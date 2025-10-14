-- Script de inicialización para MySQL
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS oots_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE oots_db;

-- Otorgar todos los permisos al usuario
GRANT ALL PRIVILEGES ON oots_db.* TO 'oots_user'@'%';
FLUSH PRIVILEGES;

-- Mensaje de confirmación
SELECT 'Base de datos oots_db inicializada correctamente' AS status;