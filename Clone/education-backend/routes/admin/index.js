const express = require("express");
const { query } = require("../../db");

const router = express.Router();

const requireAdminPanelKey = (req, res, next) => {
  const expected = `${process.env.ADMIN_PANEL_KEY || ""}`.trim();
  const provided = `${req.headers["x-admin-key"] || ""}`.trim();

  if (!expected) {
    return res.status(500).json({
      message: "ADMIN_PANEL_KEY is not configured on server",
    });
  }

  if (!provided || provided !== expected) {
    return res.status(401).json({ message: "Unauthorized admin key" });
  }

  return next();
};

router.use(requireAdminPanelKey);

router.get("/courses", async (req, res) => {
  try {
    const result = await query(
      `SELECT c.id, c.title, c.slug, c.category, c.level, c.duration, c.price,
              c.discount_price AS "discountPrice", c.rating, c.thumbnail,
              c.enrolled_students AS "memberCount", c.description,
              COALESCE(u.name, 'Unassigned') AS "mentorName"
       FROM courses c
       LEFT JOIN users u ON u.id = c.instructor_id
       ORDER BY c.id DESC`
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch courses", error: error.message });
  }
});

router.put("/courses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      level,
      duration,
      price,
      discountPrice,
      rating,
      thumbnail,
      description,
    } = req.body;

    const result = await query(
      `UPDATE courses
       SET title = COALESCE($1, title),
           category = COALESCE($2, category),
           level = COALESCE($3, level),
           duration = COALESCE($4, duration),
           price = COALESCE($5, price),
           discount_price = COALESCE($6, discount_price),
           rating = COALESCE($7, rating),
           thumbnail = COALESCE($8, thumbnail),
           description = COALESCE($9, description)
       WHERE id = $10
       RETURNING id, title, category, level, duration, price, discount_price AS "discountPrice", rating, thumbnail, description`,
      [
        title ?? null,
        category ?? null,
        level ?? null,
        duration ?? null,
        price ?? null,
        discountPrice ?? null,
        rating ?? null,
        thumbnail ?? null,
        description ?? null,
        id,
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update course", error: error.message });
  }
});

router.delete("/courses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `DELETE FROM courses WHERE id = $1 RETURNING id`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json({ message: "Course deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete course", error: error.message });
  }
});

router.get("/mentors", async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, role, bio, phone, created_at AS "createdAt", last_login_at AS "lastLoginAt"
       FROM users
       WHERE role IN ('mentor', 'instructor', 'teacher')
       ORDER BY id DESC`
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch mentors", error: error.message });
  }
});

router.put("/mentors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, bio, phone } = req.body;

    const result = await query(
      `UPDATE users
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           role = COALESCE($3, role),
           bio = COALESCE($4, bio),
           phone = COALESCE($5, phone)
       WHERE id = $6
       RETURNING id, name, email, role, bio, phone`,
      [
        name ?? null,
        email ?? null,
        role ?? null,
        bio ?? null,
        phone ?? null,
        id,
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update mentor", error: error.message });
  }
});

router.delete("/mentors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`DELETE FROM users WHERE id = $1 RETURNING id`, [
      id,
    ]);

    if (!result.rows.length) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    return res.status(200).json({ message: "Mentor deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete mentor", error: error.message });
  }
});

router.get("/members", async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, role, bio, phone, created_at AS "createdAt", last_login_at AS "lastLoginAt"
       FROM users
       WHERE role = 'student'
       ORDER BY id DESC`
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch members", error: error.message });
  }
});

router.put("/members/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, bio, phone } = req.body;

    const result = await query(
      `UPDATE users
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           bio = COALESCE($3, bio),
           phone = COALESCE($4, phone)
       WHERE id = $5
       RETURNING id, name, email, role, bio, phone`,
      [name ?? null, email ?? null, bio ?? null, phone ?? null, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Member not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update member", error: error.message });
  }
});

router.delete("/members/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`DELETE FROM users WHERE id = $1 RETURNING id`, [
      id,
    ]);

    if (!result.rows.length) {
      return res.status(404).json({ message: "Member not found" });
    }

    return res.status(200).json({ message: "Member deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete member", error: error.message });
  }
});

module.exports = router;
