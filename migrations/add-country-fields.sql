-- ============================================================================
-- MIGRACIÓN: Ampliar tabla countries con campos de configuración regional
-- Versión: v3.1.0
-- Fecha: 2026-05-12
-- ============================================================================

USE oots_db;

-- 1. Agregar columnas (compatibilidad MySQL 5.7+)
SET @dbname = DATABASE();
SET @tablename = 'countries';

-- currency
SET @col = 'currency';
SET @sql = IF(
  NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @col),
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `', @col, '` VARCHAR(10) NULL AFTER `locale`'),
  'SELECT "currency ya existe" AS info'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- phone_prefix
SET @col = 'phone_prefix';
SET @sql = IF(
  NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @col),
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `', @col, '` VARCHAR(10) NULL AFTER `currency`'),
  'SELECT "phone_prefix ya existe" AS info'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- flag_url
SET @col = 'flag_url';
SET @sql = IF(
  NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @col),
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `', @col, '` VARCHAR(255) NULL AFTER `phone_prefix`'),
  'SELECT "flag_url ya existe" AS info'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- default_language
SET @col = 'default_language';
SET @sql = IF(
  NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @col),
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `', @col, '` VARCHAR(10) NULL AFTER `flag_url`'),
  'SELECT "default_language ya existe" AS info'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- is_active
SET @col = 'is_active';
SET @sql = IF(
  NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @col),
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `', @col, '` TINYINT(1) NOT NULL DEFAULT 1 AFTER `default_language`'),
  'SELECT "is_active ya existe" AS info'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. Actualizar datos existentes: Colombia
UPDATE `countries` SET
  `currency`         = 'COP',
  `phone_prefix`     = '+57',
  `flag_url`         = 'https://flagcdn.com/w20/co.png',
  `default_language` = 'es-CO',
  `is_active`        = 1
WHERE `iso` = 'CO';

-- 3. Actualizar datos existentes: Puerto Rico
UPDATE `countries` SET
  `currency`         = 'USD',
  `phone_prefix`     = '+1',
  `flag_url`         = 'https://flagcdn.com/w20/pr.png',
  `default_language` = 'es-PR',
  `is_active`        = 1
WHERE `iso` = 'PR';

-- 4. Actualizar datos existentes: Estados Unidos
UPDATE `countries` SET
  `currency`         = 'USD',
  `phone_prefix`     = '+1',
  `flag_url`         = 'https://flagcdn.com/w20/us.png',
  `default_language` = 'en-US',
  `is_active`        = 1
WHERE `iso` = 'US';

-- 5. Verificar resultado
SELECT id, name, iso, locale, currency, phone_prefix, flag_url, default_language, is_active
FROM `countries`
ORDER BY name;
