-- Script de Verificación Post-Migración
-- Ejecutar después de completar la migración de datos médicos a casos

-- =====================================================
-- VERIFICACIÓN 1: Consistencia de Datos
-- =====================================================

-- Verificar que todas las entidades médicas tienen case_id
SELECT 
    'PASO 1: Verificación de case_id' as verificacion,
    '' as tabla,
    '' as resultado
UNION ALL
SELECT 
    '',
    'bio_psychosocial_histories',
    CASE 
        WHEN (SELECT COUNT(*) FROM bio_psychosocial_histories WHERE case_id IS NULL) = 0 
        THEN 'OK - Todos los registros tienen case_id' 
        ELSE CONCAT('ERROR - ', (SELECT COUNT(*) FROM bio_psychosocial_histories WHERE case_id IS NULL), ' registros sin case_id')
    END
UNION ALL
SELECT 
    '',
    'consultation_reasons',
    CASE 
        WHEN (SELECT COUNT(*) FROM consultation_reasons WHERE case_id IS NULL) = 0 
        THEN 'OK - Todos los registros tienen case_id' 
        ELSE CONCAT('ERROR - ', (SELECT COUNT(*) FROM consultation_reasons WHERE case_id IS NULL), ' registros sin case_id')
    END
UNION ALL
SELECT 
    '',
    'interventions',
    CASE 
        WHEN (SELECT COUNT(*) FROM interventions WHERE case_id IS NULL) = 0 
        THEN 'OK - Todos los registros tienen case_id' 
        ELSE CONCAT('ERROR - ', (SELECT COUNT(*) FROM interventions WHERE case_id IS NULL), ' registros sin case_id')
    END
UNION ALL
SELECT 
    '',
    'follow_up_plans',
    CASE 
        WHEN (SELECT COUNT(*) FROM follow_up_plans WHERE case_id IS NULL) = 0 
        THEN 'OK - Todos los registros tienen case_id' 
        ELSE CONCAT('ERROR - ', (SELECT COUNT(*) FROM follow_up_plans WHERE case_id IS NULL), ' registros sin case_id')
    END
UNION ALL
SELECT 
    '',
    'physical_health_histories',
    CASE 
        WHEN (SELECT COUNT(*) FROM physical_health_histories WHERE case_id IS NULL) = 0 
        THEN 'OK - Todos los registros tienen case_id' 
        ELSE CONCAT('ERROR - ', (SELECT COUNT(*) FROM physical_health_histories WHERE case_id IS NULL), ' registros sin case_id')
    END
UNION ALL
SELECT 
    '',
    'mental_health_histories',
    CASE 
        WHEN (SELECT COUNT(*) FROM mental_health_histories WHERE case_id IS NULL) = 0 
        THEN 'OK - Todos los registros tienen case_id' 
        ELSE CONCAT('ERROR - ', (SELECT COUNT(*) FROM mental_health_histories WHERE case_id IS NULL), ' registros sin case_id')
    END
UNION ALL
SELECT 
    '',
    'intervention_plans',
    CASE 
        WHEN (SELECT COUNT(*) FROM intervention_plans WHERE case_id IS NULL) = 0 
        THEN 'OK - Todos los registros tienen case_id' 
        ELSE CONCAT('ERROR - ', (SELECT COUNT(*) FROM intervention_plans WHERE case_id IS NULL), ' registros sin case_id')
    END
UNION ALL
SELECT 
    '',
    'progress_notes',
    CASE 
        WHEN (SELECT COUNT(*) FROM progress_notes WHERE case_id IS NULL) = 0 
        THEN 'OK - Todos los registros tienen case_id' 
        ELSE CONCAT('ERROR - ', (SELECT COUNT(*) FROM progress_notes WHERE case_id IS NULL), ' registros sin case_id')
    END
UNION ALL
SELECT 
    '',
    'referrals',
    CASE 
        WHEN (SELECT COUNT(*) FROM referrals WHERE case_id IS NULL) = 0 
        THEN 'OK - Todos los registros tienen case_id' 
        ELSE CONCAT('ERROR - ', (SELECT COUNT(*) FROM referrals WHERE case_id IS NULL), ' registros sin case_id')
    END;

-- =====================================================
-- VERIFICACIÓN 2: Integridad Referencial
-- =====================================================

SELECT 
    'PASO 2: Integridad Referencial' as verificacion,
    '' as tabla,
    '' as resultado
UNION ALL
SELECT 
    '',
    'bio_psychosocial_histories',
    CASE 
        WHEN (SELECT COUNT(*) FROM bio_psychosocial_histories b LEFT JOIN cases c ON b.case_id = c.id WHERE c.id IS NULL) = 0 
        THEN 'OK - Todas las referencias son válidas' 
        ELSE CONCAT('ERROR - ', (SELECT COUNT(*) FROM bio_psychosocial_histories b LEFT JOIN cases c ON b.case_id = c.id WHERE c.id IS NULL), ' referencias inválidas')
    END
UNION ALL
SELECT 
    '',
    'consultation_reasons',
    CASE 
        WHEN (SELECT COUNT(*) FROM consultation_reasons cr LEFT JOIN cases c ON cr.case_id = c.id WHERE c.id IS NULL) = 0 
        THEN 'OK - Todas las referencias son válidas' 
        ELSE CONCAT('ERROR - ', (SELECT COUNT(*) FROM consultation_reasons cr LEFT JOIN cases c ON cr.case_id = c.id WHERE c.id IS NULL), ' referencias inválidas')
    END
