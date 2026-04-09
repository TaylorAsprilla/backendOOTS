-- ============================================================
-- Migration: Security Tables (RBAC + Sessions + Login History)
-- Author: OOTS Colombia
-- Description:
--   1. ADD COLUMN role on users
--   2. CREATE TABLE refresh_tokens
--   3. CREATE TABLE sessions
--   4. CREATE TABLE audit_logs
--   5. CREATE TABLE login_history
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. ROLE column on users (idempotent)
-- ────────────────────────────────────────────────────────────
ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `role`
    ENUM('ADMIN','COORDINADOR','SUPERVISOR','PSICOLOGO','ORIENTADOR')
    NOT NULL DEFAULT 'ORIENTADOR'
  AFTER `status`;

-- ────────────────────────────────────────────────────────────
-- 2. REFRESH TOKENS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `token_hash`  VARCHAR(64)   NOT NULL         COMMENT 'SHA-256 hash of the raw token',
  `user_id`     INT UNSIGNED  NOT NULL,
  `expires_at`  DATETIME      NOT NULL,
  `revoked_at`  DATETIME      NULL             DEFAULT NULL,
  `ip_address`  VARCHAR(45)   NULL             DEFAULT NULL,
  `user_agent`  TEXT          NULL,
  `created_at`  DATETIME(6)   NOT NULL         DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY  `UQ_refresh_tokens_token_hash`   (`token_hash`),
  INDEX        `IDX_refresh_tokens_user_revoked` (`user_id`, `revoked_at`),
  CONSTRAINT  `FK_refresh_tokens_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Stores hashed refresh tokens with revocation support (token rotation)';

-- ────────────────────────────────────────────────────────────
-- 3. SESSIONS (single-session enforcement)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `sessions` (
  `id`            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `user_id`       INT UNSIGNED  NOT NULL,
  `token_hash`    VARCHAR(64)   NOT NULL     COMMENT 'SHA-256 of current access token',
  `ip_address`    VARCHAR(45)   NULL         DEFAULT NULL,
  `user_agent`    TEXT          NULL,
  `device_type`   VARCHAR(50)   NULL         DEFAULT NULL,
  `browser`       VARCHAR(100)  NULL         DEFAULT NULL,
  `os`            VARCHAR(100)  NULL         DEFAULT NULL,
  `country`       VARCHAR(100)  NULL         DEFAULT NULL,
  `city`          VARCHAR(100)  NULL         DEFAULT NULL,
  `is_active`     TINYINT(1)    NOT NULL     DEFAULT 1,
  `last_activity` DATETIME      NOT NULL,
  `created_at`    DATETIME(6)   NOT NULL     DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`    DATETIME(6)   NOT NULL     DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `IDX_sessions_user_active` (`user_id`, `is_active`),
  CONSTRAINT `FK_sessions_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Active user sessions — one per user (single-session policy)';

-- ────────────────────────────────────────────────────────────
-- 4. AUDIT LOGS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id`              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `user_id`         INT UNSIGNED  NULL      DEFAULT NULL,
  `user_email`      VARCHAR(100)  NULL      DEFAULT NULL,
  `action`          ENUM(
                      'CREATE','UPDATE','DELETE','READ',
                      'LOGIN','LOGOUT','STATUS_CHANGE',
                      'PASSWORD_CHANGE','PASSWORD_RESET'
                    ) NOT NULL,
  `endpoint`        VARCHAR(255)  NULL      DEFAULT NULL,
  `http_method`     VARCHAR(10)   NULL      DEFAULT NULL,
  `request_body`    JSON          NULL,
  `response_status` SMALLINT UNSIGNED NULL  DEFAULT NULL,
  `ip_address`      VARCHAR(45)   NULL      DEFAULT NULL,
  `user_agent`      TEXT          NULL,
  `duration_ms`     INT UNSIGNED  NULL      DEFAULT NULL,
  `description`     TEXT          NULL,
  `created_at`      DATETIME(6)   NOT NULL  DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `IDX_audit_logs_user_id`       (`user_id`),
  INDEX `IDX_audit_logs_user_created`  (`user_id`, `created_at`),
  INDEX `IDX_audit_logs_action_created`(`action`,  `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Immutable audit trail for all mutating API operations';

-- ────────────────────────────────────────────────────────────
-- 5. LOGIN HISTORY
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `login_history` (
  `id`              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `user_id`         INT UNSIGNED  NOT NULL,
  `ip_address`      VARCHAR(45)   NOT NULL,
  `country`         VARCHAR(100)  NULL      DEFAULT NULL,
  `country_code`    VARCHAR(10)   NULL      DEFAULT NULL,
  `city`            VARCHAR(100)  NULL      DEFAULT NULL,
  `region`          VARCHAR(100)  NULL      DEFAULT NULL,
  `lat`             DECIMAL(10,7) NULL      DEFAULT NULL,
  `lon`             DECIMAL(10,7) NULL      DEFAULT NULL,
  `isp`             VARCHAR(255)  NULL      DEFAULT NULL,
  `timezone`        VARCHAR(100)  NULL      DEFAULT NULL,
  `user_agent`      TEXT          NULL,
  `device_type`     VARCHAR(50)   NULL      DEFAULT NULL,
  `browser`         VARCHAR(100)  NULL      DEFAULT NULL,
  `os`              VARCHAR(100)  NULL      DEFAULT NULL,
  `is_new_location` TINYINT(1)    NOT NULL  DEFAULT 0,
  `risk`            ENUM('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'LOW',
  `created_at`      DATETIME(6)   NOT NULL  DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `IDX_login_history_user_created` (`user_id`, `created_at`),
  CONSTRAINT `FK_login_history_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Login history per user with geolocation and risk level for security alerts';

-- ────────────────────────────────────────────────────────────
-- 6. INDEX OPTIMIZATIONS
-- ────────────────────────────────────────────────────────────

-- audit_logs: drop redundant single-column user_id index (covered by composite)
ALTER TABLE `audit_logs` DROP INDEX IF EXISTS `IDX_bd2726fd31b35443f2245b93ba`;

-- cases: status filtering + participant lookups
CREATE INDEX IF NOT EXISTS `IDX_cases_status`             ON `cases` (`status`);
CREATE INDEX IF NOT EXISTS `IDX_cases_participant_status` ON `cases` (`participant_id`, `status`);

-- participants: soft-delete, city (demographics), combined
CREATE INDEX IF NOT EXISTS `IDX_participants_deleted_at`    ON `participants` (`deleted_at`);
CREATE INDEX IF NOT EXISTS `IDX_participants_city`          ON `participants` (`city`);
CREATE INDEX IF NOT EXISTS `IDX_participants_deleted_city`  ON `participants` (`deleted_at`, `city`);

-- geolocations: time-range + action queries
CREATE INDEX IF NOT EXISTS `IDX_geolocations_user_created` ON `geolocations` (`user_id`, `created_at`);
CREATE INDEX IF NOT EXISTS `IDX_geolocations_action`       ON `geolocations` (`action`);

-- users: status (JWT validation) + password reset token lookup
CREATE INDEX IF NOT EXISTS `IDX_users_status`               ON `users` (`status`);
CREATE INDEX IF NOT EXISTS `IDX_users_password_reset_token` ON `users` (`password_reset_token`);

-- sessions: token_hash lookup on refresh rotation
CREATE INDEX IF NOT EXISTS `IDX_sessions_token_hash` ON `sessions` (`token_hash`);

-- login_history: risk-based security analytics
CREATE INDEX IF NOT EXISTS `IDX_login_history_risk` ON `login_history` (`risk`);
