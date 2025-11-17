// =========================================================
//  Controlador de Reservas — Unisalones (Sprint Final)
// =========================================================

const dayjs = require('dayjs');
const { Reservation, WaitlistEntry } = require('../models');
const {
  createReservation,
  cancelReservation,
  modifyReservation,
  joinWaitlist,
} = require('../services/reservation.service');

const { formatCOL } = require('../utils/dateFormat');

// =========================================================
//  Crear reserva
// =========================================================
async function create(req, res) {
  try {
    const { spaceId, space_id, startUTC, endUTC } = req.body;
    const finalSpaceId = spaceId || space_id;

    if (!finalSpaceId || !startUTC || !endUTC) {
      return res.status(400).json({
        message: 'Faltan campos requeridos: spaceId, start y end.',
      });
    }

    if (dayjs(endUTC).isSameOrBefore(dayjs(startUTC))) {
      return res.status(400).json({
        message: 'La hora de fin debe ser posterior a la hora de inicio.',
      });
    }

    const { reservation } = await createReservation({
      spaceId: finalSpaceId,
      userId: req.user.id,
      start: startUTC,
      end: endUTC,
    });

    return res.status(201).json({
      id: reservation.id,
      space_id: reservation.space_id,
      user_id: reservation.user_id,
      start_time: formatCOL(reservation.start_time),
      end_time: formatCOL(reservation.end_time),
      receipt_code: reservation.receipt_code,
      status: reservation.status,
      message: 'Reserva creada correctamente',
    });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || 'Error interno del servidor' });
  }
}
// =========================================================
//  Modificar reserva
// =========================================================
async function modify(req, res) {
  try {
    const { startUTC, endUTC } = req.body;
    const reservationId = req.params.id;

    if (!startUTC || !endUTC) {
      return res
        .status(400)
        .json({ message: 'Los campos start y end son obligatorios.' });
    }

    if (dayjs(endUTC).isSameOrBefore(dayjs(startUTC))) {
      return res.status(400).json({
        message: 'La hora de fin debe ser posterior a la hora de inicio.',
      });
    }

    const result = await modifyReservation({
      reservationId,
      userId: req.user.id,
      isAdmin: req.user.role === 'admin',
      newStart: startUTC,
      newEnd: endUTC,
    });

    const r = result.updatedReservation;

    return res.status(200).json({
      message: result.message,
      updatedReservation: {
        id: r.id,
        space_id: r.space_id,
        user_id: r.user_id,
        start_time: formatCOL(r.start_time),
        end_time: formatCOL(r.end_time),
        status: r.status,
        receipt_code: r.receipt_code,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }
    });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || 'Error interno del servidor' });
  }
}
// =========================================================
//  Cancelar reserva
// =========================================================
async function cancelCtrl(req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'ID de reserva inválido.' });
    }

    const result = await cancelReservation({
      reservationId: id,
      userId: req.user.id,
      isAdmin: req.user.role === 'admin',
    });

    return res.status(200).json({
      message: result.message,
      canceledId: result.cancelledId,
      status: 'canceled',
    });
  } catch (error) {
    console.error('Error al cancelar reserva:', error.message);
    return res
      .status(error.status || 500)
      .json({ message: error.message || 'Error interno del servidor' });
  }
}

// =========================================================
//  Historial de reservas del usuario
// =========================================================
async function myHistory(req, res) {
  try {
    const list = await Reservation.findAll({
      where: { user_id: req.user.id },
      order: [['start_time', 'DESC']],
    });

    if (!list.length) {
      return res
        .status(404)
        .json({ message: 'No se encontraron reservas en el historial.' });
    }

    return res.status(200).json(
  list.map(r => ({
    id: r.id,
    space_id: r.space_id,
    user_id: r.user_id,
    start_time: formatCOL(r.start_time),
    end_time: formatCOL(r.end_time),
    status: r.status,
    receipt_code: r.receipt_code,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }))
);

  } catch (error) {
    console.error('Error al obtener historial:', error.message);
    return res
      .status(500)
      .json({ message: 'Error al obtener historial de reservas.' });
  }
}

// =========================================================
//  Obtener todas las reservas del usuario autenticado
// =========================================================
async function getAllReservations(req, res) {
  try {
    const list = await Reservation.findAll({
      where: { user_id: req.user.id },
      order: [['start_time', 'DESC']],
    });

    return res.status(200).json(
  list.map(r => ({
    id: r.id,
    space_id: r.space_id,
    user_id: r.user_id,
    start_time: formatCOL(r.start_time),
    end_time: formatCOL(r.end_time),
    status: r.status,
    receipt_code: r.receipt_code,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }))
);
  } catch (error) {
    console.error('Error al obtener reservas:', error.message);
    return res
      .status(500)
      .json({ message: 'Error al obtener todas las reservas.' });
  }
}

// =========================================================
//  Unirse a la lista de espera (CORREGIDO)
// =========================================================
async function joinWaitlistCtrl(req, res) {
  try {
    const { spaceId, startUTC, endUTC } = req.body;

    if (!spaceId || !startUTC || !endUTC) {
      return res
        .status(400)
        .json({ message: 'spaceId, start y end son obligatorios.' });
    }

    const result = await joinWaitlist({
      spaceId,
      userId: req.user.id,
      start: startUTC,
      end: endUTC,
    });

    return res.status(201).json({
  message: result.message,
  entry: {
    ...result.entry.toJSON(),
    start_time: formatCOL(result.entry.start_time),
    end_time: formatCOL(result.entry.end_time),
  }
});

  } catch (error) {
    console.error('Error al unirse a la lista de espera:', error.message);
    return res
      .status(error.status || 500)
      .json({
        message: error.message || 'Error al unirse a la lista de espera.',
      });
  }
}

// =========================================================
//  Obtener lista de espera del usuario
// =========================================================
async function getWaitlistCtrl(req, res) {
  try {
    const list = await WaitlistEntry.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    if (!list.length) {
      return res
        .status(404)
        .json({ message: 'No hay registros en la lista de espera.' });
    }

    return res.status(200).json(
  list.map(entry => ({
    id: entry.id,
    user_id: entry.user_id, 
    space_id: entry.space_id,
    position: entry.position,
    status: entry.status,
    start_time: formatCOL(entry.start_time),
    end_time: formatCOL(entry.end_time),
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  }))
);

  } catch (error) {
    console.error('Error al obtener lista de espera:', error.message);
    return res
      .status(500)
      .json({ message: 'Error al obtener la lista de espera.' });
  }
}

// =========================================================
//  Exportación
// =========================================================
module.exports = {
  create,
  modify,
  cancelCtrl,
  myHistory,
  getAllReservations,
  joinWaitlistCtrl,
  getWaitlistCtrl,
};
