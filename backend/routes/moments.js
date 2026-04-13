const router      = require('express').Router();
const db          = require('../database/db');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

// GET /api/moments
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM moments WHERE user_id = ? ORDER BY date DESC, created_at DESC
  `).all(req.user.id);
  res.json(rows);
});

// POST /api/moments
router.post('/', (req, res) => {
  const { title, description, date, image, favorite } = req.body;
  if (!title?.trim() || !date)
    return res.status(400).json({ error: 'title y date son obligatorios' });

  const result = db.prepare(`
    INSERT INTO moments (user_id, title, description, date, image, favorite)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    req.user.id,
    title.trim(),
    description?.trim() || null,
    date,
    image || null,
    favorite ? 1 : 0
  );

  res.status(201).json({ id: result.lastInsertRowid, ok: true });
});

// PATCH /api/moments/:id
router.patch('/:id', (req, res) => {
  const allowed = ['title', 'description', 'date', 'image', 'favorite'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  if (Object.keys(updates).length === 0)
    return res.status(400).json({ error: 'No hay campos para actualizar' });

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const info = db.prepare(`
    UPDATE moments SET ${setClauses} WHERE id = ? AND user_id = ?
  `).run(...Object.values(updates), Number(req.params.id), req.user.id);

  if (info.changes === 0) return res.status(404).json({ error: 'Momento no encontrado' });
  res.json({ ok: true });
});

// DELETE /api/moments/:id
router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM moments WHERE id = ? AND user_id = ?')
    .run(Number(req.params.id), req.user.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Momento no encontrado' });
  res.json({ ok: true });
});

module.exports = router;
