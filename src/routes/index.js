const express = require('express');
const authRoutes = require('./auth.routes');
const spaceRoutes = require('./space.routes');
const reservationRoutes = require('./reservation.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/spaces', spaceRoutes);
router.use('/reservations', reservationRoutes);

// 👇 Ruta de health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = router;
