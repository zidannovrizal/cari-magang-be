require("dotenv").config();

/**
 * Script untuk validasi environment variables
 * Jalankan: node scripts/validateEnv.js
 */

const requiredEnvVars = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "JWT_SECRET",
  "RAPIDAPI_KEY",
];

const optionalEnvVars = [
  "DB_PORT",
  "JWT_EXPIRES_IN",
  "PORT",
  "NODE_ENV",
  "RAPIDAPI_HOST",
  "CORS_ORIGIN",
  "RATE_LIMIT_WINDOW_MS",
  "RATE_LIMIT_MAX_REQUESTS",
];

function validateEnvironment() {
  console.log("🔍 Validating environment variables...\n");

  let hasErrors = false;

  // Check required variables
  console.log("📋 Required Environment Variables:");
  requiredEnvVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value) {
      console.log(`❌ ${varName}: MISSING`);
      hasErrors = true;
    } else {
      // Mask sensitive values
      const displayValue =
        varName.includes("PASSWORD") ||
        varName.includes("SECRET") ||
        varName.includes("KEY")
          ? "***" + value.slice(-4)
          : value;
      console.log(`✅ ${varName}: ${displayValue}`);
    }
  });

  console.log("\n📋 Optional Environment Variables:");
  optionalEnvVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value) {
      console.log(`⚠️  ${varName}: Not set (using default)`);
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  });

  // Check database connection
  console.log("\n🔗 Testing Database Connection:");
  const { Pool } = require("pg");

  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME || "cari_magang_db",
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
  });

  pool.query("SELECT NOW()", (err, res) => {
    if (err) {
      console.log("❌ Database connection failed:", err.message);
      hasErrors = true;
    } else {
      console.log("✅ Database connection successful");
    }

    pool.end();

    // Check RapidAPI connection
    console.log("\n🌐 Testing RapidAPI Connection:");
    const https = require("https");

    const options = {
      method: "GET",
      hostname: process.env.RAPIDAPI_HOST || "internships-api.p.rapidapi.com",
      port: null,
      path: "/active-jb-7d",
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host":
          process.env.RAPIDAPI_HOST || "internships-api.p.rapidapi.com",
      },
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log("✅ RapidAPI connection successful");
      } else {
        console.log(`❌ RapidAPI connection failed: ${res.statusCode}`);
        hasErrors = true;
      }
    });

    req.on("error", (error) => {
      console.log("❌ RapidAPI connection failed:", error.message);
      hasErrors = true;
    });

    req.end();

    // Final summary
    setTimeout(() => {
      console.log("\n📊 Validation Summary:");
      if (hasErrors) {
        console.log(
          "❌ Environment validation failed. Please fix the issues above."
        );
        process.exit(1);
      } else {
        console.log("✅ All environment variables are properly configured!");
        console.log("🚀 Ready to run the application.");
      }
    }, 2000);
  });
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateEnvironment();
}

module.exports = validateEnvironment;
