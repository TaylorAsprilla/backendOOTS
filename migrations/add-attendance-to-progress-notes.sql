-- Migration: Add attendance tracking to progress_notes
-- Created: 2026-09-07
-- Description: Adds attended (boolean, default true) and absence_reason (text)
--              columns to progress_notes to record whether the participant
--              showed up to the session.

USE u434635530_ootspr;

SET @has_attended = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'progress_notes'
    AND COLUMN_NAME = 'attended'
);

SET @add_attended_sql = IF(
  @has_attended = 0,
  'ALTER TABLE progress_notes ADD COLUMN attended TINYINT(1) NOT NULL DEFAULT 1 AFTER end_time',
  'SELECT 1'
);
PREPARE stmt FROM @add_attended_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_absence_reason = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'progress_notes'
    AND COLUMN_NAME = 'absence_reason'
);

SET @add_absence_reason_sql = IF(
  @has_absence_reason = 0,
  'ALTER TABLE progress_notes ADD COLUMN absence_reason TEXT NULL AFTER attended',
  'SELECT 1'
);
PREPARE stmt FROM @add_absence_reason_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify changes
DESCRIBE progress_notes;
