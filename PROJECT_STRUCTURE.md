# 📁 Project Structure - Cari Magang

## 🏗️ Struktur Project

```
cari-magang/                    # Root project
├── .gitignore                  # Git ignore untuk seluruh project
├── package.json                # Root package.json
├── src/
│   ├── app/                    # Frontend (Next.js)
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.js
│   └── backend/                # Backend (Express.js)
│       ├── services/
│       │   └── jobBoardService.js
│       ├── routes/
│       │   └── jobBoardRoutes.js
│       ├── scripts/
│       │   ├── syncJobs.js
│       │   └── validateEnv.js
│       ├── database/
│       │   └── schema.sql
│       ├── app.js
│       ├── package.json
│       ├── env.example
│       ├── README.md
│       └── test-job-board.js
└── public/                     # Static files
    ├── file.svg
    ├── globe.svg
    ├── next.svg
    ├── vercel.svg
    └── window.svg
```

## 🔐 Environment Variables Management

### File .env Location

- **Development**: `src/backend/.env` (local development)
- **Production**: Environment variables di server
- **Template**: `src/backend/env.example`

### Git Ignore

- File `.env` di-ignore di `.gitignore` utama project
- Pattern: `.env*` (mengabaikan semua file environment)
- Lokasi: Root project (`cari-magang/.gitignore`)

## 📋 Database Configuration

### Database Name

- **Database**: `cari_magang_db`
- **User**: `admin`
- **Host**: `localhost`
- **Port**: `5432`

### Environment Variables

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cari_magang_db    # ✅ Correct database name
DB_USER=admin
DB_PASSWORD=admin123
```

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
cd src/backend

# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Edit .env file
# Set your actual values

# Validate environment
npm run validate-env

# Start development server
npm run dev
```

### 2. Frontend Setup

```bash
# From root project
npm install
npm run dev
```

### 3. Database Setup

```bash
# Import schema
psql -U admin -d cari_magang_db -f src/backend/database/schema.sql
```

## 🔍 Environment Variables

### Required Variables

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cari_magang_db
DB_USER=admin
DB_PASSWORD=admin123
JWT_SECRET=your-super-secret-jwt-key
RAPIDAPI_KEY=your-rapidapi-key-here
```

### Optional Variables

```env
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
RAPIDAPI_HOST=internships-api.p.rapidapi.com
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📊 Development Workflow

### 1. Development

```bash
# Terminal 1: Backend
cd src/backend
npm run dev

# Terminal 2: Frontend
npm run dev
```

### 2. Testing

```bash
# Test environment
cd src/backend
npm run validate-env

# Test job board API
node test-job-board.js

# Sync jobs
npm run sync-jobs
```

### 3. Database Management

```bash
# Connect to database
psql -U admin -d cari_magang_db

# Import schema
psql -U admin -d cari_magang_db -f database/schema.sql
```

## 🔒 Security Notes

### Environment Variables

- ✅ File `.env` di-ignore di `.gitignore` utama
- ✅ Template tersedia di `env.example`
- ✅ Validation script di `scripts/validateEnv.js`
- ✅ Documentation lengkap di `SETUP_ENV.md`

### Database Security

- ✅ Database name: `cari_magang_db`
- ✅ User: `admin`
- ✅ Password: Set via environment variable
- ✅ Connection pooling enabled

### API Security

- ✅ RapidAPI key via environment variable
- ✅ JWT secret via environment variable
- ✅ Rate limiting enabled
- ✅ CORS configuration

## 📚 Related Documentation

- `README.md` - Main documentation
- `SETUP_ENV.md` - Environment setup guide
- `SECURITY_SUMMARY.md` - Security overview
- `JOB_BOARD_GUIDE.md` - Job board integration guide
- `SCHEMA_CHANGES.md` - Database schema changes
- `IMPLEMENTATION_SUMMARY.md` - Implementation overview

## 🎯 Key Points

1. **Database Name**: `cari_magang_db` (bukan `cari_magang`)
2. **Git Ignore**: Di root project, bukan di folder backend
3. **Environment Variables**: Di `src/backend/.env`
4. **Project Structure**: Monorepo dengan frontend dan backend
5. **Security**: Semua sensitive data via environment variables
