const { query } = require("../config/database");
const bcrypt = require("bcrypt");

class Company {
  // Mendapatkan semua company
  static async getAll() {
    try {
      const result = await query(
        "SELECT * FROM companies ORDER BY created_at DESC"
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting companies: ${error.message}`);
    }
  }

  // Mendapatkan company by ID
  static async getById(id) {
    try {
      const result = await query("SELECT * FROM companies WHERE id = $1", [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error getting company by ID: ${error.message}`);
    }
  }

  // Mendapatkan company by email
  static async getByEmail(email) {
    try {
      const result = await query("SELECT * FROM companies WHERE email = $1", [
        email,
      ]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error getting company by email: ${error.message}`);
    }
  }

  // Membuat company baru
  static async create(companyData) {
    try {
      const {
        email,
        password,
        name,
        description,
        industry,
        company_size,
        website,
        logo_url,
        address,
        city,
        province,
        postal_code,
        phone,
      } = companyData;

      // Hash password
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      const result = await query(
        `INSERT INTO companies (email, password_hash, name, description, industry, company_size, 
                               website, logo_url, address, city, province, postal_code, phone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          email,
          password_hash,
          name,
          description,
          industry,
          company_size,
          website,
          logo_url,
          address,
          city,
          province,
          postal_code,
          phone,
        ]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating company: ${error.message}`);
    }
  }

  // Update company
  static async update(id, companyData) {
    try {
      const {
        name,
        description,
        industry,
        company_size,
        website,
        logo_url,
        address,
        city,
        province,
        postal_code,
        phone,
        is_verified,
        sdg_8_certified,
      } = companyData;

      const result = await query(
        `UPDATE companies 
         SET name = $1, description = $2, industry = $3, company_size = $4,
             website = $5, logo_url = $6, address = $7, city = $8,
             province = $9, postal_code = $10, phone = $11, is_verified = $12, sdg_8_certified = $13
         WHERE id = $14
         RETURNING *`,
        [
          name,
          description,
          industry,
          company_size,
          website,
          logo_url,
          address,
          city,
          province,
          postal_code,
          phone,
          is_verified,
          sdg_8_certified,
          id,
        ]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating company: ${error.message}`);
    }
  }

  // Update password
  static async updatePassword(id, newPassword) {
    try {
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(newPassword, saltRounds);

      const result = await query(
        "UPDATE companies SET password_hash = $1 WHERE id = $2 RETURNING *",
        [password_hash, id]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating password: ${error.message}`);
    }
  }

  // Verifikasi password
  static async verifyPassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      throw new Error(`Error verifying password: ${error.message}`);
    }
  }

  // Delete company
  static async delete(id) {
    try {
      const result = await query(
        "DELETE FROM companies WHERE id = $1 RETURNING *",
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting company: ${error.message}`);
    }
  }

  // Mendapatkan company dengan SDG 8 metrics
  static async getCompanyWithSDG8Metrics(id) {
    try {
      const result = await query(
        `SELECT c.*, 
                AVG(sm.metric_value) as avg_sdg8_score,
                COUNT(sm.id) as metrics_count
         FROM companies c
         LEFT JOIN sdg8_metrics sm ON c.id = sm.company_id
         WHERE c.id = $1
         GROUP BY c.id`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(
        `Error getting company with SDG 8 metrics: ${error.message}`
      );
    }
  }

  // Mendapatkan company yang SDG 8 certified
  static async getSDG8Certified() {
    try {
      const result = await query(
        `SELECT c.*, 
                AVG(sm.metric_value) as avg_sdg8_score,
                COUNT(sm.id) as metrics_count
         FROM companies c
         LEFT JOIN sdg8_metrics sm ON c.id = sm.company_id
         WHERE c.sdg_8_certified = true
         GROUP BY c.id
         ORDER BY avg_sdg8_score DESC NULLS LAST`
      );
      return result.rows;
    } catch (error) {
      throw new Error(
        `Error getting SDG 8 certified companies: ${error.message}`
      );
    }
  }

  // Mendapatkan statistik company
  static async getStats() {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_companies,
          COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_companies,
          COUNT(CASE WHEN sdg_8_certified = true THEN 1 END) as sdg8_certified_companies,
          COUNT(CASE WHEN industry = 'Technology' THEN 1 END) as tech_companies,
          COUNT(CASE WHEN industry = 'Marketing' THEN 1 END) as marketing_companies,
          COUNT(CASE WHEN industry = 'Design' THEN 1 END) as design_companies
        FROM companies
      `);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error getting company stats: ${error.message}`);
    }
  }

  // Search companies
  static async search(searchTerm, filters = {}) {
    try {
      let sql = `
        SELECT c.*, 
               COUNT(i.id) as internship_count,
               AVG(r.rating) as average_rating,
               COUNT(r.id) as review_count
        FROM companies c
        LEFT JOIN internships i ON c.id = i.company_id
        LEFT JOIN reviews r ON c.id = r.company_id
        WHERE 1=1
      `;

      const params = [];
      let paramCount = 0;

      // Search term
      if (searchTerm) {
        paramCount++;
        sql += ` AND (c.name ILIKE $${paramCount} OR c.description ILIKE $${paramCount} OR c.industry ILIKE $${paramCount})`;
        params.push(`%${searchTerm}%`);
      }

      // Apply filters
      if (filters.industry) {
        paramCount++;
        sql += ` AND c.industry = $${paramCount}`;
        params.push(filters.industry);
      }

      if (filters.city) {
        paramCount++;
        sql += ` AND c.city ILIKE $${paramCount}`;
        params.push(`%${filters.city}%`);
      }

      if (filters.sdg8Certified) {
        sql += ` AND c.sdg_8_certified = true`;
      }

      if (filters.verified) {
        sql += ` AND c.is_verified = true`;
      }

      sql += ` GROUP BY c.id`;
      sql += ` ORDER BY c.created_at DESC`;

      if (filters.limit) {
        paramCount++;
        sql += ` LIMIT $${paramCount}`;
        params.push(filters.limit);
      }

      const result = await query(sql, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Error searching companies: ${error.message}`);
    }
  }

  // Mendapatkan company dengan reviews
  static async getCompanyWithReviews(id) {
    try {
      const result = await query(
        `SELECT c.*, 
                AVG(r.rating) as average_rating,
                COUNT(r.id) as review_count,
                COUNT(DISTINCT r.user_id) as unique_reviewers
         FROM companies c
         LEFT JOIN reviews r ON c.id = r.company_id
         WHERE c.id = $1
         GROUP BY c.id`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error getting company with reviews: ${error.message}`);
    }
  }

  // Mendapatkan company dengan internship stats
  static async getCompanyWithInternshipStats(id) {
    try {
      const result = await query(
        `SELECT c.*, 
                COUNT(i.id) as total_internships,
                COUNT(CASE WHEN i.is_active = true THEN 1 END) as active_internships,
                COUNT(CASE WHEN i.is_featured = true THEN 1 END) as featured_internships,
                AVG(i.salary_min) as avg_salary_min,
                AVG(i.salary_max) as avg_salary_max,
                SUM(i.views_count) as total_views
         FROM companies c
         LEFT JOIN internships i ON c.id = i.company_id
         WHERE c.id = $1
         GROUP BY c.id`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(
        `Error getting company with internship stats: ${error.message}`
      );
    }
  }
}

module.exports = Company;
