-- ============================================================================
-- MIGRATION: Cambiar familyMembers y bioPsychosocialHistory para pertenecer a Case
-- Version: v2.1.0
-- Fecha: 18 Diciembre 2025
-- Descripción: Cambia las relaciones de family_members y bio_psychosocial_history
--              desde participant_id a case_id
-- ============================================================================

-- ADVERTENCIA: Esta migración cambiará la estructura de datos.
-- Cada caso ahora tendrá su propia información familiar y biopsicosocial.
-- Los datos existentes vinculados a participantes se perderán a menos que
-- se realice una migración de datos específica antes de ejecutar este script.

-- ============================================================================
-- PASO 1: Verificar que existan las tablas necesarias
-- ============================================================================

SELECT 'Verificando existencia de tablas...' AS status;

SELECT 
    CASE 
        WHEN COUNT(*) = 3 THEN '✓ Todas las tablas existen'
        ELSE '✗ ERROR: Faltan tablas necesarias'
    END AS verification
FROM information_schema.tables 
WHERE table_schema = DATABASE()
  AND table_name IN ('family_members', 'bio_psychosocial_history', 'cases');

-- ============================================================================
-- PASO 2: Eliminar foreign key existente de family_members.participant_id
-- ============================================================================

-- Detectar el nombre de la FK dinámicamente
SET @fk_name_family = (
    SELECT CONSTRAINT_NAME 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'family_members' 
      AND COLUMN_NAME = 'participant_id'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    LIMIT 1
);

-- Construir y ejecutar DROP FK
SET @drop_fk_family = IF(
    @fk_name_family IS NOT NULL,
    CONCAT('ALTER TABLE family_members DROP FOREIGN KEY ', @fk_name_family),
    'SELECT "No FK encontrada en family_members.participant_id" AS info'
);

PREPARE stmt_drop_fk_family FROM @drop_fk_family;
EXECUTE stmt_drop_fk_family;
DEALLOCATE PREPARE stmt_drop_fk_family;

SELECT 'Foreign key eliminada de family_members' AS status;

-- ============================================================================
-- PASO 3: Eliminar foreign key existente de bio_psychosocial_history.participant_id
-- ============================================================================

-- Detectar el nombre de la FK dinámicamente
SET @fk_name_bio = (
    SELECT CONSTRAINT_NAME 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'bio_psychosocial_history' 
      AND COLUMN_NAME = 'participant_id'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    LIMIT 1
);

-- Construir y ejecutar DROP FK
SET @drop_fk_bio = IF(
    @fk_name_bio IS NOT NULL,
    CONCAT('ALTER TABLE bio_psychosocial_history DROP FOREIGN KEY ', @fk_name_bio),
    'SELECT "No FK encontrada en bio_psychosocial_history.participant_id" AS info'
);

PREPARE stmt_drop_fk_bio FROM @drop_fk_bio;
EXECUTE stmt_drop_fk_bio;
DEALLOCATE PREPARE stmt_drop_fk_bio;

SELECT 'Foreign key eliminada de bio_psychosocial_history' AS status;

-- ============================================================================
-- PASO 4: Renombrar columnas y eliminar datos huérfanos
-- ============================================================================

-- ADVERTENCIA: Esta operación eliminará los datos existentes
-- Si necesitas migrar los datos, ejecuta un script de migración de datos ANTES de este paso

-- Limpiar datos en family_members (se perderán los datos vinculados a participants)
TRUNCATE TABLE family_members;

-- Renombrar columna en family_members
ALTER TABLE family_members 
CHANGE COLUMN participant_id case_id INT UNSIGNED NOT NULL;

SELECT 'Columna renombrada en family_members: participant_id → case_id' AS status;

-- Limpiar datos en bio_psychosocial_history
TRUNCATE TABLE bio_psychosocial_history;

-- Renombrar columna en bio_psychosocial_history
ALTER TABLE bio_psychosocial_history 
CHANGE COLUMN participant_id case_id INT UNSIGNED NOT NULL UNIQUE;

SELECT 'Columna renombrada en bio_psychosocial_history: participant_id → case_id' AS status;

-- ============================================================================
-- PASO 5: Crear nuevas foreign keys apuntando a cases
-- ============================================================================

