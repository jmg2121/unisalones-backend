// src/config/corsConfig.js
const cors = require('cors');

const whitelist = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin || whitelist.includes(origin)) return cb(null, true);
    return cb(new Error('No permitido por CORS'));
  },
  credentials: true
};

module.exports = cors(corsOptions);
