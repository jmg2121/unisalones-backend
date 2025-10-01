const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) return res.status(401).json({ error: 'No autenticado' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev');
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

function authorize(roles = []) {
  return (req, res, next) => {
    if (!roles.length) return next();
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    next();
  }
}

module.exports = { authenticate, authorize };
