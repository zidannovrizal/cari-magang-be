const axios = require("axios");
const { Pool } = require("pg");
require("dotenv").config();

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "cari_magang_db",
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "",
});

/**
 * Service untuk mengelola data job board
 * Mengambil data dari API eksternal dan menyimpannya ke database
 */
class JobBoardService {
  /**
   * Fetch data dari API job board dengan query params yang sesuai
   * @param {Object} options - Query parameters untuk API
   * @returns {Array} Array of job data
   */
  async fetchJobsFromAPI(options = {}) {
    try {
      console.log("🔍 Fetching jobs from API...");

      // Query parameters yang tersedia di API
      const {
        title_filter = "",
        location_filter = "",
        description_filter = "",
        description_type = "",
        remote = "",
        agency = "",
        offset = 0,
        date_filter = "",
        advanced_title_filter = "",
        include_ai = false,
        ai_work_arrangement_filter = "",
      } = options;

      // Build query params untuk API
      const queryParams = {
        ...(title_filter && { title_filter }),
        ...(location_filter && { location_filter }),
        ...(description_filter && { description_filter }),
        ...(description_type && { description_type }),
        ...(remote !== "" && { remote }),
        ...(agency !== "" && { agency }),
        offset,
        ...(date_filter && { date_filter }),
        ...(advanced_title_filter && { advanced_title_filter }),
        ...(include_ai && { include_ai }),
        ...(ai_work_arrangement_filter && { ai_work_arrangement_filter }),
      };

      console.log("📋 Query params:", queryParams);

      // Jika ada API key, gunakan axios untuk hit API yang sebenarnya
      if (process.env.RAPIDAPI_KEY && process.env.RAPIDAPI_HOST) {
        const response = await axios.get(`${process.env.RAPIDAPI_HOST}/jobs`, {
          headers: {
            "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
            "X-RapidAPI-Host": process.env.RAPIDAPI_HOST,
          },
          params: queryParams,
        });

        console.log(`✅ Fetched ${response.data.length || 0} jobs from API`);
        return response.data || [];
      }

      // Simulasi API response (untuk testing tanpa API key)
      const mockResponse = {
        data: [
          {
            id: "1827366568",
            date_posted: "2025-07-17T06:03:15",
            date_created: "2025-07-17T06:11:19.923755",
            title: "Data Analyst Intern",
            organization: "Lensa",
            organization_url: "https://www.linkedin.com/company/lensa",
            date_validthrough: "2025-08-16T06:03:15",
            locations_raw: [
              {
                "@type": "Place",
                address: {
                  "@type": "PostalAddress",
                  addressCountry: "US",
                  addressLocality: "Buffalo",
                  addressRegion: "NY",
                  streetAddress: null,
                },
                latitude: 42.88769,
                longitude: -78.87937,
              },
            ],
            employment_type: ["INTERN"],
            url: "https://www.linkedin.com/jobs/view/data-analyst-intern-at-lensa-4266935033",
            source_type: "jobboard",
            source: "linkedin",
            source_domain: "linkedin.com",
            organization_logo:
              "https://media.licdn.com/dms/image/v2/D4D0BAQEkHa-0Aki9XQ/company-logo_200_200/B4DZaKylu7GsAI-/0/1746085240184/lensa_logo?e=2147483647&v=beta&t=uWeVCpbXYyRN0ASrTAkroLlijETQQufn9qquZHoZTfo",
            cities_derived: ["Buffalo"],
            regions_derived: ["New York"],
            countries_derived: ["United States"],
            locations_derived: ["Buffalo, New York, United States"],
            timezones_derived: ["America/New_York"],
            lats_derived: [42.9018],
            lngs_derived: [-78.8487],
            remote_derived: false,
            seniority: "Internship",
            directapply: false,
            external_apply_url:
              "https://lensa.com/cgw/d3caabc6e1e347a496f3319043573caatjo1?jpsi=directemployers&publisher_preference=easier_apply&utm_campaign=Computer Occupations&utm_medium=slot&utm_source=linkedin&utm_term=jse",
          },
          {
            id: "1827366569",
            date_posted: "2025-07-17T06:00:00",
            date_created: "2025-07-17T06:10:00",
            title: "Software Engineering Intern",
            organization: "TechCorp",
            organization_url: "https://www.linkedin.com/company/techcorp",
            date_validthrough: "2025-08-17T06:00:00",
            locations_raw: [
              {
                "@type": "Place",
                address: {
                  "@type": "PostalAddress",
                  addressCountry: "US",
                  addressLocality: "San Francisco",
                  addressRegion: "CA",
                  streetAddress: null,
                },
                latitude: 37.7749,
                longitude: -122.4194,
              },
            ],
            employment_type: ["INTERN"],
            url: "https://www.linkedin.com/jobs/view/software-engineering-intern",
            source_type: "jobboard",
            source: "linkedin",
            source_domain: "linkedin.com",
            organization_logo: "https://example.com/logo.png",
            cities_derived: ["San Francisco"],
            regions_derived: ["California"],
            countries_derived: ["United States"],
            locations_derived: ["San Francisco, California, United States"],
            timezones_derived: ["America/Los_Angeles"],
            lats_derived: [37.7749],
            lngs_derived: [-122.4194],
            remote_derived: false,
            seniority: "Internship",
            directapply: true,
            external_apply_url: "https://techcorp.com/careers/intern",
          },
        ],
      };

      console.log(
        `✅ Fetched ${mockResponse.data.length} jobs from API (mock data)`
      );
      return mockResponse.data;
    } catch (error) {
      console.error("❌ Error fetching jobs from API:", error.message);
      throw error;
    }
  }

