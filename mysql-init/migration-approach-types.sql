-- Migración para eliminar columna code de approach_types
-- Fecha: 2025-10-31

USE oots_db;

-- Eliminar la columna code de la tabla approach_types
ALTER TABLE approach_types 
  DROP COLUMN code;

-- Verificar la estructura de la tabla
DESC approach_types;
