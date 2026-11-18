-- Migration: Autor del informe de transferencia
-- Description: Flujo de transferencia en 4 pasos: (1) se solicita la transferencia,
--              (2) el profesional que tiene el caso elabora el informe,
--              (3) supervisión aprueba, (4) el caso pasa al nuevo profesional.
--              Agrega reported_by_id / reported_at a case_transfers. El nuevo
--              estado AWAITING_REPORT no requiere cambio de esquema (status es VARCHAR).
--              Idempotente; también se aplica automáticamente en src/migrate.ts.

SET @has_col = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'case_transfers'
    AND COLUMN_NAME = 'reported_by_id'
);

SET @sql = IF(
  @has_col = 0,
  'ALTER TABLE case_transfers
     ADD COLUMN reported_by_id INT UNSIGNED NULL,
     ADD COLUMN reported_at DATETIME NULL,
     ADD CONSTRAINT fk_case_transfers_reported_by_id
       FOREIGN KEY (reported_by_id) REFERENCES users (id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

DESCRIBE case_transfers;
