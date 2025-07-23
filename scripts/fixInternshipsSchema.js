// Fix database schema untuk tabel internships
const { Pool } = require("pg");
require("dotenv").config();

const fixInternshipsSchema = async () => {
  console.log("🔧 Fixing Internships Database Schema...");

  // Database connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();
    console.log("✅ Database connected successfully!");

    // Check current schema
    console.log("🔍 Checking current internships table structure...");
    const tablesResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'internships' 
      ORDER BY ordinal_position
    `);

    console.log("📋 Current internships table structure:");
    tablesResult.rows.forEach((row) => {
      console.log(
        `   ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`
      );
    });

    // Fix updated_at column if needed
    console.log("🔧 Fixing updated_at column...");
    await client.query(`
      ALTER TABLE internships 
      ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP,
      ALTER COLUMN updated_at SET NOT NULL
    `);
    console.log("✅ Updated_at column fixed!");

    // Fix created_at column if needed
    console.log("🔧 Fixing created_at column...");
    await client.query(`
      ALTER TABLE internships 
      ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
      ALTER COLUMN created_at SET NOT NULL
    `);
    console.log("✅ Created_at column fixed!");

    // Test insert
    console.log("🧪 Testing insert...");
    const testResult = await client.query(
      `
      INSERT INTO internships (api_id, title, organization, url) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, title, organization, created_at, updated_at
    `,
      ["test-123", "Test Internship", "Test Company", "https://example.com"]
    );

    console.log("✅ Test insert successful:", testResult.rows[0]);

    // Clean up test data
    await client.query(`DELETE FROM internships WHERE api_id = 'test-123'`);
    console.log("🧹 Test data cleaned up");

    client.release();
    console.log("✅ Internships database schema fixed successfully!");
  } catch (error) {
    console.error("❌ Database fix failed:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await pool.end();
  }
};

fixInternshipsSchema();
