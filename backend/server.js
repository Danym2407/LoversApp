require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const path    = require('path');

const { globalLimiter, writeLimiter } = require('./middleware/rateLimit');
const sanitizeBody = require('./middleware/sanitize');

const app    = express();
const PORT   = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// ── Security headers (helmet) ─────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,          // Managed by the SPA / CDN layer
  crossOriginEmbedderPolicy: false,      // Allows embedding assets without COEP issues
  hsts: isProd
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false,
}));

// ── CORS ──────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

if (!isProd) {
  ALLOWED_ORIGINS.push('http://localhost:5173', 'http://localhost:3000');
} else if (process.env.FRONTEND_URL) {
  ALLOWED_ORIGINS.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: (origin, cb) => {
    // Allow server-to-server (no Origin header) and listed origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ── Body parsing & input sanitization ────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(sanitizeBody);   // strip null bytes + control chars from all string fields

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use(globalLimiter);  // 200 req / 15 min per IP on all routes
app.use('/api', writeLimiter); // 60 write-ops / min per IP (skips GET/HEAD/OPTIONS)

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',            require('./routes/auth'));
app.use('/api/users',           require('./routes/users'));
app.use('/api/couple-dates',    require('./routes/couple-dates'));
app.use('/api/cita-swipes',     require('./routes/cita-swipes'));
app.use('/api/citas',           require('./routes/citas'));
app.use('/api/letters',         require('./routes/letters'));
app.use('/api/moments',         require('./routes/moments'));
app.use('/api/challenges',      require('./routes/challenges'));
app.use('/api/calendar',        require('./routes/calendar'));
app.use('/api/timeline',        require('./routes/timeline'));
app.use('/api/important-dates', require('./routes/important-dates'));
app.use('/api/countdowns',      require('./routes/countdowns'));
app.use('/api/admin',           require('./routes/admin'));
app.use('/api/achievements',    require('./routes/achievements'));
app.use('/api/games',           require('./routes/games'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── Frontend estático (producción) ────────────────────────────────────────────
if (isProd) {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  // SPA fallback — cualquier ruta no-API devuelve index.html
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
} else {
  app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
}

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => console.log(`LoversApp API  →  http://localhost:${PORT}`));
