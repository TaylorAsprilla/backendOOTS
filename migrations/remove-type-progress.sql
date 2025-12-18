-- Verificar y eliminar la foreign key de progress_notes a type_progress
SET @fk_name = (
  SELECT CONSTRAINT_NAME 
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'progress_notes' 
    AND COLUMN_NAME = 'type_progress_id'
    AND REFERENCED_TABLE_NAME IS NOT NULL
  LIMIT 1
);

SET @query = IF(@fk_name IS NOT NULL, 
  CONCAT('ALTER TABLE `progress_notes` DROP FOREIGN KEY `', @fk_name, '`'), 
  'SELECT "No foreign key found" AS info'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Eliminar la columna type_progress_id de progress_notes
ALTER TABLE `progress_notes`
DROP COLUMN IF EXISTS `type_progress_id`;

-- Eliminar la tabla type_progress
DROP TABLE IF EXISTS `type_progress`;
