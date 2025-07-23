const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { authenticateToken } = require("../middleware/auth");
const { Pool } = require("pg");
require("dotenv").config();

// Database connection - menggunakan konfigurasi yang sama dengan authRoutes
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const result = await pool.query(
      "SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1",
      [userId]
    );
    const user = result.rows[0];

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const userId = req.user.userId || req.user.id;

    console.log("Debug - User ID:", userId);
    console.log("Debug - User object:", req.user);

    // Validasi input
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Nama dan email harus diisi",
      });
    }

    // Cek apakah user ada
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    const user = userResult.rows[0];

    console.log("Debug - User query result:", userResult.rows);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Cek apakah email sudah digunakan oleh user lain
    if (email !== user.email) {
      const existingUserResult = await pool.query(
        "SELECT id FROM users WHERE email = $1 AND id != $2",
        [email, userId]
      );
      if (existingUserResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email sudah digunakan",
        });
      }
    }

    // Update password jika diisi
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Password saat ini harus diisi untuk mengubah password",
        });
      }

      // Verifikasi password saat ini
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password_hash
      );
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Password saat ini salah",
        });
      }

      // Hash password baru
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(newPassword, saltRounds);

      // Update user dengan password baru
      const updateResult = await pool.query(
        "UPDATE users SET name = $1, email = $2, password_hash = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, name, email, created_at, updated_at",
        [name, email, password_hash, userId]
      );

      const updatedUser = updateResult.rows[0];

      res.json({
        success: true,
        message: "Profil berhasil diperbarui",
        data: updatedUser,
      });
    } else {
      // Update user tanpa password
      const updateResult = await pool.query(
        "UPDATE users SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, name, email, created_at, updated_at",
        [name, email, userId]
      );

      const updatedUser = updateResult.rows[0];

      res.json({
        success: true,
        message: "Profil berhasil diperbarui",
        data: updatedUser,
      });
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui profil",
    });
  }
});

module.exports = router;
