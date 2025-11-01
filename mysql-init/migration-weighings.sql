-- =====================================================
-- MIGRACIÓN: Crear tabla weighings (ponderaciones)
-- Fecha: 2025-10-31
-- Descripción: Nueva tabla para almacenar información de ponderación de casos
-- =====================================================

-- Crear tabla weighings
CREATE TABLE IF NOT EXISTS weighings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reason_consultation TEXT NULL COMMENT 'Motivo de consulta según el trabajador social',
  identified_situation TEXT NULL COMMENT 'Situación identificada por el trabajador social',
  favorable_conditions TEXT NULL COMMENT 'Condiciones favorables del paciente',
  conditions_not_favorable TEXT NULL COMMENT 'Condiciones no favorables del paciente',
  help_process TEXT NULL COMMENT 'Proceso de ayuda recomendado',
  case_id INT NOT NULL UNIQUE COMMENT 'ID del caso al que pertenece esta ponderación',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
  INDEX idx_weighings_case_id (case_id),
  CONSTRAINT fk_weighings_case_id 
    FOREIGN KEY (case_id) 
    REFERENCES cases(id) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla de ponderaciones de casos';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que la tabla se creó correctamente
SELECT 
  'weighings' as tabla,
  COUNT(*) as total_registros,
  'Tabla creada exitosamente' as estado
FROM weighings;

-- Verificar estructura de la tabla
DESCRIBE weighings;

-- Verificar índices y foreign keys
SHOW CREATE TABLE weighings;

-- =====================================================
-- ROLLBACK (En caso de necesitar revertir)
-- =====================================================

-- Para deshacer esta migración, ejecutar:
-- DROP TABLE IF EXISTS weighings;
