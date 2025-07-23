# 🔐 Setup Environment Variables

Panduan untuk mengatur environment variables dengan aman untuk aplikasi Cari Magang.

## 🚨 Keamanan

**PENTING**: Jangan pernah commit file `.env` ke repository GitHub! File ini berisi informasi sensitif.

## 📋 Langkah Setup

### 1. Copy Environment Template

```bash
cd src/backend
cp env.example .env
```

### 2. Edit File .env

Buka file `.env` dan sesuaikan nilai-nilai berikut:

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

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password

# Cloud Storage (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔑 Environment Variables yang Diperlukan

### Database Configuration

| Variable      | Description       | Required | Default     |
| ------------- | ----------------- | -------- | ----------- |
| `DB_HOST`     | Database host     | Yes      | localhost   |
| `DB_PORT`     | Database port     | Yes      | 5432        |
| `DB_NAME`     | Database name     | Yes      | cari_magang |
| `DB_USER`     | Database username | Yes      | admin       |
| `DB_PASSWORD` | Database password | Yes      | admin123    |

### JWT Configuration

| Variable         | Description          | Required | Default |
| ---------------- | -------------------- | -------- | ------- |
| `JWT_SECRET`     | Secret key untuk JWT | Yes      | -       |
| `JWT_EXPIRES_IN` | JWT expiration time  | No       | 7d      |

### API Configuration

| Variable   | Description      | Required | Default     |
| ---------- | ---------------- | -------- | ----------- |
| `PORT`     | Server port      | No       | 5000        |
| `NODE_ENV` | Environment mode | No       | development |

### RapidAPI Configuration

| Variable        | Description                  | Required | Default                        |
| --------------- | ---------------------------- | -------- | ------------------------------ |
| `RAPIDAPI_KEY`  | RapidAPI key untuk job board | Yes      | -                              |
| `RAPIDAPI_HOST` | RapidAPI host                | No       | internships-api.p.rapidapi.com |

### Security Configuration

| Variable                  | Description             | Required | Default               |
| ------------------------- | ----------------------- | -------- | --------------------- |
| `CORS_ORIGIN`             | CORS origin             | No       | http://localhost:3000 |
| `RATE_LIMIT_WINDOW_MS`    | Rate limit window       | No       | 900000 (15 min)       |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No       | 100                   |

## 🔒 Keamanan Environment Variables

### 1. Jangan Commit .env

File `.env` sudah ditambahkan ke `.gitignore` utama project sehingga tidak akan ter-commit ke repository.

### 2. Gunakan .env.example

File `env.example` berisi template yang bisa di-copy untuk setup environment variables.

### 3. Production Environment

Untuk production, gunakan environment variables yang berbeda dan lebih aman:

```env
# Production Environment
NODE_ENV=production
JWT_SECRET=very-long-and-complex-secret-key-for-production
DB_PASSWORD=strong-production-password
RAPIDAPI_KEY=your-production-rapidapi-key
```

### 4. Environment Variables di Server

Untuk deployment, set environment variables di server:

```bash
# Linux/Mac
export DB_HOST=your-db-host
export DB_PASSWORD=your-db-password
export JWT_SECRET=your-jwt-secret

# Windows
set DB_HOST=your-db-host
set DB_PASSWORD=your-db-password
set JWT_SECRET=your-jwt-secret
```

## 🧪 Testing Environment Variables

### 1. Check Environment Variables

```javascript
// Di dalam kode
console.log("DB_HOST:", process.env.DB_HOST);
console.log("RAPIDAPI_KEY:", process.env.RAPIDAPI_KEY ? "Set" : "Not set");
```

### 2. Validate Required Variables

```javascript
const requiredEnvVars = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "JWT_SECRET",
  "RAPIDAPI_KEY",
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```

## 🚀 Deployment Checklist

### Development

- [ ] Copy `env.example` ke `.env`
- [ ] Set semua required environment variables
- [ ] Test aplikasi berjalan dengan baik
- [ ] Verify database connection

### Production

- [ ] Set environment variables di server
- [ ] Use strong passwords dan secrets
- [ ] Enable HTTPS
- [ ] Set proper CORS origins
- [ ] Configure rate limiting
- [ ] Set up monitoring

## 🔍 Troubleshooting

### 1. Environment Variables Not Loading

```bash
# Pastikan dotenv di-load di awal aplikasi
require('dotenv').config();
```

### 2. Database Connection Failed

```bash
# Check database credentials
psql -h $DB_HOST -U $DB_USER -d $DB_NAME
```

### 3. RapidAPI Key Invalid

```bash
# Test RapidAPI connection
curl -H "x-rapidapi-key: $RAPIDAPI_KEY" \
     -H "x-rapidapi-host: $RAPIDAPI_HOST" \
     "https://$RAPIDAPI_HOST/active-jb-7d"
```

### 4. JWT Errors

```bash
# Check JWT secret is set
echo $JWT_SECRET
```

## 📚 Best Practices

### 1. Environment Separation

- Development: `.env` file
- Staging: Environment variables
- Production: Secure environment variables

### 2. Secret Management

- Use strong, unique secrets
- Rotate secrets regularly
- Never commit secrets to repository

### 3. Validation

- Validate all required variables on startup
- Provide clear error messages
- Use default values where appropriate

### 4. Documentation

- Document all environment variables
- Provide examples
- Keep documentation updated
