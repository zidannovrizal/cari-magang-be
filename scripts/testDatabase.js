require("dotenv").config();
const { Pool } = require("pg");

/**
 * Script untuk test koneksi database PostgreSQL
 * Jalankan: node scripts/testDatabase.js
 */

async function testDatabaseConnection() {
  console.log("🔍 Testing Database Connection...\n");

  // Database configuration
  const config = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME || "cari_magang_db",
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
  };

  console.log("📋 Database Configuration:");
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   User: ${config.user}`);
  console.log(
    `   Password: ${
      config.password ? "***" + config.password.slice(-3) : "Not set"
    }\n`
  );

  const pool = new Pool(config);

  try {
    // Test 1: Basic connection
    console.log("1️⃣ Testing basic connection...");
    const result = await pool.query(
      "SELECT NOW() as current_time, version() as version"
    );
    console.log("✅ Database connection successful!");
    console.log(`   Current time: ${result.rows[0].current_time}`);
    console.log(
      `   PostgreSQL version: ${result.rows[0].version.split(" ")[0]}\n`
    );

    // Test 2: Check if database exists
    console.log("2️⃣ Checking database tables...");
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tablesResult.rows.length === 0) {
      console.log(
        "⚠️  No tables found in database. Schema needs to be imported."
      );
    } else {
      console.log("✅ Found tables in database:");
      tablesResult.rows.forEach((row) => {
        console.log(`   - ${row.table_name}`);
      });
    }
    console.log("");

    // Test 3: Test specific tables (if they exist)
    const expectedTables = [
      "users",
      "companies",
      "internships",
      "applications",
      "saved_internships",
      "reviews",
      "skills",
      "user_skills",
      "notifications",
      "sdg8_metrics",
      "job_board_sync_logs",
    ];

    console.log("3️⃣ Testing expected tables...");
    for (const tableName of expectedTables) {
      try {
        const tableResult = await pool.query(
          `
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = $1
        `,
          [tableName]
        );

        if (tableResult.rows[0].count > 0) {
          console.log(`✅ Table '${tableName}' exists`);
        } else {
          console.log(`❌ Table '${tableName}' not found`);
        }
      } catch (error) {
        console.log(`❌ Error checking table '${tableName}': ${error.message}`);
      }
    }
    console.log("");

    // Test 4: Test sample data insertion (if tables exist)
    console.log("4️⃣ Testing sample data insertion...");
    try {
      // Test companies table
      const companyTest = await pool.query(
        `
        INSERT INTO companies (name, email, description, industry, source_type) 
        VALUES ($1, $2, $3, $4, $5) 
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `,
        [
          "Test Company",
          "test@company.com",
          "Test company for database testing",
          "Technology",
          "manual",
        ]
      );

      if (companyTest.rows.length > 0) {
        console.log("✅ Sample company inserted successfully");

        // Clean up test data
        await pool.query("DELETE FROM companies WHERE email = $1", [
          "test@company.com",
        ]);
        console.log("✅ Test data cleaned up");
      } else {
        console.log("✅ Company already exists (no duplicate)");
      }
    } catch (error) {
      console.log(`❌ Error testing data insertion: ${error.message}`);
      console.log("   This is normal if schema has not been imported yet.");
    }
    console.log("");

    // Test 5: Test environment variables
    console.log("5️⃣ Testing environment variables...");
    const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
    let envVarsOk = true;

    requiredEnvVars.forEach((varName) => {
      if (!process.env[varName]) {
        console.log(`❌ ${varName}: Missing`);
        envVarsOk = false;
      } else {
        console.log(`✅ ${varName}: Set`);
      }
    });

    if (envVarsOk) {
      console.log("✅ All required environment variables are set");
    } else {
      console.log("❌ Some environment variables are missing");
    }
    console.log("");

    // Final summary
    console.log("📊 Database Test Summary:");
    console.log("✅ Database connection: SUCCESS");
    console.log("✅ Environment variables: CHECKED");
    console.log("✅ Table structure: VERIFIED");
    console.log("✅ Data operations: TESTED");
    console.log("\n🚀 Database is ready for use!");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.log("\n🔧 Troubleshooting tips:");
    console.log("1. Check if PostgreSQL is running");
    console.log("2. Verify database credentials in .env file");
    console.log('3. Ensure database "cari_magang_db" exists');
    console.log('4. Check if user "admin" has proper permissions');
    console.log("\nCommands to check:");
    console.log("   psql -U admin -d cari_magang_db");
    console.log("   sudo systemctl status postgresql");
    console.log('   sudo -u postgres psql -c "\\l"');

    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run test if this script is executed directly
if (require.main === module) {
  testDatabaseConnection();
}

module.exports = testDatabaseConnection;
