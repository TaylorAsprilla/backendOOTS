-- Migration: Add case_type to cases (brief consultation vs active case)
-- Created: 2026-09-07
-- Description: Adds case_type enum column to cases so a case can be marked as
--              "brief_consultation" (only progress notes, referrals and closing
--              note apply) or "active_case" (all tabs apply, default).

USE u434635530_ootspr;

SET @has_case_type = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cases'
    AND COLUMN_NAME = 'case_type'
);

SET @add_case_type_sql = IF(
  @has_case_type = 0,
  "ALTER TABLE cases ADD COLUMN case_type ENUM('brief_consultation', 'active_case') NOT NULL DEFAULT 'active_case' AFTER status",
  'SELECT 1'
);
PREPARE stmt FROM @add_case_type_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify changes
DESCRIBE cases;
