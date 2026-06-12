-- ============================================================================
-- MIGRACIÓN: Sincronizar base de PRODUCCIÓN (ootsPR) con el código actual
-- Fecha:       2026-06-12
-- Motor:       MySQL 8.0+
-- Idempotente: usa IF NOT EXISTS / información_schema donde es seguro.
--
-- RESUMEN DE CAMBIOS:
--   A) TABLAS NUEVAS:
--      - countries
--      - case_discussions
--      - case_discussion_family_members
--
--   B) COLUMNAS NUEVAS:
--      - users.country_id        (FK -> countries)
--      - users.mita_number       (INT UNSIGNED UNIQUE)
--      - participants.country_id (FK -> countries)
--      - participants.mita_number(INT UNSIGNED)
--
--   C) CAMBIOS DE COLUMNA:
--      - cases.case_number  ahora NULLABLE (entidad lo declara opcional)
--
--   D) LIMPIEZA – tablas huérfanas (sin entidad, vacías en producción):
--      - case_follow_up_plans
--      - follow_up_plan_catalog
--      - catalog_identified_situations
--      - type_progress
--
--   E) LIMPIEZA – columnas huérfanas (sin campo en User entity):
--      - users.facebook, users.twitter, users.instagram,
--        users.linkedin, users.github
--
-- ⚠️  EJECUTAR DENTRO DE UNA TRANSACCIÓN Y HACER BACKUP ANTES.
-- ============================================================================

SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- A) TABLAS NUEVAS
-- ============================================================================

