const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const { pool } = require("./config/database");

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const internshipRoutes = require("./routes/internships");
const companyRoutes = require("./routes/companies");
const applicationRoutes = require("./routes/applications");

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Cari Magang API is running",
    timestamp: new Date().toISOString(),
    sdg8: "Decent Work & Economic Growth",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/applications", applicationRoutes);

// SDG 8 endpoint
app.get("/api/sdg8", (req, res) => {
  res.json({
    goal: "SDG 8: Decent Work and Economic Growth",
    description:
      "Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all",
    targets: [
      "8.1 Sustain per capita economic growth in accordance with national circumstances",
      "8.2 Achieve higher levels of economic productivity through diversification, technological upgrading and innovation",
      "8.3 Promote development-oriented policies that support productive activities, decent job creation, entrepreneurship, creativity and innovation",
      "8.4 Improve progressively, through 2030, global resource efficiency in consumption and production",
      "8.5 By 2030, achieve full and productive employment and decent work for all women and men, including for young people and persons with disabilities, and equal pay for work of equal value",
      "8.6 By 2020, substantially reduce the proportion of youth not in employment, education or training",
      "8.7 Take immediate and effective measures to eradicate forced labour, end modern slavery and human trafficking and secure the prohibition and elimination of the worst forms of child labour",
      "8.8 Protect labour rights and promote safe and secure working environments for all workers, including migrant workers, in particular women migrants, and those in precarious employment",
      "8.9 By 2030, devise and implement policies to promote sustainable tourism that creates jobs and promotes local culture and products",
      "8.10 Strengthen the capacity of domestic financial institutions to encourage and expand access to banking, insurance and financial services for all",
    ],
    our_contribution:
      "Connecting students with quality internship opportunities that provide decent work experience and contribute to economic growth",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: "The requested API endpoint does not exist",
  });
});

// Database connection test
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Database connected successfully");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Cari Magang API server running on port ${PORT}`);
  console.log(`📊 SDG 8: Decent Work & Economic Growth`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  pool.end();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  pool.end();
  process.exit(0);
});

module.exports = app;
