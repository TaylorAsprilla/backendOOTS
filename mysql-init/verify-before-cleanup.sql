-- ============================================================================
-- VERIFICACIÓN: Comprobar migración de datos antes de eliminar tablas
-- ============================================================================
-- Descripción: Este script verifica que todos los datos de las tablas obsoletas
--              fueron migrados correctamente a las nuevas tablas.
--              Ejecuta esto ANTES de cleanup-obsolete-tables.sql
--
-- Fecha: 2025-10-31
-- Autor: Sistema de migración
-- ============================================================================

SELECT 
    '🔍 VERIFICACIÓN DE MIGRACIÓN DE DATOS' AS titulo,
    '============================================' AS separador;

-- ============================================================================
-- 1. VERIFICAR: education_levels → academic_levels
-- ============================================================================

SELECT 
    '📚 1. VERIFICANDO: education_levels → academic_levels' AS seccion;

-- Verificar si education_levels existe
SET @education_levels_exists = (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'education_levels'
);

SELECT 
    CASE 
        WHEN @education_levels_exists > 0 THEN '⚠️ education_levels aún existe'
        ELSE '✅ education_levels ya fue eliminada'
    END AS estado_tabla;

-- Si existe, mostrar comparación
SELECT 
    '📊 Comparación de registros:' AS info;

SELECT 
    'education_levels (obsoleta)' AS tabla,
    COALESCE((SELECT COUNT(*) FROM education_levels), 0) AS registros
UNION ALL
SELECT 
    'academic_levels (nueva)' AS tabla,
    COUNT(*) AS registros
FROM academic_levels;

-- Verificar si hay referencias en bio_psychosocial_history
SELECT 
    '🔗 Verificando referencias en bio_psychosocial_history:' AS info;

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN CONCAT('⚠️ Hay ', COUNT(*), ' registros con education_level_id (DEBE SER 0)')
        ELSE '✅ No hay referencias a education_level_id'
    END AS verificacion
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND table_name = 'bio_psychosocial_history'
  AND column_name = 'education_level_id';

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN CONCAT('✅ Hay ', COUNT(*), ' registros con academic_level_id (CORRECTO)')
        ELSE '⚠️ No hay columna academic_level_id'
    END AS verificacion
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND table_name = 'bio_psychosocial_history'
  AND column_name = 'academic_level_id';

-- ============================================================================
-- 2. VERIFICAR: follow_up_plan_types → follow_up_plan_catalog
-- ============================================================================

SELECT 
    '📋 2. VERIFICANDO: follow_up_plan_types → follow_up_plan_catalog' AS seccion;

SET @follow_up_plan_types_exists = (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'follow_up_plan_types'
);

SELECT 
    CASE 
        WHEN @follow_up_plan_types_exists > 0 THEN '⚠️ follow_up_plan_types aún existe'
        ELSE '✅ follow_up_plan_types ya fue eliminada'
    END AS estado_tabla;

SELECT 
    '📊 Registros en follow_up_plan_catalog:' AS info,
    COUNT(*) AS total
FROM follow_up_plan_catalog;

-- Verificar que case_follow_up_plans usa follow_up_plan_catalog
SELECT 
    '🔗 Verificando relación con case_follow_up_plans:' AS info;

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN CONCAT('✅ Hay ', COUNT(*), ' relaciones activas')
        ELSE '⚠️ No hay relaciones (puede ser normal si no hay casos)'
    END AS verificacion,
    (SELECT COUNT(*) FROM case_follow_up_plans) AS total_relaciones
FROM case_follow_up_plans cfp
INNER JOIN follow_up_plan_catalog fpc ON cfp.follow_up_plan_id = fpc.id;

-- ============================================================================
-- 3. VERIFICAR: ponderaciones → weighings
-- ============================================================================

SELECT 
    '⚖️ 3. VERIFICANDO: ponderaciones → weighings' AS seccion;

SET @ponderaciones_exists = (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'ponderaciones'
);

SELECT 
    CASE 
        WHEN @ponderaciones_exists > 0 THEN '⚠️ ponderaciones aún existe'
        ELSE '✅ ponderaciones ya fue eliminada'
    END AS estado_tabla;

-- Comparar conteos
SELECT 
    '📊 Comparación de registros:' AS info;

SELECT 
    'ponderaciones (obsoleta)' AS tabla,
    COALESCE((SELECT COUNT(*) FROM ponderaciones), 0) AS registros
UNION ALL
SELECT 
    'weighings (nueva)' AS tabla,
    COUNT(*) AS registros
FROM weighings;

