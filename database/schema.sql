-- =====================================================
-- SCHEMA DATABASE CARI MAGANG (SDG 8)
-- Platform Pencarian Magang - Hanya untuk melihat list magang
-- =====================================================

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS internships CASCADE;

-- =====================================================
-- TABLE: users
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: internships (data dari API eksternal)
-- =====================================================
CREATE TABLE internships (
    id SERIAL PRIMARY KEY,
    api_id VARCHAR(50) UNIQUE, -- ID dari API (1827366568)
    title VARCHAR(200) NOT NULL,
    description TEXT,
    organization VARCHAR(100) NOT NULL,
    organization_url VARCHAR(500),
    organization_logo VARCHAR(500),
    organization_size VARCHAR(100),
    organization_industry VARCHAR(100),
    organization_headquarters VARCHAR(200),
    organization_description TEXT,
    
    -- Location data
    location_raw TEXT, -- JSON string dari locations_raw
    address_country VARCHAR(100),
    address_locality VARCHAR(100),
    address_region VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    cities_derived TEXT, -- JSON array
    regions_derived TEXT, -- JSON array
    countries_derived TEXT, -- JSON array
    locations_derived TEXT, -- JSON array
    
    -- Job details
    employment_type TEXT, -- JSON array
    seniority VARCHAR(50),
    remote_derived BOOLEAN DEFAULT FALSE,
    
    -- URLs
    url VARCHAR(500) NOT NULL, -- URL job posting
    external_apply_url VARCHAR(500), -- URL untuk apply eksternal
    direct_apply BOOLEAN DEFAULT FALSE,
    
    -- Dates
    date_posted TIMESTAMP,
    date_created TIMESTAMP,
    date_validthrough TIMESTAMP,
    
    -- Source info
    source_type VARCHAR(50),
    source VARCHAR(50),
    source_domain VARCHAR(100),
    
    -- Additional info
    salary_raw TEXT,
    location_requirements_raw TEXT,
    recruiter_name VARCHAR(100),
    recruiter_title VARCHAR(100),
    recruiter_url VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES untuk performa search
-- =====================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_internships_api_id ON internships(api_id);
CREATE INDEX idx_internships_organization ON internships(organization);
CREATE INDEX idx_internships_title ON internships(title);
CREATE INDEX idx_internships_address_locality ON internships(address_locality);
CREATE INDEX idx_internships_address_region ON internships(address_region);
CREATE INDEX idx_internships_address_country ON internships(address_country);
CREATE INDEX idx_internships_employment_type ON internships(employment_type);
CREATE INDEX idx_internships_seniority ON internships(seniority);
CREATE INDEX idx_internships_date_posted ON internships(date_posted);
CREATE INDEX idx_internships_created_at ON internships(created_at);

-- =====================================================
-- SAMPLE DATA untuk testing
-- =====================================================

-- Sample users
INSERT INTO users (name, email, password_hash) VALUES
('John Doe', 'john@example.com', '$2b$10$example.hash.here'),
('Jane Smith', 'jane@example.com', '$2b$10$example.hash.here'),
('Bob Wilson', 'bob@example.com', '$2b$10$example.hash.here');

-- Sample internships (data dari API eksternal)
INSERT INTO internships (
    api_id, title, organization, organization_url, organization_logo,
    address_country, address_locality, address_region, latitude, longitude,
    employment_type, seniority, url, external_apply_url, direct_apply,
    date_posted, date_created, date_validthrough,
    source_type, source, source_domain, remote_derived
) VALUES
(
    '1827366568',
    'Data Analyst Intern',
    'Lensa',
    'https://www.linkedin.com/company/lensa',
    'https://media.licdn.com/dms/image/v2/D4D0BAQEkHa-0Aki9XQ/company-logo_200_200/B4DZaKylu7GsAI-/0/1746085240184/lensa_logo?e=2147483647&v=beta&t=uWeVCpbXYyRN0ASrTAkroLlijETQQufn9qquZHoZTfo',
    'US',
    'Buffalo',
    'NY',
    42.88769,
    -78.87937,
    '["INTERN"]',
    'Internship',
    'https://www.linkedin.com/jobs/view/data-analyst-intern-at-lensa-4266935033',
    'https://lensa.com/cgw/d3caabc6e1e347a496f3319043573caatjo1?jpsi=directemployers&publisher_preference=easier_apply&utm_campaign=Computer Occupations&utm_medium=slot&utm_source=linkedin&utm_term=jse',
    FALSE,
    '2025-07-17T06:03:15',
    '2025-07-17T06:11:19.923755',
    '2025-08-16T06:03:15',
    'jobboard',
    'linkedin',
    'linkedin.com',
    FALSE
),
(
    '1827366569',
    'Software Engineering Intern',
    'TechCorp',
    'https://www.linkedin.com/company/techcorp',
    'https://example.com/logo.png',
    'US',
    'San Francisco',
    'CA',
    37.7749,
    -122.4194,
    '["INTERN"]',
    'Internship',
    'https://www.linkedin.com/jobs/view/software-engineering-intern',
    'https://techcorp.com/careers/intern',
    TRUE,
    '2025-07-17T06:00:00',
    '2025-07-17T06:10:00',
    '2025-08-17T06:00:00',
    'jobboard',
    'linkedin',
    'linkedin.com',
    FALSE
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Uncomment untuk test setelah import:
-- SELECT COUNT(*) as total_users FROM users;
-- SELECT COUNT(*) as total_internships FROM internships;
-- SELECT api_id, title, organization, address_locality, address_region FROM internships LIMIT 3; 