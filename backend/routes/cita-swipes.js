const router      = require('express').Router();
const db          = require('../database/db');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

// ── GET /api/cita-swipes — all swipes for current user ────────────────────────
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT cita_id, action, swiped_at FROM cita_swipes WHERE user_id = ?
  `).all(req.user.id);

  res.json(rows);
});

// ── POST /api/cita-swipes — record a swipe (like or dislike) ─────────────────
router.post('/', (req, res) => {
  const { cita_id, action } = req.body;

  if (!cita_id || !action)
    return res.status(400).json({ error: 'cita_id y action son obligatorios' });

  if (!['like', 'dislike'].includes(action))
    return res.status(400).json({ error: 'action debe ser "like" o "dislike"' });

  db.prepare(`
    INSERT INTO cita_swipes (user_id, cita_id, action)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, cita_id) DO UPDATE SET action = excluded.action, swiped_at = datetime('now')
  `).run(req.user.id, Number(cita_id), action);

  res.status(201).json({ ok: true });
});

// ── DELETE /api/cita-swipes — reset all swipes (start over) ──────────────────
router.delete('/', (req, res) => {
  db.prepare('DELETE FROM cita_swipes WHERE user_id = ?').run(req.user.id);
  res.json({ ok: true });
});

// ── GET /api/cita-swipes/stats ────────────────────────────────────────────────
router.get('/stats', (req, res) => {
  const row = db.prepare(`
    SELECT
      SUM(action = 'like')    AS likes,
      SUM(action = 'dislike') AS dislikes
    FROM cita_swipes WHERE user_id = ?
  `).get(req.user.id);

  res.json(row);
});

// ─── Cita Preferences (personalized citas) ────────────────────────────────────

// GET /api/cita-swipes/preferences
router.get('/preferences', (req, res) => {
  const rows = db.prepare(`
    SELECT cita_id, preference FROM cita_preferences WHERE user_id = ?
  `).all(req.user.id);

  // Return as { [cita_id]: 'like' | 'dislike' }
  const map = {};
  rows.forEach(r => { map[r.cita_id] = r.preference; });
  res.json(map);
});

// POST /api/cita-swipes/preferences
router.post('/preferences', (req, res) => {
  const { cita_id, preference } = req.body;

  if (!cita_id || !preference)
    return res.status(400).json({ error: 'cita_id y preference son obligatorios' });

  if (!['like', 'dislike'].includes(preference))
    return res.status(400).json({ error: 'preference debe ser "like" o "dislike"' });

  db.prepare(`
    INSERT INTO cita_preferences (user_id, cita_id, preference)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, cita_id) DO UPDATE SET preference = excluded.preference, updated_at = datetime('now')
  `).run(req.user.id, Number(cita_id), preference);

  res.status(201).json({ ok: true });
});

// GET /api/cita-swipes/matches — citas liked by both current user and their coupled partner
router.get('/matches', (req, res) => {
  const me = db.prepare('SELECT coupled_user_id FROM users WHERE id = ?').get(req.user.id);
  if (!me?.coupled_user_id) return res.json([]);

  const rows = db.prepare(`
    SELECT cs1.cita_id
    FROM cita_swipes cs1
    INNER JOIN cita_swipes cs2 ON cs1.cita_id = cs2.cita_id
    WHERE cs1.user_id = ? AND cs2.user_id = ?
      AND cs1.action = 'like' AND cs2.action = 'like'
    ORDER BY cs1.swiped_at DESC
  `).all(req.user.id, me.coupled_user_id);

  res.json(rows.map(r => r.cita_id));
});

module.exports = router;
