const router       = require('express').Router();
const db           = require('../database/db');
const requireAdmin = require('../middleware/adminAuth');

// ── DB Migrations (idempotent) ────────────────────────────────────────────────
try { db.prepare("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'").run(); } catch {}
try { db.prepare('ALTER TABLE users ADD COLUMN is_deleted INTEGER NOT NULL DEFAULT 0').run(); } catch {}
try { db.prepare('ALTER TABLE users ADD COLUMN deleted_at TEXT').run(); } catch {}
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_logs (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    action     TEXT    NOT NULL,
    entity     TEXT    NOT NULL,
    entity_id  TEXT,
    metadata   TEXT,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at);
  CREATE INDEX IF NOT EXISTS idx_admin_logs_entity  ON admin_logs(entity, entity_id);
`);

router.use(requireAdmin);

// ── Audit helper ──────────────────────────────────────────────────────────────
const auditStmt = db.prepare(
  'INSERT INTO admin_logs (action, entity, entity_id, metadata) VALUES (?, ?, ?, ?)'
);
function audit(action, entity, entityId, metadata = null) {
  try {
    auditStmt.run(action, entity, String(entityId ?? ''), metadata ? JSON.stringify(metadata) : null);
  } catch {}
}

// ── Stats globales ─────────────────────────────────────────────────────────────
router.get('/stats', (_req, res) => {
  const users          = db.prepare('SELECT COUNT(*) AS n FROM users WHERE is_deleted = 0').get().n;
  const deletedUsers   = db.prepare('SELECT COUNT(*) AS n FROM users WHERE is_deleted = 1').get().n;
  const letters        = db.prepare('SELECT COUNT(*) AS n FROM letters').get().n;
  const moments        = db.prepare('SELECT COUNT(*) AS n FROM moments').get().n;
  const challengesDone = db.prepare("SELECT COUNT(*) AS n FROM challenges WHERE completed = 1").get().n;
  const datesDone      = db.prepare("SELECT COUNT(*) AS n FROM couple_dates WHERE status = 'completed'").get().n;
  const swipes         = db.prepare('SELECT COUNT(*) AS n FROM cita_swipes').get().n;
  const calendarEvents = db.prepare('SELECT COUNT(*) AS n FROM calendar_events').get().n;
  const countdowns     = db.prepare('SELECT COUNT(*) AS n FROM countdowns').get().n;
  const totalLogs      = db.prepare('SELECT COUNT(*) AS n FROM admin_logs').get().n;
  const recentSignups  = db.prepare(
    "SELECT COUNT(*) AS n FROM users WHERE is_deleted = 0 AND created_at >= datetime('now', '-7 days')"
  ).get().n;

  res.json({ users, deletedUsers, letters, moments, challengesDone, datesDone, swipes, calendarEvents, countdowns, totalLogs, recentSignups });
});

// ── Lista de usuarios ──────────────────────────────────────────────────────────
router.get('/users', (req, res) => {
  const showDeleted = req.query.deleted === '1';
  const search      = req.query.search ? `%${req.query.search}%` : null;

  let q = `
    SELECT id, email, name, partner_name, partner_code, coupled_user_id,
           relationship_start_date, boyfriend_date, created_at, last_login,
           role, is_deleted, deleted_at, email_verified
    FROM users WHERE is_deleted = ${showDeleted ? 1 : 0}
  `;
  const params = [];
  if (search) {
    q += ' AND (name LIKE ? OR email LIKE ?)';
    params.push(search, search);
  }
  q += ' ORDER BY created_at DESC';

  const users = db.prepare(q).all(...params);

  const stmtLetters    = db.prepare('SELECT COUNT(*) AS n FROM letters    WHERE user_id = ?');
  const stmtMoments    = db.prepare('SELECT COUNT(*) AS n FROM moments    WHERE user_id = ?');
  const stmtChallenges = db.prepare("SELECT COUNT(*) AS n FROM challenges WHERE user_id = ? AND completed = 1");
  const stmtDates      = db.prepare("SELECT COUNT(*) AS n FROM couple_dates WHERE user_id = ? AND status = 'completed'");
  const stmtSwipes     = db.prepare('SELECT COUNT(*) AS n FROM cita_swipes  WHERE user_id = ?');

  const enriched = users.map(u => ({
    ...u,
    counts: {
      letters:    stmtLetters.get(u.id).n,
      moments:    stmtMoments.get(u.id).n,
      challenges: stmtChallenges.get(u.id).n,
      dates:      stmtDates.get(u.id).n,
      swipes:     stmtSwipes.get(u.id).n,
    },
  }));

  res.json(enriched);
});

// ── Perfil completo de un usuario ─────────────────────────────────────────────
router.get('/users/:id', (req, res) => {
  const user = db.prepare(`
    SELECT id, email, name, partner_name, partner_code, coupled_user_id,
           relationship_start_date, boyfriend_date, greeting_message,
           personality_test, created_at, last_login, role, is_deleted, deleted_at, email_verified
    FROM users WHERE id = ?
  `).get(req.params.id);

  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(user);
});

// ── Cambiar rol de usuario ─────────────────────────────────────────────────────
router.patch('/users/:id/role', (req, res) => {
  const { role } = req.body;
  const VALID = ['user', 'moderator', 'admin'];
  if (!VALID.includes(role))
    return res.status(400).json({ error: 'Rol inválido. Valores: user, moderator, admin' });

  const user = db.prepare('SELECT id, name, role FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  audit('role_changed', 'users', req.params.id, { from: user.role, to: role, name: user.name });
  res.json({ ok: true, role });
});

// ── Soft-delete usuario ────────────────────────────────────────────────────────
router.delete('/users/:id', (req, res) => {
  const id   = req.params.id;
  const user = db.prepare('SELECT id, name, email FROM users WHERE id = ? AND is_deleted = 0').get(id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  db.prepare("UPDATE users SET is_deleted = 1, deleted_at = datetime('now') WHERE id = ?").run(id);
  audit('user_soft_deleted', 'users', id, { name: user.name, email: user.email });
  res.json({ ok: true });
});

// ── Restaurar usuario ─────────────────────────────────────────────────────────
router.post('/users/:id/restore', (req, res) => {
  const id   = req.params.id;
  const user = db.prepare('SELECT id, name, email FROM users WHERE id = ? AND is_deleted = 1').get(id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado o no está eliminado' });

  db.prepare('UPDATE users SET is_deleted = 0, deleted_at = NULL WHERE id = ?').run(id);
  audit('user_restored', 'users', id, { name: user.name, email: user.email });
  res.json({ ok: true });
});

// ── Hard-delete permanente (requiere confirmación) ────────────────────────────
router.delete('/users/:id/hard', (req, res) => {
  const { confirm } = req.body;
  if (confirm !== 'DELETE_PERMANENTLY')
    return res.status(400).json({ error: "confirm debe ser 'DELETE_PERMANENTLY'" });

  const id   = req.params.id;
  const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const tables = [
    'cita_swipes', 'cita_preferences', 'letters', 'moments', 'challenges',
    'calendar_events', 'timeline_events', 'important_dates', 'countdowns',
    'couple_dates', 'cita_completions', 'user_achievements', 'game_interactions',
  ];
  db.transaction(() => {
    tables.forEach(t => db.prepare(`DELETE FROM ${t} WHERE user_id = ?`).run(id));
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
  })();
  audit('user_hard_deleted', 'users', id, { name: user.name, email: user.email });
  res.json({ ok: true });
});

// ── Datos por usuario ──────────────────────────────────────────────────────────
router.get('/users/:id/couple-dates', (req, res) => {
  res.json(db.prepare('SELECT * FROM couple_dates WHERE user_id = ? ORDER BY date_item_id').all(req.params.id));
});

router.get('/users/:id/letters', (req, res) => {
  res.json(db.prepare('SELECT * FROM letters WHERE user_id = ? ORDER BY created_at DESC').all(req.params.id));
});

router.get('/users/:id/moments', (req, res) => {
  res.json(db.prepare('SELECT * FROM moments WHERE user_id = ? ORDER BY created_at DESC').all(req.params.id));
});

router.get('/users/:id/challenges', (req, res) => {
  res.json(db.prepare('SELECT * FROM challenges WHERE user_id = ? ORDER BY type, challenge_id').all(req.params.id));
});

router.get('/users/:id/calendar', (req, res) => {
  res.json(db.prepare('SELECT * FROM calendar_events WHERE user_id = ? ORDER BY date').all(req.params.id));
});

router.get('/users/:id/timeline', (req, res) => {
  res.json(db.prepare('SELECT * FROM timeline_events WHERE user_id = ? ORDER BY date DESC').all(req.params.id));
});

router.get('/users/:id/swipes', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) AS n FROM cita_swipes WHERE user_id = ?').get(req.params.id).n;
  const likes = db.prepare("SELECT COUNT(*) AS n FROM cita_swipes WHERE user_id = ? AND action = 'like'").get(req.params.id).n;
  const rows  = db.prepare('SELECT * FROM cita_swipes WHERE user_id = ? ORDER BY swiped_at DESC').all(req.params.id);
  res.json({ total, likes, dislikes: total - likes, rows });
});

router.get('/users/:id/important-dates', (req, res) => {
  res.json(db.prepare('SELECT * FROM important_dates WHERE user_id = ? ORDER BY date').all(req.params.id));
});

router.get('/users/:id/countdowns', (req, res) => {
  res.json(db.prepare('SELECT * FROM countdowns WHERE user_id = ? ORDER BY target_date').all(req.params.id));
});

// ── Audit Logs ─────────────────────────────────────────────────────────────────
router.get('/logs', (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit  || '100', 10), 500);
  const offset = parseInt(req.query.offset || '0', 10);
  const action = req.query.action || '';
  const entity = req.query.entity || '';

  let q = 'SELECT * FROM admin_logs WHERE 1=1';
  const params = [];
  if (action) { q += ' AND action = ?';  params.push(action); }
  if (entity) { q += ' AND entity = ?';  params.push(entity); }
  q += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const logs  = db.prepare(q).all(...params);
  const total = db.prepare('SELECT COUNT(*) AS n FROM admin_logs').get().n;
  res.json({ logs, total, limit, offset });
});

// ── Database Manager ──────────────────────────────────────────────────────────
const ALLOWED_TABLES = new Set([
  'citas', 'cita_swipes', 'cita_preferences', 'cita_completions',
  'couple_dates', 'letters', 'moments', 'challenges',
  'calendar_events', 'timeline_events', 'important_dates',
  'countdowns', 'achievements', 'user_achievements', 'game_interactions',
]);

router.get('/tables', (_req, res) => {
  const tables = [...ALLOWED_TABLES].map(name => {
    try { return { name, count: db.prepare(`SELECT COUNT(*) AS n FROM ${name}`).get().n }; }
    catch { return { name, count: 0 }; }
  });
  res.json(tables);
});

router.get('/tables/:table', (req, res) => {
  const { table } = req.params;
  if (!ALLOWED_TABLES.has(table))
    return res.status(403).json({ error: 'Tabla no permitida' });

  const limit  = Math.min(parseInt(req.query.limit  || '50', 10), 200);
  const offset = parseInt(req.query.offset || '0', 10);
  const search = req.query.search || '';

  const total   = db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();

  let q = `SELECT * FROM ${table}`;
  const params = [];
  if (search) {
    q += ' WHERE CAST(id AS TEXT) LIKE ?';
    params.push(`%${search}%`);
  }
  q += ' ORDER BY id DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  res.json({ rows: db.prepare(q).all(...params), total, columns, limit, offset });
});

router.patch('/tables/:table/:id', (req, res) => {
  const { table, id } = req.params;
  if (!ALLOWED_TABLES.has(table))
    return res.status(403).json({ error: 'Tabla no permitida' });

  const { field, value } = req.body;
  if (!field || typeof field !== 'string')
    return res.status(400).json({ error: 'field requerido' });

  const columns   = db.prepare(`PRAGMA table_info(${table})`).all();
  const validCol  = columns.find(c => c.name === field);
  if (!validCol) return res.status(400).json({ error: 'Campo inválido' });
  if (['id', 'user_id'].includes(field))
    return res.status(400).json({ error: 'No se puede editar este campo' });

  db.prepare(`UPDATE ${table} SET ${field} = ? WHERE id = ?`).run(value, id);
  audit('db_row_updated', table, id, { field, value: String(value).slice(0, 100) });
  res.json({ ok: true });
});

router.delete('/tables/:table/:id', (req, res) => {
  const { table, id } = req.params;
  if (!ALLOWED_TABLES.has(table))
    return res.status(403).json({ error: 'Tabla no permitida' });

  const existing = db.prepare(`SELECT id FROM ${table} WHERE id = ?`).get(id);
  if (!existing) return res.status(404).json({ error: 'Registro no encontrado' });

  db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
  audit('db_row_deleted', table, id);
  res.json({ ok: true });
});

module.exports = router;
