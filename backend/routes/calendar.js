const router      = require('express').Router();
const db          = require('../database/db');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

// GET /api/calendar
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM calendar_events WHERE user_id = ? ORDER BY date ASC
  `).all(req.user.id);
  res.json(rows);
});

// POST /api/calendar
router.post('/', (req, res) => {
  const { title, date, type, color, source_id, source_type, shared } = req.body;
  if (!title?.trim() || !date)
    return res.status(400).json({ error: 'title y date son obligatorios' });

  const result = db.prepare(`
    INSERT INTO calendar_events (user_id, title, date, type, color, source_id, source_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, title.trim(), date, type || 'custom', color || null, source_id || null, source_type || 'manual');

  if (shared) {
    const me = db.prepare('SELECT coupled_user_id FROM users WHERE id = ?').get(req.user.id);
    if (me?.coupled_user_id) {
      db.prepare(`
        INSERT INTO calendar_events (user_id, title, date, type, color, source_id, source_type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(me.coupled_user_id, title.trim(), date, type || 'custom', color || null, result.lastInsertRowid, 'shared-from-partner');
    }
  }

  res.status(201).json({ id: result.lastInsertRowid, ok: true });
});

// PATCH /api/calendar/:id
router.patch('/:id', (req, res) => {
  const allowed = ['title', 'date', 'type', 'color'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  if (Object.keys(updates).length === 0)
    return res.status(400).json({ error: 'No hay campos para actualizar' });

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const info = db.prepare(`
    UPDATE calendar_events SET ${setClauses} WHERE id = ? AND user_id = ?
  `).run(...Object.values(updates), Number(req.params.id), req.user.id);

  if (info.changes === 0) return res.status(404).json({ error: 'Evento no encontrado' });
  res.json({ ok: true });
});

// DELETE /api/calendar/:id
router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM calendar_events WHERE id = ? AND user_id = ?')
    .run(Number(req.params.id), req.user.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Evento no encontrado' });
  res.json({ ok: true });
});

module.exports = router;