-- FK en family_members
ALTER TABLE family_members 
ADD CONSTRAINT fk_family_members_case_id 
FOREIGN KEY (case_id) 
REFERENCES cases(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

SELECT 'Foreign key creada: family_members.case_id → cases.id' AS status;

-- FK en bio_psychosocial_history
ALTER TABLE bio_psychosocial_history 
ADD CONSTRAINT fk_bio_psychosocial_history_case_id 
FOREIGN KEY (case_id) 
REFERENCES cases(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

SELECT 'Foreign key creada: bio_psychosocial_history.case_id → cases.id' AS status;

-- ============================================================================
-- PASO 6: Crear índices para mejorar performance
-- ============================================================================

-- Verificar y crear índice en family_members.case_id si no existe
SET @idx_family_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'family_members'
      AND INDEX_NAME = 'idx_family_members_case_id'
);

SET @create_idx_family = IF(
    @idx_family_exists = 0,
    'CREATE INDEX idx_family_members_case_id ON family_members(case_id)',
    'SELECT "Índice idx_family_members_case_id ya existe" AS info'
);

PREPARE stmt_idx_family FROM @create_idx_family;
EXECUTE stmt_idx_family;
DEALLOCATE PREPARE stmt_idx_family;

-- Verificar y crear índice en bio_psychosocial_history.case_id si no existe
SET @idx_bio_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'bio_psychosocial_history'
      AND INDEX_NAME = 'idx_bio_psychosocial_case_id'
);

SET @create_idx_bio = IF(
    @idx_bio_exists = 0,
    'CREATE INDEX idx_bio_psychosocial_case_id ON bio_psychosocial_history(case_id)',
    'SELECT "Índice idx_bio_psychosocial_case_id ya existe" AS info'
);

PREPARE stmt_idx_bio FROM @create_idx_bio;
EXECUTE stmt_idx_bio;
DEALLOCATE PREPARE stmt_idx_bio;

SELECT 'Índices creados para mejorar performance' AS status;

-- ============================================================================
-- PASO 7: Verificaciones finales
-- ============================================================================

SELECT '=== VERIFICACIÓN FINAL ===' AS title;

-- Verificar estructura de family_members
SELECT 
    'family_members' AS tabla,
    COLUMN_NAME AS columna,
    DATA_TYPE AS tipo,
    IS_NULLABLE AS nullable
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'family_members'
  AND COLUMN_NAME = 'case_id';

-- Verificar estructura de bio_psychosocial_history
SELECT 
    'bio_psychosocial_history' AS tabla,
    COLUMN_NAME AS columna,
    DATA_TYPE AS tipo,
    IS_NULLABLE AS nullable
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'bio_psychosocial_history'
  AND COLUMN_NAME = 'case_id';

-- Verificar foreign keys creadas
SELECT 
    TABLE_NAME AS tabla,
    CONSTRAINT_NAME AS fk_nombre,
    COLUMN_NAME AS columna,
    REFERENCED_TABLE_NAME AS tabla_referenciada,
    REFERENCED_COLUMN_NAME AS columna_referenciada
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('family_members', 'bio_psychosocial_history')
  AND COLUMN_NAME = 'case_id'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Contar registros existentes
SELECT 
    (SELECT COUNT(*) FROM family_members) AS family_members_count,
    (SELECT COUNT(*) FROM bio_psychosocial_history) AS bio_psychosocial_history_count;

SELECT '✓ Migración completada exitosamente' AS resultado;

-- ============================================================================
-- NOTAS IMPORTANTES PARA PRODUCCIÓN
-- ============================================================================

/*
ADVERTENCIAS:
1. Esta migración TRUNCA las tablas family_members y bio_psychosocial_history
2. Todos los datos existentes vinculados a participants se perderán
3. Si necesitas preservar los datos, debes crear un script de migración de datos ANTES

MIGRACIÓN DE DATOS (Si es necesario):
- Antes de ejecutar este script, ejecuta un script que vincule los datos existentes
  de family_members y bio_psychosocial_history al caso más reciente de cada participante
- Ejemplo:
  
  UPDATE family_members fm
  JOIN (
      SELECT participant_id, MAX(id) as latest_case_id
      FROM cases
      GROUP BY participant_id
  ) c ON fm.participant_id = c.participant_id
  SET fm.case_id = c.latest_case_id;

ROLLBACK (Si algo sale mal):
1. Ejecutar TRUNCATE en ambas tablas
2. Renombrar case_id de vuelta a participant_id
3. Eliminar FKs a cases
4. Crear FKs a participants
5. Restaurar backup de datos

TESTING POST-MIGRACIÓN:
1. Crear un nuevo caso con familyMembers y bioPsychosocialHistory
2. Verificar que los datos se guardan correctamente con case_id
3. Intentar eliminar un caso y verificar cascada (ON DELETE CASCADE)
4. Verificar consultas de casos con relaciones eager
*/
