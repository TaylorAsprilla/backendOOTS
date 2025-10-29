-- Migration: Migrar datos médicos de Participant a Case
-- Date: 2024-12-19
-- Description: Cambia todas las foreign keys de participant_id a case_id en las entidades médicas

-- IMPORTANTE: Ejecutar estas migraciones en orden y hacer backup de la base de datos antes

-- =====================================================
-- PASO 1: Agregar columnas case_id a todas las tablas médicas
-- =====================================================

-- Tabla bio_psychosocial_histories
ALTER TABLE bio_psychosocial_histories 
ADD COLUMN case_id INT NULL,
ADD INDEX idx_bio_psychosocial_histories_case_id (case_id),
ADD CONSTRAINT fk_bio_psychosocial_histories_case_id 
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE;

-- Tabla consultation_reasons
ALTER TABLE consultation_reasons 
ADD COLUMN case_id INT NULL,
ADD INDEX idx_consultation_reasons_case_id (case_id),
ADD CONSTRAINT fk_consultation_reasons_case_id 
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE;

-- Tabla interventions
ALTER TABLE interventions 
ADD COLUMN case_id INT NULL,
ADD INDEX idx_interventions_case_id (case_id),
ADD CONSTRAINT fk_interventions_case_id 
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE;

-- Tabla follow_up_plans
ALTER TABLE follow_up_plans 
ADD COLUMN case_id INT NULL,
ADD INDEX idx_follow_up_plans_case_id (case_id),
ADD CONSTRAINT fk_follow_up_plans_case_id 
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE;

-- Tabla physical_health_histories
ALTER TABLE physical_health_histories 
ADD COLUMN case_id INT NULL,
ADD INDEX idx_physical_health_histories_case_id (case_id),
ADD CONSTRAINT fk_physical_health_histories_case_id 
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE;

-- Tabla mental_health_histories
ALTER TABLE mental_health_histories 
ADD COLUMN case_id INT NULL,
ADD INDEX idx_mental_health_histories_case_id (case_id),
ADD CONSTRAINT fk_mental_health_histories_case_id 
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE;

-- Tabla assessments
ALTER TABLE assessments 
ADD COLUMN case_id INT NULL,
ADD INDEX idx_assessments_case_id (case_id),
ADD CONSTRAINT fk_assessments_case_id 
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE;

-- Tabla intervention_plans
ALTER TABLE intervention_plans 
ADD COLUMN case_id INT NULL,
ADD INDEX idx_intervention_plans_case_id (case_id),
ADD CONSTRAINT fk_intervention_plans_case_id 
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE;

-- Tabla progress_notes
ALTER TABLE progress_notes 
ADD COLUMN case_id INT NULL,
ADD INDEX idx_progress_notes_case_id (case_id),
ADD CONSTRAINT fk_progress_notes_case_id 
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE;

-- Tabla referrals
ALTER TABLE referrals 
ADD COLUMN case_id INT NULL,
ADD INDEX idx_referrals_case_id (case_id),
ADD CONSTRAINT fk_referrals_case_id 
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE;

-- =====================================================
-- PASO 2: Migrar datos existentes (si los hay)
-- =====================================================

-- NOTA: Este paso requiere lógica de negocio específica para decidir 
-- a qué caso asignar cada registro médico existente.
-- 
-- Opciones posibles:
-- 1. Crear un caso por defecto para cada participante que tenga datos médicos
-- 2. Asignar todos los datos médicos al caso más reciente de cada participante
-- 3. Requerir intervención manual para migrar los datos
--
-- EJEMPLO de migración automática (crear caso por defecto):

/*
-- Crear un caso por defecto para cada participante que tenga datos médicos
INSERT INTO cases (participant_id, case_number, title, description, status, created_at, updated_at)
SELECT DISTINCT 
    p.id as participant_id,
    CONCAT('CASE-', LPAD(ROW_NUMBER() OVER (ORDER BY p.id), 4, '0')) as case_number,
    'Caso migrado automáticamente' as title,
    'Caso creado durante la migración de datos médicos existentes' as description,
    'open' as status,
    NOW() as created_at,
    NOW() as updated_at
FROM participants p
WHERE p.id IN (
    SELECT DISTINCT participant_id FROM bio_psychosocial_histories
    UNION SELECT DISTINCT participant_id FROM consultation_reasons
    UNION SELECT DISTINCT participant_id FROM interventions
    UNION SELECT DISTINCT participant_id FROM follow_up_plans
    UNION SELECT DISTINCT participant_id FROM physical_health_histories
    UNION SELECT DISTINCT participant_id FROM mental_health_histories
    UNION SELECT DISTINCT participant_id FROM assessments
    UNION SELECT DISTINCT participant_id FROM intervention_plans
    UNION SELECT DISTINCT participant_id FROM progress_notes
    UNION SELECT DISTINCT participant_id FROM referrals
);

-- Actualizar case_id en todas las tablas médicas
UPDATE bio_psychosocial_histories b
JOIN cases c ON c.participant_id = b.participant_id
SET b.case_id = c.id;

UPDATE consultation_reasons cr
JOIN cases c ON c.participant_id = cr.participant_id
SET cr.case_id = c.id;

UPDATE interventions i
JOIN cases c ON c.participant_id = i.participant_id
SET i.case_id = c.id;

UPDATE follow_up_plans f
JOIN cases c ON c.participant_id = f.participant_id
SET f.case_id = c.id;

UPDATE physical_health_histories p
JOIN cases c ON c.participant_id = p.participant_id
SET p.case_id = c.id;

UPDATE mental_health_histories m
JOIN cases c ON c.participant_id = m.participant_id
SET m.case_id = c.id;

UPDATE assessments a
JOIN cases c ON c.participant_id = a.participant_id
SET a.case_id = c.id;

UPDATE intervention_plans ip
JOIN cases c ON c.participant_id = ip.participant_id
SET ip.case_id = c.id;

UPDATE progress_notes pn
JOIN cases c ON c.participant_id = pn.participant_id
SET pn.case_id = c.id;

UPDATE referrals r
JOIN cases c ON c.participant_id = r.participant_id
SET r.case_id = c.id;
*/

