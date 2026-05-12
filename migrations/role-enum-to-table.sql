-- ============================================================
-- Migration: role_enum_to_table
-- Convierte el campo `role` ENUM de `users` a una relación
-- con la tabla `roles`.
-- ============================================================

-- 1. Crear tabla roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id`          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(50)      NOT NULL,
  `description` VARCHAR(255)     NULL,
  `is_active`   TINYINT(1)       NOT NULL DEFAULT 1,
  `created_at`  DATETIME(6)      NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`  DATETIME(6)      NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_roles_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Insertar los roles del enum original
INSERT IGNORE INTO `roles` (`name`, `description`) VALUES
  ('ADMIN',        'Administrador del sistema'),
  ('ADMIN_COUNTRY','Administrador por país'),
  ('USER',         'Usuario estándar'),
  ('COORDINADOR',  'Coordinador de área'),
  ('SUPERVISOR',   'Supervisor de equipo'),
  ('PSICOLOGO',    'Psicólogo'),
  ('ORIENTADOR',   'Orientador');

-- 3. Agregar columna role_id a users (nullable temporalmente)
ALTER TABLE `users`
  ADD COLUMN `role_id` INT UNSIGNED NULL AFTER `status`;

-- 4. Migrar datos: asignar role_id según el valor del enum actual
UPDATE `users` u
SET u.`role_id` = (
  SELECT r.`id` FROM `roles` r
  WHERE r.`name` = CAST(u.`role` AS CHAR)
  LIMIT 1
);

-- 5. Agregar FK constraint
ALTER TABLE `users`
  ADD CONSTRAINT `FK_users_role`
  FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 6. Eliminar columna enum role
ALTER TABLE `users` DROP COLUMN `role`;

-- ============================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================
