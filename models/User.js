const { query } = require("../config/database");
const bcrypt = require("bcrypt");

class User {
  // Mendapatkan semua user
  static async getAll() {
    try {
      const result = await query(
        "SELECT * FROM users ORDER BY created_at DESC"
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting users: ${error.message}`);
    }
  }

  // Mendapatkan user by ID
  static async getById(id) {
    try {
      const result = await query("SELECT * FROM users WHERE id = $1", [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error getting user by ID: ${error.message}`);
    }
  }

  // Mendapatkan user by email
  static async getByEmail(email) {
    try {
      const result = await query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error getting user by email: ${error.message}`);
    }
  }

  // Membuat user baru
  static async create(userData) {
    try {
      const {
        email,
        password,
        first_name,
        last_name,
        university,
        major,
        phone,
        bio,
        skills,
      } = userData;

      // Hash password
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      const result = await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, university, major, phone, bio, skills)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          email,
          password_hash,
          first_name,
          last_name,
          university,
          major,
          phone,
          bio,
          skills,
        ]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Update user
  static async update(id, userData) {
    try {
      const {
        first_name,
        last_name,
        university,
        major,
        phone,
        bio,
        skills,
        resume_url,
        profile_picture_url,
      } = userData;

      const result = await query(
        `UPDATE users 
         SET first_name = $1, last_name = $2, university = $3, major = $4, 
             phone = $5, bio = $6, skills = $7, resume_url = $8, profile_picture_url = $9
         WHERE id = $10
         RETURNING *`,
        [
          first_name,
          last_name,
          university,
          major,
          phone,
          bio,
          skills,
          resume_url,
          profile_picture_url,
          id,
        ]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // Update password
  static async updatePassword(id, newPassword) {
    try {
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(newPassword, saltRounds);

      const result = await query(
        "UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING *",
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

  // Delete user
  static async delete(id) {
    try {
      const result = await query(
        "DELETE FROM users WHERE id = $1 RETURNING *",
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  // Mendapatkan user dengan skills
  static async getUserWithSkills(id) {
    try {
      const result = await query(
        `SELECT u.*, array_agg(s.name) as skill_names
         FROM users u
         LEFT JOIN user_skills us ON u.id = us.user_id
         LEFT JOIN skills s ON us.skill_id = s.id
         WHERE u.id = $1
         GROUP BY u.id`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error getting user with skills: ${error.message}`);
    }
  }

  // Menambah skill ke user
  static async addSkill(userId, skillId, proficiencyLevel = "beginner") {
    try {
      const result = await query(
        "INSERT INTO user_skills (user_id, skill_id, proficiency_level) VALUES ($1, $2, $3) RETURNING *",
        [userId, skillId, proficiencyLevel]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error adding skill to user: ${error.message}`);
    }
  }

  // Menghapus skill dari user
  static async removeSkill(userId, skillId) {
    try {
      const result = await query(
        "DELETE FROM user_skills WHERE user_id = $1 AND skill_id = $2 RETURNING *",
        [userId, skillId]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error removing skill from user: ${error.message}`);
    }
  }

  // Mendapatkan aplikasi user
  static async getUserApplications(userId) {
    try {
      const result = await query(
        `SELECT a.*, i.title as internship_title, c.name as company_name
         FROM applications a
         JOIN internships i ON a.internship_id = i.id
         JOIN companies c ON i.company_id = c.id
         WHERE a.user_id = $1
         ORDER BY a.applied_at DESC`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting user applications: ${error.message}`);
    }
  }

  // Mendapatkan lowongan tersimpan user
  static async getSavedInternships(userId) {
    try {
      const result = await query(
        `SELECT si.*, i.title, i.description, i.location, i.work_type, i.salary_min, i.salary_max,
                c.name as company_name, c.logo_url
         FROM saved_internships si
         JOIN internships i ON si.internship_id = i.id
         JOIN companies c ON i.company_id = c.id
         WHERE si.user_id = $1
         ORDER BY si.saved_at DESC`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting saved internships: ${error.message}`);
    }
  }

  // Menyimpan lowongan
  static async saveInternship(userId, internshipId) {
    try {
      const result = await query(
        "INSERT INTO saved_internships (user_id, internship_id) VALUES ($1, $2) RETURNING *",
        [userId, internshipId]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error saving internship: ${error.message}`);
    }
  }

  // Menghapus lowongan tersimpan
  static async removeSavedInternship(userId, internshipId) {
    try {
      const result = await query(
        "DELETE FROM saved_internships WHERE user_id = $1 AND internship_id = $2 RETURNING *",
        [userId, internshipId]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error removing saved internship: ${error.message}`);
    }
  }

  // Mendapatkan notifikasi user
  static async getNotifications(userId, limit = 10) {
    try {
      const result = await query(
        "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2",
        [userId, limit]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting notifications: ${error.message}`);
    }
  }

  // Mark notifikasi sebagai read
  static async markNotificationAsRead(notificationId) {
    try {
      const result = await query(
        "UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *",
        [notificationId]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error marking notification as read: ${error.message}`);
    }
  }
}

module.exports = User;
