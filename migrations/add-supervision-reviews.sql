-- Migration: Revisiones de supervisión (Orden de Expediente / Orden de Expediente de Supervisión)
-- Idempotente; también se aplica automáticamente en src/migrate.ts.

CREATE TABLE IF NOT EXISTS supervision_reviews (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  type VARCHAR(20) NOT NULL,
  case_id INT UNSIGNED NULL,
  supervisee_id INT UNSIGNED NULL,
  reviewer_id INT UNSIGNED NOT NULL,
  period VARCHAR(7) NULL,
  cases_count INT NULL,
  items JSON NOT NULL,
  recommendations TEXT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'DRAFT',
  signed_at DATETIME NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY IDX_supervision_reviews_case (case_id),
  KEY IDX_supervision_reviews_supervisee (supervisee_id),
  CONSTRAINT fk_supervision_reviews_case FOREIGN KEY (case_id) REFERENCES cases (id),
  CONSTRAINT fk_supervision_reviews_supervisee FOREIGN KEY (supervisee_id) REFERENCES users (id),
  CONSTRAINT fk_supervision_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DESCRIBE supervision_reviews;