-- =====================================================
-- PASO 3: Hacer case_id obligatorio y eliminar participant_id
-- =====================================================

-- Una vez que todos los registros tengan case_id, hacemos la columna NOT NULL
-- y eliminamos las columnas participant_id

-- ADVERTENCIA: Solo ejecutar después de verificar que todos los registros
-- tienen case_id correctamente asignado

/*
-- Hacer case_id NOT NULL
ALTER TABLE bio_psychosocial_histories MODIFY COLUMN case_id INT NOT NULL;
ALTER TABLE consultation_reasons MODIFY COLUMN case_id INT NOT NULL;
ALTER TABLE interventions MODIFY COLUMN case_id INT NOT NULL;
ALTER TABLE follow_up_plans MODIFY COLUMN case_id INT NOT NULL;
ALTER TABLE physical_health_histories MODIFY COLUMN case_id INT NOT NULL;
ALTER TABLE mental_health_histories MODIFY COLUMN case_id INT NOT NULL;
ALTER TABLE assessments MODIFY COLUMN case_id INT NOT NULL;
ALTER TABLE intervention_plans MODIFY COLUMN case_id INT NOT NULL;
ALTER TABLE progress_notes MODIFY COLUMN case_id INT NOT NULL;
ALTER TABLE referrals MODIFY COLUMN case_id INT NOT NULL;

-- Eliminar constraints y columnas participant_id
ALTER TABLE bio_psychosocial_histories 
DROP FOREIGN KEY fk_bio_psychosocial_histories_participant_id,
DROP INDEX idx_bio_psychosocial_histories_participant_id,
DROP COLUMN participant_id;

ALTER TABLE consultation_reasons 
DROP FOREIGN KEY fk_consultation_reasons_participant_id,
DROP INDEX idx_consultation_reasons_participant_id,
DROP COLUMN participant_id;

ALTER TABLE interventions 
DROP FOREIGN KEY fk_interventions_participant_id,
DROP INDEX idx_interventions_participant_id,
DROP COLUMN participant_id;

ALTER TABLE follow_up_plans 
DROP FOREIGN KEY fk_follow_up_plans_participant_id,
DROP INDEX idx_follow_up_plans_participant_id,
DROP COLUMN participant_id;

ALTER TABLE physical_health_histories 
DROP FOREIGN KEY fk_physical_health_histories_participant_id,
DROP INDEX idx_physical_health_histories_participant_id,
DROP COLUMN participant_id;

ALTER TABLE mental_health_histories 
DROP FOREIGN KEY fk_mental_health_histories_participant_id,
DROP INDEX idx_mental_health_histories_participant_id,
DROP COLUMN participant_id;

ALTER TABLE assessments 
DROP FOREIGN KEY fk_assessments_participant_id,
DROP INDEX idx_assessments_participant_id,
DROP COLUMN participant_id;

ALTER TABLE intervention_plans 
DROP FOREIGN KEY fk_intervention_plans_participant_id,
DROP INDEX idx_intervention_plans_participant_id,
DROP COLUMN participant_id;

ALTER TABLE progress_notes 
DROP FOREIGN KEY fk_progress_notes_participant_id,
DROP INDEX idx_progress_notes_participant_id,
DROP COLUMN participant_id;

ALTER TABLE referrals 
DROP FOREIGN KEY fk_referrals_participant_id,
DROP INDEX idx_referrals_participant_id,
DROP COLUMN participant_id;
*/

-- =====================================================
-- VERIFICACIONES DE INTEGRIDAD
-- =====================================================

-- Verificar que no hay registros huérfanos
SELECT 'bio_psychosocial_histories' as tabla, COUNT(*) as registros_sin_case_id
FROM bio_psychosocial_histories WHERE case_id IS NULL
UNION ALL
SELECT 'consultation_reasons', COUNT(*) FROM consultation_reasons WHERE case_id IS NULL
UNION ALL
SELECT 'interventions', COUNT(*) FROM interventions WHERE case_id IS NULL
UNION ALL
SELECT 'follow_up_plans', COUNT(*) FROM follow_up_plans WHERE case_id IS NULL
UNION ALL
SELECT 'physical_health_histories', COUNT(*) FROM physical_health_histories WHERE case_id IS NULL
UNION ALL
SELECT 'mental_health_histories', COUNT(*) FROM mental_health_histories WHERE case_id IS NULL
UNION ALL
SELECT 'assessments', COUNT(*) FROM assessments WHERE case_id IS NULL
UNION ALL
SELECT 'intervention_plans', COUNT(*) FROM intervention_plans WHERE case_id IS NULL
UNION ALL
SELECT 'progress_notes', COUNT(*) FROM progress_notes WHERE case_id IS NULL
UNION ALL
SELECT 'referrals', COUNT(*) FROM referrals WHERE case_id IS NULL;

-- Verificar integridad referencial
SELECT 'Casos huérfanos en bio_psychosocial_histories' as verificacion, COUNT(*) as cantidad
FROM bio_psychosocial_histories b LEFT JOIN cases c ON b.case_id = c.id WHERE c.id IS NULL;