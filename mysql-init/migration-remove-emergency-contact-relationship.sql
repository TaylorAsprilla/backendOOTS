-- ============================================================================
-- MIGRATION: Eliminar columna emergency_contact_relationship_id de participants
-- ============================================================================
-- Descripción: Este script elimina la columna emergency_contact_relationship_id
--              de la tabla participants. Esta columna almacenaba la relación
--              del contacto de emergencia con el participante mediante una
--              foreign key a la tabla family_relationships.
--
-- Fecha: 2025-10-31
-- Autor: Sistema de migración
-- ============================================================================

-- ============================================================================
-- PASO 1: VERIFICACIONES PRE-MIGRACIÓN
-- ============================================================================

SELECT 
    '🔍 Verificando estructura de la tabla participants...' AS status;

-- Verificar que la columna existe
SELECT 
    column_name,
    column_type,
    is_nullable,
    column_key
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND table_name = 'participants'
  AND column_name = 'emergency_contact_relationship_id';
-- Resultado esperado: 1 fila

-- Contar registros con valores en esta columna
SELECT 
    'Registros con emergency_contact_relationship_id' AS verificacion,
    COUNT(*) AS total,
    COUNT(emergency_contact_relationship_id) AS con_valor,
    COUNT(*) - COUNT(emergency_contact_relationship_id) AS sin_valor
FROM participants;

-- Ver distribución de valores
SELECT 
    'Distribución de valores' AS info,
    emergency_contact_relationship_id,
    COUNT(*) AS cantidad
FROM participants
WHERE emergency_contact_relationship_id IS NOT NULL
GROUP BY emergency_contact_relationship_id
ORDER BY cantidad DESC;

-- ============================================================================
-- PASO 2: VERIFICAR Y ELIMINAR FOREIGN KEY
-- ============================================================================

-- Buscar el nombre de la foreign key constraint
SELECT 
    '🔑 Buscando foreign key constraint...' AS status;

SELECT 
    constraint_name,
    table_name,
    column_name,
    referenced_table_name,
    referenced_column_name
FROM information_schema.key_column_usage
WHERE table_schema = DATABASE()
  AND table_name = 'participants'
  AND column_name = 'emergency_contact_relationship_id';

-- Eliminar la foreign key si existe
-- Nota: El nombre puede variar, ajusta según el resultado anterior
SET @fk_name = (
    SELECT constraint_name
    FROM information_schema.key_column_usage
    WHERE table_schema = DATABASE()
      AND table_name = 'participants'
      AND column_name = 'emergency_contact_relationship_id'
      AND constraint_name != 'PRIMARY'
    LIMIT 1
);

SET @drop_fk_query = IF(
    @fk_name IS NOT NULL,
    CONCAT('ALTER TABLE participants DROP FOREIGN KEY ', @fk_name),
    'SELECT "No hay foreign key para eliminar" AS info'
);

PREPARE stmt FROM @drop_fk_query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 
    '✅ Foreign key eliminada (si existía)' AS status;

-- ============================================================================
-- PASO 3: ELIMINAR COLUMNA
-- ============================================================================

SELECT 
    '🗑️ Eliminando columna emergency_contact_relationship_id...' AS status;

ALTER TABLE participants 
DROP COLUMN emergency_contact_relationship_id;

SELECT 
    '✅ Columna emergency_contact_relationship_id eliminada' AS status;

-- ============================================================================
-- PASO 4: VERIFICACIONES POST-MIGRACIÓN
-- ============================================================================

SELECT 
    '✅ Verificando eliminación...' AS status;

-- Verificar que la columna fue eliminada
SELECT 
    COUNT(*) AS columna_existe
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND table_name = 'participants'
  AND column_name = 'emergency_contact_relationship_id';
-- Resultado esperado: 0

-- Mostrar estructura actual de campos de contacto de emergencia
SELECT 
    '📋 Campos de contacto de emergencia restantes:' AS info;

SELECT 
    column_name,
    column_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND table_name = 'participants'
  AND column_name LIKE 'emergency_contact_%'
ORDER BY ordinal_position;

-- Contar participantes activos
SELECT 
    '👥 Total de participantes activos' AS info,
    COUNT(*) AS total
FROM participants
WHERE deleted_at IS NULL;

-- ============================================================================
-- INFORMACIÓN FINAL
-- ============================================================================

SELECT 
    '✅ MIGRACIÓN COMPLETADA' AS status,
    'Columna emergency_contact_relationship_id eliminada de participants' AS accion,
    'Los contactos de emergencia ya no tienen tipo de relación asignado' AS resultado;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================

/*
📌 CAMBIOS REALIZADOS:
   - Eliminada foreign key hacia family_relationships
   - Eliminada columna emergency_contact_relationship_id de tabla participants

📌 DATOS PRESERVADOS:
   - Todos los demás campos de contacto de emergencia permanecen intactos:
     * emergency_contact_name
     * emergency_contact_phone
     * emergency_contact_email
     * emergency_contact_address
     * emergency_contact_city

📌 TABLAS NO AFECTADAS:
   - family_relationships: Permanece intacta (se usa para family_members)
   - family_members: No se ve afectada
   - Resto del esquema permanece sin cambios

📌 IMPACTO EN LA APLICACIÓN:
   - La entidad Participant ya no tiene la relación emergencyContactRelationship
   - El DTO CreateParticipantDto ya no requiere emergencyContactRelationshipId
   - Los endpoints de participants ya no aceptan ni retornan este campo
*/

-- ============================================================================
-- ROLLBACK (EN CASO DE EMERGENCIA)
-- ============================================================================

/*
-- ⚠️ SOLO EJECUTAR SI NECESITAS RESTAURAR LA COLUMNA

-- Paso 1: Recrear la columna
ALTER TABLE participants 
ADD COLUMN emergency_contact_relationship_id INT UNSIGNED NULL
AFTER emergency_contact_city;

-- Paso 2: Recrear la foreign key
ALTER TABLE participants
ADD CONSTRAINT fk_participants_emergency_relationship
FOREIGN KEY (emergency_contact_relationship_id)
REFERENCES family_relationships(id)
ON DELETE SET NULL;

-- Paso 3: (Opcional) Si tienes un backup, restaura los valores aquí
-- UPDATE participants SET emergency_contact_relationship_id = [valor_anterior] WHERE id = [id];

SELECT '⚠️ Columna restaurada. Recuerda actualizar también el código de la aplicación' AS warning;
*/
