const express = require('express');
const { authLimiter } = require('../middlewares/rateLimit'); // Nuevo: limitador de peticiones

const authRoutes = require('./auth.routes');
const spaceRoutes = require('./space.routes');
const userRoutes = require('./user.routes');
const reservationRoutes = require('./reservation.routes');
const notificationRoutes = require('./notification.routes');
const calendarRoutes = require('./calendar.routes');

const router = express.Router();

//  Rutas principales del sistema
router.use('/auth', authLimiter, authRoutes);      // Registro e inicio de sesión (protegido con rate limit)
router.use('/spaces', spaceRoutes);                // Gestión de espacios
router.use('/users', userRoutes);                  // Gestión de usuarios
router.use('/reservations', reservationRoutes);    // Gestión de reservas
router.use('/notifications', notificationRoutes);  // Gestión de notificaciones
router.use('/calendar', calendarRoutes);           // Endpoint de calendario

//  Health check (verificación del estado del servidor)
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente 🚀' });
});

module.exports = router;

