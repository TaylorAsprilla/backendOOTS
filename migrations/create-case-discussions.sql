CREATE TABLE IF NOT EXISTS case_discussions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  case_id INT UNSIGNED NOT NULL,
  participant_id INT UNSIGNED NOT NULL,
  social_worker_id INT UNSIGNED NOT NULL,
  supervisor_id INT UNSIGNED NOT NULL,
  discussion_date DATE NOT NULL,
  status ENUM('BORRADOR', 'FINALIZADA', 'ANULADA') NOT NULL DEFAULT 'BORRADOR',
  client_name_snapshot VARCHAR(255) NULL,
  client_age_snapshot INT NULL,
  client_gender_snapshot VARCHAR(50) NULL,
  client_marital_status_snapshot VARCHAR(100) NULL,
  presented_situations LONGTEXT NOT NULL,
  affected_people LONGTEXT NULL,
  social_worker_recommendations LONGTEXT NULL,
  supervisor_recommendations LONGTEXT NULL,
  finalized_at DATETIME NULL,
  finalized_by INT UNSIGNED NULL,
  annulled_at DATETIME NULL,
  annulled_by INT UNSIGNED NULL,
  annulment_reason TEXT NULL,
  created_by INT UNSIGNED NOT NULL,
  updated_by INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY idx_case_discussions_case_id (case_id),
  KEY idx_case_discussions_participant_id (participant_id),
  KEY idx_case_discussions_supervisor_id (supervisor_id),
  KEY idx_case_discussions_status (status),
  CONSTRAINT fk_case_discussions_case_id
    FOREIGN KEY (case_id) REFERENCES cases(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_case_discussions_participant_id
    FOREIGN KEY (participant_id) REFERENCES participants(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_case_discussions_social_worker_id
    FOREIGN KEY (social_worker_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_case_discussions_supervisor_id
    FOREIGN KEY (supervisor_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_case_discussions_finalized_by
    FOREIGN KEY (finalized_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_case_discussions_annulled_by
    FOREIGN KEY (annulled_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_case_discussions_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_case_discussions_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS case_discussion_family_members (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  case_discussion_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  age INT NULL,
  relationship VARCHAR(100) NOT NULL,
  occupation VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_case_discussion_family_discussion_id (case_discussion_id),
  CONSTRAINT fk_case_discussion_family_discussion_id
    FOREIGN KEY (case_discussion_id) REFERENCES case_discussions(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);