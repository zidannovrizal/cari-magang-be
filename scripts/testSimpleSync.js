// Test simple sync tanpa API key
const { Pool } = require("pg");
require("dotenv").config();

const testSimpleSync = async () => {
  console.log("🔍 Testing Simple Sync...");

  // Database connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();
    console.log("✅ Database connected successfully!");

    // Test insert simple job
    console.log("🧪 Testing insert simple job...");
    const testResult = await client.query(
      `
      INSERT INTO internships (api_id, title, organization, url, employment_type) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id, title, organization, created_at, updated_at
    `,
      [
        "test-sync-123",
        "Test Sync Job",
        "Test Company",
        "https://example.com",
        '["INTERN"]',
      ]
    );

    console.log("✅ Test insert successful:", testResult.rows[0]);

    // Clean up test data
    await client.query(
      `DELETE FROM internships WHERE api_id = 'test-sync-123'`
    );
    console.log("🧹 Test data cleaned up");

    client.release();
    console.log("✅ Simple sync test completed successfully!");
  } catch (error) {
    console.error("❌ Simple sync test failed:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await pool.end();
  }
};

testSimpleSync();
