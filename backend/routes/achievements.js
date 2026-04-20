const express      = require('express');
const router       = express.Router();
const db           = require('../database/db');
const requireAuth  = require('../middleware/auth');

// ── Achievement catalog ─────────────────────────────────────────────────────
// Progress is always derived live from the DB; only "unlocked" flags are stored.

const CATALOG = [
  // days_together
  { id: 'first_week',   title: 'Primera Semana',    description: '7 días juntos',            type: 'days_together', target: 7,   icon: '🌱' },
  { id: 'first_month',  title: 'Primer Mes',         description: '30 días juntos',           type: 'days_together', target: 30,  icon: '🌸' },
  { id: 'three_months', title: 'Tres Meses',          description: '90 días juntos',           type: 'days_together', target: 90,  icon: '💐' },
  { id: 'six_months',   title: 'Medio Año',           description: '180 días juntos',          type: 'days_together', target: 180, icon: '🌺' },
  { id: 'one_year',     title: 'Un Año',              description: '365 días juntos',          type: 'days_together', target: 365, icon: '🎉' },
  { id: 'two_years',    title: 'Dos Años',            description: '730 días juntos',          type: 'days_together', target: 730, icon: '💎' },
  // citas completed
  { id: 'first_cita',   title: 'Primera Cita',        description: 'Completa tu primera cita', type: 'citas',         target: 1,   icon: '💑' },
  { id: 'citas_5',      title: '5 Citas',             description: '5 citas completadas',      type: 'citas',         target: 5,   icon: '⭐' },
  { id: 'citas_10',     title: '10 Citas',            description: '10 citas completadas',     type: 'citas',         target: 10,  icon: '🔥' },
  { id: 'citas_25',     title: '25 Citas',            description: '25 citas completadas',     type: 'citas',         target: 25,  icon: '🚀' },
  { id: 'citas_50',     title: '50 Citas',            description: '50 citas completadas',     type: 'citas',         target: 50,  icon: '🏆' },
  { id: 'citas_100',    title: '100 Citas',           description: '¡Meta completada!',        type: 'citas',         target: 100, icon: '👑' },
  // experiencia (letters + moments combined)
  { id: 'first_letter', title: 'Primera Carta',       description: 'Escribe tu primera carta', type: 'experiencia',   target: 1,   icon: '💌' },
  { id: 'letters_5',    title: '5 Cartas',            description: '5 cartas escritas',        type: 'experiencia',   target: 5,   icon: '✍️'  },
  { id: 'first_moment', title: 'Primer Recuerdo',     description: 'Registra un momento',      type: 'experiencia',   target: 1,   icon: '📸' },
  { id: 'moments_10',   title: '10 Recuerdos',        description: '10 momentos registrados',  type: 'experiencia',   target: 10,  icon: '🎞️'  },
];

// ── Seed catalog into DB (idempotent) ────────────────────────────────────────
const insertAch = db.prepare(
  `INSERT OR IGNORE INTO achievements (id, title, description, type, target, icon)
   VALUES (@id, @title, @description, @type, @target, @icon)`
);
const seedCatalog = db.transaction(() => {
  for (const a of CATALOG) insertAch.run(a);
});
seedCatalog();

// ── Runtime migration: create tables if they don't exist yet ─────────────────
// (for servers started before the schema update)
db.exec(`
  CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL,
    type TEXT NOT NULL, target INTEGER NOT NULL, icon TEXT
  );
  CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, achievement_id)
  );
  CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
`);

// ── Helper: days between two ISO-date strings ────────────────────────────────
function daysBetween(dateStr) {
  if (!dateStr) return 0;
  const [y, m, d] = dateStr.split('-').map(Number);
  const diff = Date.now() - new Date(y, m - 1, d).getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
}

// ── Prepared statements ───────────────────────────────────────────────────────
const stmtAlreadyUnlocked = db.prepare(
  `SELECT 1 FROM user_achievements WHERE user_id = ? AND achievement_id = ? LIMIT 1`
);
const stmtInsertUnlock = db.prepare(
  `INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)`
);
const stmtUnlockDate = db.prepare(
  `SELECT unlocked_at FROM user_achievements WHERE user_id = ? AND achievement_id = ?`
);

// ── calculateAchievements(userId) ────────────────────────────────────────────
//
// Returns an array of achievement objects with live progress + unlock state.
// Inserts into user_achievements if newly unlocked (exactly once, no duplicates).

function calculateAchievements(userId) {
  // Load user + optional partner
  const user = db.prepare(`SELECT id, relationship_start_date, coupled_user_id FROM users WHERE id = ?`).get(userId);
  if (!user) return [];

  const partnerIds = [userId];
  if (user.coupled_user_id) partnerIds.push(user.coupled_user_id);

  const placeholders = partnerIds.map(() => '?').join(',');

  // ── Progress values ────────────────────────────────────────────────────────
  const daysTogether = daysBetween(user.relationship_start_date);

  const { citas_count } = db.prepare(
    `SELECT COUNT(*) AS citas_count FROM cita_completions WHERE user_id IN (${placeholders})`
  ).get(...partnerIds);

  const { letters_count } = db.prepare(
    `SELECT COUNT(*) AS letters_count FROM letters WHERE user_id IN (${placeholders})`
  ).get(...partnerIds);

  const { moments_count } = db.prepare(
    `SELECT COUNT(*) AS moments_count FROM moments WHERE user_id IN (${placeholders})`
  ).get(...partnerIds);

  // ── Evaluate each achievement ──────────────────────────────────────────────
  const results = [];

  for (const ach of CATALOG) {
    let progress = 0;

    if (ach.type === 'days_together')  progress = daysTogether;
    else if (ach.type === 'citas')     progress = citas_count;
    else if (ach.type === 'experiencia') {
      if (ach.id.startsWith('first_letter') || ach.id.startsWith('letters'))
        progress = letters_count;
      else
        progress = moments_count;
    }

    const unlocked = progress >= ach.target;

    // Insert unlock (ONCE — OR IGNORE handles duplicates at DB level; SELECT guards the round-trip)
    if (unlocked && !stmtAlreadyUnlocked.get(userId, ach.id)) {
      stmtInsertUnlock.run(userId, ach.id);
    }

    const unlockRow = stmtUnlockDate.get(userId, ach.id);

    results.push({
      id:          ach.id,
      title:       ach.title,
      description: ach.description,
      type:        ach.type,
      icon:        ach.icon,
      target:      ach.target,
      progress:    Math.min(progress, ach.target),
      unlocked,
      unlocked_at: unlockRow?.unlocked_at ?? null,
    });
  }

  return results;
}

// ── GET /api/achievements ─────────────────────────────────────────────────────
router.get('/', requireAuth, (req, res) => {
  try {
    const achievements = calculateAchievements(req.user.id);
    res.json(achievements);
  } catch (err) {
    console.error('[achievements] GET error:', err);
    res.status(500).json({ error: 'Error al cargar logros' });
  }
});

module.exports = router;
