const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Always use an absolute path so the DB is found regardless of process cwd.
// DB_PATH from .env is intentionally ignored — it was a relative path that
// caused a new empty database to be created when cwd != backend/.
const DB_PATH = path.join(__dirname, 'loversapp.db');

console.log('[DB] Base de datos:', DB_PATH);

// Ensure the directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Performance pragmas
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Run schema on first start (idempotent — all statements use IF NOT EXISTS)
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// Migrations — add columns introduced after initial DB deployment (idempotent)
const migrations = [
  'ALTER TABLE moments ADD COLUMN source_id   INTEGER',
  'ALTER TABLE moments ADD COLUMN source_type TEXT',
];
for (const m of migrations) {
  try { db.exec(m); } catch { /* column already exists — safe to ignore */ }
}

module.exports = db;
