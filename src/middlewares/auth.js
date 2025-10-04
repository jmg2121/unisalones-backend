const jwt = require('jsonwebtoken');
const { User } = require('../models');

// 🔐 Middleware de autenticación
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';

    // Validar formato: Bearer token
    const [type, token] = header.split(' ');
    if (type !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Token no proporcionado o formato inválido' });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev');

    // Opcional: confirmar que el usuario aún existe en la BD
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado o token inválido' });
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (e) {
    if (process.env.NODE_ENV === 'development') console.error('Error en autenticación:', e);
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

// 🧩 Middleware de autorización
function authorize(roles = []) {
  return (req, res, next) => {
    if (!roles.length) return next(); // Si no hay roles definidos, pasa libremente

    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permisos para realizar esta acción' });
    }

    next();
  };
}

module.exports = { authenticate, authorize };
