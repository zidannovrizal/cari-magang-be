// Start auto sync scheduler
const cron = require("node-cron");
require("dotenv").config();

console.log("🕐 Starting Auto Sync Scheduler...");
console.log("📅 Timezone: Asia/Jakarta (WIB)");
console.log("⏰ Schedule: Every day at 12:00 AM (midnight)");

// Import auto sync
const autoSync = require("./autoSync");

console.log("✅ Auto sync scheduler started successfully!");
console.log("🔄 Jobs will be synced automatically at midnight");

// Keep the process running
process.on("SIGINT", () => {
  console.log("🛑 Auto sync scheduler stopped");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("🛑 Auto sync scheduler stopped");
  process.exit(0);
});
