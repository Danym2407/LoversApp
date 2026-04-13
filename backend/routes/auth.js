const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const db      = require('../database/db');

// Migrate: add reset token columns if they don't exist
try { db.prepare('ALTER TABLE users ADD COLUMN reset_token TEXT').run(); } catch {}
try { db.prepare('ALTER TABLE users ADD COLUMN reset_token_expires TEXT').run(); } catch {}

// Nodemailer transporter (Gmail App Password)
function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.EMAIL_PORT || '465'),
    secure: true, // SSL en puerto 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

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

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
router.post('/forgot-password', authLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requerido' });

  const user = db.prepare('SELECT id, name FROM users WHERE email = ?').get(email.toLowerCase());

  // Always respond OK to not leak whether email exists
  if (!user) return res.json({ message: 'Si el correo existe, recibirás un enlace.' });

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  db.prepare('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?')
    .run(token, expires, user.id);

  const resetUrl = `${process.env.FRONTEND_URL}/#reset-password?token=${token}`;

  try {
    await getTransporter().sendMail({
      from: `"LoversApp" <${process.env.EMAIL_USER}>`,
      to: email.toLowerCase(),
      subject: '💌 Recupera tu contraseña',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;">
          <h2 style="color:#C44455;">Hola, ${user.name} 💕</h2>
          <p>Recibimos una solicitud para restablecer tu contraseña de LoversApp.</p>
          <p>Haz clic aquí para crear una nueva contraseña (válido por 1 hora):</p>
          <a href="${resetUrl}" style="display:inline-block;background:#C44455;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Restablecer contraseña</a>
          <p style="margin-top:24px;color:#999;font-size:12px;">Si no solicitaste esto, ignora este correo.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Email error:', err.message);
    return res.status(500).json({ error: 'No se pudo enviar el correo. Verifica la configuración de email.' });
  }

  res.json({ message: 'Si el correo existe, recibirás un enlace.' });
});

// ── POST /api/auth/reset-password ─────────────────────────────────────────────
router.post('/reset-password', (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token y contraseña requeridos' });
  if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

  const user = db.prepare('SELECT id, reset_token_expires FROM users WHERE reset_token = ?').get(token);

  if (!user) return res.status(400).json({ error: 'Token inválido o expirado' });
  if (new Date(user.reset_token_expires) < new Date())
    return res.status(400).json({ error: 'El enlace ha expirado, solicita uno nuevo' });

  const hash = bcrypt.hashSync(password, 12);
  db.prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?')
    .run(hash, user.id);

  res.json({ message: 'Contraseña actualizada correctamente' });
});

module.exports = router;