-- A.1) countries -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `countries` (
  `id`               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`             VARCHAR(100) NOT NULL,
  `iso`              VARCHAR(2)   NULL,
  `locale`           VARCHAR(10)  NULL,
  `currency`         VARCHAR(10)  NULL,
  `phone_prefix`     VARCHAR(10)  NULL,
  `flag_url`         VARCHAR(255) NULL,
  `default_language` VARCHAR(10)  NULL,
  `code`             VARCHAR(10)  NOT NULL DEFAULT '',
  `is_active`        TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                       ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_countries_name`   (`name`),
  UNIQUE KEY `UQ_countries_iso`    (`iso`),
  UNIQUE KEY `UQ_countries_locale` (`locale`),
  UNIQUE KEY `UQ_countries_code`   (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Semilla mínima (ajustar a gusto)
INSERT IGNORE INTO `countries` (`name`, `iso`, `code`, `phone_prefix`, `default_language`)
VALUES
  ('Puerto Rico', 'PR', 'PRI', '+1',  'es'),
  ('United States','US', 'USA', '+1',  'en'),
  ('Colombia',    'CO', 'COL', '+57', 'es');

-- A.2) case_discussions ------------------------------------------------------
CREATE TABLE IF NOT EXISTS `case_discussions` (
  `id`                              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `case_id`                         INT UNSIGNED NOT NULL,
  `participant_id`                  INT UNSIGNED NOT NULL,
  `social_worker_id`                INT UNSIGNED NOT NULL,
  `supervisor_id`                   INT UNSIGNED NOT NULL,
  `discussion_date`                 DATE NOT NULL,
  `status`                          ENUM('BORRADOR','FINALIZADA','ANULADA')
                                    NOT NULL DEFAULT 'BORRADOR',
  `client_name_snapshot`            VARCHAR(255) NULL,
  `client_age_snapshot`             INT NULL,
  `client_gender_snapshot`          VARCHAR(50)  NULL,
  `client_marital_status_snapshot`  VARCHAR(100) NULL,
  `presented_situations`            LONGTEXT NOT NULL,
  `affected_people`                 LONGTEXT NULL,
  `social_worker_recommendations`   LONGTEXT NULL,
  `supervisor_recommendations`      LONGTEXT NULL,
  `finalized_at`                    DATETIME NULL,
  `finalized_by`                    INT UNSIGNED NULL,
  `annulled_at`                     DATETIME NULL,
  `annulled_by`                     INT UNSIGNED NULL,
  `annulment_reason`                TEXT NULL,
  `created_by`                      INT UNSIGNED NOT NULL,
  `updated_by`                      INT UNSIGNED NULL,
  `created_at`                      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`                      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                                      ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at`                      DATETIME(6) NULL,
  PRIMARY KEY (`id`),
  KEY `idx_case_discussions_case_id`        (`case_id`),
  KEY `idx_case_discussions_participant_id` (`participant_id`),
  KEY `idx_case_discussions_supervisor_id`  (`supervisor_id`),
  KEY `idx_case_discussions_status`         (`status`),
  CONSTRAINT `fk_case_discussions_case_id`
    FOREIGN KEY (`case_id`)         REFERENCES `cases`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_case_discussions_participant_id`
    FOREIGN KEY (`participant_id`)  REFERENCES `participants`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_case_discussions_social_worker_id`
    FOREIGN KEY (`social_worker_id`)REFERENCES `users`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_case_discussions_supervisor_id`
    FOREIGN KEY (`supervisor_id`)   REFERENCES `users`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_case_discussions_finalized_by`
    FOREIGN KEY (`finalized_by`)    REFERENCES `users`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_case_discussions_annulled_by`
    FOREIGN KEY (`annulled_by`)     REFERENCES `users`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_case_discussions_created_by`
    FOREIGN KEY (`created_by`)      REFERENCES `users`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_case_discussions_updated_by`
    FOREIGN KEY (`updated_by`)      REFERENCES `users`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A.3) case_discussion_family_members ----------------------------------------
CREATE TABLE IF NOT EXISTS `case_discussion_family_members` (
  `id`                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `case_discussion_id`  BIGINT UNSIGNED NOT NULL,
  `name`                VARCHAR(255) NOT NULL,
  `age`                 INT NULL,
  `relationship`        VARCHAR(100) NOT NULL,
  `occupation`          VARCHAR(255) NULL,
  `sort_order`          INT NOT NULL DEFAULT 0,
  `created_at`          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                          ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_case_discussion_family_discussion_id` (`case_discussion_id`),
  CONSTRAINT `fk_case_discussion_family_discussion_id`
    FOREIGN KEY (`case_discussion_id`) REFERENCES `case_discussions`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- B) COLUMNAS NUEVAS EN TABLAS EXISTENTES
-- ============================================================================

-- B.1) users.country_id ------------------------------------------------------
SET @col := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'users' AND COLUMN_NAME = 'country_id');
SET @sql := IF(@col = 0,
  'ALTER TABLE `users` ADD COLUMN `country_id` INT UNSIGNED NULL AFTER `role_id`',
  'SELECT "users.country_id ya existe" AS info');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @fk := (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'users' AND CONSTRAINT_NAME = 'FK_users_country');
SET @sql := IF(@fk = 0,
  'ALTER TABLE `users` ADD CONSTRAINT `FK_users_country`
     FOREIGN KEY (`country_id`) REFERENCES `countries`(`id`)
     ON DELETE SET NULL ON UPDATE CASCADE',
  'SELECT "FK_users_country ya existe" AS info');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- B.2) users.mita_number -----------------------------------------------------
SET @col := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'users' AND COLUMN_NAME = 'mita_number');
SET @sql := IF(@col = 0,
  'ALTER TABLE `users`
     ADD COLUMN `mita_number` INT UNSIGNED NULL,
     ADD UNIQUE KEY `UQ_users_mita_number` (`mita_number`)',
  'SELECT "users.mita_number ya existe" AS info');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- B.3) participants.country_id -----------------------------------------------
SET @col := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'participants' AND COLUMN_NAME = 'country_id');
SET @sql := IF(@col = 0,
  'ALTER TABLE `participants` ADD COLUMN `country_id` INT UNSIGNED NULL AFTER `state`',
  'SELECT "participants.country_id ya existe" AS info');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @fk := (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'participants' AND CONSTRAINT_NAME = 'FK_participants_country');
