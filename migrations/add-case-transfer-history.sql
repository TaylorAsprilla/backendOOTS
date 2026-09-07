-- Migration: Add case transfer history (professional reassignment)
-- Created: 2026-09-07
-- Description: Adds assigned_to_id to cases (currently responsible professional,
--              starts equal to created_by_id) and creates case_transfers to keep
--              a full history of every reassignment (from/to/who performed it).

USE u434635530_ootspr;

-- 1. Add assigned_to_id column to cases (idempotent)
SET @has_assigned_to = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cases'
    AND COLUMN_NAME = 'assigned_to_id'
);

SET @add_assigned_to_sql = IF(
  @has_assigned_to = 0,
  'ALTER TABLE cases ADD COLUMN assigned_to_id INT UNSIGNED NULL AFTER created_by_id',
  'SELECT 1'
);
PREPARE stmt FROM @add_assigned_to_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backfill assigned_to_id with the original creator for existing cases
UPDATE cases
SET assigned_to_id = created_by_id
WHERE assigned_to_id IS NULL;

-- 2. Create case_transfers table (idempotent)
CREATE TABLE IF NOT EXISTS case_transfers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  case_id INT UNSIGNED NOT NULL,
  from_user_id INT UNSIGNED NULL,
  to_user_id INT UNSIGNED NOT NULL,
  transferred_by_id INT UNSIGNED NOT NULL,
  reason TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY IDX_case_transfers_case_id (case_id),
  CONSTRAINT fk_case_transfers_case_id
    FOREIGN KEY (case_id) REFERENCES cases (id) ON DELETE CASCADE,
  CONSTRAINT fk_case_transfers_from_user_id
    FOREIGN KEY (from_user_id) REFERENCES users (id),
  CONSTRAINT fk_case_transfers_to_user_id
    FOREIGN KEY (to_user_id) REFERENCES users (id),
  CONSTRAINT fk_case_transfers_transferred_by_id
    FOREIGN KEY (transferred_by_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify changes
DESCRIBE cases;
DESCRIBE case_transfers;
