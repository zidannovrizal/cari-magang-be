const axios = require("axios");
const { Pool } = require("pg");
require("dotenv").config();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

/**
 * Script untuk sync jobs dari API eksternal ke database
 */
async function syncJobs() {
  console.log("🚀 Starting Job Sync Script...\n");

  try {
    // 1. Fetch data dari API eksternal
    console.log("📡 Fetching jobs from external API...");

    // Query parameters untuk API
    const queryParams = {
      title_filter: "intern",
      location_filter: "Indonesia",
      remote: "false",
      offset: 0,
    };

    console.log("📋 Query params:", queryParams);

    // Hit API eksternal
    if (!process.env.RAPIDAPI_KEY || !process.env.RAPIDAPI_HOST) {
      throw new Error(
        "❌ RAPIDAPI_KEY dan RAPIDAPI_HOST harus diset di .env file"
      );
    }

    const response = await axios.get(
      `https://${process.env.RAPIDAPI_HOST}/active-jb-7d`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": process.env.RAPIDAPI_HOST,
        },
        params: queryParams,
      }
    );

    const jobs = response.data || [];
    console.log(`✅ Fetched ${jobs.length} jobs from API`);

    if (jobs.length === 0) {
      console.log("⚠️  No jobs found with current filters");
      return;
    }

    // 2. Simpan ke database
    console.log("\n💾 Saving jobs to database...");

    const client = await pool.connect();
    let savedCount = 0;
    let skippedCount = 0;

    try {
      await client.query("BEGIN");

      for (const job of jobs) {
        // Extract location data
        const location = job.locations_raw?.[0] || {};
        const address = location.address || {};

        // Check if job already exists
        const existingJob = await client.query(
          "SELECT id FROM internships WHERE api_id = $1",
          [job.id]
        );

        if (existingJob.rows.length > 0) {
          skippedCount++;
          console.log(`⏭️  Skipped existing job: ${job.title}`);
          continue;
        }

        // Insert new job
        const query = `
                    INSERT INTO internships (
                        api_id, title, organization, organization_url, organization_logo,
                        address_country, address_locality, address_region, latitude, longitude,
                        employment_type, seniority, url, external_apply_url, direct_apply,
                        date_posted, date_created, date_validthrough,
                        source_type, source, source_domain, remote_derived,
                        cities_derived, regions_derived, countries_derived, locations_derived
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
                        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
                    )
                `;

        await client.query(query, [
          job.id,
          job.title,
          job.organization,
          job.organization_url,
          job.organization_logo,
          address.addressCountry,
          address.addressLocality,
          address.addressRegion,
          location.latitude,
          location.longitude,
          JSON.stringify(job.employment_type),
          job.seniority,
          job.url,
          job.external_apply_url,
          job.directapply || false,
          job.date_posted,
          job.date_created,
          job.date_validthrough,
          job.source_type,
          job.source,
          job.source_domain,
          job.remote_derived || false,
          JSON.stringify(job.cities_derived),
          JSON.stringify(job.regions_derived),
          JSON.stringify(job.countries_derived),
          JSON.stringify(job.locations_derived),
        ]);

        savedCount++;
        console.log(
          `✅ Saved: ${job.title} at ${address.addressLocality}, ${address.addressCountry}`
        );
      }

      await client.query("COMMIT");
      console.log(`\n🎉 Sync completed successfully!`);
      console.log(`📊 Summary:`);
      console.log(`   ✅ Saved: ${savedCount} new jobs`);
      console.log(`   ⏭️  Skipped: ${skippedCount} existing jobs`);
      console.log(`   📍 Total: ${savedCount + skippedCount} jobs processed`);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("❌ Error saving jobs to database:", error);
      throw error;
    } finally {
      client.release();
    }

    // 3. Verify data
    console.log("\n🔍 Verifying data...");
    const verifyResult = await pool.query(
      "SELECT COUNT(*) as total FROM internships"
    );
    console.log(`📈 Total jobs in database: ${verifyResult.rows[0].total}`);

    // 4. Show sample data
    const sampleResult = await pool.query(`
            SELECT id, title, organization, address_locality, address_country 
            FROM internships 
            ORDER BY created_at DESC 
            LIMIT 3
        `);

    console.log("\n📋 Sample jobs:");
    sampleResult.rows.forEach((job, index) => {
      console.log(
        `   ${index + 1}. ${job.title} at ${job.organization} (${
          job.address_locality
        }, ${job.address_country})`
      );
    });
  } catch (error) {
    console.error("❌ Error during sync:", error.message);
    if (error.response) {
      console.error("API Response:", error.response.data);
    }
    process.exit(1);
  } finally {
    await pool.end();
    console.log("\n🏁 Sync script completed!");
  }
}

// Run script if called directly
if (require.main === module) {
  syncJobs();
}

module.exports = { syncJobs };
