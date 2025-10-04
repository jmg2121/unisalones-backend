const dayjs = require('dayjs');
const { Reservation } = require('../models');
const {
  createReservation,
  cancelReservation,
  modifyReservation,
  joinWaitlist
} = require('../services/reservation.service');

// ✅ Crear reserva
async function create(req, res, next) {
  try {
    const { spaceId, start, end } = req.body;

    // 🔍 Validaciones básicas
    if (!spaceId || !start || !end) {
      return res.status(400).json({ message: 'spaceId, start y end son obligatorios' });
    }

    const startDate = dayjs(start).toDate();
    const endDate = dayjs(end).toDate();

    const { conflict, reservation } = await createReservation({
      spaceId,
      userId: req.user.id,
      start: startDate,
      end: endDate
    });

    if (conflict) {
      return res.status(409).json({
        conflict: true,
        message: 'Espacio ocupado. Puede unirse a la lista de espera.'
      });
    }

    res.status(201).json({
      message: 'Reserva creada exitosamente',
      reservation
    });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') console.error('Error al crear reserva:', e);
    next(e);
  }
}

// ✅ Modificar reserva
async function modify(req, res, next) {
  try {
    const { start, end } = req.body;
    const reservationId = req.params.id;

    // 🔍 Validaciones básicas
    if (!start || !end) {
      return res.status(400).json({ message: 'start y end son obligatorios' });
    }

    const newStart = dayjs(start).toDate();
    const newEnd = dayjs(end).toDate();

    const updated = await modifyReservation({
      reservationId,
      userId: req.user.id,
      isAdmin: req.user.role === 'admin',
      newStart,
      newEnd
    });

    if (!updated) {
      return res.status(404).json({ message: 'Reserva no encontrada o sin permiso para modificarla' });
    }

    res.json({
      message: 'Reserva modificada correctamente',
      updated
    });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') console.error('Error al modificar reserva:', e);
    next(e);
  }
}

// ✅ Cancelar reserva
async function cancelCtrl(req, res, next) {
  try {
    const reservationId = req.params.id;
    const canceled = await cancelReservation({
      reservationId,
      userId: req.user.id,
      isAdmin: req.user.role === 'admin'
    });

    if (!canceled) {
      return res.status(404).json({ message: 'Reserva no encontrada o sin permiso para cancelarla' });
    }

    res.json({ message: 'Reserva cancelada exitosamente', canceled });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') console.error('Error al cancelar reserva:', e);
    next(e);
  }
}

// ✅ Historial de usuario
async function myHistory(req, res, next) {
  try {
    const list = await Reservation.findAll({
      where: { user_id: req.user.id },
      order: [['start_time', 'DESC']]
    });

    if (!list.length) {
      return res.status(404).json({ message: 'No se encontraron reservas en el historial' });
    }

    res.json(list);
  } catch (e) {
    if (process.env.NODE_ENV === 'development') console.error('Error al obtener historial:', e);
    next(e);
  }
}

// ✅ Unirse a lista de espera
async function joinWaitlistCtrl(req, res, next) {
  try {
    const { spaceId, start, end } = req.body;

    // 🔍 Validaciones básicas
    if (!spaceId || !start || !end) {
      return res.status(400).json({ message: 'spaceId, start y end son obligatorios' });
    }

    const startDate = dayjs(start).toDate();
    const endDate = dayjs(end).toDate();

    const entry = await joinWaitlist({
      spaceId,
      userId: req.user.id,
      start: startDate,
      end: endDate
    });

    res.status(201).json({
      message: 'Usuario agregado a la lista de espera',
      entry
    });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') console.error('Error al unirse a la lista de espera:', e);
    next(e);
  }
}

module.exports = { create, modify, cancelCtrl, myHistory, joinWaitlistCtrl };
