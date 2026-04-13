const router      = require('express').Router();
const db          = require('../database/db');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

// ── GET /api/couple-dates — all 100 dates for current user ───────────────────
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM couple_dates WHERE user_id = ? ORDER BY date_item_id ASC
  `).all(req.user.id);

  res.json(rows);
});

// ── GET /api/couple-dates/:itemId ─────────────────────────────────────────────
router.get('/:itemId', (req, res) => {
  const row = db.prepare(`
    SELECT * FROM couple_dates WHERE user_id = ? AND date_item_id = ?
  `).get(req.user.id, Number(req.params.itemId));

  if (!row) return res.status(404).json({ error: 'Cita no encontrada' });
  res.json(row);
});

// ── PATCH /api/couple-dates/:itemId — update status / reviews / ratings ───────
router.patch('/:itemId', (req, res) => {
  const allowed = [
    'status', 'scheduled_date', 'location', 'liked',
    'p1_hearts', 'p1_stars', 'p1_review', 'p1_one_word', 'p1_best_part',
    'p2_hearts', 'p2_stars', 'p2_review', 'p2_one_word', 'p2_best_part',
  ];

  const updates = {};
  allowed.forEach(key => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  if (Object.keys(updates).length === 0)
    return res.status(400).json({ error: 'No hay campos para actualizar' });

  updates.updated_at = new Date().toISOString();

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values     = [...Object.values(updates), req.user.id, Number(req.params.itemId)];

  const info = db.prepare(`
    UPDATE couple_dates SET ${setClauses}
    WHERE user_id = ? AND date_item_id = ?
  `).run(...values);

  if (info.changes === 0) return res.status(404).json({ error: 'Cita no encontrada' });

  res.json({ ok: true });
});

// ── GET /api/couple-dates/stats/summary ──────────────────────────────────────
router.get('/stats/summary', (req, res) => {
  const row = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(status = 'completed') AS completed,
      SUM(status = 'pending')   AS pending,
      SUM(liked = 1)            AS liked
    FROM couple_dates WHERE user_id = ?
  `).get(req.user.id);

  res.json(row);
});

module.exports = router;
