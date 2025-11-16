// src/middlewares/rateLimit.js
const rateLimit = require('express-rate-limit');

// ============================
// CONFIGURACIÓN PARA DESARROLLO
// ============================
const devConfig = {
  auth: {
    windowMs: 15 * 1000,   // 15 segundos
    max: 10,               // 10 intentos
  },
  global: {
    windowMs: 5 * 1000,    // 5 segundos
    max: 200,              // alto para que Swagger no moleste
  }
};

// ============================
// CONFIGURACIÓN PARA PRODUCCIÓN
// ============================
const prodConfig = {
  auth: {
    windowMs: 15 * 60 * 1000,  // 15 minutos
    max: Number(process.env.RATE_LIMIT_MAX_AUTH || 10),
  },
  global: {
    windowMs: 60 * 1000,       // 1 minuto
    max: Number(process.env.RATE_LIMIT_MAX_GLOBAL || 100),
  }
};

// ============================
// SELECCIONAR CONFIGURACIÓN
// ============================
const ENV = process.env.NODE_ENV || 'development';
const cfg = ENV === 'production' ? prodConfig : devConfig;

// ============================
// LIMITADORES
// ============================

const authLimiter = rateLimit({
  windowMs: cfg.auth.windowMs,
  max: cfg.auth.max,
  message: { error: `Demasiadas solicitudes. Intenta de nuevo en ${cfg.auth.windowMs / 1000} segundos.` },
  standardHeaders: true,
  legacyHeaders: false,
});

const globalLimiter = rateLimit({
  windowMs: cfg.global.windowMs,
  max: cfg.global.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: `Demasiadas solicitudes globales. Espera ${cfg.global.windowMs / 1000} segundos.` },
});

module.exports = { authLimiter, globalLimiter };
