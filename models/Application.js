const { query } = require("../config/database");

class Application {
  // Mendapatkan semua applications
  static async getAll() {
    try {
      const result = await query(
        `SELECT a.*, u.first_name, u.last_name, u.email as user_email, u.university,
                i.title as internship_title, c.name as company_name
         FROM applications a
         JOIN users u ON a.user_id = u.id
         JOIN internships i ON a.internship_id = i.id
         JOIN companies c ON i.company_id = c.id
         ORDER BY a.applied_at DESC`
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting applications: ${error.message}`);
    }
  }

  // Mendapatkan application by ID
  static async getById(id) {
    try {
      const result = await query(
        `SELECT a.*, u.first_name, u.last_name, u.email as user_email, u.university, u.major,
                u.phone as user_phone, u.skills as user_skills, u.resume_url as user_resume_url,
                i.title as internship_title, i.description as internship_description,
                i.location as internship_location, i.work_type as internship_work_type,
                i.salary_min, i.salary_max, i.duration_months,
                c.name as company_name, c.email as company_email, c.phone as company_phone,
                c.city as company_city, c.industry as company_industry
         FROM applications a
         JOIN users u ON a.user_id = u.id
         JOIN internships i ON a.internship_id = i.id
         JOIN companies c ON i.company_id = c.id
         WHERE a.id = $1`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error getting application by ID: ${error.message}`);
    }
  }

