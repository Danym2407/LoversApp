const router      = require('express').Router();
const db          = require('../database/db');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

// GET /api/important-dates
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM important_dates WHERE user_id = ? ORDER BY date ASC
  `).all(req.user.id);
  res.json(rows);
});

// POST /api/important-dates
router.post('/', (req, res) => {
  const { title, date, icon, description, recurring } = req.body;
  if (!title?.trim() || !date)
    return res.status(400).json({ error: 'title y date son obligatorios' });

  const result = db.prepare(`
    INSERT INTO important_dates (user_id, title, date, icon, description, recurring)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.user.id, title.trim(), date, icon || '📅', description?.trim() || null, recurring !== false ? 1 : 0);

  res.status(201).json({ id: result.lastInsertRowid, ok: true });
});

// PATCH /api/important-dates/:id
router.patch('/:id', (req, res) => {
  const allowed = ['title', 'date', 'icon', 'description', 'recurring'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  if (Object.keys(updates).length === 0)
    return res.status(400).json({ error: 'No hay campos para actualizar' });

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const info = db.prepare(`
    UPDATE important_dates SET ${setClauses} WHERE id = ? AND user_id = ?
  `).run(...Object.values(updates), Number(req.params.id), req.user.id);

  if (info.changes === 0) return res.status(404).json({ error: 'Fecha no encontrada' });
  res.json({ ok: true });
});

// DELETE /api/important-dates/:id
router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM important_dates WHERE id = ? AND user_id = ?')
    .run(Number(req.params.id), req.user.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Fecha no encontrada' });
  res.json({ ok: true });
});

module.exports = router;
