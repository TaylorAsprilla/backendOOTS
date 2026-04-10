-- ============================================================
-- MIGRACIÓN PRODUCCIÓN v3.0.1
-- Fecha: 2026-04-09
-- Base de datos: ootsPR / Render (MySQL)
-- Descripción:
--   1. Agrega columnas state y zip_code a participants
--      (faltan en DBs desplegadas antes de v2.x)
--   2. Renombra UQ_refresh_tokens_token_hash → IDX_
--      para que TypeORM synchronize no intente dropearlo
--
-- INSTRUCCIONES:
--   Ejecutar en la consola MySQL de Railway o Render.
--   Ambas operaciones son seguras y no afectan datos existentes.
-- ============================================================

-- Paso 1: Verificar estado actual (opcional, para confirmar antes de ejecutar)
-- SELECT index_name, non_unique, GROUP_CONCAT(column_name ORDER BY seq_in_index) AS cols
-- FROM information_schema.statistics
-- WHERE table_schema = DATABASE() AND table_name = 'refresh_tokens'
-- GROUP BY index_name, non_unique;

-- Paso 2: Agregar columnas faltantes en participants
--   (agregadas en v2.x, pueden faltar en DBs desactualizadas)
--   NOTA: Ejecutar solo si las columnas NO existen aún.
--   Para verificar antes: SHOW COLUMNS FROM participants LIKE 'state';
ALTER TABLE `participants`
  ADD COLUMN `state`    VARCHAR(50)  NULL DEFAULT NULL,
  ADD COLUMN `zip_code` VARCHAR(20)  NULL DEFAULT NULL;

-- Paso 3: Renombrar el índice único de token_hash en refresh_tokens
ALTER TABLE `refresh_tokens`
  RENAME INDEX `UQ_refresh_tokens_token_hash` TO `IDX_refresh_tokens_token_hash`;

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
-- SELECT index_name, non_unique, GROUP_CONCAT(column_name ORDER BY seq_in_index) AS cols
-- FROM information_schema.statistics
-- WHERE table_schema = DATABASE() AND table_name = 'refresh_tokens'
-- GROUP BY index_name, non_unique;
--
-- Resultado esperado:
--   PRIMARY                          0   id
--   IDX_refresh_tokens_token_hash    0   token_hash   ← unique
--   IDX_refresh_tokens_user_revoked  1   user_id,revoked_at
