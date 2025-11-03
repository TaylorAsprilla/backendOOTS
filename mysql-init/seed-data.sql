-- ============================================================================
-- INICIALIZACIÓN BASE DE DATOS - OOTS Colombia
-- ============================================================================
-- Ejecutado automáticamente por Docker al crear el contenedor
-- Orden: 01 (primero)
-- ============================================================================

USE oots_db;

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET time_zone = 'America/Bogota';

-- ============================================================================
-- CATÁLOGO: RELATIONSHIPS (Parentescos y Relaciones)
-- ============================================================================
-- Usado por: family_members y participant_emergency_contacts
-- NOTA: La tabla será creada por TypeORM, aquí solo insertamos datos
-- ============================================================================

-- Datos iniciales de relationships (solo si la tabla existe)
INSERT INTO relationships (name, code, is_active) VALUES
-- Relaciones Familiares (Parentescos)
('Padre', 'PADRE', TRUE),
('Madre', 'MADRE', TRUE),
('Hermano', 'HERMANO', TRUE),
('Hermana', 'HERMANA', TRUE),
('Hijo', 'HIJO', TRUE),
('Hija', 'HIJA', TRUE),
('Abuelo', 'ABUELO', TRUE),
('Abuela', 'ABUELA', TRUE),
('Tío', 'TIO', TRUE),
('Tía', 'TIA', TRUE),
('Primo', 'PRIMO', TRUE),
('Prima', 'PRIMA', TRUE),
('Sobrino', 'SOBRINO', TRUE),
('Sobrina', 'SOBRINA', TRUE),
('Esposo', 'ESPOSO', TRUE),
('Esposa', 'ESPOSA', TRUE),
('Compañero', 'COMPANERO', TRUE),
('Compañera', 'COMPANERA', TRUE),
('Suegro', 'SUEGRO', TRUE),
('Suegra', 'SUEGRA', TRUE),
('Cuñado', 'CUNADO', TRUE),
('Cuñada', 'CUNADA', TRUE),

-- Relaciones No Familiares (Contactos de Emergencia)
('Amigo', 'AMIGO', TRUE),
('Amiga', 'AMIGA', TRUE),
('Conocido', 'CONOCIDO', TRUE),
('Conocida', 'CONOCIDA', TRUE),
('Vecino', 'VECINO', TRUE),
('Vecina', 'VECINA', TRUE),
('Colega', 'COLEGA', TRUE),
('Compañero de trabajo', 'COMPANERO_TRABAJO', TRUE),
('Tutor', 'TUTOR', TRUE),
('Tutora', 'TUTORA', TRUE),

-- Genéricos
('Otro', 'OTRO', TRUE),
('Otra', 'OTRA', TRUE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- CATÁLOGO: ACADEMIC LEVELS (Niveles Académicos)
-- ============================================================================
-- NOTA: La tabla será creada por TypeORM, aquí solo insertamos datos
-- ============================================================================

-- Datos iniciales de academic_levels (solo si la tabla existe)
INSERT INTO academic_levels (name, code, description, is_active) VALUES
('Sin escolaridad', 'SIN_ESCOLARIDAD', 'No ha cursado ningún nivel educativo', TRUE),
('Preescolar', 'PREESCOLAR', 'Educación inicial (3-5 años)', TRUE),
('Primaria incompleta', 'PRIMARIA_INCOMPLETA', 'Primaria sin terminar (1°-5°)', TRUE),
('Primaria completa', 'PRIMARIA_COMPLETA', 'Primaria terminada (1°-5°)', TRUE),
('Bachillerato incompleto', 'BACHILLERATO_INCOMPLETO', 'Secundaria sin terminar (6°-11°)', TRUE),
('Bachillerato completo', 'BACHILLERATO_COMPLETO', 'Secundaria terminada (6°-11°)', TRUE),
('Técnico', 'TECNICO', 'Educación técnica profesional', TRUE),
('Tecnólogo', 'TECNOLOGO', 'Educación tecnológica', TRUE),
('Profesional incompleto', 'PROFESIONAL_INCOMPLETO', 'Universidad sin terminar', TRUE),
('Profesional completo', 'PROFESIONAL_COMPLETO', 'Título universitario', TRUE),
('Especialización', 'ESPECIALIZACION', 'Posgrado - Especialización', TRUE),
('Maestría', 'MAESTRIA', 'Posgrado - Maestría', TRUE),
('Doctorado', 'DOCTORADO', 'Posgrado - Doctorado', TRUE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- CATÁLOGO: APPROACH TYPES (Tipos de Abordaje)
-- ============================================================================
-- NOTA: La tabla será creada por TypeORM, aquí solo insertamos datos
-- ============================================================================

-- Datos iniciales de approach_types (solo si la tabla existe)
INSERT INTO approach_types (name, code, description, is_active) VALUES
('Individual', 'INDIVIDUAL', 'Atención individual al participante', TRUE),
('Familiar', 'FAMILIAR', 'Atención junto con la familia', TRUE),
('Grupal', 'GRUPAL', 'Atención en grupo', TRUE),
('Comunitario', 'COMUNITARIO', 'Intervención a nivel comunitario', TRUE),
('Remisión', 'REMISION', 'Remisión a otra entidad o profesional', TRUE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- CATÁLOGO: FOLLOW UP PLAN CATALOG (Catálogo de Planes de Seguimiento)
-- ============================================================================
-- NOTA: La tabla será creada por TypeORM, aquí solo insertamos datos
-- ============================================================================

-- Datos iniciales de follow_up_plan_catalog (solo si la tabla existe)
INSERT INTO follow_up_plan_catalog (name, code, description, is_active) VALUES
('Seguimiento mensual', 'MENSUAL', 'Seguimiento cada 30 días', TRUE),
('Seguimiento quincenal', 'QUINCENAL', 'Seguimiento cada 15 días', TRUE),
('Seguimiento semanal', 'SEMANAL', 'Seguimiento cada 7 días', TRUE),
('Seguimiento trimestral', 'TRIMESTRAL', 'Seguimiento cada 3 meses', TRUE),
('Sin seguimiento', 'SIN_SEGUIMIENTO', 'No requiere seguimiento adicional', TRUE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- MENSAJE DE CONFIRMACIÓN
-- ============================================================================

SELECT '✅ Base de datos OOTS Colombia inicializada correctamente' AS status;
SELECT 'Catálogos creados: relationships, academic_levels, approach_types, follow_up_plan_catalog' AS info;