SET @sql := IF(@fk = 0,
  'ALTER TABLE `participants` ADD CONSTRAINT `FK_participants_country`
     FOREIGN KEY (`country_id`) REFERENCES `countries`(`id`)
     ON DELETE SET NULL ON UPDATE CASCADE',
  'SELECT "FK_participants_country ya existe" AS info');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- B.4) participants.mita_number ----------------------------------------------
SET @col := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'participants' AND COLUMN_NAME = 'mita_number');
SET @sql := IF(@col = 0,
  'ALTER TABLE `participants` ADD COLUMN `mita_number` INT UNSIGNED NULL DEFAULT NULL',
  'SELECT "participants.mita_number ya existe" AS info');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- ============================================================================
-- C) CAMBIOS DE COLUMNA (sólo si el tipo actual difiere)
-- ============================================================================

-- C.1) cases.case_number → NULLABLE (la entidad lo declara opcional)
ALTER TABLE `cases` MODIFY COLUMN `case_number` VARCHAR(20) NULL;

-- ============================================================================
-- D) LIMPIEZA: tablas huérfanas (sin entidad, vacías en producción)
--    Verificadas vacías en el dump del 2026-06-12.
-- ============================================================================

DROP TABLE IF EXISTS `case_follow_up_plans`;
DROP TABLE IF EXISTS `follow_up_plan_catalog`;
DROP TABLE IF EXISTS `catalog_identified_situations`;

-- type_progress: la FK desde progress_notes ya no existe en producción
-- (la columna type_progress_id ya fue removida).
DROP TABLE IF EXISTS `type_progress`;

-- ============================================================================
-- E) LIMPIEZA: columnas huérfanas en users (no están en la entidad User)
--    Estas columnas se agregaron en una versión previa y ya no se usan.
--    ⚠️  Si deseas conservarlas, comenta este bloque.
-- ============================================================================

SET @col := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'users' AND COLUMN_NAME = 'facebook');
SET @sql := IF(@col > 0,
  'ALTER TABLE `users` DROP COLUMN `facebook`',
  'SELECT "users.facebook no existe" AS info');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @col := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'users' AND COLUMN_NAME = 'twitter');
SET @sql := IF(@col > 0,
  'ALTER TABLE `users` DROP COLUMN `twitter`',
  'SELECT "users.twitter no existe" AS info');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @col := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'users' AND COLUMN_NAME = 'instagram');
SET @sql := IF(@col > 0,
  'ALTER TABLE `users` DROP COLUMN `instagram`',
  'SELECT "users.instagram no existe" AS info');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @col := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'users' AND COLUMN_NAME = 'linkedin');
SET @sql := IF(@col > 0,
  'ALTER TABLE `users` DROP COLUMN `linkedin`',
  'SELECT "users.linkedin no existe" AS info');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @col := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'users' AND COLUMN_NAME = 'github');
SET @sql := IF(@col > 0,
  'ALTER TABLE `users` DROP COLUMN `github`',
  'SELECT "users.github no existe" AS info');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- ============================================================================
SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;

-- ============================================================================
-- VERIFICACIÓN (opcional, ejecutar manualmente)
-- ============================================================================
-- SHOW TABLES LIKE 'countries';
-- SHOW TABLES LIKE 'case_discussions';
-- SHOW TABLES LIKE 'case_discussion_family_members';
-- SHOW COLUMNS FROM users    LIKE 'country_id';
-- SHOW COLUMNS FROM users    LIKE 'mita_number';
-- SHOW COLUMNS FROM participants LIKE 'country_id';
-- SHOW COLUMNS FROM participants LIKE 'mita_number';
-- SHOW COLUMNS FROM cases    LIKE 'case_number';
-- ============================================================================
