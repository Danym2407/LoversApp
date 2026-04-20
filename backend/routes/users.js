const router      = require('express').Router();
const db          = require('../database/db');
const requireAuth = require('../middleware/auth');

// All routes require auth
router.use(requireAuth);

// ── GET /api/users/me ─────────────────────────────────────────────────────────
router.get('/me', (req, res) => {
  const user = db.prepare(`
    SELECT id, email, name, partner_name, partner_code,
           coupled_user_id, relationship_start_date, boyfriend_date,
           greeting_message, greeting_subtext, personality_test, created_at, last_login
    FROM users WHERE id = ?
  `).get(req.user.id);

  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  // Parse personality_test JSON if stored
  if (user.personality_test) {
    try { user.personality_test = JSON.parse(user.personality_test); } catch {}
  }

  res.json(user);
});

// ── PATCH /api/users/me ───────────────────────────────────────────────────────
router.patch('/me', (req, res) => {
  const allowed = [
    'name', 'partner_name', 'relationship_start_date', 'boyfriend_date',
    'greeting_message', 'greeting_subtext', 'personality_test',
  ];

  const updates = {};
  allowed.forEach(key => {
    if (req.body[key] !== undefined) {
      updates[key] = key === 'personality_test'
        ? JSON.stringify(req.body[key])
        : req.body[key];
    }
  });

  if (Object.keys(updates).length === 0)
    return res.status(400).json({ error: 'No hay campos para actualizar' });

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values     = [...Object.values(updates), req.user.id];

  db.prepare(`UPDATE users SET ${setClauses} WHERE id = ?`).run(...values);

  res.json({ ok: true });
});

// ── GET /api/users/partner-greeting — get coupled partner's greeting message ──
router.get('/partner-greeting', (req, res) => {
  const me = db.prepare('SELECT coupled_user_id FROM users WHERE id = ?').get(req.user.id);
  if (!me?.coupled_user_id) return res.json({});

  const partner = db.prepare('SELECT greeting_message, greeting_subtext FROM users WHERE id = ?')
    .get(me.coupled_user_id);
  res.json(partner || {});
});

// ── POST /api/users/couple — link two users via partner code ──────────────────
router.post('/couple', (req, res) => {
  const { partner_code } = req.body;
  if (!partner_code)
    return res.status(400).json({ error: 'partner_code es obligatorio' });

  const partner = db.prepare('SELECT id, name FROM users WHERE partner_code = ?')
    .get(partner_code.toUpperCase());

  if (!partner)
    return res.status(404).json({ error: 'Código de pareja no encontrado' });

  if (partner.id === req.user.id)
    return res.status(400).json({ error: 'No puedes vincularte contigo mismo' });

  const me = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user.id);

  const linkBoth = db.transaction(() => {
    db.prepare('UPDATE users SET coupled_user_id = ?, partner_name = ? WHERE id = ?').run(partner.id, partner.name, req.user.id);
    db.prepare('UPDATE users SET coupled_user_id = ?, partner_name = ? WHERE id = ?').run(req.user.id, me.name, partner.id);
  });
  linkBoth();

  res.json({ ok: true, partner: { id: partner.id, name: partner.name } });
});

// ── DELETE /api/users/couple — unlink ────────────────────────────────────────
router.delete('/couple', (req, res) => {
  const me = db.prepare('SELECT coupled_user_id FROM users WHERE id = ?').get(req.user.id);

  const unlinkBoth = db.transaction(() => {
    db.prepare('UPDATE users SET coupled_user_id = NULL, partner_name = NULL WHERE id = ?').run(req.user.id);
    if (me?.coupled_user_id) {
      db.prepare('UPDATE users SET coupled_user_id = NULL, partner_name = NULL WHERE id = ?').run(me.coupled_user_id);
    }
  });
  unlinkBoth();

  res.json({ ok: true });
});

module.exports = router;
