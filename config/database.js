const { Pool } = require("pg");

// Konfigurasi database PostgreSQL
let pool;

if (process.env.DATABASE_URL) {
  // Untuk Railway/Production - menggunakan connection string
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    // Konfigurasi connection pool
    max: 20, // maksimal koneksi dalam pool
    idleTimeoutMillis: 30000, // timeout untuk koneksi idle
    connectionTimeoutMillis: 2000, // timeout untuk koneksi baru
  });
} else {
  // Untuk local development
  pool = new Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "cari_magang_db",
    password: process.env.DB_PASSWORD || "password",
    port: process.env.DB_PORT || 5432,
    // Konfigurasi connection pool
    max: 20, // maksimal koneksi dalam pool
    idleTimeoutMillis: 30000, // timeout untuk koneksi idle
    connectionTimeoutMillis: 2000, // timeout untuk koneksi baru
  });
}

// Test koneksi database
pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("❌ Database connection error:", err);
});

// Helper function untuk query
const query = (text, params) => pool.query(text, params);

// Helper function untuk mendapatkan client dari pool
const getClient = () => pool.connect();

module.exports = {
  query,
  getClient,
  pool,
};
