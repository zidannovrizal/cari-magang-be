const { query } = require("../config/database");

class Internship {
  // Mendapatkan semua internship
  static async getAll(filters = {}) {
    try {
      let sql = `
        SELECT i.*, c.name as company_name, c.logo_url, c.city as company_city,
               COUNT(a.id) as application_count,
               AVG(r.rating) as average_rating,
               COUNT(r.id) as review_count
        FROM internships i
        JOIN companies c ON i.company_id = c.id
        LEFT JOIN applications a ON i.id = a.internship_id
        LEFT JOIN reviews r ON i.id = r.internship_id
        WHERE i.is_active = true
      `;

      const params = [];
      let paramCount = 0;

      // Filter berdasarkan lokasi
      if (filters.location) {
        paramCount++;
        sql += ` AND i.location ILIKE $${paramCount}`;
        params.push(`%${filters.location}%`);
      }

      // Filter berdasarkan work type
      if (filters.workType) {
        paramCount++;
        sql += ` AND i.work_type = $${paramCount}`;
        params.push(filters.workType);
      }

      // Filter berdasarkan bidang/skills
      if (filters.skills) {
        paramCount++;
        sql += ` AND i.skills_required && $${paramCount}`;
        params.push(filters.skills);
      }

      // Filter berdasarkan durasi
      if (filters.duration) {
        paramCount++;
        sql += ` AND i.duration_months = $${paramCount}`;
        params.push(filters.duration);
      }

      // Filter berdasarkan gaji minimum
      if (filters.salaryMin) {
        paramCount++;
        sql += ` AND i.salary_min >= $${paramCount}`;
        params.push(filters.salaryMin);
      }

      // Filter berdasarkan gaji maksimum
      if (filters.salaryMax) {
        paramCount++;
        sql += ` AND i.salary_max <= $${paramCount}`;
        params.push(filters.salaryMax);
      }

      sql += ` GROUP BY i.id, c.name, c.logo_url, c.city`;

      // Sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case "newest":
            sql += ` ORDER BY i.created_at DESC`;
            break;
          case "salary_high":
            sql += ` ORDER BY i.salary_max DESC`;
            break;
          case "salary_low":
            sql += ` ORDER BY i.salary_min ASC`;
            break;
          case "duration_short":
            sql += ` ORDER BY i.duration_months ASC`;
            break;
          case "rating_high":
            sql += ` ORDER BY average_rating DESC NULLS LAST`;
            break;
          default:
            sql += ` ORDER BY i.created_at DESC`;
        }
      } else {
        sql += ` ORDER BY i.created_at DESC`;
      }

      // Pagination
      if (filters.limit) {
        paramCount++;
        sql += ` LIMIT $${paramCount}`;
        params.push(filters.limit);
      }

      if (filters.offset) {
        paramCount++;
        sql += ` OFFSET $${paramCount}`;
        params.push(filters.offset);
      }

