-- Script de inicialización para MySQL - OOTS Colombia
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS oots_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE oots_db;

-- Otorgar todos los permisos al usuario
GRANT ALL PRIVILEGES ON oots_db.* TO 'oots_user'@'%';
FLUSH PRIVILEGES;

-- Configurar zona horaria de Colombia
SET time_zone = 'America/Bogota';

-- Configurar encoding para caracteres especiales
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Mensaje de confirmación
SELECT 'Base de datos OOTS Colombia inicializada correctamente' AS status;