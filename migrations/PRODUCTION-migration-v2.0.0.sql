-- ============================================================================
-- MIGRACIÓN PARA PRODUCCIÓN - v2.0.0
-- Fecha: 2025-12-18
-- Descripción: Eliminación de type_progress, creación de approach_types y 
--              process_types, y ajustes en follow_up_plan
-- ============================================================================

-- ============================================================================
-- PASO 1: ELIMINAR TYPE_PROGRESS
-- ============================================================================

-- 1.1 Verificar y eliminar la foreign key de progress_notes a type_progress
SET @fk_name = (
  SELECT CONSTRAINT_NAME 
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'progress_notes' 
    AND COLUMN_NAME = 'type_progress_id'
    AND REFERENCED_TABLE_NAME IS NOT NULL
  LIMIT 1
);

SET @query = IF(@fk_name IS NOT NULL, 
  CONCAT('ALTER TABLE `progress_notes` DROP FOREIGN KEY `', @fk_name, '`'), 
  'SELECT "No foreign key found for type_progress_id" AS info'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 1.2 Eliminar la columna type_progress_id de progress_notes
ALTER TABLE `progress_notes`
DROP COLUMN IF EXISTS `type_progress_id`;

-- 1.3 Eliminar la tabla type_progress
DROP TABLE IF EXISTS `type_progress`;

SELECT '✅ PASO 1 COMPLETADO: type_progress eliminado' AS info;

-- ============================================================================
-- PASO 2: CREAR TABLAS APPROACH_TYPES Y PROCESS_TYPES
-- ============================================================================

-- 2.1 Crear tabla approach_types
CREATE TABLE IF NOT EXISTS `approach_types` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `UK_approach_types_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.2 Crear tabla process_types
CREATE TABLE IF NOT EXISTS `process_types` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `UK_process_types_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✅ PASO 2 COMPLETADO: Tablas approach_types y process_types creadas' AS info;

-- ============================================================================
-- PASO 3: AGREGAR COLUMNAS A PROGRESS_NOTES
-- ============================================================================

-- 3.1 Verificar y agregar columna approach_type_id
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'progress_notes' 
    AND COLUMN_NAME = 'approach_type_id'
);

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `progress_notes` ADD COLUMN `approach_type_id` INT NULL AFTER `session_date`', 
  'SELECT "Column approach_type_id already exists" AS info'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3.2 Verificar y agregar columna process_type_id
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'progress_notes' 
    AND COLUMN_NAME = 'process_type_id'
);

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE `progress_notes` ADD COLUMN `process_type_id` INT NULL AFTER `approach_type_id`', 
  'SELECT "Column process_type_id already exists" AS info'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '✅ PASO 3 COMPLETADO: Columnas agregadas a progress_notes' AS info;

-- ============================================================================
-- PASO 4: CREAR FOREIGN KEYS EN PROGRESS_NOTES
-- ============================================================================

-- 4.1 Verificar y crear foreign key a approach_types
SET @fk_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'progress_notes' 
    AND COLUMN_NAME = 'approach_type_id'
    AND REFERENCED_TABLE_NAME = 'approach_types'
);

SET @query = IF(@fk_exists = 0, 
  'ALTER TABLE `progress_notes` ADD CONSTRAINT `FK_progress_notes_approach_type` FOREIGN KEY (`approach_type_id`) REFERENCES `approach_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE', 
  'SELECT "Foreign key FK_progress_notes_approach_type already exists" AS info'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4.2 Verificar y crear foreign key a process_types
SET @fk_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'progress_notes' 
    AND COLUMN_NAME = 'process_type_id'
    AND REFERENCED_TABLE_NAME = 'process_types'
);

