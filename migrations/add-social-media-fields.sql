-- Migration: Add social media fields to users table
-- Created: 2024-11-17
-- Description: Adds facebook, twitter, instagram, linkedin, github columns for user social media profiles

USE oots_db;

-- Add social media fields
ALTER TABLE users
ADD COLUMN facebook VARCHAR(255) NULL
AFTER password_reset_expires;

ALTER TABLE users
ADD COLUMN twitter VARCHAR(255) NULL
AFTER facebook;

ALTER TABLE users
ADD COLUMN instagram VARCHAR(255) NULL
AFTER twitter;

ALTER TABLE users
ADD COLUMN linkedin VARCHAR(255) NULL
AFTER instagram;

ALTER TABLE users
ADD COLUMN github VARCHAR(255) NULL
AFTER linkedin;

-- Verify changes
DESCRIBE users;

-- Show sample of new columns
SELECT id, email, facebook, twitter, instagram, linkedin, github 
FROM users 
LIMIT 5;
