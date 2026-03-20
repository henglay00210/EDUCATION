const { Pool } = require("pg");

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
      }
    : {
        host: process.env.PGHOST || "localhost",
        port: Number(process.env.PGPORT || 5432),
        database: process.env.PGDATABASE || "education_app",
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD || "postgres",
      }
);

async function query(text, params) {
  const startTime = Date.now();

  try {
    const result = await pool.query(text, params);

    if (`${process.env.LOG_SQL || ""}`.toLowerCase() === "true") {
      const durationMs = Date.now() - startTime;
      const parameterSummary = Array.isArray(params)
        ? params.map(() => "?")
        : [];

      console.info("info: Database.Command[20101]");
      console.info(
        `      Executed DbCommand (${durationMs}ms) [Parameters=[${parameterSummary
          .map((p, i) => `@p${i}='${p}'`)
          .join(", ")}], CommandType='Text', CommandTimeout='30']`
      );
      console.info("");
      console.info(
        text
          .trim()
          .split("\n")
          .map((line) => `      ${line}`)
          .join("\n")
      );
    }

    return result;
  } catch (error) {
    if (`${process.env.LOG_SQL || ""}`.toLowerCase() === "true") {
      const durationMs = Date.now() - startTime;
      console.info("fail: Database.Command[20102]");
      console.info(
        `      Failed DbCommand (${durationMs}ms) [CommandType='Text', CommandTimeout='30']`
      );
      console.info(error.message);
    }

    throw error;
  }
}

async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      avatar TEXT DEFAULT 'https://via.placeholder.com/150?text=Avatar',
      bio TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      role TEXT NOT NULL DEFAULT 'student',
      reset_password_otp TEXT,
      reset_password_otp_expires TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE,
      description TEXT NOT NULL,
      long_description TEXT DEFAULT '',
      category TEXT NOT NULL,
      level TEXT DEFAULT 'Beginner',
      duration TEXT DEFAULT '4 weeks',
      price NUMERIC(10,2) DEFAULT 0,
      discount_price NUMERIC(10,2),
      rating NUMERIC(3,2) DEFAULT 4.5,
      thumbnail TEXT DEFAULT 'https://via.placeholder.com/300x200?text=Course',
      instructor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      enrolled_students INTEGER DEFAULT 0,
      reviews INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      enrolled_date TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (user_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS payment_transactions (
      id SERIAL PRIMARY KEY,
      transaction_id TEXT NOT NULL UNIQUE,
      provider TEXT NOT NULL DEFAULT 'bakong-khqr',
      course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
      amount NUMERIC(10,2) NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'pending',
      provider_payment_id TEXT,
      khqr_payload TEXT,
      metadata JSONB,
      paid_at TIMESTAMPTZ,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_payment_transactions_status
      ON payment_transactions(status);

    CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at
      ON payment_transactions(created_at DESC);
  `);

  await query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS auth_provider TEXT NOT NULL DEFAULT 'local';

    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS google_sub TEXT UNIQUE;

    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
  `);
}

module.exports = {
  pool,
  query,
  initDb,
};
