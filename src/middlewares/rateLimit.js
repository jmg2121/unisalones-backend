// src/middlewares/rateLimit.js
const rateLimit = require('express-rate-limit');

const isTest = process.env.NODE_ENV === 'test';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isTest ? 99999 : Number(process.env.RATE_LIMIT_MAX_AUTH || 10),
  message: { error: 'Demasiadas solicitudes. Intenta más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: isTest ? 99999 : Number(process.env.RATE_LIMIT_MAX_GLOBAL || 100),
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, globalLimiter };
