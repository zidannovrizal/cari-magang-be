const cron = require("node-cron");
const { exec } = require("child_process");
const path = require("path");

console.log("🕐 Auto-sync scheduler started...");
console.log("📅 Timezone: Asia/Jakarta (WIB)");
console.log("⏰ Schedule: Every day at 12:00 AM (midnight)");

// Schedule sync-jobs to run every day at 12:00 AM (midnight)
cron.schedule(
  "0 0 * * *",
  () => {
    console.log("🔄 Starting scheduled sync-jobs at midnight...");

    const scriptPath = path.join(__dirname, "..");

    exec("npm run sync-jobs", { cwd: scriptPath }, (error, stdout, stderr) => {
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
    });
  },
  {
    scheduled: true,
    timezone: "Asia/Jakarta", // WIB timezone
  }
);

console.log("✅ Auto-sync scheduler is running...");
console.log("💡 Press Ctrl+C to stop");

// Keep the process running
process.on("SIGINT", () => {
  console.log("🛑 Auto-sync scheduler stopped");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("🛑 Auto-sync scheduler stopped");
  process.exit(0);
});
