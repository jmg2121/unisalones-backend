const express = require('express');
const { authenticate } = require('../middlewares/auth');
const { getNotifications, markAsRead } = require('../controllers/notification.controller');

const router = express.Router();

// Obtener notificaciones del usuario autenticado
router.get('/', authenticate, getNotifications);

// Marcar una notificación como leída
router.put('/:id/read', authenticate, markAsRead);

module.exports = router;