-- Verificar que cases no tiene foreign key a ponderaciones
SELECT 
    '🔗 Verificando que cases no referencia ponderaciones:' AS info;

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '⚠️ Aún hay foreign key hacia ponderaciones (DEBE ELIMINARSE)'
        ELSE '✅ No hay foreign keys hacia ponderaciones'
    END AS verificacion
FROM information_schema.key_column_usage
WHERE table_schema = DATABASE()
  AND referenced_table_name = 'ponderaciones';

-- ============================================================================
-- 4. VERIFICAR: closing_note (singular) → closing_notes (plural)
-- ============================================================================

SELECT 
    '📝 4. VERIFICANDO: closing_note → closing_notes' AS seccion;

SET @closing_note_exists = (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'closing_note'
);

SELECT 
    CASE 
        WHEN @closing_note_exists > 0 THEN '⚠️ closing_note (singular) aún existe'
        ELSE '✅ closing_note ya fue eliminada'
    END AS estado_tabla;

-- Comparar conteos
SELECT 
    '📊 Comparación de registros:' AS info;

SELECT 
    'closing_note (singular - obsoleta)' AS tabla,
    COALESCE((SELECT COUNT(*) FROM closing_note), 0) AS registros
UNION ALL
SELECT 
    'closing_notes (plural - correcta)' AS tabla,
    COUNT(*) AS registros
FROM closing_notes;

-- ============================================================================
-- 5. VERIFICAR: family_relationships → relationships
-- ============================================================================

SELECT 
    '👨‍👩‍👧‍👦 5. VERIFICANDO: family_relationships → relationships' AS seccion;

SET @family_relationships_exists = (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'family_relationships'
);

SET @relationships_exists = (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'relationships'
);

SELECT 
    CASE 
        WHEN @family_relationships_exists > 0 AND @relationships_exists = 0 
            THEN '⚠️ family_relationships existe pero relationships NO (DEBE RENOMBRARSE)'
        WHEN @family_relationships_exists > 0 AND @relationships_exists > 0 
            THEN '⚠️ AMBAS tablas existen (ELIMINAR family_relationships)'
        WHEN @family_relationships_exists = 0 AND @relationships_exists > 0 
            THEN '✅ Correctamente renombrada a relationships'
        ELSE '❌ ERROR: Ninguna tabla existe'
    END AS estado_renombrado;

-- Comparar conteos si ambas existen
SELECT 
    '📊 Comparación de registros:' AS info;

SELECT 
    'family_relationships (antigua)' AS tabla,
    COALESCE((SELECT COUNT(*) FROM family_relationships), 0) AS registros
UNION ALL
SELECT 
    'relationships (nueva)' AS tabla,
    COALESCE((SELECT COUNT(*) FROM relationships), 0) AS registros;

-- Verificar relaciones activas con relationships
SELECT 
    '🔗 Verificando uso de relationships:' AS info;

SELECT 
    'family_members' AS tabla_referente,
    COUNT(*) AS total_referencias
FROM family_members fm
INNER JOIN relationships r ON fm.family_relationship_id = r.id
UNION ALL
SELECT 
    'participant_emergency_contacts' AS tabla_referente,
    COUNT(*) AS total_referencias
FROM participant_emergency_contacts pec
INNER JOIN relationships r ON pec.relationship_id = r.id;

-- ============================================================================
-- 6. VERIFICAR: Nueva estructura de emergency_contacts
-- ============================================================================

SELECT 
    '🚨 6. VERIFICANDO: Nueva estructura emergency_contacts' AS seccion;

-- Verificar que emergency_contacts existe
SELECT 
    '📊 Tabla emergency_contacts:' AS info,
    COUNT(*) AS total_contactos,
    COUNT(DISTINCT email) AS contactos_unicos_por_email,
    COUNT(DISTINCT phone) AS contactos_unicos_por_telefono
FROM emergency_contacts;

-- Verificar tabla pivot
SELECT 
    '🔗 Tabla pivot participant_emergency_contacts:' AS info,
    COUNT(*) AS total_relaciones,
    COUNT(DISTINCT participant_id) AS participantes_con_contacto,
    COUNT(DISTINCT emergency_contact_id) AS contactos_asignados
FROM participant_emergency_contacts;

-- Verificar que participants NO tiene columnas emergency_contact_*
SELECT 
    '✅ Verificando eliminación de columnas obsoletas en participants:' AS info;

SELECT 
    column_name,
    '⚠️ Esta columna NO debería existir' AS advertencia
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND table_name = 'participants'
  AND column_name LIKE 'emergency_contact_%';

