-- Migration: Replace session_date with start/end date and time in progress_notes
-- Created: 2026-09-07
-- Description: Adds start_date, end_date, start_time, end_time columns to progress_notes
--              to track how long an intervention session lasted, migrates existing
--              session_date data into start_date/end_date, then drops session_date.

USE u434635530_ootspr;

-- Add new columns (idempotent: safe to re-run)
ALTER TABLE progress_notes
  ADD COLUMN IF NOT EXISTS start_date DATE NULL AFTER id,
  ADD COLUMN IF NOT EXISTS end_date DATE NULL AFTER start_date,
  ADD COLUMN IF NOT EXISTS start_time TIME NULL AFTER end_date,
  ADD COLUMN IF NOT EXISTS end_time TIME NULL AFTER start_time;

-- Backfill start_date/end_date from session_date only if that column still exists
SET @has_session_date = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'progress_notes'
    AND COLUMN_NAME = 'session_date'
);

SET @backfill_sql = IF(
  @has_session_date > 0,
  'UPDATE progress_notes SET start_date = session_date, end_date = session_date WHERE session_date IS NOT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @backfill_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Fallback for any remaining NULL start_date (e.g. rows that had no session_date)
UPDATE progress_notes
SET start_date = COALESCE(start_date, created_at)
WHERE start_date IS NULL;

-- Make start_date required now that data has been backfilled
ALTER TABLE progress_notes
  MODIFY COLUMN start_date DATE NOT NULL;

-- Drop the old column (idempotent: safe to re-run)
SET @drop_sql = IF(
  @has_session_date > 0,
  'ALTER TABLE progress_notes DROP COLUMN session_date',
  'SELECT 1'
);
PREPARE stmt FROM @drop_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify changes
DESCRIBE progress_notes;