      const result = await query(sql, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting internships: ${error.message}`);
    }
  }

  // Mendapatkan internship by ID
  static async getById(id) {
    try {
      const result = await query(
        `SELECT i.*, c.name as company_name, c.logo_url, c.description as company_description,
                c.industry, c.company_size, c.website, c.city as company_city,
                COUNT(a.id) as application_count,
                AVG(r.rating) as average_rating,
                COUNT(r.id) as review_count
         FROM internships i
         JOIN companies c ON i.company_id = c.id
         LEFT JOIN applications a ON i.id = a.internship_id
         LEFT JOIN reviews r ON i.id = r.internship_id
         WHERE i.id = $1
         GROUP BY i.id, c.name, c.logo_url, c.description, c.industry, c.company_size, c.website, c.city`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error getting internship by ID: ${error.message}`);
    }
  }

  // Mendapatkan internship by company
  static async getByCompany(companyId) {
    try {
      const result = await query(
        `SELECT i.*, COUNT(a.id) as application_count,
                AVG(r.rating) as average_rating,
                COUNT(r.id) as review_count
         FROM internships i
         LEFT JOIN applications a ON i.id = a.internship_id
         LEFT JOIN reviews r ON i.id = r.internship_id
         WHERE i.company_id = $1
         GROUP BY i.id
         ORDER BY i.created_at DESC`,
        [companyId]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting internships by company: ${error.message}`);
    }
  }

  // Membuat internship baru
  static async create(internshipData) {
    try {
      const {
        company_id,
        title,
        description,
        requirements,
        responsibilities,
        skills_required,
        location,
        work_type,
        duration_months,
        salary_min,
        salary_max,
        currency,
        benefits,
        application_deadline,
        start_date,
        end_date,
        max_applicants,
      } = internshipData;

      const result = await query(
        `INSERT INTO internships (
          company_id, title, description, requirements, responsibilities, skills_required,
          location, work_type, duration_months, salary_min, salary_max, currency,
          benefits, application_deadline, start_date, end_date, max_applicants
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *`,
        [
          company_id,
          title,
          description,
          requirements,
          responsibilities,
          skills_required,
          location,
          work_type,
          duration_months,
          salary_min,
          salary_max,
          currency,
          benefits,
          application_deadline,
          start_date,
          end_date,
          max_applicants,
        ]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating internship: ${error.message}`);
    }
  }

  // Update internship
  static async update(id, internshipData) {
    try {
      const {
        title,
        description,
        requirements,
        responsibilities,
        skills_required,
        location,
        work_type,
        duration_months,
        salary_min,
        salary_max,
        currency,
        benefits,
        application_deadline,
        start_date,
        end_date,
        max_applicants,
        is_active,
        is_featured,
      } = internshipData;

      const result = await query(
        `UPDATE internships 
         SET title = $1, description = $2, requirements = $3, responsibilities = $4,
             skills_required = $5, location = $6, work_type = $7, duration_months = $8,
             salary_min = $9, salary_max = $10, currency = $11, benefits = $12,
             application_deadline = $13, start_date = $14, end_date = $15,
             max_applicants = $16, is_active = $17, is_featured = $18
         WHERE id = $19
         RETURNING *`,
        [
          title,
          description,
          requirements,
          responsibilities,
          skills_required,
          location,
          work_type,
          duration_months,
          salary_min,
          salary_max,
          currency,
          benefits,
          application_deadline,
          start_date,
          end_date,
          max_applicants,
          is_active,
          is_featured,
          id,
        ]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating internship: ${error.message}`);
    }
  }

  // Delete internship
  static async delete(id) {
    try {
      const result = await query(
        "DELETE FROM internships WHERE id = $1 RETURNING *",
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting internship: ${error.message}`);
    }
  }

  // Mendapatkan internship yang featured
  static async getFeatured(limit = 6) {
    try {
      const result = await query(
        `SELECT i.*, c.name as company_name, c.logo_url,
                COUNT(a.id) as application_count,
                AVG(r.rating) as average_rating
         FROM internships i
         JOIN companies c ON i.company_id = c.id
         LEFT JOIN applications a ON i.id = a.internship_id
         LEFT JOIN reviews r ON i.id = r.internship_id
         WHERE i.is_featured = true AND i.is_active = true
         GROUP BY i.id, c.name, c.logo_url
         ORDER BY i.created_at DESC
         LIMIT $1`,
        [limit]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting featured internships: ${error.message}`);
    }
  }

  // Mencari internship
  static async search(searchTerm, filters = {}) {
    try {
      let sql = `
        SELECT i.*, c.name as company_name, c.logo_url,
               COUNT(a.id) as application_count,
               AVG(r.rating) as average_rating
        FROM internships i
        JOIN companies c ON i.company_id = c.id
        LEFT JOIN applications a ON i.id = a.internship_id
        LEFT JOIN reviews r ON i.id = r.internship_id
        WHERE i.is_active = true
      `;

      const params = [];
      let paramCount = 0;

      // Search term
      if (searchTerm) {
        paramCount++;
        sql += ` AND (i.title ILIKE $${paramCount} OR i.description ILIKE $${paramCount} OR c.name ILIKE $${paramCount})`;
        params.push(`%${searchTerm}%`);
      }

      // Apply filters
      if (filters.location) {
        paramCount++;
        sql += ` AND i.location ILIKE $${paramCount}`;
        params.push(`%${filters.location}%`);
      }

      if (filters.workType) {
        paramCount++;
        sql += ` AND i.work_type = $${paramCount}`;
        params.push(filters.workType);
      }

      if (filters.duration) {
        paramCount++;
        sql += ` AND i.duration_months = $${paramCount}`;
        params.push(filters.duration);
      }

      sql += ` GROUP BY i.id, c.name, c.logo_url`;
      sql += ` ORDER BY i.created_at DESC`;

      if (filters.limit) {
        paramCount++;
        sql += ` LIMIT $${paramCount}`;
        params.push(filters.limit);
      }

      const result = await query(sql, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Error searching internships: ${error.message}`);
    }
  }

  // Increment view count
  static async incrementViews(id) {
    try {
      const result = await query(
        "UPDATE internships SET views_count = views_count + 1 WHERE id = $1 RETURNING views_count",
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error incrementing views: ${error.message}`);
    }
  }

  // Mendapatkan statistik internship
  static async getStats() {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_internships,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_internships,
          COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_internships,
          AVG(salary_min) as avg_salary_min,
          AVG(salary_max) as avg_salary_max,
          AVG(duration_months) as avg_duration
        FROM internships
        WHERE is_active = true
      `);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error getting internship stats: ${error.message}`);
    }
  }

  // Mendapatkan internship berdasarkan SDG 8 metrics
  static async getBySDG8Metrics() {
    try {
      const result = await query(
        `SELECT i.*, c.name as company_name, c.logo_url, c.sdg_8_certified,
                COUNT(a.id) as application_count,
                AVG(r.rating) as average_rating
         FROM internships i
         JOIN companies c ON i.company_id = c.id
         LEFT JOIN applications a ON i.id = a.internship_id
         LEFT JOIN reviews r ON i.id = r.internship_id
         WHERE i.is_active = true AND c.sdg_8_certified = true
         GROUP BY i.id, c.name, c.logo_url, c.sdg_8_certified
         ORDER BY i.created_at DESC`
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting SDG 8 internships: ${error.message}`);
    }
  }
}

module.exports = Internship;
