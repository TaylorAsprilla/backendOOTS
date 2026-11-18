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

    // ── 6. case_transfers: informe de transferencia + aprobación ──────────
    const [transferTable] = await connection.query<RowDataPacket[]>(
      `SELECT TABLE_NAME FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'case_transfers'`,
      [process.env.DB_DATABASE],
    );
    if (transferTable.length > 0) {
      const [reportRows] = await connection.query<ColumnRow[]>(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'case_transfers' AND COLUMN_NAME = 'work_summary'`,
        [process.env.DB_DATABASE],
      );
      if (reportRows.length === 0) {
        await connection.query(
          `ALTER TABLE case_transfers
             ADD COLUMN work_summary TEXT NULL,
             ADD COLUMN assessment TEXT NULL,
             ADD COLUMN achievements TEXT NULL,
             ADD COLUMN recommendations TEXT NULL,
             ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'APPROVED',
             ADD COLUMN reviewed_by_id INT UNSIGNED NULL,
             ADD COLUMN reviewed_at DATETIME NULL,
             ADD COLUMN review_note TEXT NULL,
             ADD CONSTRAINT fk_case_transfers_reviewed_by_id
               FOREIGN KEY (reviewed_by_id) REFERENCES users (id)`,
        );
        console.log('[migrate] ✓ Added case_transfers report and approval columns');
      } else {
        console.log('[migrate] · case_transfers report columns already exist, skipping');
      }

      // Quién elaboró el informe (el profesional que tiene el caso) y cuándo
      const [reportedRows] = await connection.query<ColumnRow[]>(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'case_transfers' AND COLUMN_NAME = 'reported_by_id'`,
        [process.env.DB_DATABASE],
      );
      if (reportedRows.length === 0) {
        await connection.query(
          `ALTER TABLE case_transfers
             ADD COLUMN reported_by_id INT UNSIGNED NULL,
             ADD COLUMN reported_at DATETIME NULL,
             ADD CONSTRAINT fk_case_transfers_reported_by_id
               FOREIGN KEY (reported_by_id) REFERENCES users (id)`,
        );
        console.log('[migrate] ✓ Added case_transfers reported_by columns');
      } else {
        console.log('[migrate] · case_transfers reported_by columns already exist, skipping');
      }
    }

    // ── 7. case_attachments / case_attachment_events ─────────────────────
    await connection.query(
      `CREATE TABLE IF NOT EXISTS case_attachments (
         id INT UNSIGNED NOT NULL AUTO_INCREMENT,
         case_id INT UNSIGNED NOT NULL,
         context VARCHAR(30) NOT NULL,
         category VARCHAR(40) NOT NULL,
         original_name VARCHAR(255) NOT NULL,
         storage_key VARCHAR(255) NOT NULL,
         mime_type VARCHAR(120) NOT NULL,
         extension VARCHAR(10) NOT NULL,
         size INT UNSIGNED NOT NULL,
         sha256 CHAR(64) NOT NULL,
         description TEXT NULL,
         signed_at DATE NULL,
         status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE',
         uploaded_by_id INT UNSIGNED NOT NULL,
         deleted_at DATETIME NULL,
         deleted_by_id INT UNSIGNED NULL,
         created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
         updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
         PRIMARY KEY (id),
         UNIQUE KEY UQ_case_attachments_storage_key (storage_key),
         KEY IDX_case_attachments_case (case_id, context, status),
         CONSTRAINT fk_case_attachments_case FOREIGN KEY (case_id) REFERENCES cases (id) ON DELETE RESTRICT,
         CONSTRAINT fk_case_attachments_uploaded_by FOREIGN KEY (uploaded_by_id) REFERENCES users (id)
       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    );
    await connection.query(
      `CREATE TABLE IF NOT EXISTS case_attachment_events (
         id INT UNSIGNED NOT NULL AUTO_INCREMENT,
         attachment_id INT UNSIGNED NOT NULL,
         case_id INT UNSIGNED NOT NULL,
         user_id INT UNSIGNED NOT NULL,
         action VARCHAR(10) NOT NULL,
         created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
         PRIMARY KEY (id),
         KEY IDX_case_attachment_events_attachment (attachment_id)
       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    );
    console.log('[migrate] ✓ case_attachments tables ensured');

    // ── 8. supervision_reviews ────────────────────────────────────────────
    await connection.query(
      `CREATE TABLE IF NOT EXISTS supervision_reviews (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        type VARCHAR(20) NOT NULL,
        case_id INT UNSIGNED NULL,
        supervisee_id INT UNSIGNED NULL,
        reviewer_id INT UNSIGNED NOT NULL,
        period VARCHAR(7) NULL,
        cases_count INT NULL,
        items JSON NOT NULL,
        recommendations TEXT NULL,
        status VARCHAR(10) NOT NULL DEFAULT 'DRAFT',
        signed_at DATETIME NULL,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        KEY IDX_supervision_reviews_case (case_id),
        KEY IDX_supervision_reviews_supervisee (supervisee_id),
        CONSTRAINT fk_supervision_reviews_case FOREIGN KEY (case_id) REFERENCES cases (id),
        CONSTRAINT fk_supervision_reviews_supervisee FOREIGN KEY (supervisee_id) REFERENCES users (id),
        CONSTRAINT fk_supervision_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES users (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    );
    console.log('[migrate] ✓ supervision_reviews table ensured');

    // ── 9. users: foto de perfil ──────────────────────────────────────────
    const [avatarCols] = await connection.query<ColumnRow[]>(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'avatar_key'`,
      [process.env.DB_DATABASE],
    );
    if (avatarCols.length === 0) {
      await connection.query(
        `ALTER TABLE users
           ADD COLUMN avatar_key VARCHAR(255) NULL,
           ADD COLUMN avatar_updated_at DATETIME NULL`,
      );
      console.log('[migrate] ✓ Added users.avatar_key / avatar_updated_at');
    } else {
      console.log('[migrate] · users avatar columns already exist, skipping');
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
