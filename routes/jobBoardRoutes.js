const express = require("express");
const router = express.Router();
const jobBoardService = require("../services/jobBoardService");
const { query } = require("../config/database");

// Get popular jobs (latest 3)
router.get("/popular", async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        id,
        title,
        organization,
        organization_logo,
        address_locality,
        address_region,
        address_country,
        employment_type,
        remote_derived,
        date_posted,
        url,
        source_type,
        source,
        source_domain
      FROM internships 
      ORDER BY date_posted DESC
      LIMIT 3
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching popular jobs:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil lowongan terpopuler",
    });
  }
});

// Get organizations list for dropdown
router.get("/organizations", async (req, res) => {
  try {
    const result = await query(`
      SELECT DISTINCT 
        organization,
        organization_logo,
        organization_industry,
        organization_headquarters,
        COUNT(*) as job_count
      FROM internships 
      WHERE organization IS NOT NULL AND organization != ''
      GROUP BY organization, organization_logo, organization_industry, organization_headquarters
      ORDER BY organization ASC
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil daftar perusahaan",
    });
  }
});

// Get all internships with filtering and pagination
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      location = "",
      organization = "",
      employment_type = "",
      remote = "",
    } = req.query;

    // Build WHERE clause
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(
        `(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
      );
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (location) {
      whereConditions.push(
        `(address_locality ILIKE $${paramIndex} OR address_region ILIKE $${paramIndex} OR address_country ILIKE $${paramIndex})`
      );
      queryParams.push(`%${location}%`);
      paramIndex++;
    }

    if (organization) {
      whereConditions.push(`organization ILIKE $${paramIndex}`);
      queryParams.push(`%${organization}%`);
      paramIndex++;
    }

    if (employment_type) {
      whereConditions.push(`employment_type ILIKE $${paramIndex}`);
      queryParams.push(`%${employment_type}%`);
      paramIndex++;
    }

    if (remote !== "") {
      whereConditions.push(`remote_derived = $${paramIndex}`);
      queryParams.push(remote === "true");
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Count total records
    const countQuery = `SELECT COUNT(*) as total FROM internships ${whereClause}`;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get data with pagination
    const dataQuery = `
      SELECT * FROM internships 
      ${whereClause}
      ORDER BY date_posted DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);

    const result = await query(dataQuery, queryParams);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching internships:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data magang",
    });
  }
});

// Get job by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query("SELECT * FROM internships WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lowongan tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error getting job by ID:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil detail lowongan",
    });
  }
});

/**
 * @route   POST /api/job-board/sync
 * @desc    Sync jobs dari API eksternal ke database dengan query params
 * @access  Public (untuk testing, bisa diubah jadi private)
 */
router.post("/sync", async (req, res) => {
  try {
    // Query parameters yang tersedia di API
    const {
      title_filter,
      location_filter,
      description_filter,
      description_type,
      remote,
      agency,
      offset = 0,
      date_filter,
      advanced_title_filter,
      include_ai,
      ai_work_arrangement_filter,
    } = req.body;

    console.log("🔄 Starting job sync with params:", req.body);
    const result = await jobBoardService.syncJobsFromAPI({
      title_filter,
      location_filter,
      description_filter,
      description_type,
      remote,
      agency,
      offset,
      date_filter,
      advanced_title_filter,
      include_ai,
      ai_work_arrangement_filter,
    });

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("❌ Error in job sync route:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during job sync",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/job-board/stats/summary
 * @desc    Get job statistics summary
 * @access  Public
 */
router.get("/stats/summary", async (req, res) => {
  try {
    const { Pool } = require("pg");
    require("dotenv").config();

    const pool = new Pool({
      host: process.env.DB_HOST || "127.0.0.1",
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || "cari_magang_db",
      user: process.env.DB_USER || "admin",
      password: process.env.DB_PASSWORD || "",
    });

    // Get total jobs count
    const totalJobs = await pool.query("SELECT COUNT(*) FROM internships");

    // Get jobs by country
    const jobsByCountry = await pool.query(`
            SELECT address_country, COUNT(*) as count 
            FROM internships 
            WHERE address_country IS NOT NULL 
            GROUP BY address_country 
            ORDER BY count DESC 
            LIMIT 5
        `);

    // Get jobs by organization
    const jobsByOrganization = await pool.query(`
            SELECT organization, COUNT(*) as count 
            FROM internships 
            GROUP BY organization 
            ORDER BY count DESC 
            LIMIT 5
        `);

    // Get remote vs on-site jobs
    const remoteStats = await pool.query(`
            SELECT remote_derived, COUNT(*) as count 
            FROM internships 
            GROUP BY remote_derived
        `);

    await pool.end();

    res.json({
      success: true,
      data: {
        totalJobs: parseInt(totalJobs.rows[0].count),
        jobsByCountry: jobsByCountry.rows,
        jobsByOrganization: jobsByOrganization.rows,
        remoteStats: remoteStats.rows,
      },
    });
  } catch (error) {
    console.error("❌ Error in get stats route:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error getting stats",
      error: error.message,
    });
  }
});

module.exports = router;
