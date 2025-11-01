-- Migración para eliminar columnas code y order_index de academic_levels
-- Fecha: 2025-10-31

USE oots_db;

-- Eliminar las columnas code y order_index de la tabla academic_levels
ALTER TABLE academic_levels 
  DROP COLUMN code,
  DROP COLUMN order_index;

-- Verificar la estructura de la tabla
DESC academic_levels;
