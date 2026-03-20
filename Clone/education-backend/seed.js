require("dotenv").config();
const { query, initDb, pool } = require("./db");

const sampleCourses = [
  {
    title: "Flutter Basics",
    slug: "flutter-basics",
    description: "Learn Flutter from scratch",
    longDescription:
      "A complete guide to the Flutter SDK & Flutter Framework for building native iOS and Android apps. This course is fully updated for 2024.",
    category: "Programming",
    level: "Beginner",
    duration: "2 hours",
    price: 49.99,
    rating: 4.5,
    thumbnail: "https://via.placeholder.com/300x200?text=Flutter+Basics",
    enrolledStudents: 1234,
  },
  {
    title: "Python for Data Science",
    slug: "python-data-science",
    description: "Learn Python for data science and machine learning",
    longDescription:
      "Learn Python for data science and machine learning. This course covers everything you need to know to get started in the field of data science.",
    category: "Data Science",
    level: "Beginner",
    duration: "3 hours",
    price: 39.99,
    rating: 4.8,
    thumbnail: "https://via.placeholder.com/300x200?text=Python+Data+Science",
    enrolledStudents: 5678,
  },
  {
    title: "UI/UX Design",
    slug: "ui-ux-design",
    description: "Learn the fundamentals of UI/UX design",
    longDescription:
      "Learn the fundamentals of UI/UX design. This course covers everything you need to know to get started in the field of design.",
    category: "Design",
    level: "Beginner",
    duration: "4 hours",
    price: 44.99,
    rating: 4.9,
    thumbnail: "https://via.placeholder.com/300x200?text=UI+UX+Design",
    enrolledStudents: 9101,
  },
  {
    title: "Digital Marketing",
    slug: "digital-marketing",
    description: "Learn the fundamentals of digital marketing",
    longDescription:
      "Learn the fundamentals of digital marketing. This course covers everything you need to know to get started in the field of marketing.",
    category: "Marketing",
    level: "Beginner",
    duration: "2.5 hours",
    price: 29.99,
    rating: 4.7,
    thumbnail: "https://via.placeholder.com/300x200?text=Digital+Marketing",
    enrolledStudents: 1121,
  },
  {
    title: "Web Development Basics",
    slug: "web-development-basics",
    description: "A comprehensive introduction to web development",
    longDescription:
      "A comprehensive introduction to web development, covering HTML, CSS, and JavaScript.",
    category: "Programming",
    level: "Beginner",
    duration: "3.5 hours",
    price: 39.99,
    rating: 4.6,
    thumbnail: "https://via.placeholder.com/300x200?text=Web+Development",
    enrolledStudents: 890,
  },
  {
    title: "Advanced Flutter Concepts",
    slug: "advanced-flutter",
    description: "Deep dive into advanced topics in Flutter",
    longDescription:
      "Deep dive into advanced topics in Flutter, including custom widgets, animations, and more complex state management.",
    category: "Programming",
    level: "Advanced",
    duration: "5 hours",
    price: 59.99,
    rating: 4.9,
    thumbnail: "https://via.placeholder.com/300x200?text=Advanced+Flutter",
    enrolledStudents: 2100,
  },
  {
    title: "Machine Learning with Python",
    slug: "machine-learning-python",
    description: "An in-depth course on machine learning algorithms",
    longDescription:
      "An in-depth course on machine learning algorithms and their implementation using Python and popular libraries.",
    category: "Data Science",
    level: "Advanced",
    duration: "6 hours",
    price: 69.99,
    rating: 4.8,
    thumbnail: "https://via.placeholder.com/300x200?text=Machine+Learning",
    enrolledStudents: 3500,
  },
];

async function seedDatabase() {
  try {
    await initDb();
    console.log("✅ Connected to PostgreSQL");

    // Clear existing courses and enrollments
    await query("TRUNCATE TABLE enrollments, courses RESTART IDENTITY CASCADE");
    console.log("🗑️  Cleared existing courses");

    // Insert sample courses
    const insertedCourses = [];
    for (const course of sampleCourses) {
      const result = await query(
        `INSERT INTO courses (
          title, slug, description, long_description, category, level,
          duration, price, rating, thumbnail, enrolled_students
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        RETURNING id, title, category, price`,
        [
          course.title,
          course.slug,
          course.description,
          course.longDescription,
          course.category,
          course.level,
          course.duration,
          course.price,
          course.rating,
          course.thumbnail,
          course.enrolledStudents,
        ]
      );
      insertedCourses.push(result.rows[0]);
    }
    console.log(`✅ Inserted ${insertedCourses.length} sample courses`);

    // Display inserted courses
    console.log("\n📚 Inserted Courses:");
    insertedCourses.forEach((course, index) => {
      console.log(
        `${index + 1}. ${course.title} (${course.category}) - $${course.price}`
      );
    });

    console.log("\n✨ Database seeding completed!");
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    await pool.end();
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
