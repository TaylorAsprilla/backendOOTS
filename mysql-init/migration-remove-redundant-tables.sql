-- ============================================================================
-- MIGRATION: Eliminar tablas redundantes follow_up_plan_types y ponderaciones
-- ============================================================================
-- Descripción: Este script elimina dos tablas que ya no se utilizan:
--              1. follow_up_plan_types (reemplazada por follow_up_plan_catalog)
--              2. ponderaciones (reemplazada por weighings)
--
-- Fecha: 2025-10-31
-- Autor: Sistema de migración
-- ============================================================================

-- ============================================================================
-- PASO 1: VERIFICACIONES PRE-MIGRACIÓN
-- ============================================================================

-- Verificar que las tablas existen
SELECT 
    'Verificando tablas a eliminar...' AS status;

SELECT 
    table_name,
    COUNT(*) AS total_records
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name IN ('follow_up_plan_types', 'ponderaciones')
GROUP BY table_name;

-- Verificar registros en las tablas
SELECT 'Registros en follow_up_plan_types' AS tabla, COUNT(*) AS total
FROM follow_up_plan_types
UNION ALL
SELECT 'Registros en ponderaciones' AS tabla, COUNT(*) AS total
FROM ponderaciones;

-- Verificar que las tablas de reemplazo existen
SELECT 
    'Verificando tablas de reemplazo...' AS status;

SELECT 
    'follow_up_plan_catalog' AS tabla_reemplazo, COUNT(*) AS total_records
FROM follow_up_plan_catalog
UNION ALL
SELECT 
    'weighings' AS tabla_reemplazo, COUNT(*) AS total_records
FROM weighings;

-- ============================================================================
-- PASO 2: VERIFICAR RELACIONES DE FOREIGN KEYS
-- ============================================================================

-- Verificar si hay foreign keys que apunten a follow_up_plan_types
SELECT 
    'Foreign keys hacia follow_up_plan_types' AS verificacion,
    table_name,
    constraint_name,
    column_name,
    referenced_table_name,
    referenced_column_name
FROM information_schema.key_column_usage
WHERE referenced_table_schema = DATABASE()
  AND referenced_table_name = 'follow_up_plan_types';

-- Verificar si hay foreign keys que apunten a ponderaciones
SELECT 
    'Foreign keys hacia ponderaciones' AS verificacion,
    table_name,
    constraint_name,
    column_name,
    referenced_table_name,
    referenced_column_name
FROM information_schema.key_column_usage
WHERE referenced_table_schema = DATABASE()
  AND referenced_table_name = 'ponderaciones';

-- ============================================================================
-- PASO 3: ELIMINAR TABLA follow_up_plan_types
-- ============================================================================

-- Eliminar la tabla follow_up_plan_types
DROP TABLE IF EXISTS follow_up_plan_types;

SELECT 
    '✅ Tabla follow_up_plan_types eliminada' AS status;

-- ============================================================================
-- PASO 4: ELIMINAR TABLA ponderaciones
-- ============================================================================

-- Eliminar la tabla ponderaciones
DROP TABLE IF EXISTS ponderaciones;

SELECT 
    '✅ Tabla ponderaciones eliminada' AS status;

-- ============================================================================
-- PASO 5: VERIFICACIONES POST-MIGRACIÓN
-- ============================================================================

-- Verificar que las tablas fueron eliminadas
SELECT 
    'Verificando eliminación...' AS status,
    COUNT(*) AS tablas_restantes
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name IN ('follow_up_plan_types', 'ponderaciones');
-- Resultado esperado: 0

-- Verificar que las tablas de reemplazo siguen existiendo
SELECT 
    'Verificando tablas de reemplazo...' AS status,
    table_name,
    COUNT(*) AS existe
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name IN ('follow_up_plan_catalog', 'weighings')
GROUP BY table_name;
-- Resultado esperado: 2 filas (ambas tablas existen)

-- ============================================================================
-- PASO 6: INFORMACIÓN SOBRE DATOS MIGRADOS (REFERENCIA)
-- ============================================================================

SELECT 
    '📊 RESUMEN DE MIGRACIÓN' AS info;

SELECT 
    'follow_up_plan_types → Eliminada' AS tabla_antigua,
    'follow_up_plan_catalog' AS tabla_nueva,
    'Catálogo de planes de seguimiento predefinidos' AS descripcion
UNION ALL
SELECT 
    'ponderaciones → Eliminada' AS tabla_antigua,
    'weighings' AS tabla_nueva,
    'Ponderación/análisis de casos con mejor nomenclatura' AS descripcion;

-- ============================================================================
-- ROLLBACK (EN CASO DE EMERGENCIA)
-- ============================================================================

/*
-- ⚠️ SOLO EJECUTAR SI NECESITAS REVERTIR LOS CAMBIOS

-- 1. Recrear tabla follow_up_plan_types
CREATE TABLE follow_up_plan_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  requires_details BOOLEAN DEFAULT FALSE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar datos de seed si es necesario
INSERT INTO follow_up_plan_types (name, code, requires_details, description) VALUES
  ('Se culminó el proceso de ayuda', 'CULM', FALSE, 'El proceso de orientación ha finalizado exitosamente'),
  ('Se coordinó servicios en (mencionar agencia)', 'COORD', TRUE, 'Se estableció coordinación con agencia externa'),
  ('Se hará un referido (mencionar los referidos y justificar)', 'REF', TRUE, 'Se realizará referencia a especialista o institución'),
  ('Se coordinó cita para iniciar proceso de orientación', 'CITA', FALSE, 'Se programó nueva cita para continuar orientación'),
  ('Otros', 'OTR', TRUE, 'Otro tipo de plan de seguimiento');

-- 2. Recrear tabla ponderaciones
CREATE TABLE ponderaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  consultation_motive_analysis TEXT,
  identified_situation_analysis TEXT,
  favorable_conditions TEXT,
  unfavorable_conditions TEXT,
  theoretical_approach TEXT,
  case_id INT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- NOTA: Si necesitas migrar datos de weighings de vuelta a ponderaciones:
-- INSERT INTO ponderaciones (
--   consultation_motive_analysis,
--   identified_situation_analysis,
--   favorable_conditions,
--   unfavorable_conditions,
--   theoretical_approach,
--   case_id
-- )
-- SELECT 
--   reasonConsultation,
--   identifiedSituation,
--   favorableConditions,
--   conditionsNotFavorable,
--   helpProcess,
--   caseId
-- FROM weighings;
*/

-- ============================================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================================

SELECT 
    '✅ MIGRACIÓN COMPLETADA' AS status,
    'Tablas follow_up_plan_types y ponderaciones eliminadas exitosamente' AS message,
    'Usa follow_up_plan_catalog y weighings en su lugar' AS recomendacion;
