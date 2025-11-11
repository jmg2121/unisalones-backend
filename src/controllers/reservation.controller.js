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

// =========================================================
//  Crear reserva
// =========================================================
async function create(req, res) {
  try {
    const { start, end, startTime, endTime, spaceId, space_id } = req.body;
    const startValue = start || startTime;
    const endValue = end || endTime;
    const finalSpaceId = spaceId || space_id;

    if (!finalSpaceId || !startValue || !endValue) {
      return res.status(400).json({
        message: 'Faltan campos requeridos: spaceId, start y end.',
      });
    }

    const startDate = dayjs(startValue);
    const endDate = dayjs(endValue);

    if (!startDate.isValid() || !endDate.isValid()) {
      return res.status(400).json({
        message: 'Formato de fecha inválido. Usa formato ISO 8601.',
      });
    }

    if (endDate.isSameOrBefore(startDate)) {
      return res.status(400).json({
        message: 'La hora de fin debe ser posterior a la hora de inicio.',
      });
    }

    const { reservation } = await createReservation({
      spaceId: finalSpaceId,
      userId: req.user.id,
      start: startDate.toDate(),
      end: endDate.toDate(),
    });

    // ✅ Respuesta esperada por los tests
    return res.status(201).json({
      id: reservation.id,
      space_id: reservation.space_id,
      user_id: reservation.user_id,
      start_time: reservation.start_time,
      end_time: reservation.end_time,
      receipt_code: reservation.receipt_code,
      status: reservation.status,
      message: 'Reserva creada correctamente',
    });
  } catch (error) {
    console.error('Error en createReservation:', error.message);
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
    const { start, end } = req.body;
    const reservationId = req.params.id;

    if (!start || !end) {
      return res
        .status(400)
        .json({ message: 'Los campos start y end son obligatorios.' });
    }

    const result = await modifyReservation({
      reservationId,
      userId: req.user.id,
      isAdmin: req.user.role === 'admin',
      newStart: dayjs(start).toDate(),
      newEnd: dayjs(end).toDate(),
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error al modificar reserva:', error.message);
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
      canceledId: result.canceledId,
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

    return res.status(200).json(list);
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

    return res.status(200).json(list);
  } catch (error) {
    console.error('Error al obtener reservas:', error.message);
    return res
      .status(500)
      .json({ message: 'Error al obtener todas las reservas.' });
  }
}

// =========================================================
//  Unirse a la lista de espera
// =========================================================
async function joinWaitlistCtrl(req, res) {
  try {
    const { spaceId, start, end } = req.body;

    if (!spaceId || !start || !end) {
      return res
        .status(400)
        .json({ message: 'spaceId, start y end son obligatorios.' });
    }

    const startDate = dayjs(start).toDate();
    const endDate = dayjs(end).toDate();

    const result = await joinWaitlist({
      spaceId,
      userId: req.user.id,
      start: startDate,
      end: endDate,
    });

    return res.status(201).json(result);
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

    return res.status(200).json(list);
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