UNION ALL
SELECT 
    '',
    'intervention_plans',
    CASE 
        WHEN (SELECT COUNT(*) FROM intervention_plans ip LEFT JOIN cases c ON ip.case_id = c.id WHERE c.id IS NULL) = 0 
        THEN 'OK - Todas las referencias son válidas' 
        ELSE CONCAT('ERROR - ', (SELECT COUNT(*) FROM intervention_plans ip LEFT JOIN cases c ON ip.case_id = c.id WHERE c.id IS NULL), ' referencias inválidas')
    END
UNION ALL
SELECT 
    '',
    'progress_notes',
    CASE 
        WHEN (SELECT COUNT(*) FROM progress_notes pn LEFT JOIN cases c ON pn.case_id = c.id WHERE c.id IS NULL) = 0 
        THEN 'OK - Todas las referencias son válidas' 
        ELSE CONCAT('ERROR - ', (SELECT COUNT(*) FROM progress_notes pn LEFT JOIN cases c ON pn.case_id = c.id WHERE c.id IS NULL), ' referencias inválidas')
    END;

-- =====================================================
-- VERIFICACIÓN 3: Estadísticas de Migración
-- =====================================================

SELECT 
    'PASO 3: Estadísticas' as verificacion,
    '' as metrica,
    '' as valor
UNION ALL
SELECT 
    '',
    'Total de participantes',
    CAST((SELECT COUNT(*) FROM participants) AS CHAR)
UNION ALL
SELECT 
    '',
    'Total de casos',
    CAST((SELECT COUNT(*) FROM cases) AS CHAR)
UNION ALL
SELECT 
    '',
    'Casos por participante (promedio)',
    CAST((SELECT ROUND(COUNT(c.id) / COUNT(DISTINCT c.participant_id), 2) FROM cases c) AS CHAR)
UNION ALL
SELECT 
    '',
    'Participantes con datos médicos',
    CAST((SELECT COUNT(DISTINCT c.participant_id) FROM cases c 
          WHERE c.id IN (
              SELECT DISTINCT case_id FROM bio_psychosocial_histories 
              UNION SELECT DISTINCT case_id FROM consultation_reasons
          )) AS CHAR)
UNION ALL
SELECT 
    '',
    'Total registros bio-psicosociales',
    CAST((SELECT COUNT(*) FROM bio_psychosocial_histories) AS CHAR)
UNION ALL
SELECT 
    '',
    'Total motivos de consulta',
    CAST((SELECT COUNT(*) FROM consultation_reasons) AS CHAR)
UNION ALL
SELECT 
    '',
    'Total planes de intervención',
    CAST((SELECT COUNT(*) FROM intervention_plans) AS CHAR)
UNION ALL
SELECT 
    '',
    'Total notas de progreso',
    CAST((SELECT COUNT(*) FROM progress_notes) AS CHAR);

-- =====================================================
-- VERIFICACIÓN 4: Casos de Prueba
-- =====================================================

-- Mostrar algunos casos de ejemplo para verificar manualmente
SELECT 
    'PASO 4: Casos de Ejemplo' as verificacion,
    '' as caso,
    '' as detalle
UNION ALL
SELECT 
    '',
    'Caso con más información médica',
    CONCAT('Caso ID: ', c.id, ' - ', c.case_number, ' (Participante: ', p.first_name, ' ', p.first_last_name, ')')
FROM cases c
JOIN participants p ON c.participant_id = p.id
WHERE c.id IN (
    SELECT case_id FROM bio_psychosocial_histories
    UNION SELECT case_id FROM consultation_reasons
)
ORDER BY c.id
LIMIT 1
UNION ALL
SELECT 
    '',
    'Participante con más casos',
    CONCAT('Participante: ', p.first_name, ' ', p.first_last_name, ' - Casos: ', COUNT(c.id))
FROM participants p
JOIN cases c ON p.id = c.participant_id
GROUP BY p.id, p.first_name, p.first_last_name
ORDER BY COUNT(c.id) DESC
LIMIT 1;

-- =====================================================
-- VERIFICACIÓN 5: Comandos de Limpieza (Si todo está OK)
-- =====================================================

-- Si todas las verificaciones anteriores son OK, se pueden ejecutar estos comandos:
/*
-- Hacer case_id NOT NULL (solo si todas las verificaciones son OK)
ALTER TABLE bio_psychosocial_histories MODIFY COLUMN case_id INT NOT NULL;
ALTER TABLE consultation_reasons MODIFY COLUMN case_id INT NOT NULL;
ALTER TABLE interventions MODIFY COLUMN case_id INT NOT NULL;
ALTER TABLE follow_up_plans MODIFY COLUMN case_id INT NOT NULL;
ALTER TABLE physical_health_histories MODIFY COLUMN case_id INT NOT NULL;
ALTER TABLE mental_health_histories MODIFY COLUMN case_id INT NOT NULL;
ALTER TABLE intervention_plans MODIFY COLUMN case_id INT NOT NULL;
ALTER TABLE progress_notes MODIFY COLUMN case_id INT NOT NULL;
ALTER TABLE referrals MODIFY COLUMN case_id INT NOT NULL;

-- Eliminar columnas participant_id obsoletas (SOLO SI TODO ESTÁ OK)
-- ADVERTENCIA: Esta acción es irreversible
ALTER TABLE bio_psychosocial_histories DROP COLUMN participant_id;
ALTER TABLE consultation_reasons DROP COLUMN participant_id;
ALTER TABLE interventions DROP COLUMN participant_id;
ALTER TABLE follow_up_plans DROP COLUMN participant_id;
ALTER TABLE physical_health_histories DROP COLUMN participant_id;
ALTER TABLE mental_health_histories DROP COLUMN participant_id;
ALTER TABLE intervention_plans DROP COLUMN participant_id;
ALTER TABLE progress_notes DROP COLUMN participant_id;
ALTER TABLE referrals DROP COLUMN participant_id;
*/