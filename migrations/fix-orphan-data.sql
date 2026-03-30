-- ============================================================================
-- SCRIPT: Verificar y limpiar datos huérfanos antes de crear FKs
-- Fecha: 18 Diciembre 2025
-- ============================================================================

-- 1. VERIFICAR DATOS HUÉRFANOS EN bio_psychosocial_history
-- ============================================================================

SELECT 'Verificando datos huérfanos en bio_psychosocial_history...' AS status;

SELECT 
    bph.id,
    bph.case_id,
    'NO EXISTE EN CASES' AS problema
FROM bio_psychosocial_history bph
LEFT JOIN cases c ON bph.case_id = c.id
WHERE c.id IS NULL;

-- Contar cuántos registros huérfanos hay
SELECT 
    COUNT(*) AS registros_huerfanos,
    'bio_psychosocial_history' AS tabla
FROM bio_psychosocial_history bph
LEFT JOIN cases c ON bph.case_id = c.id
WHERE c.id IS NULL;

-- 2. VERIFICAR DATOS HUÉRFANOS EN family_members
-- ============================================================================

SELECT 'Verificando datos huérfanos en family_members...' AS status;

SELECT 
    fm.id,
    fm.case_id,
    'NO EXISTE EN CASES' AS problema
FROM family_members fm
LEFT JOIN cases c ON fm.case_id = c.id
WHERE c.id IS NULL;

-- Contar cuántos registros huérfanos hay
SELECT 
    COUNT(*) AS registros_huerfanos,
    'family_members' AS tabla
FROM family_members fm
LEFT JOIN cases c ON fm.case_id = c.id
WHERE c.id IS NULL;

-- 3. VERIFICAR VALORES NULL
-- ============================================================================

SELECT 'Verificando valores NULL...' AS status;

SELECT 
    COUNT(*) AS registros_con_null,
    'bio_psychosocial_history' AS tabla
FROM bio_psychosocial_history
WHERE case_id IS NULL;

SELECT 
    COUNT(*) AS registros_con_null,
    'family_members' AS tabla
FROM family_members
WHERE case_id IS NULL;

-- ============================================================================
-- SOLUCIÓN 1: LIMPIAR TODOS LOS DATOS (Opción más simple)
-- ============================================================================

-- ADVERTENCIA: Esto eliminará TODOS los datos de estas tablas
-- Descomenta las siguientes líneas si quieres ejecutarlo:

-- TRUNCATE TABLE bio_psychosocial_history;
-- TRUNCATE TABLE family_members;
-- SELECT '✓ Tablas limpiadas completamente' AS resultado;

-- ============================================================================
-- SOLUCIÓN 2: ELIMINAR SOLO REGISTROS HUÉRFANOS (Preserva datos válidos)
-- ============================================================================

-- Descomenta las siguientes líneas si quieres ejecutarlo:

-- Eliminar registros huérfanos de bio_psychosocial_history
-- DELETE bph 
-- FROM bio_psychosocial_history bph
-- LEFT JOIN cases c ON bph.case_id = c.id
-- WHERE c.id IS NULL;

-- Eliminar registros huérfanos de family_members
-- DELETE fm 
-- FROM family_members fm
-- LEFT JOIN cases c ON fm.case_id = c.id
-- WHERE c.id IS NULL;

-- SELECT '✓ Registros huérfanos eliminados' AS resultado;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

SELECT 'Conteo final de registros...' AS status;

SELECT 
    (SELECT COUNT(*) FROM bio_psychosocial_history) AS bio_psychosocial_history_total,
    (SELECT COUNT(*) FROM family_members) AS family_members_total,
    (SELECT COUNT(*) FROM cases) AS cases_total;
