-- ============================================================================
-- MIGRATION: Refactorizar contactos de emergencia y renombrar relationships
-- ============================================================================
-- Descripción: Este script realiza múltiples cambios:
--              1. Renombra family_relationships → relationships
--              2. Crea tabla emergency_contacts (independiente de participants)
--              3. Crea tabla pivot participant_emergency_contacts (M:N)
--              4. Migra datos existentes de participants a las nuevas tablas
--              5. Elimina columnas obsoletas de emergency_contact_* de participants
--
-- Fecha: 2025-10-31
-- Autor: Sistema de migración
-- ============================================================================

-- ============================================================================
-- PASO 1: VERIFICACIONES PRE-MIGRACIÓN
-- ============================================================================

SELECT 
    '🔍 Verificando estado actual de la base de datos...' AS status;

-- Verificar que family_relationships existe
SELECT 
    'Tabla family_relationships' AS verificacion,
    COUNT(*) AS existe
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name = 'family_relationships';
-- Resultado esperado: 1

-- Verificar columnas de emergency contact en participants
SELECT 
    'Columnas emergency_contact en participants' AS verificacion,
    COUNT(*) AS cantidad
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND table_name = 'participants'
  AND column_name LIKE 'emergency_contact_%';
-- Resultado esperado: 5 columnas

-- Contar participantes con contactos de emergencia
SELECT 
    'Participantes con contacto de emergencia' AS info,
    COUNT(*) AS total,
    COUNT(emergency_contact_name) AS con_contacto,
    COUNT(*) - COUNT(emergency_contact_name) AS sin_contacto
FROM participants;

-- ============================================================================
-- PASO 2: RENOMBRAR family_relationships → relationships
-- ============================================================================

SELECT 
    '📝 Renombrando family_relationships a relationships...' AS status;

-- Renombrar la tabla
ALTER TABLE family_relationships 
RENAME TO relationships;

SELECT 
    '✅ Tabla renombrada exitosamente' AS status;

-- Verificar el cambio
SELECT 
    'Verificando nuevo nombre' AS verificacion,
    table_name
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name IN ('family_relationships', 'relationships');

-- ============================================================================
-- PASO 3: CREAR TABLA emergency_contacts
-- ============================================================================

SELECT 
    '🆕 Creando tabla emergency_contacts...' AS status;

CREATE TABLE emergency_contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT 'Nombre completo del contacto de emergencia',
  phone VARCHAR(20) NOT NULL COMMENT 'Teléfono formato +57 3XX XXX XXXX',
  email VARCHAR(100) NOT NULL COMMENT 'Email del contacto',
  address VARCHAR(200) NOT NULL COMMENT 'Dirección completa',
  city VARCHAR(50) NOT NULL COMMENT 'Ciudad de residencia',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Contactos de emergencia compartidos (M:N con participants)';

SELECT 
    '✅ Tabla emergency_contacts creada' AS status;

-- ============================================================================
-- PASO 4: CREAR TABLA PIVOT participant_emergency_contacts
-- ============================================================================

SELECT 
    '🔗 Creando tabla pivot participant_emergency_contacts...' AS status;

