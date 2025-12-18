-- Migration: Make emergency contact fields optional
-- Created: 2024-12-17
-- Description: Makes phone, email, address, and city fields nullable in emergency_contacts table

USE u434635530_ootspr;

-- Make phone field nullable
ALTER TABLE emergency_contacts
MODIFY COLUMN phone VARCHAR(20) NULL;

-- Make email field nullable
ALTER TABLE emergency_contacts
MODIFY COLUMN email VARCHAR(100) NULL;

-- Make address field nullable
ALTER TABLE emergency_contacts
MODIFY COLUMN address VARCHAR(200) NULL;

-- Make city field nullable
ALTER TABLE emergency_contacts
MODIFY COLUMN city VARCHAR(50) NULL;

-- Verify changes
DESCRIBE emergency_contacts;

-- Show sample of modified columns
SELECT id, name, phone, email, address, city
FROM emergency_contacts
LIMIT 5;
