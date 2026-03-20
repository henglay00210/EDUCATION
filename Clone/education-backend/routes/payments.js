const express = require("express");
const crypto = require("crypto");
const { query } = require("../db");

const router = express.Router();

const isBakongEnabled =
  `${process.env.BAKONG_ENABLED || ""}`.toLowerCase() === "true";

const buildMockKhqrPayload = ({ transactionId, amount, currency }) =>
  `bakong-khqr://pay?tran_id=${encodeURIComponent(
    transactionId
  )}&amount=${encodeURIComponent(amount)}&currency=${encodeURIComponent(
    currency
  )}`;

const tryCreateBakongKhqr = async ({ transactionId, amount, currency }) => {
  const baseUrl = `${process.env.BAKONG_API_BASE_URL || ""}`.trim();
  const apiKey = `${process.env.BAKONG_API_KEY || ""}`.trim();
  const merchantId = `${process.env.BAKONG_MERCHANT_ID || ""}`.trim();

  if (!isBakongEnabled || !baseUrl || !apiKey || !merchantId) {
    return {
      integrationMode: "mock",
      providerPaymentId: null,
      khqrPayload: buildMockKhqrPayload({ transactionId, amount, currency }),
    };
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/khqr/create`;

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      merchantId,
      transactionId,
      amount,
      currency,
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Bakong create KHQR failed: ${resp.status} ${errText}`);
  }

  const data = await resp.json();

  const khqrPayload =
    data.khqr || data.qr || data.qrString || data.qr_string || null;
  const providerPaymentId =
    data.paymentId || data.tran_id || data.transactionId || null;

  if (!khqrPayload) {
    throw new Error("Bakong response missing KHQR payload");
  }

  return {
    integrationMode: "live",
    providerPaymentId,
    khqrPayload,
  };
};

router.post("/khqr/create", async (req, res) => {
  try {
    const { courseId, amount, currency = "USD" } = req.body;

    if (!courseId || !amount) {
      return res
        .status(400)
        .json({ message: "courseId and amount are required" });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const courseResult = await query("SELECT id FROM courses WHERE id = $1", [
      courseId,
    ]);

    if (!courseResult.rows.length) {
      return res.status(404).json({ message: "Course not found" });
    }

    const transactionId = `KHQR-${Date.now()}-${crypto
      .randomUUID()
      .slice(0, 8)}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    let providerPaymentId = null;
    let khqrPayload = null;
    let integrationMode = "mock";

    try {
      const bakong = await tryCreateBakongKhqr({
        transactionId,
        amount: numericAmount,
        currency,
      });
      providerPaymentId = bakong.providerPaymentId;
      khqrPayload = bakong.khqrPayload;
      integrationMode = bakong.integrationMode;
    } catch (error) {
      return res.status(502).json({
        message: "Failed to create KHQR payment",
        error: error.message,
      });
    }

    await query(
      `INSERT INTO payment_transactions
       (transaction_id, provider, course_id, amount, currency, status, provider_payment_id, khqr_payload, metadata, expires_at)
       VALUES ($1, 'bakong-khqr', $2, $3, $4, 'pending', $5, $6, $7::jsonb, $8)`,
      [
        transactionId,
        courseId,
        numericAmount,
        currency,
        providerPaymentId,
        khqrPayload,
        JSON.stringify({ integrationMode }),
        expiresAt,
      ]
    );

    return res.status(201).json({
      transactionId,
      status: "pending",
      amount: numericAmount,
      currency,
      khqrPayload,
      integrationMode,
      expiresAt,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create payment", error: error.message });
  }
});

router.get("/:transactionId/status", async (req, res) => {
  try {
    const { transactionId } = req.params;

    const result = await query(
      `SELECT transaction_id, status, amount, currency, provider, provider_payment_id,
              khqr_payload, metadata, paid_at, expires_at, created_at
       FROM payment_transactions
       WHERE transaction_id = $1`,
      [transactionId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const tx = result.rows[0];

    if (
      tx.status === "pending" &&
      tx.expires_at &&
      new Date(tx.expires_at).getTime() < Date.now()
    ) {
      await query(
        `UPDATE payment_transactions
         SET status = 'expired', updated_at = NOW()
         WHERE transaction_id = $1`,
        [transactionId]
      );
      tx.status = "expired";
    }

    return res.status(200).json({
      transactionId: tx.transaction_id,
      status: tx.status,
      amount: Number(tx.amount),
      currency: tx.currency,
      provider: tx.provider,
      providerPaymentId: tx.provider_payment_id,
      khqrPayload: tx.khqr_payload,
      metadata: tx.metadata,
      paidAt: tx.paid_at,
      expiresAt: tx.expires_at,
      createdAt: tx.created_at,
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Failed to check payment status",
        error: error.message,
      });
  }
});

// Dev-only helper: simulate bank webhook confirmation.
router.post("/:transactionId/mock-paid", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ message: "Not found" });
  }

  try {
    const { transactionId } = req.params;

    const update = await query(
      `UPDATE payment_transactions
       SET status = 'paid', paid_at = NOW(), updated_at = NOW()
       WHERE transaction_id = $1
       RETURNING transaction_id`,
      [transactionId]
    );

    if (!update.rows.length) {
      return res.status(404).json({ message: "Payment not found" });
    }

    return res.status(200).json({
      message: "Payment marked as paid",
      transactionId,
      status: "paid",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to mark payment", error: error.message });
  }
});

// Webhook endpoint for real Bakong callback integration.
router.post("/bakong/webhook", async (req, res) => {
  try {
    const transactionId =
      req.body.transactionId || req.body.tran_id || req.body.reference;
    const statusRaw = `${req.body.status || ""}`.toLowerCase();

    if (!transactionId) {
      return res.status(400).json({ message: "transactionId is required" });
    }

    const status =
      statusRaw === "paid" || statusRaw === "success"
        ? "paid"
        : statusRaw === "failed"
        ? "failed"
        : "pending";

    await query(
      `UPDATE payment_transactions
       SET status = $1,
           paid_at = CASE WHEN $1 = 'paid' THEN NOW() ELSE paid_at END,
           updated_at = NOW()
       WHERE transaction_id = $2`,
      [status, transactionId]
    );

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;
