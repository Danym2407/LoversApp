const router     = require('express').Router();
const db         = require('../database/db');
const requireAdmin = require('../middleware/adminAuth');

router.use(requireAdmin);

// ── Stats globales ─────────────────────────────────────────────────────────────
router.get('/stats', (_req, res) => {
  const users          = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  const letters        = db.prepare('SELECT COUNT(*) AS n FROM letters').get().n;
  const moments        = db.prepare('SELECT COUNT(*) AS n FROM moments').get().n;
  const challengesDone = db.prepare("SELECT COUNT(*) AS n FROM challenges WHERE completed = 1").get().n;
  const datesDone      = db.prepare("SELECT COUNT(*) AS n FROM couple_dates WHERE status = 'completed'").get().n;
  const swipes         = db.prepare('SELECT COUNT(*) AS n FROM cita_swipes').get().n;
  const calendarEvents = db.prepare('SELECT COUNT(*) AS n FROM calendar_events').get().n;
  const countdowns     = db.prepare('SELECT COUNT(*) AS n FROM countdowns').get().n;

  res.json({ users, letters, moments, challengesDone, datesDone, swipes, calendarEvents, countdowns });
});

// ── Lista de usuarios ──────────────────────────────────────────────────────────
router.get('/users', (_req, res) => {
  const users = db.prepare(`
    SELECT id, email, name, partner_name, partner_code, coupled_user_id,
           relationship_start_date, boyfriend_date, created_at, last_login
    FROM users
    ORDER BY created_at DESC
  `).all();

  // Add per-user counts
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
           personality_test, created_at, last_login
    FROM users WHERE id = ?
  `).get(req.params.id);

  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(user);
});

// ── Eliminar usuario y todos sus datos ────────────────────────────────────────
router.delete('/users/:id', (req, res) => {
  const id = req.params.id;
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const tables = [
    'cita_swipes', 'cita_preferences', 'letters', 'moments', 'challenges',
    'calendar_events', 'timeline_events', 'important_dates', 'countdowns',
    'couple_dates',
  ];
  const del = db.transaction(() => {
    tables.forEach(t => db.prepare(`DELETE FROM ${t} WHERE user_id = ?`).run(id));
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
  });
  del();
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

module.exports = router;
