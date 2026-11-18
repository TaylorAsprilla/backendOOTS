-- Migration: Documentos adjuntos de casos y consultas breves (metadatos; el binario vive en S3)
-- Idempotente y no destructiva. También se aplica automáticamente en src/migrate.ts.

CREATE TABLE IF NOT EXISTS case_attachments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  case_id INT UNSIGNED NOT NULL,
  context VARCHAR(30) NOT NULL,
  category VARCHAR(40) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  storage_key VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  extension VARCHAR(10) NOT NULL,
  size INT UNSIGNED NOT NULL,
  sha256 CHAR(64) NOT NULL,
  description TEXT NULL,
  signed_at DATE NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE',
  uploaded_by_id INT UNSIGNED NOT NULL,
  deleted_at DATETIME NULL,
  deleted_by_id INT UNSIGNED NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY UQ_case_attachments_storage_key (storage_key),
  KEY IDX_case_attachments_case (case_id, context, status),
  CONSTRAINT fk_case_attachments_case FOREIGN KEY (case_id) REFERENCES cases (id) ON DELETE RESTRICT,
  CONSTRAINT fk_case_attachments_uploaded_by FOREIGN KEY (uploaded_by_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS case_attachment_events (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  attachment_id INT UNSIGNED NOT NULL,
  case_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  action VARCHAR(10) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY IDX_case_attachment_events_attachment (attachment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DESCRIBE case_attachments;
DESCRIBE case_attachment_events;
