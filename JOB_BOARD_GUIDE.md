# 🚀 Panduan Job Board API Integration

Panduan lengkap untuk menggunakan sistem integrasi job board API di Cari Magang.

## 📋 Overview

Sistem ini memungkinkan Anda untuk:

- ✅ Mengambil data lowongan magang dari external API
- ✅ Menyimpan data ke database PostgreSQL
- ✅ Mengelola data perusahaan dan lowongan
- ✅ Menyediakan API untuk frontend
- ✅ Menghemat kuota API dengan caching di database

## 🔧 Setup Awal

### 1. Install Dependencies

```bash
cd src/backend
npm install
```

### 2. Setup Environment Variables

Buat file `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cari_magang
DB_USER=admin
DB_PASSWORD=admin123

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# API
PORT=5000
NODE_ENV=development

# RapidAPI
RAPIDAPI_KEY=3b5a8ce239msh9bb60cf19b3106ap18d36djsndc25c3be4cef
```

### 3. Setup Database

Pastikan PostgreSQL sudah running dan database sudah dibuat dengan schema yang sesuai.

## 🎯 Cara Penggunaan

### 1. Sync Jobs dari API

**Manual Sync:**

```bash
# Sync semua jobs
npm run sync-jobs

# Atau jalankan script langsung
node scripts/syncJobs.js
```

**Via API Endpoint:**

```bash
curl -X POST http://localhost:5000/api/job-board/sync \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"endpoint": "/active-jb-7d"}'
```

### 2. Ambil Data Jobs

**Get semua jobs:**

```bash
curl http://localhost:5000/api/job-board
```

**Get jobs dengan filter:**

```bash
curl "http://localhost:5000/api/job-board?page=1&limit=10&location=New%20York&remote_work=true"
```

**Get job by ID:**

```bash
curl http://localhost:5000/api/job-board/123
```

**Get statistics:**

```bash
curl http://localhost:5000/api/job-board/stats/overview
```

### 3. Testing

**Test job board API:**

```bash
node test-job-board.js
```

## 📊 Data Structure

### Response API Job Board

```json
{
  "id": "1827366568",
  "title": "Data Analyst Intern",
  "organization": "Lensa",
  "organization_url": "https://www.linkedin.com/company/lensa",
  "date_posted": "2025-07-17T06:03:15",
  "locations_raw": [...],
  "salary_raw": {...},
  "employment_type": ["INTERN"],
  "url": "https://www.linkedin.com/jobs/view/...",
  "source_type": "jobboard",
  "source": "linkedin",
  "organization_logo": "https://media.licdn.com/...",
  "cities_derived": ["Buffalo"],
  "regions_derived": ["New York"],
  "countries_derived": ["United States"],
  "remote_derived": false,
  "linkedin_org_employees": 345,
  "linkedin_org_size": "51-200 employees",
  "linkedin_org_industry": "Internet Publishing",
  "linkedin_org_headquarters": "West Chester, Pennsylvania",
  "linkedin_org_foundeddate": "2015",
  "linkedin_org_specialties": [...],
  "linkedin_org_locations": [...],
  "linkedin_org_description": "Lensa is a U.S. job search platform...",
  "seniority": "Internship",
  "directapply": false,
  "external_apply_url": "https://lensa.com/cgw/..."
}
```

### Database Schema

**Companies Table:**

