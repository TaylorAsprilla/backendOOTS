-- Usar la base de datos correcta
USE oots_db;

-- Desactivar verificación de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar registros con nombres vacíos en todas las tablas de catálogos
DELETE FROM income_levels WHERE name = '' OR name IS NULL;
DELETE FROM income_sources WHERE name = '' OR name IS NULL;
DELETE FROM housing_types WHERE name = '' OR name IS NULL;
DELETE FROM relationships WHERE name = '' OR name IS NULL;
DELETE FROM marital_statuses WHERE name = '' OR name IS NULL;
DELETE FROM health_insurances WHERE name = '' OR name IS NULL;

-- Reactivar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;
