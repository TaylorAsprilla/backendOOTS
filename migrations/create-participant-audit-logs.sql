CREATE TABLE IF NOT EXISTS `participant_audit_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `participant_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `user_email` VARCHAR(100) NOT NULL,
  `user_name` VARCHAR(255) NOT NULL,
  `action` ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `IDX_participant_audit_participant_created` (`participant_id`, `created_at`),
  INDEX `IDX_participant_audit_user_created` (`user_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