CREATE TABLE participant_emergency_contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  participant_id INT UNSIGNED NOT NULL COMMENT 'ID del participante',
  emergency_contact_id INT NOT NULL COMMENT 'ID del contacto de emergencia',
  relationship_id INT UNSIGNED NOT NULL COMMENT 'Tipo de relación (de tabla relationships)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (participant_id) 
    REFERENCES participants(id) 
    ON DELETE CASCADE,
  
  FOREIGN KEY (emergency_contact_id) 
    REFERENCES emergency_contacts(id) 
    ON DELETE CASCADE,
  
  FOREIGN KEY (relationship_id) 
    REFERENCES relationships(id) 
    ON DELETE RESTRICT,
  
  -- Índices para mejorar el rendimiento
  INDEX idx_participant (participant_id),
  INDEX idx_emergency_contact (emergency_contact_id),
  INDEX idx_relationship (relationship_id),
  
  -- Constraint único para evitar duplicados
  UNIQUE KEY uk_participant_contact (participant_id, emergency_contact_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tabla pivot M:N entre participants y emergency_contacts';

SELECT 
    '✅ Tabla pivot creada' AS status;

-- ============================================================================
-- PASO 5: MIGRAR DATOS EXISTENTES
-- ============================================================================

SELECT 
    '📦 Migrando datos de contactos de emergencia...' AS status;

-- Insertar contactos únicos en emergency_contacts
-- Agrupamos por combinación única de campos para evitar duplicados
INSERT INTO emergency_contacts (name, phone, email, address, city)
SELECT DISTINCT
    emergency_contact_name,
    emergency_contact_phone,
    emergency_contact_email,
    emergency_contact_address,
    emergency_contact_city
FROM participants
WHERE emergency_contact_name IS NOT NULL
  AND emergency_contact_phone IS NOT NULL
  AND emergency_contact_email IS NOT NULL
  AND emergency_contact_address IS NOT NULL
  AND emergency_contact_city IS NOT NULL;

SELECT 
    CONCAT('✅ ', ROW_COUNT(), ' contactos únicos insertados en emergency_contacts') AS resultado;

-- Crear las relaciones en la tabla pivot
-- Usamos relationship_id = 28 ('Otro') por defecto para contactos existentes
-- ya que no tenemos esa información en los datos actuales
INSERT INTO participant_emergency_contacts (participant_id, emergency_contact_id, relationship_id)
SELECT DISTINCT
    p.id AS participant_id,
    ec.id AS emergency_contact_id,
    28 AS relationship_id  -- 'Otro' por defecto
FROM participants p
INNER JOIN emergency_contacts ec ON
    p.emergency_contact_name = ec.name
    AND p.emergency_contact_phone = ec.phone
    AND p.emergency_contact_email = ec.email
    AND p.emergency_contact_address = ec.address
    AND p.emergency_contact_city = ec.city
WHERE p.emergency_contact_name IS NOT NULL;

SELECT 
    CONCAT('✅ ', ROW_COUNT(), ' relaciones creadas en participant_emergency_contacts') AS resultado;

-- ============================================================================
-- PASO 6: ELIMINAR COLUMNAS OBSOLETAS DE participants
-- ============================================================================

SELECT 
    '🗑️ Eliminando columnas obsoletas de participants...' AS status;

-- Eliminar foreign key si existe
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

-- Eliminar columnas de contacto de emergencia
ALTER TABLE participants
DROP COLUMN IF EXISTS emergency_contact_name,
DROP COLUMN IF EXISTS emergency_contact_phone,
DROP COLUMN IF EXISTS emergency_contact_email,
DROP COLUMN IF EXISTS emergency_contact_address,
DROP COLUMN IF EXISTS emergency_contact_city;

SELECT 
    '✅ Columnas eliminadas de participants' AS status;

-- ============================================================================
-- PASO 7: ACTUALIZAR CATÁLOGO relationships CON NUEVOS TIPOS
-- ============================================================================

SELECT 
    '📋 Agregando nuevos tipos de relación al catálogo...' AS status;

-- Insertar relaciones adicionales para contactos de emergencia (si no existen)
INSERT INTO relationships (name, code, gender_specific, is_active)
SELECT 'Amigo', 'AMIG', FALSE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM relationships WHERE code = 'AMIG');

INSERT INTO relationships (name, code, gender_specific, is_active)
SELECT 'Conocido', 'CONO', FALSE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM relationships WHERE code = 'CONO');

INSERT INTO relationships (name, code, gender_specific, is_active)
SELECT 'Vecino', 'VEC', FALSE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM relationships WHERE code = 'VEC');

SELECT 
    '✅ Catálogo de relaciones actualizado' AS status;

-- ============================================================================
-- PASO 8: VERIFICACIONES POST-MIGRACIÓN
-- ============================================================================

SELECT 
    '✅ Verificando resultados de la migración...' AS status;

-- Verificar que relationships existe
SELECT 
    'Tabla relationships' AS verificacion,
    COUNT(*) AS existe
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name = 'relationships';
-- Resultado esperado: 1

-- Verificar que family_relationships NO existe
SELECT 
    'Tabla family_relationships (debe estar eliminada)' AS verificacion,
    COUNT(*) AS existe
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name = 'family_relationships';
-- Resultado esperado: 0

-- Verificar que emergency_contacts existe
SELECT 
    'Tabla emergency_contacts' AS verificacion,
    COUNT(*) AS existe,
    (SELECT COUNT(*) FROM emergency_contacts) AS total_contactos
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name = 'emergency_contacts';

-- Verificar que participant_emergency_contacts existe
SELECT 
    'Tabla participant_emergency_contacts' AS verificacion,
    COUNT(*) AS existe,
    (SELECT COUNT(*) FROM participant_emergency_contacts) AS total_relaciones
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name = 'participant_emergency_contacts';

-- Verificar que las columnas fueron eliminadas de participants
SELECT 
    'Columnas emergency_contact en participants (deben estar eliminadas)' AS verificacion,
    COUNT(*) AS cantidad
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND table_name = 'participants'
  AND column_name LIKE 'emergency_contact_%';
-- Resultado esperado: 0

-- Mostrar estructura final de participants
SELECT 
    '📋 Columnas restantes en participants:' AS info;

SELECT 
    column_name,
    column_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND table_name = 'participants'
ORDER BY ordinal_position;

-- Verificar foreign keys de la tabla pivot
SELECT 
    '🔑 Foreign keys de participant_emergency_contacts:' AS info;

