-- Migration: Make participant document fields optional
-- Created: 2026-09-07
-- Description: Makes document_type_id and document_number fields nullable in participants table

USE u434635530_ootspr;

-- Make document_type_id nullable
ALTER TABLE participants
MODIFY COLUMN document_type_id INT UNSIGNED NULL;

-- Make document_number nullable
ALTER TABLE participants
MODIFY COLUMN document_number VARCHAR(50) NULL;

-- Verify changes
DESCRIBE participants;
