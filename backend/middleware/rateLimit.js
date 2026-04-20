/**
 * Centralized rate-limit configuration.
 * Import the relevant limiter in server.js or individual route files.
 *
 *  globalLimiter  — applied to every request (already in server.js)
 *  authLimiter    — strict limit for /auth endpoints (brute-force protection)
 *  writeLimiter   — applied to non-GET /api routes (POST / PUT / PATCH / DELETE)
 */
const rateLimit = require('express-rate-limit');

const isProd = process.env.NODE_ENV === 'production';

/** 200 requests per 15 min per IP — baseline protection */
const globalLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            200,
  standardHeaders: true,
  legacyHeaders:  false,
  message: { error: 'Demasiadas peticiones, intenta más tarde.' },
});

/**
 * Strict auth limiter — brute-force protection on login / register / reset-password.
 * Production: 10 attempts / 15 min.
 * Development: 100 (to not block local testing).
 */
const authLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            isProd ? 10 : 100,
  standardHeaders: true,
  legacyHeaders:  false,
  message: { error: 'Demasiados intentos, espera 15 minutos.' },
  // Skip successful requests so the counter only tracks failures
  skipSuccessfulRequests: false,
});

/**
 * Write-operation limiter — applied to POST / PUT / PATCH / DELETE on any /api route.
 * 60 mutating requests per minute per IP.
 */
const writeLimiter = rateLimit({
  windowMs:       60 * 1000,
  max:            60,
  standardHeaders: true,
  legacyHeaders:  false,
  message: { error: 'Demasiadas operaciones de escritura, espera un momento.' },
  skip: (req) => req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS',
});

/**
 * OTP verification limiter — brute-force protection for /auth/verify-email
 * and /auth/resend-otp. 5 attempts per 10 min per IP.
 */
const otpLimiter = rateLimit({
  windowMs:       10 * 60 * 1000,
  max:            isProd ? 5 : 50,
  standardHeaders: true,
  legacyHeaders:  false,
  message: { error: 'Demasiados intentos de verificación, espera 10 minutos.' },
});

module.exports = { globalLimiter, authLimiter, writeLimiter, otpLimiter };
