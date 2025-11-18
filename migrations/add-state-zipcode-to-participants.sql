-- Migration: Add state and zip_code fields to participants table
-- Created: 2024-11-17
-- Description: Adds state and zip_code columns to store complete address information

USE oots_db;

-- Add state field (estado/departamento)
ALTER TABLE participants
ADD COLUMN state VARCHAR(50) NULL
AFTER city;

-- Add zip_code field (código postal)
ALTER TABLE participants
ADD COLUMN zip_code VARCHAR(20) NULL
AFTER state;

-- Verify changes
DESCRIBE participants;

-- Show sample of new columns
SELECT id, first_name, first_last_name, address, city, state, zip_code
FROM participants
LIMIT 5;
