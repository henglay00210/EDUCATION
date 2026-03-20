const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const { query } = require("../db");
const router = express.Router();

const isPlaceholder = (value = "") => {
  const normalized = `${value}`
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .toLowerCase();
  if (!normalized) return true;

  const knownPlaceholders = new Set([
    "your-email@gmail.com",
    "your-app-password",
    "changeme",
    "example",
  ]);

  return knownPlaceholders.has(normalized);
};

const firstNonEmptyEnv = (...keys) => {
  for (const key of keys) {
    const value = process.env[key];
    if (`${value || ""}`.trim()) {
      return value;
    }
  }
  return "";
};

const normalizeEnvString = (value = "") =>
  `${value}`.trim().replace(/^['"]|['"]$/g, "");

const normalizeGmailAppPassword = (value = "") =>
  normalizeEnvString(value).replace(/\s+/g, "");

const getGoogleClientIds = () => {
  const fromSingle = normalizeEnvString(process.env.GOOGLE_CLIENT_ID);
  const fromList = normalizeEnvString(process.env.GOOGLE_CLIENT_IDS);

  const values = [
    ...fromList
      .split(",")
      .map((v) => normalizeEnvString(v))
      .filter(Boolean),
    fromSingle,
  ].filter(Boolean);

  return [...new Set(values)];
};

const googleClient = new OAuth2Client();

const verifyGoogleIdToken = async (idToken) => {
  const audiences = getGoogleClientIds();

  if (!audiences.length) {
    throw new Error(
      "Google OAuth is not configured. Set GOOGLE_CLIENT_ID or GOOGLE_CLIENT_IDS in .env"
    );
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: audiences,
  });

  return ticket.getPayload();
};

const getOtpTransporter = () => {
  const gmailUser = normalizeEnvString(
    firstNonEmptyEnv("GMAIL_USER", "GOOGLE_EMAIL", "EMAIL_USER")
  );
  const gmailAppPassword = normalizeGmailAppPassword(
    firstNonEmptyEnv(
      "GMAIL_APP_PASSWORD",
      "GMAIL_PASSWORD",
      "GMAIL_PASS",
      "GOOGLE_APP_PASSWORD",
      "EMAIL_PASS"
    )
  );
  // Preferred: Gmail service + App Password
  if (!isPlaceholder(gmailUser) && !isPlaceholder(gmailAppPassword)) {
    return {
      ready: true,
      fromEmail: gmailUser,
      transporter: nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
      }),
    };
  }

  // Fallback: Custom SMTP
  const smtpHost = normalizeEnvString(process.env.SMTP_HOST);
  const smtpUser = normalizeEnvString(process.env.SMTP_USER);
  const smtpPass = normalizeEnvString(process.env.SMTP_PASS);
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpSecure =
    `${process.env.SMTP_SECURE || ""}`.toLowerCase() === "true" ||
    smtpPort === 465;

  if (
    !isPlaceholder(smtpHost) &&
    !isPlaceholder(smtpUser) &&
    !isPlaceholder(smtpPass)
  ) {
    return {
      ready: true,
      fromEmail: smtpUser,
      transporter: nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      }),
    };
  }

  return {
    ready: false,
    fromEmail: null,
    transporter: null,
  };
};

const getMailConfigStatus = () => {
  const gmailUser = normalizeEnvString(
    firstNonEmptyEnv("GMAIL_USER", "GOOGLE_EMAIL", "EMAIL_USER")
  );
  const gmailAppPassword = normalizeGmailAppPassword(
    firstNonEmptyEnv(
      "GMAIL_APP_PASSWORD",
      "GMAIL_PASSWORD",
      "GMAIL_PASS",
      "GOOGLE_APP_PASSWORD",
      "EMAIL_PASS"
    )
  );

  const smtpHost = normalizeEnvString(process.env.SMTP_HOST);
  const smtpUser = normalizeEnvString(process.env.SMTP_USER);
  const smtpPass = normalizeEnvString(process.env.SMTP_PASS);

  return {
    gmail: {
      userSet: !isPlaceholder(gmailUser),
      passwordSet: !isPlaceholder(gmailAppPassword),
    },
    smtp: {
      hostSet: !isPlaceholder(smtpHost),
      userSet: !isPlaceholder(smtpUser),
      passwordSet: !isPlaceholder(smtpPass),
    },
  };
};

const createOtpCode = () => `${Math.floor(100000 + Math.random() * 900000)}`;
const OTP_TTL_MS = 10 * 60 * 1000;
const otpStore = new Map();

