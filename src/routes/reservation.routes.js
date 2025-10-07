const express = require('express');
const { authenticate } = require('../middlewares/auth');
const {
  create,
  modify,
  cancelCtrl,
  myHistory,
  joinWaitlistCtrl,
  getAllReservations,
  getWaitlistCtrl
} = require('../controllers/reservation.controller');

const router = express.Router();

// 📅 Crear nueva reserva
router.post('/', authenticate, create);

// ✏️ Modificar una reserva existente
router.patch('/:id', authenticate, modify);

// ❌ Cancelar una reserva
router.delete('/:id', authenticate, cancelCtrl);

// 📋 Listar reservas del usuario autenticado
router.get('/me', authenticate, myHistory);

// 📋 Listar todas las reservas (GET /api/reservations)
router.get('/', authenticate, getAllReservations);

// ⏳ Unirse a la lista de espera de un espacio ocupado
router.post('/waitlist', authenticate, joinWaitlistCtrl);

// 📋 Obtener lista de espera del usuario autenticado
router.get('/waitlist', authenticate, getWaitlistCtrl);

module.exports = router;

