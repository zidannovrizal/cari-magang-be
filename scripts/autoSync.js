const cron = require("node-cron");
const { exec } = require("child_process");
const path = require("path");
require("dotenv").config();

console.log("🕐 Auto-sync scheduler started...");

// Schedule sync-jobs to run every day at 12:00 AM (midnight)
cron.schedule(
  "0 0 * * *",
  () => {
    console.log("🔄 Starting scheduled sync-jobs at midnight...");

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
          return;
        }

        if (stderr) {
          console.error("⚠️ Sync-jobs stderr:", stderr);
        }

        console.log(
          "✅ Sync-jobs completed successfully at",
          new Date().toLocaleString()
        );
        console.log("📊 Output:", stdout);
      }
    );
  },
  {
    scheduled: true,
    timezone: "Asia/Jakarta", // WIB timezone
  }
);

console.log("⏰ Scheduled sync-jobs for 12:00 AM (midnight) daily");
console.log("📅 Timezone: Asia/Jakarta (WIB)");

// Keep the process running
process.on("SIGINT", () => {
  console.log("🛑 Auto-sync scheduler stopped");
  process.exit(0);
});

module.exports = cron;