```sql
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  website_url VARCHAR(500),
  logo_url VARCHAR(500),
  industry VARCHAR(100),
  size VARCHAR(100),
  founded_year INTEGER,
  headquarters VARCHAR(255),
  linkedin_url VARCHAR(500),
  linkedin_slug VARCHAR(100),
  employee_count INTEGER,
  followers_count INTEGER,
  slogan TEXT,
  specialties JSONB,
  locations JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Internships Table:**

```sql
CREATE TABLE internships (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  company_id INTEGER REFERENCES companies(id),
  location VARCHAR(255),
  salary_min DECIMAL(10,2),
  salary_max DECIMAL(10,2),
  salary_currency VARCHAR(10),
  employment_type VARCHAR(50),
  remote_work BOOLEAN DEFAULT FALSE,
  application_url VARCHAR(500),
  external_url VARCHAR(500),
  external_id VARCHAR(100) UNIQUE,
  date_posted TIMESTAMP,
  date_valid_through TIMESTAMP,
  seniority_level VARCHAR(50),
  is_direct_apply BOOLEAN DEFAULT FALSE,
  source_type VARCHAR(50),
  source_domain VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 Sync Process

### 1. Fetch Data

- Mengambil data dari RapidAPI endpoint
- Handle connection errors
- Parse JSON response

### 2. Process Data

- Extract company information
- Extract internship information
- Validate required fields
- Transform data format

### 3. Save to Database

- Check for existing companies (deduplication)
- Save new companies
- Check for existing internships (by external_id)
- Save new internships or update existing ones

### 4. Error Handling

- Log all errors
- Continue processing other jobs
- Return summary statistics

## 📈 Monitoring & Logs

### Console Output

```
🚀 Starting job sync process...
📥 Syncing jobs from job board API...
✅ Job board sync completed:
   - Total jobs processed: 10
   - Jobs saved: 8
   - Errors: 2
🎉 All sync processes completed successfully!
📊 Total jobs in database: 150
```

### Error Types

- **API Connection Errors**: Network issues, API limits
- **Data Parsing Errors**: Invalid JSON, missing fields
- **Database Errors**: Connection issues, constraint violations
- **Duplicate Data**: Already existing companies/internships

## 🛠️ Customization

### 1. Add New API Endpoints

Edit `scripts/syncJobs.js`:

```javascript
// Add new endpoint
const careerSiteResult = await jobBoardService.processAndSaveJobs(
  "/career-site-endpoint"
);
```

### 2. Custom Data Processing

Edit `services/jobBoardService.js`:

```javascript
// Add custom data transformation
async transformJobData(rawData) {
  // Your custom logic here
  return transformedData;
}
```

### 3. Add New Filters

Edit `routes/jobBoardRoutes.js`:

```javascript
const filters = {
  // Add new filters
  salary_range: req.query.salary_range,
  experience_level: req.query.experience_level,
};
```

## 🔒 Security Considerations

### 1. API Key Management

- Store API keys in environment variables
- Rotate keys regularly
- Monitor API usage

### 2. Rate Limiting

- Implement rate limiting for sync endpoints
- Monitor API call frequency
- Handle API limits gracefully

### 3. Data Validation

- Validate all incoming data
- Sanitize user inputs
- Prevent SQL injection

## 📊 Performance Optimization

### 1. Batch Processing

- Process jobs in batches
- Use database transactions
- Implement connection pooling

### 2. Caching

- Cache frequently accessed data
- Implement Redis for caching
- Use database indexes

### 3. Monitoring

- Monitor database performance
- Track API response times
- Set up alerts for errors

## 🚨 Troubleshooting

### Common Issues

**1. API Connection Failed**

```
Error: API request failed: connect ECONNREFUSED
```

**Solution**: Check network connection and API endpoint

**2. Database Connection Failed**

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: Ensure PostgreSQL is running and credentials are correct

**3. Duplicate Key Error**

```
Error: duplicate key value violates unique constraint
```

**Solution**: Data already exists, this is normal behavior

**4. Invalid JSON Response**

```
Error: Failed to parse API response: Unexpected token
```

**Solution**: Check API response format and handle malformed data

### Debug Commands

```bash
# Test database connection
psql -h localhost -U admin -d cari_magang

# Test API connection
curl -H "x-rapidapi-key: YOUR_KEY" \
     -H "x-rapidapi-host: internships-api.p.rapidapi.com" \
     "https://internships-api.p.rapidapi.com/active-jb-7d"

# Check logs
tail -f logs/app.log
```

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [RapidAPI Documentation](https://rapidapi.com/docs/)
- [Node.js Documentation](https://nodejs.org/docs/)

## 🤝 Support

Jika mengalami masalah:

1. Check logs untuk error messages
2. Verify environment variables
3. Test database connection
4. Test API connection
5. Review error handling in code
