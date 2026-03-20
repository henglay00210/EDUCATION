const express = require("express");
const jwt = require("jsonwebtoken");
const { query } = require("../db");
const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Get All Courses
router.get("/", verifyToken, async (req, res) => {
  try {
    const { search, category, level, page = 1, limit = 10 } = req.query;

    const where = [];
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      where.push(
        `(title ILIKE $${values.length} OR description ILIKE $${values.length})`
      );
    }

    if (category) {
      values.push(category);
      where.push(`category = $${values.length}`);
    }

    if (level) {
      values.push(level);
      where.push(`level = $${values.length}`);
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const offset = (pageNum - 1) * limitNum;
    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const coursesResult = await query(
      `SELECT id, title, slug, description, long_description AS "longDescription",
              category, level, duration, price, discount_price AS "discountPrice",
              rating, thumbnail, enrolled_students AS "enrolledStudents",
              reviews, created_at AS "createdAt",
              COALESCE((SELECT name FROM users u WHERE u.id = courses.instructor_id), 'AngkorEdu') AS "mentorName"
       FROM courses
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, limitNum, offset]
    );

    const totalResult = await query(
      `SELECT COUNT(*)::int AS total FROM courses ${whereClause}`,
      values
    );

    res.status(200).json({
      courses: coursesResult.rows,
      total: totalResult.rows[0].total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch courses", error: error.message });
  }
});

// Get Single Course
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, title, slug, description, long_description AS "longDescription",
              category, level, duration, price, discount_price AS "discountPrice",
              rating, thumbnail, enrolled_students AS "enrolledStudents",
              reviews, created_at AS "createdAt",
              COALESCE((SELECT name FROM users u WHERE u.id = courses.instructor_id), 'AngkorEdu') AS "mentorName"
       FROM courses
       WHERE id = $1`,
      [req.params.id]
    );

    const course = result.rows[0];

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch course", error: error.message });
  }
});

// Enroll in Course
router.post("/:id/enroll", verifyToken, async (req, res) => {
  try {
    const courseResult = await query("SELECT id FROM courses WHERE id = $1", [
      req.params.id,
    ]);
    const userResult = await query("SELECT id FROM users WHERE id = $1", [
      req.userId,
    ]);

    if (!courseResult.rows.length) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!userResult.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingEnrollment = await query(
      "SELECT 1 FROM enrollments WHERE user_id = $1 AND course_id = $2",
      [req.userId, req.params.id]
    );

    if (existingEnrollment.rows.length) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });
    }

    await query(
      "INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2)",
      [req.userId, req.params.id]
    );

    await query(
      "UPDATE courses SET enrolled_students = enrolled_students + 1 WHERE id = $1",
      [req.params.id]
    );

    res.status(201).json({
      message: "Successfully enrolled",
      enrollment: {
        userId: Number(req.userId),
        courseId: Number(req.params.id),
        enrolledDate: new Date(),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Enrollment failed", error: error.message });
  }
});

module.exports = router;