const setOtpForEmail = (email, otp) => {
  const hashedOtp = crypto.createHash("sha256").update(`${otp}`).digest("hex");
  otpStore.set(email, {
    hashedOtp,
    expiresAt: Date.now() + OTP_TTL_MS,
  });
};

const getOtpForEmail = (email) => {
  const record = otpStore.get(email);
  if (!record) return null;

  return record;
};

const validateOtpForEmail = (email, otp) => {
  const record = getOtpForEmail(email);
  if (!record) {
    return { ok: false, reason: "missing" };
  }

  if (record.expiresAt < Date.now()) {
    clearOtpForEmail(email);
    return { ok: false, reason: "expired" };
  }

  const hashedOtp = crypto.createHash("sha256").update(`${otp}`).digest("hex");

  if (record.hashedOtp !== hashedOtp) {
    return { ok: false, reason: "invalid" };
  }

  return { ok: true, reason: "valid" };
};

const clearOtpForEmail = (email) => {
  otpStore.delete(email);
};

// Cleanup expired OTP records periodically (memory-only store).
setInterval(() => {
  const now = Date.now();
  for (const [email, record] of otpStore.entries()) {
    if (record.expiresAt < now) {
      otpStore.delete(email);
    }
  }
}, 60 * 1000).unref();

const saveAndSendResetOtp = async ({ userName, email }) => {
  const otp = createOtpCode();

  // Store OTP in memory (not persisted to database).
  setOtpForEmail(email, otp);

  const mailConfig = getOtpTransporter();

  // If email is configured, try to send real email
  if (mailConfig.ready) {
    try {
      await mailConfig.transporter.sendMail({
        from: `"AngkorEdu" <${mailConfig.fromEmail}>`,
        to: email,
        subject: "Your AngkorEdu Password Reset OTP",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
            <h2 style="color:#6B66FF;">Password Reset Verification</h2>
            <p>Hello ${userName},</p>
            <p>Use this OTP to reset your password:</p>
            <div style="font-size: 30px; font-weight: bold; letter-spacing: 6px; color:#222; margin: 18px 0;">
              ${otp}
            </div>
            <p>This OTP is valid for <strong>10 minutes</strong>.</p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
        `,
      });

      return { ok: true };
    } catch (mailError) {
      const errorMessage = `${mailError?.message || ""}`;
      const isLikelyGmailAuthError =
        /auth|invalid login|username|password|534|535/i.test(errorMessage);

      return {
        ok: false,
        status: 500,
        message: isLikelyGmailAuthError
          ? "Failed to send OTP email. Check GMAIL_USER and GMAIL_APP_PASSWORD (Google App Password) in education-backend/.env, then restart backend."
          : "Failed to send OTP email",
        error: mailError.message,
      };
    }
  }

  // Development mode: Email not configured, log OTP to console instead
  if (process.env.NODE_ENV !== "production") {
    console.log(`
╔════════════════════════════════════════════════════════╗
║            OTP FOR PASSWORD RESET (DEV MODE)            ║
╚════════════════════════════════════════════════════════╝

  Email: ${email}
  Name: ${userName}
  OTP: ${otp}
  Valid for: 10 minutes
  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To configure real email: Set GMAIL_USER + GMAIL_APP_PASSWORD in .env
    `);
    return { ok: true, otpLoggedToConsole: true };
  }

  // Production: must have email configured
  return {
    ok: false,
    status: 500,
    message:
      "Email service is not configured. Set either (GMAIL_USER + GMAIL_APP_PASSWORD) or (SMTP_HOST + SMTP_USER + SMTP_PASS) in education-backend/.env, then restart backend.",
  };
};

// Generate JWT Token
const generateToken = (id, role = "student") => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

const requireAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    req.auth = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Register User
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email exists
    const userExists = await query("SELECT id FROM users WHERE email = $1", [
      normalizedEmail,
    ]);
    if (userExists.rows.length) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=6B66FF&color=fff`;

    // Create user
    const result = await query(
      `INSERT INTO users (name, email, password_hash, avatar)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email`,
      [name, normalizedEmail, passwordHash, avatar]
    );
    const user = result.rows[0];

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
});

// Login User
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const result = await query(
      "SELECT id, name, email, avatar, role, password_hash FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (!result.rows.length) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const user = result.rows[0];

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    await query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [
      user.id,
    ]);

    res.status(200).json({
      token,
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// Google OAuth Login/Register
router.post("/oauth/google", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "idToken is required" });
    }

    const payload = await verifyGoogleIdToken(idToken);
    const verifiedEmail = `${payload?.email || ""}`.toLowerCase().trim();

    if (!verifiedEmail || !payload?.email_verified) {
      return res
        .status(401)
        .json({ message: "Google account email is not verified" });
    }

    const googleSub = `${payload.sub || ""}`.trim();
    const googleName = `${payload.name || "Google User"}`.trim();
    const googleAvatar = `${payload.picture || ""}`.trim();

    let userResult = await query(
      `SELECT id, name, email, avatar, role, google_sub
       FROM users
       WHERE email = $1`,
      [verifiedEmail]
    );

    let user = userResult.rows[0];

    if (!user) {
      const randomPasswordHash = await bcrypt.hash(crypto.randomUUID(), 10);
      const createResult = await query(
        `INSERT INTO users (name, email, password_hash, avatar, auth_provider, google_sub)
         VALUES ($1, $2, $3, $4, 'google', $5)
         RETURNING id, name, email, avatar, role, google_sub`,
        [
          googleName,
          verifiedEmail,
          randomPasswordHash,
          googleAvatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              googleName
            )}&background=6B66FF&color=fff`,
          googleSub || null,
        ]
      );
      user = createResult.rows[0];
    } else if (googleSub && user.google_sub !== googleSub) {
      const updateResult = await query(
        `UPDATE users
         SET google_sub = $1,
             auth_provider = 'google',
             avatar = COALESCE(NULLIF($2, ''), avatar)
         WHERE id = $3
         RETURNING id, name, email, avatar, role, google_sub`,
        [googleSub, googleAvatar, user.id]
      );
      user = updateResult.rows[0];
    }

    const token = generateToken(user.id, user.role);

    await query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [
      user.id,
    ]);

    return res.status(200).json({
      token,
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    return res.status(401).json({
      message: "Google authentication failed",
      error: error.message,
    });
  }
});

// Forgot Password - Send OTP to Gmail
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userResult = await query(
      "SELECT id, name FROM users WHERE email = $1",
      [normalizedEmail]
    );
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({
        message: "gmail not found",
      });
    }

    const otpResult = await saveAndSendResetOtp({
      userName: user.name,
      email: normalizedEmail,
    });

    if (!otpResult.ok) {
      return res.status(otpResult.status || 500).json({
        message: otpResult.message,
        ...(otpResult.details ? { details: otpResult.details } : {}),
        ...(otpResult.error ? { error: otpResult.error } : {}),
      });
    }

    if (otpResult.otpLoggedToConsole) {
      return res.status(200).json({
        message:
          "OTP generated in development mode and logged on server console. Configure Gmail credentials for real email delivery.",
      });
    }

    return res.status(200).json({
      message: "OTP sent to your Gmail.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to send OTP",
      error: error.message,
    });
  }
});

// Resend OTP
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userResult = await query(
      "SELECT id, name FROM users WHERE email = $1",
      [normalizedEmail]
    );
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({
        message: "gmail not found",
      });
    }

    const otpResult = await saveAndSendResetOtp({
      userName: user.name,
      email: normalizedEmail,
    });

    if (!otpResult.ok) {
      return res.status(otpResult.status || 500).json({
        message: otpResult.message,
        ...(otpResult.details ? { details: otpResult.details } : {}),
        ...(otpResult.error ? { error: otpResult.error } : {}),
      });
    }

    if (otpResult.otpLoggedToConsole) {
      return res.status(200).json({
        message:
          "A new OTP was generated in development mode and logged on server console. Configure Gmail credentials for real email delivery.",
      });
    }

    return res
      .status(200)
      .json({ message: "A new OTP was sent to your Gmail." });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to resend OTP",
      error: error.message,
    });
  }
});

// Mail configuration diagnostics (development only)
router.get("/mail-health", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ message: "Not found" });
  }

  const mailConfig = getOtpTransporter();
  const status = getMailConfigStatus();

  let verify = {
    ok: false,
    error: "Transporter not configured",
  };

  if (mailConfig.ready && mailConfig.transporter) {
    try {
      await mailConfig.transporter.verify();
      verify = { ok: true };
    } catch (error) {
      verify = { ok: false, error: error.message };
    }
  }

  return res.status(200).json({
    ready: mailConfig.ready,
    usingFromEmail: mailConfig.fromEmail,
    status,
    verify,
    otpStorage: "memory",
  });
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userResult = await query("SELECT id FROM users WHERE email = $1", [
      normalizedEmail,
    ]);
    const user = userResult.rows[0];

    if (!user) {
      return res
        .status(400)
        .json({ message: "OTP not found. Request a new OTP." });
    }

    const otpValidation = validateOtpForEmail(normalizedEmail, otp);
    if (!otpValidation.ok && otpValidation.reason === "missing") {
      return res
        .status(400)
        .json({ message: "OTP not found. Request a new OTP." });
    }

    if (!otpValidation.ok && otpValidation.reason === "expired") {
      return res
        .status(400)
        .json({ message: "OTP expired. Request a new OTP." });
    }

    if (!otpValidation.ok && otpValidation.reason === "invalid") {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    return res.status(200).json({ message: "OTP verified" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "OTP verification failed", error: error.message });
  }
});

// Reset Password using OTP
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, OTP and newPassword are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userResult = await query("SELECT id FROM users WHERE email = $1", [
      normalizedEmail,
    ]);
    const user = userResult.rows[0];

    if (!user) {
      return res
        .status(400)
        .json({ message: "OTP not found. Request a new OTP." });
    }

    const otpValidation = validateOtpForEmail(normalizedEmail, otp);
    if (!otpValidation.ok && otpValidation.reason === "missing") {
      return res
        .status(400)
        .json({ message: "OTP not found. Request a new OTP." });
    }

    if (!otpValidation.ok && otpValidation.reason === "expired") {
      return res
        .status(400)
        .json({ message: "OTP expired. Request a new OTP." });
    }

    if (!otpValidation.ok && otpValidation.reason === "invalid") {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await query(
      `UPDATE users
       SET password_hash = $1
       WHERE id = $2`,
      [passwordHash, user.id]
    );

    clearOtpForEmail(normalizedEmail);

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Password reset failed", error: error.message });
  }
});

// User CRUD
router.get("/users", requireAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, avatar, bio, phone, role, auth_provider, created_at
       FROM users
       ORDER BY id DESC`
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
});

router.get("/users/:id", requireAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, avatar, bio, phone, role, auth_provider, created_at
       FROM users
       WHERE id = $1`,
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch user", error: error.message });
  }
});

router.post("/users", requireAuth, async (req, res) => {
  try {
    const { name, email, password, role = "student" } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email and password are required" });
    }

    if (`${password}`.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = `${email}`.toLowerCase().trim();
    const exists = await query("SELECT id FROM users WHERE email = $1", [
      normalizedEmail,
    ]);

    if (exists.rows.length) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=6B66FF&color=fff`;

    const result = await query(
      `INSERT INTO users (name, email, password_hash, avatar, role, auth_provider)
       VALUES ($1, $2, $3, $4, $5, 'local')
       RETURNING id, name, email, avatar, bio, phone, role, auth_provider, created_at`,
      [name, normalizedEmail, passwordHash, avatar, role]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create user", error: error.message });
  }
});

router.put("/users/:id", requireAuth, async (req, res) => {
  try {
    const { name, email, avatar, bio, phone, role } = req.body;

    const result = await query(
      `UPDATE users
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           avatar = COALESCE($3, avatar),
           bio = COALESCE($4, bio),
           phone = COALESCE($5, phone),
           role = COALESCE($6, role)
       WHERE id = $7
       RETURNING id, name, email, avatar, bio, phone, role, auth_provider, created_at`,
      [
        name ?? null,
        email ? `${email}`.toLowerCase().trim() : null,
        avatar ?? null,
        bio ?? null,
        phone ?? null,
        role ?? null,
        req.params.id,
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update user", error: error.message });
  }
});

router.delete("/users/:id", requireAuth, async (req, res) => {
  try {
    const result = await query(
      `DELETE FROM users
       WHERE id = $1
       RETURNING id`,
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
});

// Get User Profile (requires token)
router.get("/profile", async (req, res) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userResult = await query(
      `SELECT id, name, email, avatar, bio, phone, role
       FROM users WHERE id = $1`,
      [decoded.id]
    );
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const enrollmentsResult = await query(
      `SELECT c.id, c.title, c.slug, c.description, c.category, c.level,
              c.duration, c.price, c.rating, c.thumbnail
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = $1
       ORDER BY e.enrolled_date DESC`,
      [decoded.id]
    );

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      phone: user.phone,
      role: user.role,
      enrolledCourses: enrollmentsResult.rows,
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid token", error: error.message });
  }
});

// Validate Session Token (requires token)
router.get("/session", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ valid: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userResult = await query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [decoded.id]
    );
    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({ valid: false, message: "Invalid token" });
    }

    return res.status(200).json({
      valid: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(401).json({ valid: false, message: "Invalid token" });
  }
});

module.exports = router;
