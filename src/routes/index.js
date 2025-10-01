const express = require('express');
const authRoutes = require('./auth.routes');
const spaceRoutes = require('./space.routes');
const reservationRoutes = require('./reservation.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/spaces', spaceRoutes);
router.use('/reservations', reservationRoutes);

module.exports = router;