  /**
   * Simpan data job ke database dengan deduplication
   * @param {Array} jobs - Array of job data
   * @returns {Object} Result dengan jumlah jobs yang disimpan
   */
  async saveJobsToDatabase(jobs) {
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
          continue; // Skip jika sudah ada
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
      }

      await client.query("COMMIT");
      console.log(
        `✅ Saved ${savedCount} new jobs, skipped ${skippedCount} existing jobs`
      );
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("❌ Error saving jobs to database:", error);
      throw error;
    } finally {
      client.release();
    }

    return { savedCount, skippedCount };
  }

  /**
   * Sync data dari API ke database dengan query params
   * @param {Object} options - Query parameters untuk API
   * @returns {Object} Result sync
   */
  async syncJobsFromAPI(options = {}) {
    try {
      console.log("🔄 Starting job sync from API...");

      // Fetch data dari API dengan query params
      const jobs = await this.fetchJobsFromAPI(options);

      // Simpan ke database
      const result = await this.saveJobsToDatabase(jobs);

      // Log sync result
      console.log(
        `✅ Sync completed: ${result.savedCount} new jobs saved, ${result.skippedCount} skipped`
      );

      return {
        success: true,
        message: `Sync completed: ${result.savedCount} new jobs saved, ${result.skippedCount} skipped`,
        data: result,
      };
    } catch (error) {
      console.error("❌ Error during job sync:", error);
      return {
        success: false,
        message: "Error during job sync: " + error.message,
        error: error,
      };
    }
  }

  /**
   * Ambil data jobs dari database dengan pagination dan filter
   * @param {Object} options - Filter options
   * @returns {Object} Paginated jobs data
   */
  async getJobsFromDatabase(options = {}) {
    const {
      page = 1,
      limit = 10,
      search = "",
      location = "",
      organization = "",
      employment_type = "",
      remote = null,
    } = options;

    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Build search conditions
    if (search) {
      conditions.push(
        `(title ILIKE $${paramIndex} OR organization ILIKE $${paramIndex})`
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (location) {
      conditions.push(
        `(address_locality ILIKE $${paramIndex} OR address_region ILIKE $${paramIndex} OR address_country ILIKE $${paramIndex})`
      );
      params.push(`%${location}%`);
      paramIndex++;
    }

    if (organization) {
      conditions.push(`organization ILIKE $${paramIndex}`);
      params.push(`%${organization}%`);
      paramIndex++;
    }

    if (employment_type) {
      conditions.push(`employment_type::text ILIKE $${paramIndex}`);
      params.push(`%${employment_type}%`);
      paramIndex++;
    }

    if (remote !== null) {
      conditions.push(`remote_derived = $${paramIndex}`);
      params.push(remote);
      paramIndex++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    try {
      // Get total count
      const countQuery = `SELECT COUNT(*) FROM internships ${whereClause}`;
      const countResult = await pool.query(countQuery, params);
      const totalCount = parseInt(countResult.rows[0].count);

      // Get paginated data
      const dataQuery = `
                SELECT 
                    id, api_id, title, organization, organization_url, organization_logo,
                    address_country, address_locality, address_region, latitude, longitude,
                    employment_type, seniority, url, external_apply_url, direct_apply,
                    date_posted, date_created, date_validthrough,
                    source_type, source, source_domain, remote_derived,
                    cities_derived, regions_derived, countries_derived, locations_derived,
                    created_at
                FROM internships 
                ${whereClause}
                ORDER BY date_posted DESC
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;

      params.push(limit, offset);
      const dataResult = await pool.query(dataQuery, params);

      return {
        success: true,
        data: dataResult.rows,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      console.error("❌ Error getting jobs from database:", error);
      return {
        success: false,
        message: "Error getting jobs from database: " + error.message,
        error: error,
      };
    }
  }

  /**
   * Get job detail by ID
   * @param {number} id - Job ID
   * @returns {Object} Job detail
   */
  async getJobById(id) {
    try {
      const query = `
                SELECT * FROM internships WHERE id = $1
            `;

      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return {
          success: false,
          message: "Job not found",
        };
      }

      return {
        success: true,
        data: result.rows[0],
      };
    } catch (error) {
      console.error("❌ Error getting job by ID:", error);
      return {
        success: false,
        message: "Error getting job by ID: " + error.message,
        error: error,
      };
    }
  }
}

module.exports = new JobBoardService();
