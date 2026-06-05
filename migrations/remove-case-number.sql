-- Migración: Eliminar columna case_number de la tabla cases
-- La identificación del caso ahora se hace por el ID autoincremental

-- 1. Eliminar el índice unique primero
ALTER TABLE `cases` DROP INDEX `UQ_cases_case_number` IF EXISTS;

-- Si el índice tiene otro nombre, usar:
-- SHOW INDEX FROM cases WHERE Column_name = 'case_number';
-- ALTER TABLE `cases` DROP INDEX `<nombre_del_indice>`;

-- 2. Eliminar la columna case_number
ALTER TABLE `cases` DROP COLUMN `case_number`;

-- 3. Hacer consultation_reason opcional (nullable)
ALTER TABLE `cases` MODIFY COLUMN `consultation_reason` TEXT NULL;
