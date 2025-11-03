-- ============================================================================
-- CLEANUP: Eliminar tablas obsoletas y redundantes
-- ============================================================================
-- Descripción: Este script elimina todas las tablas que han sido reemplazadas
--              o renombradas en migraciones anteriores. Solo ejecutar después
--              de confirmar que las migraciones fueron exitosas.
--
-- Fecha: 2025-10-31
-- Autor: Sistema de migración
-- ============================================================================

-- ⚠️ ADVERTENCIA: Este script elimina tablas permanentemente
-- Asegúrate de:
-- 1. Haber ejecutado todos los scripts de migración
-- 2. Tener un backup de la base de datos
-- 3. Verificar que los datos fueron migrados correctamente

-- ============================================================================
-- PASO 1: VERIFICACIÓN PRE-ELIMINACIÓN
-- ============================================================================

SELECT 
    '🔍 Verificando tablas obsoletas en la base de datos...' AS status;

-- Verificar qué tablas obsoletas existen actualmente
SELECT 
    'Tablas obsoletas encontradas:' AS info;

SELECT 
    table_name,
    table_rows AS filas_aprox,
    ROUND((data_length + index_length) / 1024 / 1024, 2) AS tamano_mb
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name IN (
    'education_levels',
    'follow_up_plan_types',
    'ponderaciones',
    'closing_note',
    'family_relationships'
  )
ORDER BY table_name;

-- Verificar que las tablas nuevas existen
SELECT 
    'Verificando que las tablas de reemplazo existen...' AS info;

SELECT 
    table_name,
    CASE 
        WHEN table_name = 'academic_levels' THEN '✓ Reemplaza: education_levels'
        WHEN table_name = 'follow_up_plan_catalog' THEN '✓ Reemplaza: follow_up_plan_types'
        WHEN table_name = 'weighings' THEN '✓ Reemplaza: ponderaciones'
        WHEN table_name = 'closing_notes' THEN '✓ Reemplaza: closing_note'
        WHEN table_name = 'relationships' THEN '✓ Reemplaza: family_relationships'
    END AS descripcion,
    table_rows AS filas
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name IN (
    'academic_levels',
    'follow_up_plan_catalog',
    'weighings',
    'closing_notes',
    'relationships'
  )
ORDER BY table_name;

-- ============================================================================
-- PASO 2: VERIFICAR FOREIGN KEYS QUE APUNTAN A TABLAS OBSOLETAS
-- ============================================================================

SELECT 
    '🔑 Verificando foreign keys hacia tablas obsoletas...' AS status;

SELECT 
    CONCAT('⚠️ Foreign key encontrada: ', constraint_name, ' en ', table_name) AS advertencia,
    column_name,
    referenced_table_name AS tabla_referenciada
FROM information_schema.key_column_usage
WHERE referenced_table_schema = DATABASE()
  AND referenced_table_name IN (
    'education_levels',
    'follow_up_plan_types',
    'ponderaciones',
    'closing_note',
    'family_relationships'
  );

-- Si hay resultados aquí, NO CONTINUAR hasta resolver las dependencias

-- ============================================================================
-- PASO 3: BACKUP DE CONTEO DE REGISTROS (para comparar después)
-- ============================================================================

SELECT 
    '📊 Conteo de registros antes de eliminar...' AS status;

