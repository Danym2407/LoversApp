const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const nodemailer = require('nodemailer');
const db      = require('../database/db');
const { authLimiter, otpLimiter } = require('../middleware/rateLimit');

// ── DB migrations (idempotent) ────────────────────────────────────────────────
try { db.prepare('ALTER TABLE users ADD COLUMN reset_token TEXT').run(); } catch {}
try { db.prepare('ALTER TABLE users ADD COLUMN reset_token_expires TEXT').run(); } catch {}

// email_verified: DEFAULT 0 (secure). Back-fill existing accounts ONLY on first run.
;(() => {
  try {
    db.prepare('ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0').run();
    // Column just added for the first time → activate ALL pre-existing accounts
    db.prepare('UPDATE users SET email_verified = 1').run();
    console.log('[DB] email_verified column added — existing accounts activated.');
  } catch { /* column already exists — no back-fill */ }
})();

try { db.prepare('ALTER TABLE users ADD COLUMN otp_code TEXT').run(); } catch {}
try { db.prepare('ALTER TABLE users ADD COLUMN otp_expires TEXT').run(); } catch {}

// ── SMTP setup ────────────────────────────────────────────────────────────────
const SMTP_CFG = {
  host:   process.env.EMAIL_HOST || 'smtp.hostinger.com',
  port:   parseInt(process.env.EMAIL_PORT || '465'),
  secure: true,                               // SSL on port 465
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
};

const EMAIL_ENABLED = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);

if (!EMAIL_ENABLED) {
  console.warn('[EMAIL] EMAIL_USER / EMAIL_PASS not set — OTP codes will be printed to console (dev mode).');
} else {
  console.log(`[EMAIL] SMTP configured → ${SMTP_CFG.host}:${SMTP_CFG.port} as ${SMTP_CFG.auth.user}`);
  // Verify SMTP connection at startup (non-blocking)
  nodemailer.createTransport(SMTP_CFG).verify()
    .then(() => console.log('[EMAIL] SMTP connection OK ✓'))
    .catch(err => console.error('[EMAIL] SMTP connection FAILED:', err.message));
}

/** Returns a ready-to-use Nodemailer transporter (same config everywhere). */
function createTransporter() {
  return nodemailer.createTransport(SMTP_CFG);
}

/** Send OTP verification email. Throws on failure. */
async function sendOtpEmail(email, name, otp) {
  if (!EMAIL_ENABLED) {
    console.log(`[DEV OTP] ${email} → ${otp}`);
    return;
  }
  await createTransporter().sendMail({
    from:    `"LoversApp" <${SMTP_CFG.auth.user}>`,
    to:      email,
    subject: '💌 Tu código de verificación — LoversApp',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;">
        <h2 style="color:#C44455;">¡Hola, ${name}! 💕</h2>
        <p>Gracias por registrarte en LoversApp. Usa este código para verificar tu correo:</p>
        <div style="background:#FFF0F4;border:2px solid #FF6B8A;border-radius:16px;
                    padding:24px;text-align:center;margin:24px 0;">
          <span style="font-size:42px;font-weight:700;letter-spacing:8px;color:#C44455;">
            ${otp}
          </span>
        </div>
        <p style="color:#666;">Este código expira en <strong>10 minutos</strong>.</p>
        <p style="color:#999;font-size:12px;margin-top:24px;">
          Si no creaste esta cuenta, ignora este correo.
        </p>
      </div>
    `,
  });
}


// ── Shared helpers ────────────────────────────────────────────────────────────
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
}

function generatePartnerCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

/** Cryptographically random 6-digit OTP (uses crypto.randomInt, not Math.random). */
function generateOTP() {
  return String(crypto.randomInt(100000, 999999));
}

/** Minimal safe user object — never exposes password_hash, otp_code, or tokens. */
function publicUser(u) {
  return {
    id:                      u.id,
    name:                    u.name,
    partner_name:            u.partner_name,
    email:                   u.email,
    partner_code:            u.partner_code,
    coupled_user_id:         u.coupled_user_id,
    relationship_start_date: u.relationship_start_date || null,
    boyfriend_date:          u.boyfriend_date           || null,
    greeting_message:        u.greeting_message         || 'Buenos días, mi amor',
    greeting_subtext:        u.greeting_subtext         || 'Hoy les toca una cita especial ✦',
  };
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', authLimiter, async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'name, email y password son obligatorios' });

  if (password.length < 6)
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ error: 'Email inválido' });

  const normalEmail = email.toLowerCase();
  const existing = db.prepare('SELECT id, email_verified FROM users WHERE email = ?').get(normalEmail);

  // Block re-registration of a verified account
  if (existing && existing.email_verified) {
    return res.status(409).json({ error: 'El email ya está registrado' });
  }

  const otp     = generateOTP();
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

  let userId;

  if (existing) {
    // Unverified account — refresh credentials + OTP, keep same id
    db.prepare(
      'UPDATE users SET name = ?, password_hash = ?, otp_code = ?, otp_expires = ?, email_verified = 0 WHERE id = ?'
    ).run(name.trim(), bcrypt.hashSync(password, 12), otp, expires, existing.id);
    userId = existing.id;
  } else {
    // New user — email_verified is explicitly 0 (never rely on column default)
    const hash = bcrypt.hashSync(password, 12);

    let code;
    for (let attempt = 0; attempt < 10; attempt++) {
      code = generatePartnerCode();
      if (!db.prepare('SELECT id FROM users WHERE partner_code = ?').get(code)) break;
    }

    const createUser = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO users (email, password_hash, name, partner_code, email_verified, otp_code, otp_expires)
        VALUES (?, ?, ?, ?, 0, ?, ?)
      `).run(normalEmail, hash, name.trim(), code, otp, expires);

      const uid = result.lastInsertRowid;

      // Seed 100 couple_dates rows
      const insertDate = db.prepare('INSERT OR IGNORE INTO couple_dates (user_id, date_item_id) VALUES (?, ?)');
      for (let i = 1; i <= 100; i++) insertDate.run(uid, i);

      return uid;
    });

    userId = createUser();
  }

  // Send OTP email — if it fails, user row already exists with email_verified = 0
  // (safe: they can request a resend)
  try {
    await sendOtpEmail(normalEmail, name.trim(), otp);
  } catch (err) {
    console.error('OTP email error:', err.message);
    return res.status(500).json({ error: 'No se pudo enviar el correo de verificación. Intenta de nuevo en unos minutos.' });
  }

  res.status(201).json({ pendingVerification: true, email: normalEmail });
});

