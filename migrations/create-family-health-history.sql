-- ============================================================================
-- Migración: Crear tabla family_health_history
-- Unifica los antecedentes familiares de salud física y mental en una sola
-- tabla con discriminador history_type para máximo rendimiento y escalabilidad.
--
-- Índice compuesto (case_id, history_type) permite lookup O(1).
-- ON DELETE CASCADE garantiza integridad referencial sin huérfanos.
-- ============================================================================

CREATE TABLE IF NOT EXISTS family_health_history (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  case_id         INT UNSIGNED    NOT NULL,
  history_type    ENUM('physical', 'mental') NOT NULL,
  family_history_father TEXT      NULL,
  family_history_mother TEXT      NULL,
  created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                    ON UPDATE CURRENT_TIMESTAMP(6),

  PRIMARY KEY (id),

  -- Índice compuesto: lookup por caso + tipo en O(1)
  INDEX idx_family_health_case_type (case_id, history_type),

  CONSTRAINT fk_family_health_case
    FOREIGN KEY (case_id) REFERENCES cases(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