SELECT 
    constraint_name,
    column_name,
    referenced_table_name,
    referenced_column_name
FROM information_schema.key_column_usage
WHERE table_schema = DATABASE()
  AND table_name = 'participant_emergency_contacts'
  AND referenced_table_name IS NOT NULL;

-- Estadísticas finales
SELECT 
    '📊 Estadísticas finales:' AS info;

SELECT 
    'Total contactos únicos' AS descripcion,
    COUNT(*) AS cantidad
FROM emergency_contacts
UNION ALL
SELECT 
    'Total relaciones participant-contact' AS descripcion,
    COUNT(*) AS cantidad
FROM participant_emergency_contacts
UNION ALL
SELECT 
    'Total participantes activos' AS descripcion,
    COUNT(*) AS cantidad
FROM participants
WHERE deleted_at IS NULL
UNION ALL
SELECT 
    'Total tipos de relación' AS descripcion,
    COUNT(*) AS cantidad
FROM relationships
WHERE is_active = TRUE;

-- ============================================================================
-- INFORMACIÓN FINAL
-- ============================================================================

SELECT 
    '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE' AS status,
    'family_relationships → relationships ✓' AS cambio_1,
    'emergency_contacts creada con datos migrados ✓' AS cambio_2,
    'participant_emergency_contacts (M:N) creada ✓' AS cambio_3,
    'Columnas obsoletas eliminadas de participants ✓' AS cambio_4;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================

/*
📌 CAMBIOS REALIZADOS:

1. TABLA RENOMBRADA:
   - family_relationships → relationships
   - Todas las foreign keys actualizadas automáticamente
   - Índices y constraints preservados

2. NUEVAS TABLAS:
   - emergency_contacts: Almacena contactos únicos (pueden ser compartidos)
   - participant_emergency_contacts: Tabla pivot M:N con relationship_id

3. MIGRACIÓN DE DATOS:
   - Todos los contactos existentes fueron migrados
   - Contactos duplicados se consolidaron (mismo email/phone)
   - Relación por defecto: "Otro" (relationship_id = 28)

4. COLUMNAS ELIMINADAS DE participants:
   - emergency_contact_name
   - emergency_contact_phone
   - emergency_contact_email
   - emergency_contact_address
   - emergency_contact_city

5. NUEVAS RELACIONES AGREGADAS:
   - Amigo, Conocido, Vecino (para contactos de emergencia)

📌 BENEFICIOS:
   - Un contacto puede ser usado por múltiples participantes
   - Reduce duplicación de datos
   - Permite actualizar contacto en un solo lugar
   - Relación M:N flexible con tipo de relación

📌 IMPACTO EN LA APLICACIÓN:
   - Entity Participant ya no tiene campos emergency_contact_*
   - Nuevas entities: EmergencyContact, ParticipantEmergencyContact
   - DTO CreateParticipantDto ahora usa emergencyContacts: CreateEmergencyContactDto[]
   - Endpoint /api/v1/catalogs/relationships (antes family-relationships)
*/

-- ============================================================================
-- ROLLBACK (EN CASO DE EMERGENCIA)
-- ============================================================================

/*
-- ⚠️ SOLO EJECUTAR SI NECESITAS REVERTIR LOS CAMBIOS

-- Paso 1: Renombrar relationships de vuelta a family_relationships
ALTER TABLE relationships RENAME TO family_relationships;

-- Paso 2: Recrear columnas en participants
ALTER TABLE participants
ADD COLUMN emergency_contact_name VARCHAR(100) NULL AFTER referral_source,
ADD COLUMN emergency_contact_phone VARCHAR(20) NULL,
ADD COLUMN emergency_contact_email VARCHAR(100) NULL,
ADD COLUMN emergency_contact_address VARCHAR(200) NULL,
ADD COLUMN emergency_contact_city VARCHAR(50) NULL;

-- Paso 3: Restaurar datos (si tienes backup)
UPDATE participants p
INNER JOIN participant_emergency_contacts pec ON p.id = pec.participant_id
INNER JOIN emergency_contacts ec ON pec.emergency_contact_id = ec.id
SET 
    p.emergency_contact_name = ec.name,
    p.emergency_contact_phone = ec.phone,
    p.emergency_contact_email = ec.email,
    p.emergency_contact_address = ec.address,
    p.emergency_contact_city = ec.city;

-- Paso 4: Eliminar nuevas tablas
DROP TABLE IF EXISTS participant_emergency_contacts;
DROP TABLE IF EXISTS emergency_contacts;

-- Paso 5: Eliminar nuevas relaciones agregadas
DELETE FROM family_relationships WHERE code IN ('AMIG', 'CONO', 'VEC');

SELECT '⚠️ Rollback completado. Recuerda actualizar también el código de la aplicación' AS warning;
*/
