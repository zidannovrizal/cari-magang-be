# 📊 Perubahan Schema Database untuk Job Board API Integration

## 🔄 Overview Perubahan

Schema database telah diperbarui untuk mengakomodasi data dari external job board API sambil tetap mempertahankan fitur-fitur existing untuk aplikasi Cari Magang.

## 📋 Perubahan Utama

### 1. Tabel Companies - Enhanced Fields

**Field Baru:**

- `linkedin_url` - URL LinkedIn perusahaan
- `linkedin_slug` - Slug LinkedIn (UNIQUE)
- `employee_count` - Jumlah karyawan
- `followers_count` - Jumlah followers LinkedIn
- `slogan` - Slogan perusahaan
- `specialties` - Spesialisasi (JSONB)
- `locations` - Lokasi kantor (JSONB)
- `headquarters` - Kantor pusat
- `founded_year` - Tahun berdiri
- `company_type` - Tipe perusahaan
- `source_type` - Sumber data ('manual', 'jobboard', 'careersite')
- `external_id` - ID dari external API

**Field Modified:**

- `email` - Sekarang optional (untuk data dari API)
- `password_hash` - Sekarang optional (untuk data dari API)

### 2. Tabel Internships - Enhanced Fields

**Field Baru:**

- `external_id` - ID dari external API (UNIQUE)
- `external_url` - URL posting asli
- `application_url` - URL apply langsung
- `date_posted` - Tanggal posting
- `date_valid_through` - Tanggal berlaku
- `seniority_level` - Level senioritas
- `employment_type` - Tipe pekerjaan ('INTERN', 'FULL_TIME', 'PART_TIME')
- `is_direct_apply` - Bisa apply langsung
- `remote_work` - Pekerjaan remote
- `cities_derived` - Kota (array)
- `regions_derived` - Region (array)
- `countries_derived` - Negara (array)
- `locations_derived` - Lokasi lengkap (array)
- `timezones_derived` - Timezone (array)
- `lats_derived` - Latitude (array)
- `lngs_derived` - Longitude (array)
- `source_type` - Sumber data ('jobboard', 'careersite', 'manual')
- `source_domain` - Domain sumber
- `recruiter_name` - Nama recruiter
- `recruiter_title` - Jabatan recruiter
- `recruiter_url` - URL recruiter

**Field Modified:**

- `duration_months` - Sekarang optional
- `application_deadline` - Sekarang optional

### 3. Tabel Baru: Job Board Sync Logs

**Fields:**

- `endpoint` - Endpoint API yang di-sync
- `total_jobs` - Total jobs yang diproses
- `saved_jobs` - Jobs yang berhasil disimpan
- `error_count` - Jumlah error
- `error_details` - Detail error (JSONB)
- `sync_duration_ms` - Durasi sync dalam ms
- `sync_status` - Status sync ('success', 'partial', 'failed')

## 🔍 Indexes Baru

### Companies Table

- `idx_companies_linkedin_slug` - Untuk lookup berdasarkan LinkedIn slug
- `idx_companies_source_type` - Untuk filter berdasarkan sumber data

### Internships Table

- `idx_internships_external_id` - Untuk lookup berdasarkan external ID
- `idx_internships_source_type` - Untuk filter berdasarkan sumber data
- `idx_internships_date_posted` - Untuk sorting berdasarkan tanggal posting
- `idx_internships_remote_work` - Untuk filter remote work
- `idx_internships_employment_type` - Untuk filter tipe pekerjaan

### Job Board Sync Logs Table

- `idx_job_board_sync_logs_created_at` - Untuk sorting berdasarkan waktu sync

## 📊 Data Mapping dari API

### Job Board API → Database

