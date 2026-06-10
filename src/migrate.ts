/**
 * Script de migración que se ejecuta en build-time (Render deploy).
 * Aplica cambios de esquema que TypeORM synchronize no puede hacer
 * en producción (synchronize: false).
 *
 * Ejecutado por: render.yaml buildCommand → node dist/src/migrate.js
 */
import * as mysql from 'mysql2/promise';
import type { RowDataPacket } from 'mysql2';

interface ColumnRow extends RowDataPacket {
  COLUMN_NAME: string;
}

interface IndexRow extends RowDataPacket {
  INDEX_NAME: string;
}

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: +(process.env.DB_PORT || '3306'),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  console.log('[migrate] Connected to database');

  try {
    // ── 1. participants.state ─────────────────────────────────────────────
    const [stateRows] = await connection.query<ColumnRow[]>(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'participants' AND COLUMN_NAME = 'state'`,
      [process.env.DB_DATABASE],
    );
    if (stateRows.length === 0) {
      await connection.query(
        `ALTER TABLE participants
           ADD COLUMN state    VARCHAR(50) NULL DEFAULT NULL,
           ADD COLUMN zip_code VARCHAR(20) NULL DEFAULT NULL`,
      );
      console.log('[migrate] ✓ Added participants.state and zip_code');
    } else {
      console.log('[migrate] · participants.state already exists, skipping');
    }

    // ── 2. users.role ─────────────────────────────────────────────────────
    const [roleRows] = await connection.query<ColumnRow[]>(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'`,
      [process.env.DB_DATABASE],
    );
    if (roleRows.length === 0) {
      await connection.query(
        `ALTER TABLE users
           ADD COLUMN role ENUM('ADMIN','COORDINADOR','SUPERVISOR','PSICOLOGO','ORIENTADOR')
           NOT NULL DEFAULT 'ORIENTADOR' AFTER status`,
      );
      console.log('[migrate] ✓ Added users.role');
    } else {
      console.log('[migrate] · users.role already exists, skipping');
    }

    // ── 3. refresh_tokens — fix index name ────────────────────────────────
    const [uqRows] = await connection.query<IndexRow[]>(
      `SELECT INDEX_NAME FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'refresh_tokens'
         AND INDEX_NAME = 'UQ_refresh_tokens_token_hash'`,
      [process.env.DB_DATABASE],
    );
    if (uqRows.length > 0) {
      await connection.query(
        `ALTER TABLE refresh_tokens
           RENAME INDEX \`UQ_refresh_tokens_token_hash\`
           TO \`IDX_refresh_tokens_token_hash\``,
      );
      console.log('[migrate] ✓ Renamed refresh_tokens UQ index to IDX');
    } else {
      console.log('[migrate] · refresh_tokens index already correct, skipping');
    }

    console.log('[migrate] All migrations completed successfully');
  } finally {
    await connection.end();
  }
}

runMigrations().catch((err) => {
  console.error('[migrate] Migration failed:', err.message);
  process.exit(1);
});
