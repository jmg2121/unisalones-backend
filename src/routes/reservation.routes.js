const express = require('express');
const { authenticate } = require('../middlewares/auth');
const {
  create,
  modify,
  cancelCtrl,
  myHistory,
  joinWaitlistCtrl
} = require('../controllers/reservation.controller');

const router = express.Router();

// 📌 Crear nueva reserva
// Requiere autenticación
router.post('/', authenticate, create);

// 📌 Modificar reserva existente
// El usuario solo puede modificar sus propias reservas (verificado en el servicio)
router.patch('/:id', authenticate, modify);

// 📌 Cancelar una reserva
// Solo el usuario dueño o un admin puede cancelarla
router.delete('/:id', authenticate, cancelCtrl);

// 📌 Consultar historial de reservas del usuario autenticado
router.get('/me', authenticate, myHistory);

// 📌 Unirse a la lista de espera de un espacio ocupado
router.post('/waitlist', authenticate, joinWaitlistCtrl);

module.exports = router;
