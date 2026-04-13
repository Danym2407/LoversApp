const router      = require('express').Router();
const db          = require('../database/db');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

// Ensure to_user_id column exists (migration for existing DBs)
try {
  db.exec('ALTER TABLE letters ADD COLUMN to_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE');
  db.exec('ALTER TABLE letters ADD COLUMN read_at    TEXT');
} catch {}

// GET /api/letters — own letters sent
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM letters WHERE user_id = ? ORDER BY created_at DESC
  `).all(req.user.id);
  res.json(rows);
});

// GET /api/letters/received — letters sent TO the current user by their partner
router.get('/received', (req, res) => {
  const rows = db.prepare(`
    SELECT l.*, u.name as sender_name
    FROM letters l
    JOIN users u ON u.id = l.user_id
    WHERE l.to_user_id = ?
    ORDER BY l.created_at DESC
  `).all(req.user.id);
  res.json(rows);
});

// PATCH /api/letters/:id/read — mark a received letter as read
router.patch('/:id/read', (req, res) => {
  db.prepare(`UPDATE letters SET read_at = datetime('now') WHERE id = ? AND to_user_id = ?`)
    .run(Number(req.params.id), req.user.id);
  res.json({ ok: true });
});

// POST /api/letters
router.post('/', (req, res) => {
  const { from_name, title, content, favorite } = req.body;
  if (!title?.trim() || !content?.trim())
    return res.status(400).json({ error: 'title y content son obligatorios' });

  // Automatically send to coupled partner if one exists
  const me = db.prepare('SELECT coupled_user_id, name FROM users WHERE id = ?').get(req.user.id);
  const toUserId = me?.coupled_user_id || null;
  const senderName = from_name?.trim() || me?.name || 'Tú';

  const result = db.prepare(`
    INSERT INTO letters (user_id, to_user_id, from_name, title, content, favorite)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.user.id, toUserId, senderName, title.trim(), content.trim(), favorite ? 1 : 0);

  res.status(201).json({ id: result.lastInsertRowid, ok: true, sent_to_partner: !!toUserId });
});

// PATCH /api/letters/:id
router.patch('/:id', (req, res) => {
  const allowed = ['from_name', 'title', 'content', 'favorite'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  if (Object.keys(updates).length === 0)
    return res.status(400).json({ error: 'No hay campos para actualizar' });

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const info = db.prepare(`
    UPDATE letters SET ${setClauses} WHERE id = ? AND user_id = ?
  `).run(...Object.values(updates), Number(req.params.id), req.user.id);

  if (info.changes === 0) return res.status(404).json({ error: 'Carta no encontrada' });
  res.json({ ok: true });
});

// DELETE /api/letters/:id
router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM letters WHERE id = ? AND user_id = ?')
    .run(Number(req.params.id), req.user.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Carta no encontrada' });
  res.json({ ok: true });
});

module.exports = router;
