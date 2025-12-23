-- Crear tabla approach_types (tipos de abordaje)
CREATE TABLE IF NOT EXISTS `approach_types` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `UK_approach_types_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla process_types (tipos de proceso)
CREATE TABLE IF NOT EXISTS `process_types` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `UK_process_types_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agregar columnas a progress_notes para las relaciones
ALTER TABLE `progress_notes`
ADD COLUMN `approach_type_id` INT NULL AFTER `case_id`,
ADD COLUMN `process_type_id` INT NULL AFTER `approach_type_id`;

-- Crear foreign keys
ALTER TABLE `progress_notes`
ADD CONSTRAINT `FK_progress_notes_approach_type`
  FOREIGN KEY (`approach_type_id`)
  REFERENCES `approach_types` (`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE `progress_notes`
ADD CONSTRAINT `FK_progress_notes_process_type`
  FOREIGN KEY (`process_type_id`)
  REFERENCES `process_types` (`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- Insertar datos iniciales para approach_types
INSERT INTO `approach_types` (`name`, `description`) VALUES
('Terapia Cognitivo-Conductual', 'Enfoque terapéutico que trabaja en la modificación de pensamientos y conductas disfuncionales'),
('Terapia Psicodinámica', 'Enfoque basado en la exploración del inconsciente y experiencias tempranas'),
('Terapia Humanista', 'Enfoque centrado en la persona y su potencial de crecimiento'),
('Terapia Sistémica', 'Enfoque que considera al individuo dentro de su sistema familiar y social'),
('Terapia Gestalt', 'Enfoque experiencial centrado en el aquí y ahora'),
('Terapia de Aceptación y Compromiso (ACT)', 'Enfoque basado en mindfulness y valores personales'),
('Terapia Narrativa', 'Enfoque que explora las historias personales y su reescritura'),
('Intervención en Crisis', 'Abordaje inmediato para situaciones de emergencia psicológica');

-- Insertar datos iniciales para process_types
INSERT INTO `process_types` (`name`, `description`) VALUES
('Proceso Individual', 'Proceso terapéutico con atención personalizada uno a uno'),
('Proceso Grupal', 'Proceso terapéutico en formato de grupo'),
('Proceso Familiar', 'Proceso terapéutico enfocado en la dinámica familiar'),
('Proceso de Pareja', 'Proceso terapéutico para relaciones de pareja'),
('Proceso de Evaluación', 'Proceso diagnóstico y valoración psicológica'),
('Proceso Psicoeducativo', 'Proceso enfocado en educación sobre salud mental'),
('Proceso de Acompañamiento', 'Proceso de seguimiento y apoyo continuo');
