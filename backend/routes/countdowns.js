const router      = require('express').Router();
const db          = require('../database/db');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

// Ensure source_type column exists (migration for existing DBs)
try { db.exec('ALTER TABLE countdowns ADD COLUMN source_type TEXT'); } catch {}

// GET /api/countdowns
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM countdowns WHERE user_id = ? ORDER BY target_date ASC
  `).all(req.user.id);
  res.json(rows);
});

// POST /api/countdowns
router.post('/', (req, res) => {
  const { title, target_date, description, icon, shared } = req.body;
  if (!title?.trim() || !target_date)
    return res.status(400).json({ error: 'title y target_date son obligatorios' });

  const result = db.prepare(`
    INSERT INTO countdowns (user_id, title, target_date, description, icon)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.user.id, title.trim(), target_date, description?.trim() || null, icon || '⏳');

  if (shared) {
    const me = db.prepare('SELECT coupled_user_id FROM users WHERE id = ?').get(req.user.id);
    if (me?.coupled_user_id) {
      db.prepare(`
        INSERT INTO countdowns (user_id, title, target_date, description, icon, source_type)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(me.coupled_user_id, title.trim(), target_date, description?.trim() || null, icon || '⏳', 'shared-from-partner');
    }
  }

  res.status(201).json({ id: result.lastInsertRowid, ok: true });
});

// PATCH /api/countdowns/:id
router.patch('/:id', (req, res) => {
  const allowed = ['title', 'target_date', 'description', 'icon'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  if (Object.keys(updates).length === 0)
    return res.status(400).json({ error: 'No hay campos para actualizar' });

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const info = db.prepare(`
    UPDATE countdowns SET ${setClauses} WHERE id = ? AND user_id = ?
  `).run(...Object.values(updates), Number(req.params.id), req.user.id);

  if (info.changes === 0) return res.status(404).json({ error: 'Cuenta regresiva no encontrada' });
  res.json({ ok: true });
});

// DELETE /api/countdowns/:id
router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM countdowns WHERE id = ? AND user_id = ?')
    .run(Number(req.params.id), req.user.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Cuenta regresiva no encontrada' });
  res.json({ ok: true });
});

module.exports = router;
