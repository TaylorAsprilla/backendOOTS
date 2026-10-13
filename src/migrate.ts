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

export async function runMigrations() {
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

    // ── 4. family_members.age and nullable birth_date ─────────────────────
    const [ageRows] = await connection.query<ColumnRow[]>(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'family_members' AND COLUMN_NAME = 'age'`,
      [process.env.DB_DATABASE],
    );
    if (ageRows.length === 0) {
      await connection.query(
        `ALTER TABLE family_members
           ADD COLUMN age INT NULL AFTER name,
           MODIFY COLUMN birth_date DATE NULL`,
      );
      await connection.query(
        `UPDATE family_members
           SET age = TIMESTAMPDIFF(YEAR, birth_date, CURDATE())
         WHERE age IS NULL AND birth_date IS NOT NULL`,
      );
      console.log('[migrate] ✓ Added family_members.age and made birth_date nullable');
    } else {
      console.log('[migrate] · family_members.age already exists, skipping');
    }

    // ── 5. process_types.Inicial ──────────────────────────────────────────
    const [processTypeRows] = await connection.query<RowDataPacket[]>(
      `SELECT id FROM process_types WHERE name = 'Inicial'`,
    );
    if (processTypeRows.length === 0) {
      await connection.query(
        `INSERT INTO process_types (name, description, is_active)
         VALUES ('Inicial', 'Nota inicial / Primer encuentro', 1)`,
      );
      console.log('[migrate] ✓ Added process_types "Inicial"');
    } else {
      console.log('[migrate] · process_types "Inicial" already exists, skipping');
    }

    console.log('[migrate] All migrations completed successfully');
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  runMigrations().catch((err) => {
    console.error('[migrate] Migration failed:', err.message);
    process.exit(1);
  });
}
