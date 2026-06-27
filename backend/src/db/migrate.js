const pool = require('./index');

/**
 * Run idempotent schema migrations on startup.
 * Uses CREATE TABLE IF NOT EXISTS so it's safe to run every boot.
 */
async function migrate() {
  const client = await pool.connect();
  try {
    // ── Users ─────────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        name          VARCHAR(100) NOT NULL,
        email         VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT         NOT NULL,
        avatar_url    TEXT,
        created_at    TIMESTAMPTZ  DEFAULT NOW()
      );
    `);

    // ── Tasks ─────────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title       VARCHAR(255) NOT NULL,
        description TEXT,
        completed   BOOLEAN      DEFAULT FALSE,
        priority    VARCHAR(10)  DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
        due_date    TIMESTAMPTZ,
        reminder_at TIMESTAMPTZ,
        notified    BOOLEAN      DEFAULT FALSE,
        created_at  TIMESTAMPTZ  DEFAULT NOW(),
        updated_at  TIMESTAMPTZ  DEFAULT NOW()
      );
    `);

    // Add new columns to existing installs (idempotent — ignores "column already exists")
    await client.query(`
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority  VARCHAR(10) DEFAULT 'medium';
    `);
    await client.query(`
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date  TIMESTAMPTZ;
    `);

    // ── Auto-update updated_at trigger ────────────────────────────────────────
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`DROP TRIGGER IF EXISTS tasks_updated_at ON tasks;`);
    await client.query(`
      CREATE TRIGGER tasks_updated_at
        BEFORE UPDATE ON tasks
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    `);

    console.log('✅ DB migration complete');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = migrate;
