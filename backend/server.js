require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const rateLimit = require('express-rate-limit');

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Security middleware ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));

// Global rate limit — 200 req / 15 min per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones, intenta más tarde.' },
}));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',            require('./routes/auth'));
app.use('/api/users',           require('./routes/users'));
app.use('/api/couple-dates',    require('./routes/couple-dates'));
app.use('/api/cita-swipes',     require('./routes/cita-swipes'));
app.use('/api/letters',         require('./routes/letters'));
app.use('/api/moments',         require('./routes/moments'));
app.use('/api/challenges',      require('./routes/challenges'));
app.use('/api/calendar',        require('./routes/calendar'));
app.use('/api/timeline',        require('./routes/timeline'));
app.use('/api/important-dates', require('./routes/important-dates'));
app.use('/api/countdowns',      require('./routes/countdowns'));
app.use('/api/admin',           require('./routes/admin'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => console.log(`LoversApp API  →  http://localhost:${PORT}`));
