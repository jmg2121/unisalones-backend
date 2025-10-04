// 🧩 Middleware global de manejo de errores
function errorHandler(err, req, res, next) {
  // Mostrar el error completo solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('🛑 Error detectado:', err);
  }

  // Si el error ya tiene un statusCode (definido manualmente en controladores)
  const status = err.statusCode || getHttpStatus(err);

  res.status(status).json({
    message: err.message || 'Error interno del servidor',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

// 🔍 Asigna un código de estado según el tipo de error
function getHttpStatus(err) {
  if (err.name === 'SequelizeValidationError') return 400;
  if (err.name === 'SequelizeUniqueConstraintError') return 409;
  if (err.name === 'JsonWebTokenError') return 401;
  if (err.name === 'TokenExpiredError') return 401;
  if (err.name === 'ForbiddenError') return 403;
  if (err.name === 'NotFoundError') return 404;
  return 500; // Por defecto
}

module.exports = { errorHandler };