// ── POST /api/auth/verify-email ───────────────────────────────────────────────
router.post('/verify-email', otpLimiter, (req, res) => {
  const { email, code } = req.body;
  if (!email || !code)
    return res.status(400).json({ error: 'email y code son obligatorios' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());

  if (!user)
    return res.status(404).json({ error: 'Usuario no encontrado' });

  if (user.email_verified) {
    // Already verified — tell frontend to redirect to login
    return res.status(400).json({ error: 'Este correo ya fue verificado. Inicia sesión.' });
  }

  if (!user.otp_code || user.otp_code !== String(code).trim())
    return res.status(400).json({ error: 'Código incorrecto' });

  if (new Date(user.otp_expires) < new Date())
    return res.status(400).json({ error: 'El código ha expirado. Solicita uno nuevo.' });

  // Activate account + clear OTP
  db.prepare(`
    UPDATE users
    SET email_verified = 1, otp_code = NULL, otp_expires = NULL, last_login = datetime('now')
    WHERE id = ?
  `).run(user.id);

  const token = generateToken(user.id);

  // Re-fetch to get partner_code etc.
  const fresh = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);

  res.json({ token, user: publicUser(fresh) });
});

// ── POST /api/auth/resend-otp ─────────────────────────────────────────────────
router.post('/resend-otp', otpLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email es obligatorio' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());

  if (!user)        return res.status(404).json({ error: 'Usuario no encontrado' });
  if (user.email_verified) return res.status(400).json({ error: 'Este correo ya fue verificado.' });

  const otp     = generateOTP();
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  db.prepare('UPDATE users SET otp_code = ?, otp_expires = ? WHERE id = ?')
    .run(otp, expires, user.id);

  try {
    await sendOtpEmail(email.toLowerCase(), user.name, otp);
  } catch (err) {
    console.error('Resend OTP error:', err.message);
    return res.status(500).json({ error: 'No se pudo reenviar el código.' });
  }

  res.json({ message: 'Código reenviado' });
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', authLimiter, (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'email y password son obligatorios' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'Credenciales incorrectas' });

  // Block login for unverified accounts
  if (!user.email_verified) {
    return res.status(403).json({
      error: 'Debes verificar tu correo antes de iniciar sesión.',
      pendingVerification: true,
      email: user.email,
    });
  }

  db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);

  const token = generateToken(user.id);

  res.json({ token, user: publicUser(user) });
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

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  try {
    await createTransporter().sendMail({
      from:    `"LoversApp" <${SMTP_CFG.auth.user}>`,
      to:      email.toLowerCase(),
      subject: '💌 Recupera tu contraseña — LoversApp',
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
    console.error('[FORGOT-PASSWORD] Email failed:', err.message);
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
