CREATE TABLE IF NOT EXISTS `case_document_histories` (
  `case_id` INT UNSIGNED NOT NULL,
  `country_id` INT UNSIGNED NULL,
  `source` ENUM('creation', 'legacy') NOT NULL,
  `captured_at` DATETIME(6) NOT NULL,
  `participant_snapshot` JSON NOT NULL,
  `participant_age` INT NULL,
  `family_snapshot` JSON NOT NULL,
  `responsible_snapshot` JSON NULL,
  `closed_at` DATETIME(6) NULL,
  `closed_by_snapshot` JSON NULL,
  `closed_snapshot` JSON NULL,
  `discussions_snapshot` JSON NULL,
  PRIMARY KEY (`case_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
