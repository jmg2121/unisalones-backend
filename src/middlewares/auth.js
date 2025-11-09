const jwt = require('jsonwebtoken');
const { User } = require('../models');

// 🔐 Middleware de autenticación (versión limpia y robusta)
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || req.headers.Authorization || '';

    // Extraer token eliminando cualquier "Bearer " repetido o sobrante
    const token = header.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado o formato inválido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado o token inválido' });
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (e) {
    console.error('Error en autenticación:', e.message);
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

// 🧩 Middleware de autorización (según rol)
function authorize(roles = []) {
  return (req, res, next) => {
    if (!roles.length) return next();
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permisos para realizar esta acción' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