-- Si no hay resultados aquí, significa que las columnas fueron eliminadas correctamente

-- ============================================================================
-- RESUMEN GENERAL DE VERIFICACIÓN
-- ============================================================================

SELECT 
    '📋 RESUMEN DE VERIFICACIÓN' AS titulo,
    '============================================' AS separador;

-- Tabla de resumen
SELECT 
    'Estado de la migración:' AS resumen;

CREATE TEMPORARY TABLE IF NOT EXISTS verification_summary (
    item VARCHAR(100),
    estado VARCHAR(50),
    detalles TEXT
);

-- Insertar resultados
INSERT INTO verification_summary VALUES 
    ('education_levels', 
     CASE WHEN @education_levels_exists > 0 THEN '⚠️ Pendiente eliminar' ELSE '✅ Migrada' END,
     'Reemplazada por academic_levels'),
    ('follow_up_plan_types',
     CASE WHEN @follow_up_plan_types_exists > 0 THEN '⚠️ Pendiente eliminar' ELSE '✅ Migrada' END,
     'Reemplazada por follow_up_plan_catalog'),
    ('ponderaciones',
     CASE WHEN @ponderaciones_exists > 0 THEN '⚠️ Pendiente eliminar' ELSE '✅ Migrada' END,
     'Reemplazada por weighings'),
    ('closing_note',
     CASE WHEN @closing_note_exists > 0 THEN '⚠️ Pendiente eliminar' ELSE '✅ Migrada' END,
     'Reemplazada por closing_notes (plural)'),
    ('family_relationships',
     CASE WHEN @family_relationships_exists > 0 THEN '⚠️ Pendiente renombrar' ELSE '✅ Renombrada' END,
     'Renombrada a relationships');

SELECT * FROM verification_summary ORDER BY estado DESC, item;

-- Verificar si es seguro ejecutar cleanup
SELECT 
    CASE 
        WHEN (@education_levels_exists + @follow_up_plan_types_exists + 
              @ponderaciones_exists + @closing_note_exists + 
              @family_relationships_exists) = 0
            THEN '✅ SEGURO EJECUTAR cleanup-obsolete-tables.sql'
        ELSE '⚠️ ESPERA - Aún hay tablas por migrar/eliminar'
    END AS recomendacion;

-- Mostrar comandos sugeridos
SELECT 
    'Comandos sugeridos:' AS siguiente_paso;

SELECT 
    CASE 
        WHEN (@education_levels_exists + @follow_up_plan_types_exists + 
              @ponderaciones_exists + @closing_note_exists + 
              @family_relationships_exists) = 0
        THEN 'mysql -u root -p oots_db < mysql-init/cleanup-obsolete-tables.sql'
        ELSE 'ESPERA - Ejecuta primero los scripts de migración pendientes'
    END AS comando;

-- Limpiar tabla temporal
DROP TEMPORARY TABLE IF EXISTS verification_summary;

-- ============================================================================
-- INFORMACIÓN FINAL
-- ============================================================================

SELECT 
    '📌 NOTAS IMPORTANTES:' AS info;

SELECT 
    '1. Si todas las verificaciones son ✅, es SEGURO ejecutar cleanup' AS nota_1,
    '2. Si hay ⚠️, ejecuta primero los scripts de migración correspondientes' AS nota_2,
    '3. Siempre haz backup antes de ejecutar cleanup-obsolete-tables.sql' AS nota_3,
    '4. Los datos en las tablas nuevas deben coincidir con las obsoletas' AS nota_4;

SELECT 
    '🔧 Scripts de migración por ejecutar (si aplica):' AS scripts;

SELECT 
    CASE WHEN @education_levels_exists > 0 
         THEN 'mysql -u root -p oots_db < mysql-init/migration-remove-education-levels.sql'
         ELSE 'N/A'
    END AS script_1,
    CASE WHEN @follow_up_plan_types_exists > 0 OR @ponderaciones_exists > 0
         THEN 'mysql -u root -p oots_db < mysql-init/migration-remove-redundant-tables.sql'
         ELSE 'N/A'
    END AS script_2,
    CASE WHEN @closing_note_exists > 0
         THEN 'mysql -u root -p oots_db < mysql-init/migration-remove-closing-note-singular.sql'
         ELSE 'N/A'
    END AS script_3,
    CASE WHEN @family_relationships_exists > 0
         THEN 'mysql -u root -p oots_db < mysql-init/migration-refactor-emergency-contacts.sql'
         ELSE 'N/A'
    END AS script_4;
