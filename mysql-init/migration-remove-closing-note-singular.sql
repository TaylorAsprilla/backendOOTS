-- ============================================================================
-- MIGRATION: Eliminar tabla obsoleta closing_note (singular)
-- ============================================================================
-- Descripción: Este script elimina la tabla closing_note (singular) que es
--              redundante. La tabla closing_notes (plural) es la que está
--              actualmente en uso por la entidad ClosingNote.
--
-- Fecha: 2025-10-31
-- Autor: Sistema de migración
-- ============================================================================

-- ============================================================================
-- PASO 1: VERIFICACIONES PRE-MIGRACIÓN
-- ============================================================================

-- Verificar que ambas tablas existen
SELECT 
    'Verificando tablas closing_note...' AS status;

SELECT 
    table_name,
    table_rows
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name IN ('closing_note', 'closing_notes')
ORDER BY table_name;

-- Verificar estructura de ambas tablas
SELECT 
    'Estructura de closing_note (singular - obsoleta)' AS info;
    
DESCRIBE closing_note;

SELECT 
    'Estructura de closing_notes (plural - en uso)' AS info;
    
DESCRIBE closing_notes;

-- Contar registros en ambas tablas
SELECT 
    'closing_note (singular)' AS tabla, 
    COUNT(*) AS total_registros
FROM closing_note
UNION ALL
SELECT 
    'closing_notes (plural)' AS tabla, 
    COUNT(*) AS total_registros
FROM closing_notes;

-- ============================================================================
-- PASO 2: VERIFICAR FOREIGN KEYS
-- ============================================================================

-- Verificar si hay foreign keys que apunten a closing_note (singular)
SELECT 
    'Foreign keys hacia closing_note (singular)' AS verificacion,
    table_name,
    constraint_name,
    column_name,
    referenced_table_name
FROM information_schema.key_column_usage
WHERE referenced_table_schema = DATABASE()
  AND referenced_table_name = 'closing_note';

-- Verificar foreign keys desde closing_note (singular)
SELECT 
    'Foreign keys desde closing_note (singular)' AS verificacion,
    table_name,
    constraint_name,
    column_name,
    referenced_table_name
FROM information_schema.key_column_usage
WHERE table_schema = DATABASE()
  AND table_name = 'closing_note'
  AND referenced_table_name IS NOT NULL;

-- ============================================================================
-- PASO 3: BACKUP DE DATOS (OPCIONAL)
-- ============================================================================

-- Si hay datos en closing_note que quieres conservar, descomenta esto:
/*
INSERT INTO closing_notes (
    closing_date,
    reason,
    achievements,
    recommendations,
    observations,
    case_id,
    created_at,
    updated_at
)
SELECT 
    closing_date,
    reason,
    achievements,
    recommendations,
    observations,
    case_id,
    created_at,
    updated_at
FROM closing_note
WHERE id NOT IN (SELECT id FROM closing_notes);
*/

-- ============================================================================
-- PASO 4: ELIMINAR TABLA closing_note (singular)
-- ============================================================================

-- Eliminar la tabla obsoleta
DROP TABLE IF EXISTS closing_note;

SELECT 
    '✅ Tabla closing_note (singular) eliminada' AS status;

-- ============================================================================
-- PASO 5: VERIFICACIONES POST-MIGRACIÓN
-- ============================================================================

-- Verificar que la tabla fue eliminada
SELECT 
    'Verificando eliminación...' AS status,
    COUNT(*) AS tablas_closing_note
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name = 'closing_note';
-- Resultado esperado: 0

-- Verificar que closing_notes (plural) sigue existiendo
SELECT 
    'Verificando closing_notes (en uso)...' AS status,
    COUNT(*) AS tabla_existe
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name = 'closing_notes';
-- Resultado esperado: 1

-- Mostrar estructura final de closing_notes
SELECT 
    '📋 Tabla activa: closing_notes' AS info;
    
DESCRIBE closing_notes;

-- Contar registros finales
SELECT 
    'closing_notes (activa)' AS tabla,
    COUNT(*) AS total_registros
FROM closing_notes;

-- ============================================================================
-- INFORMACIÓN FINAL
-- ============================================================================

SELECT 
    '✅ MIGRACIÓN COMPLETADA' AS status,
    'Tabla obsoleta closing_note (singular) eliminada' AS accion,
    'Tabla closing_notes (plural) sigue activa y en uso' AS resultado;

-- ============================================================================
-- ROLLBACK (EN CASO DE EMERGENCIA)
-- ============================================================================

/*
-- ⚠️ SOLO EJECUTAR SI NECESITAS RECREAR LA TABLA

CREATE TABLE closing_note (
  id INT AUTO_INCREMENT PRIMARY KEY,
  closing_date DATE,
  reason VARCHAR(100),
  achievements TEXT,
  recommendations TEXT,
  observations TEXT,
  case_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- Si tenías un backup, restaura los datos aquí
*/
