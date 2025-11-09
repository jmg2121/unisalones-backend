// Dependencias principales
const dayjs = require('dayjs');
const { Reservation } = require('../models');
const {
  createReservation,
  cancelReservation,
  modifyReservation,
  joinWaitlist
} = require('../services/reservation.service');

// Servicios de notificación (correo real con Nodemailer)
const {
  sendReservationConfirmation,
  sendReservationCancellation
} = require('../services/notificationService');

// Crear reserva
async function create(req, res, next) {
  try {
    console.log('DEBUG create reservation headers:', req.headers);
    console.log('DEBUG create reservation body:', req.body);
    console.log('DEBUG create reservation query:', req.query);
    console.log('DEBUG create reservation params:', req.params);

    // Aceptar start/startTime y end/endTime
    const { start, end, startTime, endTime } = req.body || {};
    const startValue = start || startTime;
    const endValue = end || endTime;

    const rawSpaceId =
      (req.body && (req.body.spaceId ?? req.body.space_id)) ??
      (req.query && (req.query.spaceId ?? req.query.space_id)) ??
      (req.params && (req.params.spaceId ?? req.params.space_id));

    if (!rawSpaceId || !startValue || !endValue) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: spaceId, start o end'
      });
    }

    const spaceId = Number(rawSpaceId);
    if (Number.isNaN(spaceId) || spaceId <= 0) {
      return res.status(400).json({ error: 'spaceId inválido' });
    }

    const startDate = dayjs(startValue);
    const endDate = dayjs(endValue);
    if (!startDate.isValid() || !endDate.isValid()) {
      return res.status(400).json({
        error: 'start o end inválidos. Usa formato ISO reconocido por dayjs.'
      });
    }
    if (endDate.isSameOrBefore(startDate)) {
      return res.status(400).json({ error: 'end debe ser posterior a start' });
    }

    const result = await createReservation({
      spaceId,
      userId: req.user.id,
      start: startDate.toDate(),
      end: endDate.toDate()
    });

    if (!result) return res.status(500).json({ error: 'No se pudo crear la reserva' });
    if (result.conflict) {
      return res
        .status(409)
        .json({ message: 'El espacio ya está reservado en ese horario' });
    }

    if (result.reservation) {
      const reservation = result.reservation;
      res.status(201).json(reservation);

      try {
        const { User } = require('../models');
        const user = await User.findByPk(req.user.id);

        if (user && user.email) {
          console.log(`Enviando correo de confirmación a ${user.email}`);
          await sendReservationConfirmation(user, reservation);
        } else {
          console.warn(`No se encontró correo electrónico válido para el usuario ID ${req.user.id}.`);
        }
      } catch (err) {
        console.error('Error enviando correo de confirmación:', err.message);
      }
      return;
    }

    return res
      .status(500)
      .json({ error: 'Resultado desconocido al intentar crear reserva' });
  } catch (e) {
    console.error('Error en create reservation controller:', e);
    next(e);
  }
}

// Modificar reserva
async function modify(req, res, next) {
  try {
    const { start, end } = req.body;
    const reservationId = req.params.id;

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
      return res
        .status(404)
        .json({ message: 'Reserva no encontrada o sin permiso para modificarla' });
    }

    res.json({
      message: 'Reserva modificada correctamente',
      updated
    });
  } catch (e) {
    console.error('Error al modificar reserva:', e);
    next(e);
  }
}

// Cancelar reserva
async function cancelCtrl(req, res, next) {
  try {
    const reservationId = req.params.id;
    const canceled = await cancelReservation({
      reservationId,
      userId: req.user.id,
      isAdmin: req.user.role === 'admin'
    });

    if (!canceled) {
      return res
        .status(404)
        .json({ message: 'Reserva no encontrada o sin permiso para cancelarla' });
    }

    res.json({ message: 'Reserva cancelada exitosamente', status: 'canceled' });

    try {
      const { Reservation, User } = require('../models');
      const reservation = await Reservation.findByPk(reservationId);
      const user = await User.findByPk(reservation.user_id);

      if (user && user.email) {
        console.log(`Enviando correo de cancelación a ${user.email}`);
        await sendReservationCancellation(user, reservation);
      } else {
        console.warn(`No se encontró correo electrónico válido para el usuario ID ${reservation.user_id}.`);
      }
    } catch (err) {
      console.error('Error enviando correo de cancelación:', err.message);
    }
  } catch (e) {
    console.error('Error al cancelar reserva:', e);
    next(e);
  }
}

// Historial de usuario
async function myHistory(req, res, next) {
  try {
    const list = await Reservation.findAll({
      where: { user_id: req.user.id },
      order: [['start_time', 'DESC']]
    });

    if (!list.length) {
      return res
        .status(404)
        .json({ message: 'No se encontraron reservas en el historial' });
    }

    res.json(list);
  } catch (e) {
    console.error('Error al obtener historial:', e);
    next(e);
  }
}

// Obtener todas las reservas del usuario autenticado
async function getAllReservations(req, res, next) {
  try {
    const list = await Reservation.findAll({
      where: { user_id: req.user.id },
      order: [['start_time', 'DESC']]
    });

    res.json(list);
  } catch (e) {
    console.error('Error al obtener reservas:', e);
    next(e);
  }
}

// Unirse a lista de espera
async function joinWaitlistCtrl(req, res, next) {
  try {
    const { spaceId, start, end } = req.body;

    if (!spaceId || !start || !end) {
      return res
        .status(400)
        .json({ message: 'spaceId, start y end son obligatorios' });
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
    console.error('Error al unirse a la lista de espera:', e);
    next(e);
  }
}

// Obtener lista de espera
async function getWaitlistCtrl(req, res, next) {
  try {
    const { WaitlistEntry } = require('../models');
    const list = await WaitlistEntry.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    if (!list.length) {
      return res
        .status(404)
        .json({ message: 'No hay registros en la lista de espera.' });
    }

    res.json(list);
  } catch (e) {
    console.error('Error al obtener lista de espera:', e);
    next(e);
  }
}

module.exports = {
  create,
  modify,
  cancelCtrl,
  myHistory,
  joinWaitlistCtrl,
  getWaitlistCtrl,
  getAllReservations
};