SET @query = IF(@fk_exists = 0, 
  'ALTER TABLE `progress_notes` ADD CONSTRAINT `FK_progress_notes_process_type` FOREIGN KEY (`process_type_id`) REFERENCES `process_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE', 
  'SELECT "Foreign key FK_progress_notes_process_type already exists" AS info'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '✅ PASO 4 COMPLETADO: Foreign keys creadas en progress_notes' AS info;

-- ============================================================================
-- PASO 5: INSERTAR DATOS INICIALES EN APPROACH_TYPES
-- ============================================================================

INSERT INTO `approach_types` (`name`, `description`) VALUES
('Terapia Cognitivo-Conductual', 'Enfoque terapéutico que trabaja en la modificación de pensamientos y conductas disfuncionales'),
('Terapia Psicodinámica', 'Enfoque basado en la exploración del inconsciente y experiencias tempranas'),
('Terapia Humanista', 'Enfoque centrado en la persona y su potencial de crecimiento'),
('Terapia Sistémica', 'Enfoque que considera al individuo dentro de su sistema familiar y social'),
('Terapia Gestalt', 'Enfoque experiencial centrado en el aquí y ahora'),
('Terapia de Aceptación y Compromiso (ACT)', 'Enfoque basado en mindfulness y valores personales'),
('Terapia Narrativa', 'Enfoque que explora las historias personales y su reescritura'),
('Intervención en Crisis', 'Abordaje inmediato para situaciones de emergencia psicológica')
ON DUPLICATE KEY UPDATE 
  `description` = VALUES(`description`);

SELECT '✅ PASO 5 COMPLETADO: Datos iniciales de approach_types insertados' AS info;

-- ============================================================================
-- PASO 6: INSERTAR DATOS INICIALES EN PROCESS_TYPES
-- ============================================================================

INSERT INTO `process_types` (`name`, `description`) VALUES
('Proceso Individual', 'Proceso terapéutico con atención personalizada uno a uno'),
('Proceso Grupal', 'Proceso terapéutico en formato de grupo'),
('Proceso Familiar', 'Proceso terapéutico enfocado en la dinámica familiar'),
('Proceso de Pareja', 'Proceso terapéutico para relaciones de pareja'),
('Proceso de Evaluación', 'Proceso diagnóstico y valoración psicológica'),
('Proceso Psicoeducativo', 'Proceso enfocado en educación sobre salud mental'),
('Proceso de Acompañamiento', 'Proceso de seguimiento y apoyo continuo')
ON DUPLICATE KEY UPDATE 
  `description` = VALUES(`description`);

SELECT '✅ PASO 6 COMPLETADO: Datos iniciales de process_types insertados' AS info;

-- ============================================================================
-- PASO 7: HACER OPCIONAL EL CAMPO COORDINATED_SERVICE EN FOLLOW_UP_PLAN
-- ============================================================================

-- 7.1 Modificar columna coordinated_service para que sea nullable
ALTER TABLE `follow_up_plan`
MODIFY COLUMN `coordinated_service` BOOLEAN NULL DEFAULT FALSE;

SELECT '✅ PASO 7 COMPLETADO: Campo coordinated_service es ahora opcional' AS info;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

SELECT '========================================' AS '';
SELECT '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE' AS '';
SELECT '========================================' AS '';

-- Verificar tablas creadas
SELECT 'Verificando tablas creadas:' AS '';
SELECT TABLE_NAME, TABLE_ROWS 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME IN ('approach_types', 'process_types')
ORDER BY TABLE_NAME;

-- Verificar columnas en progress_notes
SELECT 'Verificando columnas en progress_notes:' AS '';
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'progress_notes'
  AND COLUMN_NAME IN ('approach_type_id', 'process_type_id')
ORDER BY ORDINAL_POSITION;

-- Verificar columna en follow_up_plan
SELECT 'Verificando columna en follow_up_plan:' AS '';
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'follow_up_plan'
  AND COLUMN_NAME = 'coordinated_service';

SELECT '========================================' AS '';
SELECT 'Versión: 2.0.0' AS '';
SELECT 'Fecha de aplicación:', NOW() AS '';
SELECT '========================================' AS '';