| API Field                   | Database Field              | Type            | Notes  |
| --------------------------- | --------------------------- | --------------- | ------ |
| `id`                        | `external_id`               | VARCHAR(100)    | UNIQUE |
| `title`                     | `title`                     | VARCHAR(255)    | -      |
| `organization`              | `companies.name`            | VARCHAR(255)    | -      |
| `organization_logo`         | `companies.logo_url`        | VARCHAR(500)    | -      |
| `organization_url`          | `companies.linkedin_url`    | VARCHAR(500)    | -      |
| `linkedin_org_slug`         | `companies.linkedin_slug`   | VARCHAR(100)    | UNIQUE |
| `linkedin_org_description`  | `companies.description`     | TEXT            | -      |
| `linkedin_org_industry`     | `companies.industry`        | VARCHAR(100)    | -      |
| `linkedin_org_size`         | `companies.company_size`    | VARCHAR(50)     | -      |
| `linkedin_org_employees`    | `companies.employee_count`  | INTEGER         | -      |
| `linkedin_org_followers`    | `companies.followers_count` | INTEGER         | -      |
| `linkedin_org_slogan`       | `companies.slogan`          | TEXT            | -      |
| `linkedin_org_specialties`  | `companies.specialties`     | JSONB           | -      |
| `linkedin_org_locations`    | `companies.locations`       | JSONB           | -      |
| `linkedin_org_headquarters` | `companies.headquarters`    | VARCHAR(255)    | -      |
| `linkedin_org_foundeddate`  | `companies.founded_year`    | INTEGER         | -      |
| `linkedin_org_type`         | `companies.company_type`    | VARCHAR(100)    | -      |
| `url`                       | `external_url`              | VARCHAR(500)    | -      |
| `external_apply_url`        | `application_url`           | VARCHAR(500)    | -      |
| `date_posted`               | `date_posted`               | TIMESTAMP       | -      |
| `date_validthrough`         | `date_valid_through`        | TIMESTAMP       | -      |
| `seniority`                 | `seniority_level`           | VARCHAR(50)     | -      |
| `directapply`               | `is_direct_apply`           | BOOLEAN         | -      |
| `remote_derived`            | `remote_work`               | BOOLEAN         | -      |
| `employment_type[0]`        | `employment_type`           | VARCHAR(50)     | -      |
| `salary_raw.value.minValue` | `salary_min`                | INTEGER         | -      |
| `salary_raw.value.maxValue` | `salary_max`                | INTEGER         | -      |
| `salary_raw.currency`       | `currency`                  | VARCHAR(10)     | -      |
| `locations_derived[0]`      | `location`                  | VARCHAR(255)    | -      |
| `cities_derived`            | `cities_derived`            | TEXT[]          | -      |
| `regions_derived`           | `regions_derived`           | TEXT[]          | -      |
| `countries_derived`         | `countries_derived`         | TEXT[]          | -      |
| `locations_derived`         | `locations_derived`         | TEXT[]          | -      |
| `timezones_derived`         | `timezones_derived`         | TEXT[]          | -      |
| `lats_derived`              | `lats_derived`              | DECIMAL(10,8)[] | -      |
| `lngs_derived`              | `lngs_derived`              | DECIMAL(10,8)[] | -      |
| `source_type`               | `source_type`               | VARCHAR(50)     | -      |
| `source_domain`             | `source_domain`             | VARCHAR(100)    | -      |
| `recruiter_name`            | `recruiter_name`            | VARCHAR(255)    | -      |
| `recruiter_title`           | `recruiter_title`           | VARCHAR(255)    | -      |
| `recruiter_url`             | `recruiter_url`             | VARCHAR(500)    | -      |

## 🔄 Sync Process Flow

### 1. Data Fetch

```javascript
// Fetch dari API
const jobs = await fetchJobsFromAPI("/active-jb-7d");
```

### 2. Company Processing

```javascript
// Check existing company
const existingCompany = await checkCompanyByLinkedInSlug(job.linkedin_org_slug);

if (!existingCompany) {
  // Create new company
  const companyId = await createCompany(job);
} else {
  // Use existing company
  const companyId = existingCompany.id;
}
```

### 3. Internship Processing

```javascript
// Check existing internship
const existingInternship = await checkInternshipByExternalId(job.id);

if (!existingInternship) {
  // Create new internship
  await createInternship(job, companyId);
} else {
  // Update existing internship
  await updateInternship(job, existingInternship.id);
}
```

### 4. Log Sync Results

```javascript
// Log sync results
await logSyncResults({
  endpoint: "/active-jb-7d",
  total_jobs: jobs.length,
  saved_jobs: savedCount,
  error_count: errorCount,
  sync_duration_ms: duration,
});
```

## 🛡️ Data Integrity

### Constraints

- `companies.linkedin_slug` - UNIQUE
- `internships.external_id` - UNIQUE
- `companies.email` - UNIQUE (jika ada)
- `users.email` - UNIQUE

### Validation Rules

- Company dari API tidak perlu email dan password
- Internship dari API tidak perlu deadline dan duration
- External ID harus unik untuk mencegah duplikasi
- Source type harus valid ('manual', 'jobboard', 'careersite')

## 📈 Performance Considerations

### Indexes

- Index pada `external_id` untuk fast lookup
- Index pada `source_type` untuk filtering
- Index pada `date_posted` untuk sorting
- Index pada `remote_work` untuk filtering

### Query Optimization

- Use prepared statements
- Implement connection pooling
- Batch operations untuk bulk insert
- Pagination untuk large datasets

## 🔍 Monitoring & Analytics

### Sync Metrics

- Total jobs processed
- Success rate
- Error rate
- Sync duration
- API response time

### Data Quality

- Duplicate detection
- Data validation
- Missing field tracking
- Source attribution

## 🚀 Migration Strategy

### Phase 1: Schema Update

1. Backup existing database
2. Run schema migration
3. Verify data integrity
4. Update application code

### Phase 2: API Integration

1. Implement job board service
2. Test with sample data
3. Monitor performance
4. Scale gradually

### Phase 3: Production Deployment

1. Enable sync scheduling
2. Monitor error rates
3. Optimize performance
4. Add monitoring alerts

## 📚 Related Files

- `services/jobBoardService.js` - Service untuk job board API
- `routes/jobBoardRoutes.js` - API routes untuk job board
- `scripts/syncJobs.js` - Script untuk sync jobs
- `test-job-board.js` - Test script
- `JOB_BOARD_GUIDE.md` - Panduan lengkap
