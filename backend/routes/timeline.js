const router      = require('express').Router();
const db          = require('../database/db');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

// GET /api/timeline
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM timeline_events WHERE user_id = ? ORDER BY date DESC
  `).all(req.user.id);
  res.json(rows);
});

// POST /api/timeline
router.post('/', (req, res) => {
  const { title, description, date, type, source_id, source_type } = req.body;
  if (!title?.trim() || !date)
    return res.status(400).json({ error: 'title y date son obligatorios' });

  const result = db.prepare(`
    INSERT INTO timeline_events (user_id, title, description, date, type, source_id, source_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.user.id, title.trim(), description?.trim() || null,
    date, type || 'manual', source_id || null, source_type || 'manual'
  );

  res.status(201).json({ id: result.lastInsertRowid, ok: true });
});

// PATCH /api/timeline/:id
router.patch('/:id', (req, res) => {
  const allowed = ['title', 'description', 'date', 'type'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  if (Object.keys(updates).length === 0)
    return res.status(400).json({ error: 'No hay campos para actualizar' });

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const info = db.prepare(`
    UPDATE timeline_events SET ${setClauses} WHERE id = ? AND user_id = ?
  `).run(...Object.values(updates), Number(req.params.id), req.user.id);

  if (info.changes === 0) return res.status(404).json({ error: 'Evento no encontrado' });
  res.json({ ok: true });
});

// DELETE /api/timeline/:id
router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM timeline_events WHERE id = ? AND user_id = ?')
    .run(Number(req.params.id), req.user.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Evento no encontrado' });
  res.json({ ok: true });
});

module.exports = router;
