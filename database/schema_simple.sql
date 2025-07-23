-- =====================================================
-- SCHEMA DATABASE CARI MAGANG (SDG 8) - SIMPLE VERSION
-- =====================================================

-- Drop tables if they exist
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS internships CASCADE;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create internships table
CREATE TABLE internships (
    id SERIAL PRIMARY KEY,
    api_id VARCHAR(50) UNIQUE,
    title VARCHAR(200) NOT NULL,
    organization VARCHAR(100) NOT NULL,
    organization_url VARCHAR(500),
    address_country VARCHAR(100),
    address_locality VARCHAR(100),
    address_region VARCHAR(100),
    employment_type TEXT,
    seniority VARCHAR(50),
    url VARCHAR(500) NOT NULL,
    external_apply_url VARCHAR(500),
    date_posted TIMESTAMP,
    source VARCHAR(50),
    remote_derived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_internships_api_id ON internships(api_id);
CREATE INDEX idx_internships_organization ON internships(organization);

-- Insert sample data
INSERT INTO users (name, email, password_hash) VALUES
('John Doe', 'john@example.com', '$2b$10$example.hash.here'),
('Jane Smith', 'jane@example.com', '$2b$10$example.hash.here');

INSERT INTO internships (
    api_id, title, organization, organization_url, address_country, 
    address_locality, address_region, employment_type, seniority, 
    url, external_apply_url, date_posted, source, remote_derived
) VALUES
(
    '1827366568',
    'Data Analyst Intern',
    'Lensa',
    'https://www.linkedin.com/company/lensa',
    'US',
    'Buffalo',
    'NY',
    '["INTERN"]',
    'Internship',
    'https://www.linkedin.com/jobs/view/data-analyst-intern-at-lensa-4266935033',
    'https://lensa.com/cgw/d3caabc6e1e347a496f3319043573caatjo1?jpsi=directemployers&publisher_preference=easier_apply&utm_campaign=Computer Occupations&utm_medium=slot&utm_source=linkedin&utm_term=jse',
    '2025-07-17T06:03:15',
    'linkedin',
    FALSE
);

-- Verify
SELECT '✅ Schema created successfully!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_internships FROM internships; 