  // Mendapatkan application by user dan internship
  static async getByUserAndInternship(userId, internshipId) {
    try {
      const result = await query(
        "SELECT * FROM applications WHERE user_id = $1 AND internship_id = $2",
        [userId, internshipId]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(
        `Error getting application by user and internship: ${error.message}`
      );
    }
  }

  // Mendapatkan applications by user
  static async getByUser(userId) {
    try {
      const result = await query(
        `SELECT a.*, i.title as internship_title, i.location as internship_location,
                i.work_type as internship_work_type, i.salary_min, i.salary_max,
                c.name as company_name, c.logo_url as company_logo
         FROM applications a
         JOIN internships i ON a.internship_id = i.id
         JOIN companies c ON i.company_id = c.id
         WHERE a.user_id = $1
         ORDER BY a.applied_at DESC`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting applications by user: ${error.message}`);
    }
  }

  // Mendapatkan applications by internship
  static async getByInternship(internshipId, companyId) {
    try {
      const result = await query(
        `SELECT a.*, u.first_name, u.last_name, u.email as user_email, u.university, u.major,
                u.phone as user_phone, u.skills as user_skills, u.resume_url as user_resume_url
         FROM applications a
         JOIN users u ON a.user_id = u.id
         JOIN internships i ON a.internship_id = i.id
         WHERE a.internship_id = $1 AND i.company_id = $2
         ORDER BY a.applied_at DESC`,
        [internshipId, companyId]
      );
      return result.rows;
    } catch (error) {
      throw new Error(
        `Error getting applications by internship: ${error.message}`
      );
    }
  }

  // Mendapatkan applications by company
  static async getByCompany(companyId) {
    try {
      const result = await query(
        `SELECT a.*, u.first_name, u.last_name, u.email as user_email, u.university, u.major,
                u.phone as user_phone, u.skills as user_skills, u.resume_url as user_resume_url,
                i.title as internship_title, i.location as internship_location,
                i.work_type as internship_work_type, i.salary_min, i.salary_max
         FROM applications a
         JOIN users u ON a.user_id = u.id
         JOIN internships i ON a.internship_id = i.id
         WHERE i.company_id = $1
         ORDER BY a.applied_at DESC`,
        [companyId]
      );
      return result.rows;
    } catch (error) {
      throw new Error(
        `Error getting applications by company: ${error.message}`
      );
    }
  }

  // Membuat application baru
  static async create(applicationData) {
    try {
      const { user_id, internship_id, cover_letter, resume_url } =
        applicationData;

      const result = await query(
        `INSERT INTO applications (user_id, internship_id, cover_letter, resume_url)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [user_id, internship_id, cover_letter, resume_url]
      );

      // Update current_applicants count
      await query(
        "UPDATE internships SET current_applicants = current_applicants + 1 WHERE id = $1",
        [internship_id]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating application: ${error.message}`);
    }
  }

  // Update application status
  static async updateStatus(id, status, notes = null) {
    try {
      const result = await query(
        `UPDATE applications 
         SET status = $1, notes = $2, reviewed_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [status, notes, id]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating application status: ${error.message}`);
    }
  }

  // Update application
  static async update(id, applicationData) {
    try {
      const { cover_letter, resume_url, status, notes } = applicationData;

      const result = await query(
        `UPDATE applications 
         SET cover_letter = $1, resume_url = $2, status = $3, notes = $4
         WHERE id = $5
         RETURNING *`,
        [cover_letter, resume_url, status, notes, id]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating application: ${error.message}`);
    }
  }

  // Delete application
  static async delete(id) {
    try {
      // Get internship_id before deleting
      const application = await this.getById(id);

      const result = await query(
        "DELETE FROM applications WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rows[0]) {
        // Update current_applicants count
        await query(
          "UPDATE internships SET current_applicants = current_applicants - 1 WHERE id = $1",
          [application.internship_id]
        );
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting application: ${error.message}`);
    }
  }

  // Mendapatkan statistik applications
  static async getStats() {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_applications,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_applications,
          COUNT(CASE WHEN status = 'reviewed' THEN 1 END) as reviewed_applications,
          COUNT(CASE WHEN status = 'shortlisted' THEN 1 END) as shortlisted_applications,
          COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_applications,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_applications,
          AVG(CASE WHEN reviewed_at IS NOT NULL THEN EXTRACT(EPOCH FROM (reviewed_at - applied_at))/3600 END) as avg_review_time_hours
        FROM applications
      `);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error getting application stats: ${error.message}`);
    }
  }

  // Mendapatkan applications dengan filter
  static async getWithFilters(filters = {}) {
    try {
      let sql = `
        SELECT a.*, u.first_name, u.last_name, u.email as user_email, u.university,
               i.title as internship_title, c.name as company_name
        FROM applications a
        JOIN users u ON a.user_id = u.id
        JOIN internships i ON a.internship_id = i.id
        JOIN companies c ON i.company_id = c.id
        WHERE 1=1
      `;

      const params = [];
      let paramCount = 0;

      // Filter berdasarkan status
      if (filters.status) {
        paramCount++;
        sql += ` AND a.status = $${paramCount}`;
        params.push(filters.status);
      }

      // Filter berdasarkan company
      if (filters.companyId) {
        paramCount++;
        sql += ` AND i.company_id = $${paramCount}`;
        params.push(filters.companyId);
      }

      // Filter berdasarkan internship
      if (filters.internshipId) {
        paramCount++;
        sql += ` AND a.internship_id = $${paramCount}`;
        params.push(filters.internshipId);
      }

      // Filter berdasarkan user
      if (filters.userId) {
        paramCount++;
        sql += ` AND a.user_id = $${paramCount}`;
        params.push(filters.userId);
      }

      // Filter berdasarkan tanggal
      if (filters.startDate) {
        paramCount++;
        sql += ` AND a.applied_at >= $${paramCount}`;
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        paramCount++;
        sql += ` AND a.applied_at <= $${paramCount}`;
        params.push(filters.endDate);
      }

      sql += ` ORDER BY a.applied_at DESC`;

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
      throw new Error(
        `Error getting applications with filters: ${error.message}`
      );
    }
  }

  // Mendapatkan applications yang belum direview
  static async getPending() {
    try {
      const result = await query(
        `SELECT a.*, u.first_name, u.last_name, u.email as user_email,
                i.title as internship_title, c.name as company_name
         FROM applications a
         JOIN users u ON a.user_id = u.id
         JOIN internships i ON a.internship_id = i.id
         JOIN companies c ON i.company_id = c.id
         WHERE a.status = 'pending'
         ORDER BY a.applied_at ASC`
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting pending applications: ${error.message}`);
    }
  }

  // Mendapatkan applications yang diterima
  static async getAccepted() {
    try {
      const result = await query(
        `SELECT a.*, u.first_name, u.last_name, u.email as user_email,
                i.title as internship_title, c.name as company_name
         FROM applications a
         JOIN users u ON a.user_id = u.id
         JOIN internships i ON a.internship_id = i.id
         JOIN companies c ON i.company_id = c.id
         WHERE a.status = 'accepted'
         ORDER BY a.applied_at DESC`
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting accepted applications: ${error.message}`);
    }
  }
}

module.exports = Application;
