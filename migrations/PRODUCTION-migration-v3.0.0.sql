-- ============================================================
-- MIGRACIÓN PRODUCCIÓN v3.0.0
-- Fecha: 2026-04-09
-- Base de datos: ootsPR (Railway - MySQL 9.4.0)
-- Descripción: RBAC + Sesiones + Historial + Family Health + Índices
--
-- INSTRUCCIONES:
--   1. Hacer un backup ANTES de ejecutar
--   2. Ejecutar completo en una sola transacción
--   3. Verificar con las queries al final
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- ────────────────────────────────────────────────────────────
-- 1. COLUMNA role EN users
--    (NO existe en producción)
-- ────────────────────────────────────────────────────────────
ALTER TABLE `users`
  ADD COLUMN `role`
    ENUM('ADMIN','COORDINADOR','SUPERVISOR','PSICOLOGO','ORIENTADOR')
    NOT NULL DEFAULT 'ORIENTADOR'
  AFTER `status`;

-- ────────────────────────────────────────────────────────────
-- 2. TABLA refresh_tokens
--    (NO existe en producción)
-- ────────────────────────────────────────────────────────────
CREATE TABLE `refresh_tokens` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `token_hash`  VARCHAR(64)   NOT NULL          COMMENT 'SHA-256 del token raw',
  `user_id`     INT UNSIGNED  NOT NULL,
  `expires_at`  DATETIME      NOT NULL,
  `revoked_at`  DATETIME      NULL              DEFAULT NULL,
  `ip_address`  VARCHAR(45)   NULL              DEFAULT NULL,
  `user_agent`  TEXT          NULL,
  `created_at`  DATETIME(6)   NOT NULL          DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY  `UQ_refresh_tokens_token_hash`     (`token_hash`),
  INDEX        `IDX_refresh_tokens_user_revoked` (`user_id`, `revoked_at`),
  CONSTRAINT  `FK_refresh_tokens_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Hashed refresh tokens con soporte de revocación (rotación)';

-- ────────────────────────────────────────────────────────────
-- 3. TABLA sessions
--    (NO existe en producción)
-- ────────────────────────────────────────────────────────────
CREATE TABLE `sessions` (
  `id`            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `user_id`       INT UNSIGNED  NOT NULL,
  `token_hash`    VARCHAR(64)   NOT NULL     COMMENT 'SHA-256 del access token actual',
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
  INDEX `IDX_sessions_user_active`  (`user_id`, `is_active`),
  INDEX `IDX_sessions_token_hash`   (`token_hash`),
  CONSTRAINT `FK_sessions_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Sesiones activas de usuario (política single-session)';

-- ────────────────────────────────────────────────────────────
-- 4. TABLA audit_logs
--    (NO existe en producción)
-- ────────────────────────────────────────────────────────────
CREATE TABLE `audit_logs` (
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
  INDEX `IDX_audit_logs_user_created`   (`user_id`, `created_at`),
  INDEX `IDX_audit_logs_action_created` (`action`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Registro inmutable de operaciones de la API';

-- ────────────────────────────────────────────────────────────
-- 5. TABLA login_history
--    (NO existe en producción)
-- ────────────────────────────────────────────────────────────
CREATE TABLE `login_history` (
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
  INDEX `IDX_login_history_risk`         (`risk`),
  CONSTRAINT `FK_login_history_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Historial de accesos con geolocalización y nivel de riesgo';

-- ────────────────────────────────────────────────────────────
-- 6. TABLA family_health_history
--    (NO existe en producción)
-- ────────────────────────────────────────────────────────────
CREATE TABLE `family_health_history` (
  `id`                    INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `case_id`               INT UNSIGNED  NOT NULL,
  `history_type`          ENUM('physical','mental') NOT NULL,
  `family_history_father` TEXT          NULL,
  `family_history_mother` TEXT          NULL,
  `created_at`            DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`            DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_family_health_case_type` (`case_id`, `history_type`),
  CONSTRAINT `FK_family_health_history_case`
    FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Historial de salud familiar (física y mental) por caso';

-- ────────────────────────────────────────────────────────────
-- 7. ÍNDICES DE OPTIMIZACIÓN
--    (ninguno existe en producción)
-- ────────────────────────────────────────────────────────────

-- cases: filtros por estado y búsquedas por participante+estado
CREATE INDEX `IDX_cases_status`             ON `cases` (`status`);
CREATE INDEX `IDX_cases_participant_status` ON `cases` (`participant_id`, `status`);

-- participants: soft-delete, ciudad, combinado
CREATE INDEX `IDX_participants_deleted_at`   ON `participants` (`deleted_at`);
CREATE INDEX `IDX_participants_city`         ON `participants` (`city`);
CREATE INDEX `IDX_participants_deleted_city` ON `participants` (`deleted_at`, `city`);

-- geolocations: rango de fechas y filtro por acción
CREATE INDEX `IDX_geolocations_user_created` ON `geolocations` (`user_id`, `created_at`);
CREATE INDEX `IDX_geolocations_action`       ON `geolocations` (`action`);

-- users: validación JWT (cada request) + forgot-password
CREATE INDEX `IDX_users_status`               ON `users` (`status`);
CREATE INDEX `IDX_users_password_reset_token` ON `users` (`password_reset_token`);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- VERIFICACIÓN — ejecutar después de la migración
-- ============================================================
-- SELECT 'audit_logs'       t, COUNT(*) ok FROM audit_logs       UNION ALL
-- SELECT 'refresh_tokens'   t, COUNT(*) ok FROM refresh_tokens   UNION ALL
-- SELECT 'sessions'         t, COUNT(*) ok FROM sessions         UNION ALL
-- SELECT 'login_history'    t, COUNT(*) ok FROM login_history    UNION ALL
-- SELECT 'family_health_history' t, COUNT(*) ok FROM family_health_history;
--
-- SHOW COLUMNS FROM users LIKE 'role';
--
-- SELECT table_name, index_name, column_name
-- FROM information_schema.statistics
-- WHERE table_schema = 'ootsPR'
--   AND index_name IN (
--     'IDX_cases_status','IDX_cases_participant_status',
--     'IDX_participants_deleted_at','IDX_participants_city',
--     'IDX_geolocations_user_created','IDX_geolocations_action',
--     'IDX_users_status','IDX_users_password_reset_token'
--   )
-- ORDER BY table_name, index_name;
