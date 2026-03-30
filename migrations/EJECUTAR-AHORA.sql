-- ============================================================================
-- LIMPIEZA RÁPIDA: Eliminar datos huérfanos
-- Ejecuta esto en tu base de datos MySQL
-- ============================================================================

USE oots_db;

-- Deshabilitar temporalmente las verificaciones de FK
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar completamente las tablas
TRUNCATE TABLE bio_psychosocial_history;
TRUNCATE TABLE family_members;

-- Reactivar verificaciones de FK
SET FOREIGN_KEY_CHECKS = 1;

-- Verificar que estén vacías
SELECT 
    (SELECT COUNT(*) FROM bio_psychosocial_history) AS bio_count,
    (SELECT COUNT(*) FROM family_members) AS family_count;

-- Resultado esperado: ambos en 0
