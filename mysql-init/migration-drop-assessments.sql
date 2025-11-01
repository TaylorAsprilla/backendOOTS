-- =====================================================
-- MIGRACIÓN: Eliminar tabla assessments
-- Fecha: 2025-10-31
-- Descripción: Elimina la tabla assessments que ya no se utiliza en el sistema
-- =====================================================

-- NOTA: Esta tabla fue reemplazada por la tabla weighings
-- La funcionalidad se movió a una nueva estructura con mejores nombres de campos

-- Verificar si la tabla existe antes de eliminar
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'La tabla assessments existe y será eliminada'
        ELSE 'La tabla assessments no existe'
    END as estado
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'assessments';

-- Verificar si hay datos en la tabla antes de eliminar
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables 
                     WHERE table_schema = DATABASE() 
                     AND table_name = 'assessments')
        THEN (SELECT CONCAT('La tabla assessments tiene ', COUNT(*), ' registros') 
              FROM assessments)
        ELSE 'La tabla assessments no existe'
    END as registros;

-- =====================================================
-- ELIMINAR TABLA
-- =====================================================

-- Eliminar la tabla assessments si existe
DROP TABLE IF EXISTS assessments;

-- Verificar que la tabla fue eliminada
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'La tabla assessments fue eliminada exitosamente'
        ELSE 'ERROR: La tabla assessments aún existe'
    END as resultado
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'assessments';

-- =====================================================
-- NOTA IMPORTANTE
-- =====================================================

-- La funcionalidad de assessments ahora se encuentra en la tabla weighings
-- Si necesitas migrar datos antiguos de assessments a weighings, 
-- ejecuta el siguiente comando ANTES de eliminar la tabla:

/*
INSERT INTO weighings (
    reason_consultation,
    identified_situation,
    favorable_conditions,
    conditions_not_favorable,
    help_process,
    case_id,
    created_at,
    updated_at
)
SELECT 
    consultation_reason as reason_consultation,
    weighting as identified_situation,
    concurrent_factors as favorable_conditions,
    critical_factors as conditions_not_favorable,
    problem_analysis as help_process,
    case_id,
    created_at,
    updated_at
FROM assessments
WHERE case_id IS NOT NULL;
*/

-- =====================================================
-- ROLLBACK (En caso de necesitar revertir)
-- =====================================================

-- Si necesitas restaurar la tabla, tendrás que crearla manualmente
-- o restaurar desde un backup de la base de datos
