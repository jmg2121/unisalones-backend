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
    // Logs de depuración
    console.log('DEBUG create reservation headers:', req.headers);
    /* eslint-disable */console.log('DEBUG create reservation body:', req.body);
    /* eslint-disable */console.log('DEBUG create reservation query:', req.query);
    /* eslint-disable */console.log('DEBUG create reservation params:', req.params);

    // Intentar obtener spaceId de body (camel o snake), query o params
    const rawSpaceId =
      (req.body && (req.body.spaceId ?? req.body.space_id)) ??
      (req.query && (req.query.spaceId ?? req.query.space_id)) ??
      (req.params && (req.params.spaceId ?? req.params.space_id));

    const { start, end } = req.body || {};

    // Validaciones básicas
    if (rawSpaceId === undefined || start === undefined || end === undefined) {
      return res.status(400).json({ error: 'Faltan campos requeridos: spaceId (body/query/params), start, end' });
    }

    // Asegurar que spaceId es número
    const spaceId = Number(rawSpaceId);
    if (Number.isNaN(spaceId) || spaceId <= 0) {
      return res.status(400).json({ error: 'spaceId inválido' });
    }

    // Validar fechas con dayjs
    const startDate = dayjs(start);
    const endDate = dayjs(end);
    if (!startDate.isValid() || !endDate.isValid()) {
      return res.status(400).json({ error: 'start o end inválidos. Usa un formato ISO o reconocido por dayjs.' });
    }
    if (endDate.isSameOrBefore(startDate)) {
      return res.status(400).json({ error: 'end debe ser posterior a start' });
    }

    // Llamar al servicio
    const result = await createReservation({
      spaceId,
      userId: req.user.id,
      start: startDate.toDate(),
      end: endDate.toDate()
    });

    if (!result) {
      return res.status(500).json({ error: 'No se pudo crear la reserva' });
    }
    if (result.conflict) {
      // Puedes cambiar a joinWaitlist aquí si quieres comportamiento automático
      return res.status(409).json({ message: 'El espacio ya está reservado en ese horario' });
    }
    if (result.reservation) {
      return res.status(201).json(result.reservation);
    }

    return res.status(500).json({ error: 'Resultado desconocido al intentar crear reserva' });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') console.error('Error en create reservation controller:', e);
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

res.json({ message: 'Reserva cancelada exitosamente', status: 'canceled' });  } catch (e) {
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