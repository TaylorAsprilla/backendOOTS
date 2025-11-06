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
-- CATÁLOGO: DOCUMENT TYPES (Tipos de Documento)
-- ============================================================================
-- NOTA: La tabla será creada por TypeORM, aquí solo insertamos datos
-- ============================================================================

-- Datos iniciales de document_types (solo si la tabla existe)
INSERT INTO document_types (name, code, is_active) VALUES
('Cédula de Ciudadanía', 'CC', TRUE),
('Tarjeta de Identidad', 'TI', TRUE),
('Cédula de Extranjería', 'CE', TRUE),
('Pasaporte', 'PASAPORTE', TRUE),
('Registro Civil', 'RC', TRUE),
('NIT', 'NIT', TRUE),
('Permiso Especial de Permanencia', 'PEP', TRUE),
('Permiso por Protección Temporal', 'PPT', TRUE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- CATÁLOGO: GENDERS (Géneros)
-- ============================================================================
-- NOTA: La tabla será creada por TypeORM, aquí solo insertamos datos
-- ============================================================================

-- Datos iniciales de genders (solo si la tabla existe)
INSERT INTO genders (name, code, is_active) VALUES
('Masculino', 'M', TRUE),
('Femenino', 'F', TRUE),
('No binario', 'NB', TRUE),
('Prefiero no decir', 'PND', TRUE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- CATÁLOGO: MARITAL STATUSES (Estados Civiles)
-- ============================================================================
-- NOTA: La tabla será creada por TypeORM, aquí solo insertamos datos
-- ============================================================================

-- Datos iniciales de marital_statuses (solo si la tabla existe)
INSERT INTO marital_statuses (name, code, is_active) VALUES
('Soltero/a', 'SOLTERO', TRUE),
('Casado/a', 'CASADO', TRUE),
('Unión libre', 'UNION_LIBRE', TRUE),
('Separado/a', 'SEPARADO', TRUE),
('Divorciado/a', 'DIVORCIADO', TRUE),
('Viudo/a', 'VIUDO', TRUE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- CATÁLOGO: HEALTH INSURANCES (Entidades Prestadoras de Salud)
-- ============================================================================
-- NOTA: La tabla será creada por TypeORM, aquí solo insertamos datos
-- ============================================================================

-- Datos iniciales de health_insurances (solo si la tabla existe)
INSERT INTO health_insurances (name, code, is_active) VALUES
('SISBÉN', 'SISBEN', TRUE),
('EPS Sanitas', 'SANITAS', TRUE),
('EPS Sura', 'SURA', TRUE),
('EPS Salud Total', 'SALUD_TOTAL', TRUE),
('EPS Compensar', 'COMPENSAR', TRUE),
('EPS Famisanar', 'FAMISANAR', TRUE),
('Nueva EPS', 'NUEVA_EPS', TRUE),
('EPS Coomeva', 'COOMEVA', TRUE),
('Régimen subsidiado', 'REG_SUBSIDIADO', TRUE),
('Sin afiliación', 'SIN_AFILIACION', TRUE),
('Régimen especial', 'REG_ESPECIAL', TRUE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- CATÁLOGO: HOUSING TYPES (Tipos de Vivienda)
-- ============================================================================
-- NOTA: La tabla será creada por TypeORM, aquí solo insertamos datos
-- ============================================================================

-- Datos iniciales de housing_types (solo si la tabla existe)
INSERT INTO housing_types (name, code, is_active) VALUES
('Casa propia', 'CASA_PROPIA', TRUE),
('Casa arrendada', 'CASA_ARRENDADA', TRUE),
('Casa familiar', 'CASA_FAMILIAR', TRUE),
('Apartamento propio', 'APTO_PROPIO', TRUE),
('Apartamento arrendado', 'APTO_ARRENDADO', TRUE),
('Cuarto', 'CUARTO', TRUE),
('Inquilinato', 'INQUILINATO', TRUE),
('Albergue', 'ALBERGUE', TRUE),
('Situación de calle', 'SIT_CALLE', TRUE),
('Invasión', 'INVASION', TRUE),
('Otro', 'OTRO', TRUE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- CATÁLOGO: INCOME SOURCES (Fuentes de Ingreso)
-- ============================================================================
-- NOTA: La tabla será creada por TypeORM, aquí solo insertamos datos
-- ============================================================================

-- Datos iniciales de income_sources (solo si la tabla existe)
INSERT INTO income_sources (name, code, is_active) VALUES
('Trabajo formal', 'TRABAJO_FORMAL', TRUE),
('Trabajo informal', 'TRABAJO_INFORMAL', TRUE),
('Pensión', 'PENSION', TRUE),
('Auxilio gubernamental', 'AUXILIO_GOB', TRUE),
('Familias en Acción', 'FAMILIAS_ACCION', TRUE),
('Jóvenes en Acción', 'JOVENES_ACCION', TRUE),
('Ingreso Solidario', 'INGRESO_SOLIDARIO', TRUE),
('Remesas', 'REMESAS', TRUE),
('Ayuda familiar', 'AYUDA_FAMILIAR', TRUE),
('Actividades ilegales', 'ACT_ILEGALES', TRUE),
('Sin ingresos', 'SIN_INGRESOS', TRUE),
('Otro', 'OTRO', TRUE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- CATÁLOGO: INCOME LEVELS (Niveles de Ingreso)
-- ============================================================================
-- NOTA: La tabla será creada por TypeORM, aquí solo insertamos datos
-- ============================================================================

-- Datos iniciales de income_levels (solo si la tabla existe)
INSERT INTO income_levels (name, code, min_amount, max_amount, is_active) VALUES
('Sin ingresos', 'SIN_INGRESOS', 0, 0, TRUE),
('Menos de 1 SMMLV', 'MENOS_1_SMMLV', 1, 1299999, TRUE),
('1 SMMLV', '1_SMMLV', 1300000, 1300000, TRUE),
('Entre 1 y 2 SMMLV', '1_2_SMMLV', 1300001, 2600000, TRUE),
('Entre 2 y 3 SMMLV', '2_3_SMMLV', 2600001, 3900000, TRUE),
('Entre 3 y 4 SMMLV', '3_4_SMMLV', 3900001, 5200000, TRUE),
('Más de 4 SMMLV', 'MAS_4_SMMLV', 5200001, 999999999, TRUE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- CATÁLOGO: SITUATIONS IDENTIFIED (Situaciones Identificadas)
-- ============================================================================
-- NOTA: La tabla será creada por TypeORM, aquí solo insertamos datos
-- ============================================================================

-- Datos iniciales de situations_identified (solo si la tabla existe)
INSERT INTO situations_identified (name, code, is_active) VALUES
('Violencia intrafamiliar', 'VIF', TRUE),
('Abandono escolar', 'ABANDONO_ESC', TRUE),
('Consumo de sustancias psicoactivas', 'CONSUMO_SPA', TRUE),
('Embarazo adolescente', 'EMB_ADOLESC', TRUE),
('Trabajo infantil', 'TRABAJO_INF', TRUE),
('Desnutrición', 'DESNUTRICION', TRUE),
('Problemas de salud mental', 'SALUD_MENTAL', TRUE),
('Situación de calle', 'SIT_CALLE', TRUE),
('Discapacidad', 'DISCAPACIDAD', TRUE),
('Migración forzada', 'MIGRACION', TRUE),
('Conflicto armado', 'CONF_ARMADO', TRUE),
('Pobreza extrema', 'POBREZA_EXT', TRUE),
('Maltrato institucional', 'MALTRATO_INST', TRUE),
('Explotación sexual', 'EXPLOT_SEX', TRUE),
('Reclutamiento forzado', 'RECLUT_FORZ', TRUE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- CATÁLOGO: PROCESS TYPES (Tipos de Proceso)
-- ============================================================================
-- NOTA: La tabla será creada por TypeORM, aquí solo insertamos datos
-- ============================================================================

-- Datos iniciales de process_types (solo si la tabla existe)
INSERT INTO process_types (name, code, description, is_active) VALUES
('Seguimiento', 'S', 'Proceso de seguimiento continuo', TRUE),
('Cierre', 'C', 'Finalización del proceso', TRUE),
('Transferencia', 'T', 'Transferencia a otro profesional', TRUE),
('Derivación', 'D', 'Derivación a otra institución', TRUE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- CATÁLOGO: TREATMENT STATUSES (Estados de Tratamiento)
-- ============================================================================
-- NOTA: La tabla será creada por TypeORM, aquí solo insertamos datos
-- ============================================================================

-- Datos iniciales de treatment_statuses (solo si la tabla existe)
INSERT INTO treatment_statuses (name, code, is_active) VALUES
('Sí', 'SI', TRUE),
('No', 'NO', TRUE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- MENSAJE DE CONFIRMACIÓN
-- ============================================================================

SELECT '✅ Base de datos OOTS Colombia inicializada correctamente' AS status;
SELECT 'Catálogos creados: relationships, academic_levels, document_types, genders, marital_statuses, health_insurances, housing_types, income_sources, income_levels, situations_identified, process_types, treatment_statuses' AS info;
