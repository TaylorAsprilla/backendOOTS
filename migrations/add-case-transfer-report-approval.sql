-- Migration: Informe de transferencia + aprobación
-- Description: Agrega a case_transfers los campos del Informe de transferencia
--              (resumen, ponderación, logros, recomendaciones) y el flujo de
--              aprobación (status, reviewed_by_id, reviewed_at, review_note).
--              Las transferencias existentes quedan APPROVED (ya se ejecutaron).
--              Idempotente; también se aplica automáticamente en src/migrate.ts.

SET @has_report = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'case_transfers'
    AND COLUMN_NAME = 'work_summary'
);

SET @sql = IF(
  @has_report = 0,
  'ALTER TABLE case_transfers
     ADD COLUMN work_summary TEXT NULL,
     ADD COLUMN assessment TEXT NULL,
     ADD COLUMN achievements TEXT NULL,
     ADD COLUMN recommendations TEXT NULL,
     ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT ''APPROVED'',
     ADD COLUMN reviewed_by_id INT UNSIGNED NULL,
     ADD COLUMN reviewed_at DATETIME NULL,
     ADD COLUMN review_note TEXT NULL,
     ADD CONSTRAINT fk_case_transfers_reviewed_by_id
       FOREIGN KEY (reviewed_by_id) REFERENCES users (id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

DESCRIBE case_transfers;
