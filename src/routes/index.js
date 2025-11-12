const express = require('express');
const { authLimiter } = require('../middlewares/rateLimit'); // Rate limit global (ya existente)

// Importación de rutas existentes
const authRoutes = require('./auth.routes');
const spaceRoutes = require('./space.routes');
const userRoutes = require('./user.routes');
const reservationRoutes = require('./reservation.routes');
const notificationRoutes = require('./notification.routes');
const calendarRoutes = require('./calendar.routes');

// 🆕 Nuevo: ruta de reportes (Bloque H – HU-006)
const reportRoutes = require('./report.routes');

const router = express.Router();

// ====================================================
// Rutas principales del sistema
// ====================================================
router.use('/auth', authLimiter, authRoutes);      // Registro e inicio de sesión (protegido con rate limit)
router.use('/spaces', spaceRoutes);                // Gestión de espacios
router.use('/users', userRoutes);                  // Gestión de usuarios
router.use('/reservations', reservationRoutes);    // Gestión de reservas
router.use('/notifications', notificationRoutes);  // Gestión de notificaciones
router.use('/calendar', calendarRoutes);           // Endpoint de calendario

// Ruta de reportes de uso (solo admins)
router.use('/reports', reportRoutes);              // HU-006 Reportes de uso (JSON / PDF / XLSX)

// ====================================================
// Health check (verificación del estado del servidor)
// ====================================================
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

module.exports = router;
