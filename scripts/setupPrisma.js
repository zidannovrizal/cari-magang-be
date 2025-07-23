const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Setting up Prisma for Railway...");

try {
  // Check if DATABASE_URL exists
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) {
    console.error("❌ .env file not found!");
    console.log("Please create .env file with DATABASE_URL");
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  if (!envContent.includes("DATABASE_URL")) {
    console.error("❌ DATABASE_URL not found in .env!");
    console.log("Please add DATABASE_URL to your .env file");
    process.exit(1);
  }

  console.log("✅ Environment variables checked");

  // Push schema to Railway
  console.log("📤 Pushing schema to Railway...");
  execSync("npx prisma db push", { stdio: "inherit" });
  console.log("✅ Schema pushed successfully!");

  // Generate Prisma client
  console.log("🔧 Generating Prisma client...");
  execSync("npx prisma generate", { stdio: "inherit" });
  console.log("✅ Prisma client generated!");

  console.log("🎉 Prisma setup completed successfully!");
  console.log("📊 You can now use: npx prisma studio");
} catch (error) {
  console.error("❌ Error during Prisma setup:", error.message);
  process.exit(1);
}
