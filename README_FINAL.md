# Backend Cari Magang (SDG 8)

Platform pencarian magang untuk mendukung SDG 8 (Pekerjaan Layak & Pertumbuhan Ekonomi).

## 🚀 Fitur Utama

- **Autentikasi User**: Register, login, logout
- **Job Board Integration**: Fetch data dari API eksternal, simpan ke database
- **Search & Filter**: Cari magang berdasarkan lokasi, perusahaan, dll
- **Job Details**: Detail magang dengan redirect ke URL eksternal untuk apply
- **Statistics**: Dashboard dengan statistik magang

## 📋 Struktur Database

### Tabel Utama

- **users**: Data user (id, name, email, password_hash)
- **internships**: Data magang dari API eksternal

### Struktur Data Internships

```sql
CREATE TABLE internships (
    id SERIAL PRIMARY KEY,
    api_id VARCHAR(50) UNIQUE, -- ID dari API
    title VARCHAR(200) NOT NULL,
    organization VARCHAR(100) NOT NULL,
    organization_url VARCHAR(500),
    organization_logo VARCHAR(500),
    address_country VARCHAR(100),
    address_locality VARCHAR(100),
    address_region VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    employment_type TEXT, -- JSON array
    seniority VARCHAR(50),
    url VARCHAR(500) NOT NULL, -- URL job posting
    external_apply_url VARCHAR(500), -- URL untuk apply eksternal
    date_posted TIMESTAMP,
    date_created TIMESTAMP,
    date_validthrough TIMESTAMP,
    source_type VARCHAR(50),
    source VARCHAR(50),
    source_domain VARCHAR(100),
    remote_derived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🛠️ Setup & Installation

### 1. Install Dependencies

```bash
cd src/backend
npm install
```

### 2. Setup Environment Variables

```bash
cp env.example .env
```

Edit file `.env`:

```env
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=cari_magang_db
DB_USER=admin
DB_PASSWORD=

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# API Configuration (opsional)
RAPIDAPI_KEY=your-rapidapi-key-here
RAPIDAPI_HOST=internships-api.p.rapidapi.com
```

### 3. Setup Database

1. **Buat database PostgreSQL**:

   ```sql
   CREATE DATABASE cari_magang_db;
   ```

2. **Import schema di DBeaver**:
   - Buka DBeaver → Koneksi ke database `cari_magang_db`
   - Buka SQL Editor
   - Copy-paste isi file `database/schema.sql`
   - Jalankan script (Ctrl+Enter)

### 4. Test Koneksi Database

```bash
npm run test-db
```

### 5. Start Server

```bash
npm start
# atau untuk development
npm run dev
```

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Job Board

- `POST /api/jobs/sync` - Sync jobs dari API eksternal
- `GET /api/jobs` - Get jobs dengan pagination & filter
- `GET /api/jobs/:id` - Get job detail
- `GET /api/jobs/stats/summary` - Get statistics

### Health Check

- `GET /api/health` - Health check endpoint

## 🔧 Testing

### Test Database Connection

```bash
npm run test-db
```

### Test API Endpoints

```bash
npm run test-api
```

### Test Individual Endpoints

```bash
npm run test-api individual
```

## 📊 Contoh Response API

### Sync Jobs

```json
{
  "success": true,
  "message": "Sync completed: 2 new jobs saved, 0 skipped",
  "data": {
    "savedCount": 2,
    "skippedCount": 0
  }
}
```

### Get Jobs

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "api_id": "1827366568",
      "title": "Data Analyst Intern",
      "organization": "Lensa",
      "organization_url": "https://www.linkedin.com/company/lensa",
      "address_country": "US",
      "address_locality": "Buffalo",
      "address_region": "NY",
      "employment_type": "[\"INTERN\"]",
      "seniority": "Internship",
      "url": "https://www.linkedin.com/jobs/view/data-analyst-intern-at-lensa-4266935033",
      "external_apply_url": "https://lensa.com/cgw/d3caabc6e1e347a496f3319043573caatjo1?jpsi=directemployers&publisher_preference=easier_apply&utm_campaign=Computer Occupations&utm_medium=slot&utm_source=linkedin&utm_term=jse",
      "remote_derived": false,
      "date_posted": "2025-07-17T06:03:15",
      "created_at": "2025-07-17T15:08:22"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

## 🔍 Filter & Search

### Query Parameters

- `page` - Halaman (default: 1)
- `limit` - Jumlah data per halaman (default: 10)
- `search` - Search berdasarkan title atau organization
- `location` - Filter berdasarkan lokasi
- `organization` - Filter berdasarkan perusahaan
- `employment_type` - Filter berdasarkan tipe employment
- `remote` - Filter remote/on-site (true/false)

### Contoh Request

```
GET /api/jobs?page=1&limit=5&search=analyst&location=US&remote=false
```

## 🚀 Deployment

### Environment Variables untuk Production

```env
NODE_ENV=production
PORT=5000
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=cari_magang_db
DB_USER=your-db-user
DB_PASSWORD=your-db-password
JWT_SECRET=your-production-jwt-secret
```

### Security Best Practices

- Gunakan HTTPS di production
- Set `NODE_ENV=production`
- Gunakan JWT secret yang kuat
- Enable rate limiting
- Validasi semua input

## 📝 Notes

- **Tidak ada fitur apply**: User hanya bisa lihat magang dan redirect ke URL eksternal
- **Tidak ada role admin/company**: Hanya user biasa
- **Data dari API eksternal**: Disimpan ke database untuk menghemat kuota API
- **Deduplication**: Data tidak duplikat berdasarkan `api_id`

## 🐛 Troubleshooting

### Database Connection Error

1. Pastikan PostgreSQL berjalan
2. Cek credentials di `.env`
3. Pastikan database `cari_magang_db` sudah dibuat
4. Test dengan: `npm run test-db`

### API Error

1. Pastikan server berjalan: `npm start`
2. Cek port 5000 tidak digunakan
3. Test dengan: `npm run test-api`

### Environment Variables

1. Pastikan file `.env` ada
2. Cek semua variabel terisi: `npm run validate-env`
3. Restart server setelah ubah `.env`
