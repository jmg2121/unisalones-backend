const express = require('express');
const authRoutes = require('./auth.routes');
const spaceRoutes = require('./space.routes');
const reservationRoutes = require('./reservation.routes');

const router = express.Router();

// 📦 Rutas principales del sistema
router.use('/auth', authRoutes);           // Registro e inicio de sesión
router.use('/spaces', spaceRoutes);        // Gestión de espacios
router.use('/reservations', reservationRoutes); // Gestión de reservas

// 📌 Health check (verificación del estado del servidor)
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente 🚀' });
});

module.exports = router;
