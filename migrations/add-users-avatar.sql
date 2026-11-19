-- Foto de perfil y guía de la foto (users). Ejecutar a mano solo si las columnas no existen;
-- src/migrate.ts ya las crea al arrancar la aplicación (pasos 9 y 10).
ALTER TABLE users
  ADD COLUMN avatar_key VARCHAR(255) NULL,
  ADD COLUMN avatar_updated_at DATETIME NULL,
  ADD COLUMN avatar_tour_seen_at DATETIME NULL;
