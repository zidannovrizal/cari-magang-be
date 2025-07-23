const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Import auto-sync scheduler
const autoSync = require("./scripts/autoSync");

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      "https://cari-magang.netlify.app",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/job-board", require("./routes/jobBoardRoutes"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    message: "Cari Magang API is running",
  });
});

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
    success: false,
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
