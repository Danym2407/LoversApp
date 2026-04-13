const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db      = require('../database/db');

// Stricter rate limit for auth endpoints — 10 req / 15 min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos, espera 15 minutos.' },
});

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
}

function generatePartnerCode() {
  // 6-char alphanumeric code (no ambiguous chars)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', authLimiter, (req, res) => {
  const { name, partner_name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'name, email y password son obligatorios' });

  if (password.length < 6)
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ error: 'Email inválido' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing)
    return res.status(409).json({ error: 'El email ya está registrado' });

  const hash = bcrypt.hashSync(password, 12);

  const result = db.prepare(`
    INSERT INTO users (email, password_hash, name, partner_name)
    VALUES (?, ?, ?, ?)
  `).run(email.toLowerCase(), hash, name.trim(), partner_name?.trim() || null);

  const userId = result.lastInsertRowid;

  // Generate unique partner code
  let code;
  for (let attempt = 0; attempt < 10; attempt++) {
    code = generatePartnerCode();
    const taken = db.prepare('SELECT id FROM users WHERE partner_code = ?').get(code);
    if (!taken) break;
  }
  db.prepare('UPDATE users SET partner_code = ? WHERE id = ?').run(code, userId);

  // Seed 100 couple_dates rows for new user
  const insertDate = db.prepare('INSERT OR IGNORE INTO couple_dates (user_id, date_item_id) VALUES (?, ?)');
  const seedDates = db.transaction(() => {
    for (let i = 1; i <= 100; i++) insertDate.run(userId, i);
  });
  seedDates();

  const token = generateToken(userId);

  res.status(201).json({
    token,
    user: { id: userId, name, partner_name: partner_name?.trim(), email: email.toLowerCase(), partner_code: code },
  });
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', authLimiter, (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'email y password son obligatorios' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'Credenciales incorrectas' });

  db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);

  const token = generateToken(user.id);

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      partner_name: user.partner_name,
      email: user.email,
      partner_code: user.partner_code,
      coupled_user_id: user.coupled_user_id,
    },
  });
});

module.exports = router;
