// Railway Cron Job untuk sync jobs
const { exec } = require("child_process");
const path = require("path");
require("dotenv").config();

console.log("🚀 Railway Cron Job - Starting sync jobs...");
console.log(
  "📅 Time:",
  new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
);
console.log("🌍 Environment:", process.env.NODE_ENV || "development");

// Run sync jobs
const scriptPath = path.join(__dirname, "..");

exec(
  "npm run sync-jobs",
  {
    cwd: scriptPath,
    env: { ...process.env, NODE_ENV: "production" },
  },
  (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Error running sync-jobs:", error);
      process.exit(1);
    }

    if (stderr) {
      console.error("⚠️ Sync-jobs stderr:", stderr);
    }

    console.log("✅ Sync-jobs completed successfully!");
    console.log("📊 Output:", stdout);
    process.exit(0);
  }
);
