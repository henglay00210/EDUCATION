const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { initDb } = require("./db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes
const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const paymentRoutes = require("./routes/payments");
const adminRoutes = require("./routes/admin");

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running!", timestamp: new Date() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Server error", error: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initDb();
    console.log("✅ PostgreSQL Connected");

    app.listen(PORT, () => {
      console.log(`
🚀 Education App Backend Running
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server: http://localhost:${PORT}
📊 API Docs: http://localhost:${PORT}/api/health
🗄️ Database: PostgreSQL
✨ Ready for requests!
  `);
    });
  } catch (err) {
    console.error("❌ PostgreSQL Connection Error:", err.message);
    process.exit(1);
  }
}

startServer();
