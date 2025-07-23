# Cari Magang Backend API

Backend API untuk aplikasi Cari Magang dengan integrasi job board API.

## Fitur Utama

- 🔐 Authentication & Authorization
- 👥 User Management
- 🏢 Company Management
- 💼 Internship Management
- 📝 Application System
- ⭐ Review System
- 🎯 Skills Management
- 🔔 Notification System
- 📊 SDG 8 Metrics
- 🔄 Job Board API Integration

## Job Board API Integration

Sistem ini mengintegrasikan dengan external job board API untuk mengambil data lowongan magang secara otomatis dan menyimpannya ke database lokal.

### Endpoints Job Board

#### 1. Sync Jobs from External API

```http
POST /api/job-board/sync
Authorization: Bearer <token>
Content-Type: application/json

{
  "endpoint": "/active-jb-7d"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Job sync completed successfully",
  "data": {
    "total": 10,
    "saved": 8,
    "errors": 2
  }
}
```

#### 2. Get Jobs with Pagination & Filters

```http
GET /api/job-board?page=1&limit=10&location=New York&remote_work=true
```

**Query Parameters:**

- `page`: Halaman (default: 1)
- `limit`: Jumlah item per halaman (default: 10)
- `location`: Filter berdasarkan lokasi
- `remote_work`: Filter remote work (true/false)
- `employment_type`: Filter tipe pekerjaan
- `company_industry`: Filter industri perusahaan

**Response:**

```json
{
  "success": true,
  "data": {
    "jobs": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "totalPages": 15
    }
  }
}
```

#### 3. Get Job by ID

```http
GET /api/job-board/123
```

#### 4. Get Job Statistics

```http
GET /api/job-board/stats/overview
```

**Response:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "total_jobs": 150,
      "remote_jobs": 45,
      "on_site_jobs": 105,
      "total_companies": 25,
      "recent_jobs": 12
    },
    "topIndustries": [...],
    "topLocations": [...]
  }
}
```

## Setup & Installation

### 1. Install Dependencies

```bash
cd src/backend
npm install
```

### 2. Environment Variables

**PENTING**: Jangan commit file `.env` ke repository! File ini berisi informasi sensitif. File `.env` sudah di-ignore di `.gitignore` utama project.

```bash
# Copy environment template
cp env.example .env
```

Edit file `.env` dan sesuaikan nilai-nilai berikut:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cari_magang_db
DB_USER=admin
DB_PASSWORD=admin123

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# API Configuration
PORT=5000
NODE_ENV=development

# RapidAPI Configuration
RAPIDAPI_KEY=your-rapidapi-key-here
RAPIDAPI_HOST=internships-api.p.rapidapi.com

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Lihat `SETUP_ENV.md` untuk panduan lengkap environment variables.

### 3. Database Setup

Pastikan PostgreSQL sudah terinstall dan database sudah dibuat sesuai dengan schema yang ada di `database/schema.sql`.

### 4. Sync Jobs from API

Untuk mengambil data dari external API dan menyimpannya ke database:

```bash
# Sync jobs secara manual
npm run sync-jobs

# Atau jalankan script langsung
node scripts/syncJobs.js
```

### 5. Start Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Job Board Service

Service ini menangani:

- ✅ Fetch data dari external job board API
- ✅ Parse dan transform data
- ✅ Save company data ke database
- ✅ Save internship data ke database
- ✅ Handle duplicate data
- ✅ Provide pagination dan filtering
- ✅ Generate statistics

### Cara Kerja

1. **Fetch Data**: Mengambil data dari RapidAPI job board endpoint
2. **Parse Data**: Mengubah response API menjadi format yang sesuai dengan database
3. **Save Company**: Menyimpan data perusahaan (dengan deduplication)
4. **Save Internship**: Menyimpan data lowongan magang
5. **Handle Errors**: Menangani error dan logging

### Data Structure

Data dari API akan disimpan dalam format:

**Companies Table:**

- name, description, website_url, logo_url
- industry, size, founded_year, headquarters
- linkedin_url, linkedin_slug, employee_count
- followers_count, slogan, specialties, locations

**Internships Table:**

- title, description, company_id, location
- salary_min, salary_max, salary_currency
- employment_type, remote_work, application_url
- external_url, external_id, date_posted
- date_valid_through, seniority_level, is_direct_apply
- source_type, source_domain

## Cron Job (Optional)

Untuk sync otomatis, bisa ditambahkan cron job:

```javascript
const cron = require("node-cron");
const syncJobs = require("./scripts/syncJobs");

// Sync jobs setiap 6 jam
cron.schedule("0 */6 * * *", () => {
  console.log("Running scheduled job sync...");
  syncJobs();
});
```

## Testing

```bash
# Run tests
npm test

# Test specific endpoint
curl -X GET http://localhost:5000/api/job-board
```

## Error Handling

Service ini menangani berbagai error:

- ✅ API connection errors
- ✅ Database connection errors
- ✅ Data parsing errors
- ✅ Duplicate data handling
- ✅ Invalid data validation

## Monitoring

Logs yang tersedia:

- 📥 API fetch progress
- 💾 Database save progress
- ⚠️ Error handling
- 📊 Statistics summary

## Security

- ✅ Rate limiting
- ✅ Input validation
- ✅ SQL injection protection
- ✅ CORS configuration
- ✅ Helmet security headers