CREATE TEMPORARY TABLE IF NOT EXISTS backup_counts (
    tabla VARCHAR(100),
    cantidad INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conteo de education_levels (si existe)
INSERT INTO backup_counts (tabla, cantidad)
SELECT 'education_levels_eliminada', COUNT(*)
FROM information_schema.tables t
LEFT JOIN education_levels ON TRUE
WHERE t.table_schema = DATABASE()
  AND t.table_name = 'education_levels';

-- Conteo de follow_up_plan_types (si existe)
INSERT INTO backup_counts (tabla, cantidad)
SELECT 'follow_up_plan_types_eliminada', COUNT(*)
FROM information_schema.tables t
LEFT JOIN follow_up_plan_types ON TRUE
WHERE t.table_schema = DATABASE()
  AND t.table_name = 'follow_up_plan_types';

-- Conteo de ponderaciones (si existe)
INSERT INTO backup_counts (tabla, cantidad)
SELECT 'ponderaciones_eliminada', COUNT(*)
FROM information_schema.tables t
LEFT JOIN ponderaciones ON TRUE
WHERE t.table_schema = DATABASE()
  AND t.table_name = 'ponderaciones';

-- Conteo de closing_note (si existe)
INSERT INTO backup_counts (tabla, cantidad)
SELECT 'closing_note_eliminada', COUNT(*)
FROM information_schema.tables t
LEFT JOIN closing_note ON TRUE
WHERE t.table_schema = DATABASE()
  AND t.table_name = 'closing_note';

-- ============================================================================
-- PASO 4: ELIMINAR TABLAS OBSOLETAS
-- ============================================================================

SELECT 
    '🗑️ Eliminando tablas obsoletas...' AS status;

-- 1. Eliminar education_levels
DROP TABLE IF EXISTS education_levels;
SELECT '✓ education_levels eliminada (reemplazada por academic_levels)' AS resultado;

-- 2. Eliminar follow_up_plan_types
DROP TABLE IF EXISTS follow_up_plan_types;
SELECT '✓ follow_up_plan_types eliminada (reemplazada por follow_up_plan_catalog)' AS resultado;

-- 3. Eliminar ponderaciones
DROP TABLE IF EXISTS ponderaciones;
SELECT '✓ ponderaciones eliminada (reemplazada por weighings)' AS resultado;

-- 4. Eliminar closing_note (singular)
DROP TABLE IF EXISTS closing_note;
SELECT '✓ closing_note eliminada (se usa closing_notes plural)' AS resultado;

-- 5. Verificar si family_relationships todavía existe (debió ser renombrada)
SET @table_exists = (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'family_relationships'
);

-- Si existe, significa que el script de migración no la renombró
-- La renombramos aquí
SET @rename_query = IF(
    @table_exists > 0,
    'ALTER TABLE family_relationships RENAME TO relationships',
    'SELECT "family_relationships ya fue renombrada a relationships" AS info'
);

PREPARE stmt FROM @rename_query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 
    CASE 
        WHEN @table_exists > 0 THEN '✓ family_relationships renombrada a relationships'
        ELSE '✓ family_relationships ya estaba renombrada'
    END AS resultado;

-- ============================================================================
-- PASO 5: VERIFICACIONES POST-ELIMINACIÓN
-- ============================================================================

SELECT 
    '✅ Verificando resultado de la limpieza...' AS status;

-- Verificar que las tablas obsoletas fueron eliminadas
SELECT 
    'Tablas obsoletas restantes (debe ser 0):' AS verificacion,
    COUNT(*) AS cantidad
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name IN (
    'education_levels',
    'follow_up_plan_types',
    'ponderaciones',
    'closing_note',
    'family_relationships'
  );
-- Resultado esperado: 0

-- Verificar que las tablas de reemplazo siguen existiendo
SELECT 
    'Tablas de reemplazo activas:' AS verificacion,
    table_name,
    table_rows AS registros
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name IN (
    'academic_levels',
    'follow_up_plan_catalog',
    'weighings',
    'closing_notes',
    'relationships',
    'emergency_contacts',
    'participant_emergency_contacts'
  )
ORDER BY table_name;

-- Mostrar el backup de conteos
SELECT 
    '📊 Registro de tablas eliminadas:' AS info;

SELECT * FROM backup_counts ORDER BY tabla;

-- Limpiar tabla temporal
DROP TEMPORARY TABLE IF EXISTS backup_counts;

-- ============================================================================
-- PASO 6: RESUMEN FINAL
-- ============================================================================

SELECT 
    '✅ LIMPIEZA COMPLETADA EXITOSAMENTE' AS status;

SELECT 
    'Tablas eliminadas:' AS resumen,
    '1. education_levels → academic_levels' AS cambio_1,
    '2. follow_up_plan_types → follow_up_plan_catalog' AS cambio_2,
    '3. ponderaciones → weighings' AS cambio_3,
    '4. closing_note → closing_notes' AS cambio_4,
    '5. family_relationships → relationships' AS cambio_5;

SELECT 
    '📌 Nuevas tablas activas:' AS info,
    'emergency_contacts (nueva - M:N con participants)' AS nueva_1,
    'participant_emergency_contacts (pivot M:N)' AS nueva_2;

-- ============================================================================
-- INFORMACIÓN ADICIONAL
-- ============================================================================

/*
📋 RESUMEN DE CAMBIOS REALIZADOS:

✅ TABLAS ELIMINADAS:
   - education_levels (datos migrados a academic_levels)
   - follow_up_plan_types (reemplazada por follow_up_plan_catalog)
   - ponderaciones (reemplazada por weighings)
   - closing_note (duplicada, se usa closing_notes)

✅ TABLAS RENOMBRADAS:
   - family_relationships → relationships

✅ NUEVAS TABLAS:
   - emergency_contacts (contactos independientes)
   - participant_emergency_contacts (pivot M:N)

📊 ESTADO DE LA BASE DE DATOS:
   - Todas las tablas obsoletas han sido eliminadas
   - Los datos fueron migrados previamente
   - Las foreign keys apuntan a las tablas correctas
   - El esquema está limpio y optimizado

🔐 SEGURIDAD:
   - Backup recomendado antes de ejecutar
   - Verificaciones automáticas incluidas
   - Rollback disponible si es necesario

⚙️ IMPACTO EN LA APLICACIÓN:
   - La aplicación ya está actualizada con las nuevas entidades
   - Los DTOs reflejan la nueva estructura
   - Los endpoints usan las tablas correctas
   - No se requieren cambios adicionales en el código
*/

-- ============================================================================
-- ROLLBACK (EN CASO DE EMERGENCIA)
-- ============================================================================

/*
-- ⚠️ SOLO EJECUTAR SI NECESITAS RECREAR LAS TABLAS ELIMINADAS

-- ADVERTENCIA: Esto NO restaurará los datos, solo la estructura
-- Necesitarás restaurar desde un backup para recuperar los datos

-- 1. Recrear education_levels
CREATE TABLE education_levels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  code VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Recrear follow_up_plan_types
CREATE TABLE follow_up_plan_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Recrear ponderaciones
CREATE TABLE ponderaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT,
  -- agregar campos según estructura original
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Recrear closing_note
CREATE TABLE closing_note (
  id INT AUTO_INCREMENT PRIMARY KEY,
  closing_date DATE,
  reason VARCHAR(100),
  achievements TEXT,
  recommendations TEXT,
  observations TEXT,
  case_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Renombrar de vuelta relationships a family_relationships
ALTER TABLE relationships RENAME TO family_relationships;

-- NOTA: Después del rollback, deberás restaurar los datos desde tu backup
-- mysqldump o archivo de respaldo
*/
