-- ============================================================================
-- MIGRATION: Eliminar education_levels y reemplazar por academic_levels
-- ============================================================================
-- Descripción: Este script elimina la tabla education_levels y actualiza
--              la relación en bio_psychosocial_history para usar academic_levels
--
-- Fecha: 2025-10-31
-- Autor: Sistema de migración
-- ============================================================================

-- ============================================================================
-- PASO 1: VERIFICACIONES PRE-MIGRACIÓN
-- ============================================================================

-- Verificar que la tabla education_levels existe
SELECT 
    'Verificando existencia de education_levels...' AS status,
    COUNT(*) AS total_records
FROM education_levels;

-- Verificar que la tabla academic_levels existe
SELECT 
    'Verificando existencia de academic_levels...' AS status,
    COUNT(*) AS total_records
FROM academic_levels;

-- Verificar registros en bio_psychosocial_history con education_level_id
SELECT 
    'Registros con education_level_id en bio_psychosocial_history' AS status,
    COUNT(*) AS total_records
FROM bio_psychosocial_history
WHERE education_level_id IS NOT NULL;

-- ============================================================================
-- PASO 2: MIGRACIÓN DE DATOS (si hay datos que migrar)
-- ============================================================================

-- NOTA: Si tienes datos en bio_psychosocial_history con education_level_id,
-- necesitarás mapear manualmente los IDs de education_levels a academic_levels.
-- Aquí un ejemplo de cómo hacerlo si los nombres coinciden:

-- Ejemplo de migración de datos (descomenta y ajusta según sea necesario):
/*
UPDATE bio_psychosocial_history bph
INNER JOIN education_levels el ON bph.education_level_id = el.id
INNER JOIN academic_levels al ON el.name = al.name
SET bph.academic_level_id = al.id
WHERE bph.education_level_id IS NOT NULL;
*/

-- IMPORTANTE: Revisa los datos antes de ejecutar la migración.
-- Si los nombres no coinciden exactamente, necesitarás un mapeo manual.

-- ============================================================================
-- PASO 3: ELIMINAR COLUMNA ANTIGUA Y AÑADIR NUEVA
-- ============================================================================

-- Verificar la estructura actual de bio_psychosocial_history
DESCRIBE bio_psychosocial_history;

-- Añadir la nueva columna academic_level_id si no existe
ALTER TABLE bio_psychosocial_history 
ADD COLUMN IF NOT EXISTS academic_level_id INT NULL 
AFTER housing_type_id;

-- Añadir el índice para la nueva columna
ALTER TABLE bio_psychosocial_history
ADD INDEX IF NOT EXISTS idx_academic_level_id (academic_level_id);

-- Añadir la foreign key para la nueva columna
ALTER TABLE bio_psychosocial_history
ADD CONSTRAINT IF NOT EXISTS fk_bio_psych_academic_level
FOREIGN KEY (academic_level_id) REFERENCES academic_levels(id)
ON DELETE SET NULL;

-- Eliminar la foreign key antigua
ALTER TABLE bio_psychosocial_history
DROP FOREIGN KEY IF EXISTS fk_bio_psych_education_level;

-- Eliminar la columna antigua
ALTER TABLE bio_psychosocial_history
DROP COLUMN IF EXISTS education_level_id;

-- ============================================================================
-- PASO 4: ELIMINAR TABLA education_levels
-- ============================================================================

-- Eliminar la tabla education_levels
DROP TABLE IF EXISTS education_levels;

-- ============================================================================
-- PASO 5: VERIFICACIONES POST-MIGRACIÓN
-- ============================================================================

-- Verificar que education_levels fue eliminada
SELECT 
    'Verificando que education_levels fue eliminada...' AS status,
    COUNT(*) AS table_exists
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name = 'education_levels';
-- Resultado esperado: 0

-- Verificar la nueva estructura de bio_psychosocial_history
DESCRIBE bio_psychosocial_history;

-- Verificar que la nueva columna existe y está funcionando
SELECT 
    'Verificando nueva columna academic_level_id...' AS status,
    COUNT(*) AS total_records,
    COUNT(academic_level_id) AS records_with_academic_level
FROM bio_psychosocial_history;

-- ============================================================================
-- ROLLBACK (EN CASO DE EMERGENCIA)
-- ============================================================================

/*
-- ⚠️ SOLO EJECUTAR SI NECESITAS REVERTIR LOS CAMBIOS

-- 1. Recrear la tabla education_levels
CREATE TABLE education_levels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(30) NOT NULL UNIQUE,
  order_index INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Añadir de nuevo la columna education_level_id
ALTER TABLE bio_psychosocial_history 
ADD COLUMN education_level_id INT NULL 
AFTER housing_type_id;

-- 3. Añadir la foreign key
ALTER TABLE bio_psychosocial_history
ADD CONSTRAINT fk_bio_psych_education_level
FOREIGN KEY (education_level_id) REFERENCES education_levels(id)
ON DELETE SET NULL;

-- 4. Migrar datos de vuelta (si es necesario)
-- UPDATE bio_psychosocial_history SET education_level_id = academic_level_id;

-- 5. Eliminar la columna academic_level_id
ALTER TABLE bio_psychosocial_history
DROP FOREIGN KEY fk_bio_psych_academic_level;

ALTER TABLE bio_psychosocial_history
DROP COLUMN academic_level_id;
*/

-- ============================================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================================

SELECT 
    '✅ MIGRACIÓN COMPLETADA' AS status,
    'education_levels eliminada, academic_levels activa' AS message;
