const { Reservation, WaitlistEntry, Space, User } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { sendReservationConfirmation, sendReservationCancellation } = require('./notificationService');

// Verifica si hay traslape de horarios
async function hasOverlap(spaceId, start, end) {
  const reservations = await Reservation.findAll({
    where: {
      space_id: spaceId,
      status: 'confirmed',
      [Op.and]: [
        { start_time: { [Op.lt]: end } },
        { end_time: { [Op.gt]: start } }
      ]
    }
  });
  return reservations.length > 0;
}

// Crear una nueva reserva
async function createReservation({ spaceId, userId, start, end }) {
  const space = await Space.findByPk(spaceId);
  if (!space || !space.is_active) throw new Error('Espacio no disponible');

  const overlap = await hasOverlap(spaceId, start, end);
  if (overlap) return { conflict: true };

  const receipt = uuidv4();

  const reservation = await Reservation.create({
    user_id: userId,
    space_id: spaceId,
    start_time: start,
    end_time: end,
    status: 'confirmed',
    receipt_code: `R-${Date.now()}`
  });

  // Enviar correo de confirmación
  const user = await User.findByPk(userId);
  if (user) {
    await sendReservationConfirmation(user, reservation);
  }

  return { reservation };
}

// Cancelar una reserva existente
async function cancelReservation({ reservationId, userId, isAdmin }) {
  const resv = await Reservation.findByPk(reservationId);
  if (!resv) throw new Error('Reserva no encontrada');
  if (!isAdmin && resv.user_id !== userId) throw new Error('No autorizado');

  resv.status = 'canceled';
  await resv.save();

  // Enviar correo de cancelación
  const user = await User.findByPk(resv.user_id);
  if (user) {
    await sendReservationCancellation(user, resv);
  }

  // Promover a siguiente en lista de espera
  const entry = await WaitlistEntry.findOne({
    where: {
      space_id: resv.space_id,
      status: 'pending',
      start_time: resv.start_time,
      end_time: resv.end_time
    },
    order: [['position', 'ASC']]
  });

  if (entry) {
    const { reservation } = await createReservation({
      spaceId: entry.space_id,
      userId: entry.user_id,
      start: entry.start_time,
      end: entry.end_time
    });

    entry.status = 'converted';
    await entry.save();

    const promotedUser = await User.findByPk(entry.user_id);
    if (promotedUser) {
      await sendReservationConfirmation(promotedUser, reservation);
    }
  }

  return resv;
}

// Modificar una reserva existente
async function modifyReservation({ reservationId, userId, isAdmin, newStart, newEnd }) {
  const resv = await Reservation.findByPk(reservationId);
  if (!resv) throw new Error('Reserva no encontrada');
  if (!isAdmin && resv.user_id !== userId) throw new Error('No autorizado');

  // Verifica traslape excluyendo la reserva actual
  const overlapping = await Reservation.findOne({
    where: {
      space_id: resv.space_id,
      status: 'confirmed',
      id: { [Op.ne]: reservationId },
      [Op.and]: [
        { start_time: { [Op.lt]: newEnd } },
        { end_time: { [Op.gt]: newStart } }
      ]
    }
  });

  if (overlapping) throw new Error('Horario no disponible');

  resv.start_time = newStart;
  resv.end_time = newEnd;
  await resv.save();

  // Notificación (opcional)
  const user = await User.findByPk(resv.user_id);
  if (user) {
    await sendReservationConfirmation(user, resv);
  }

  return resv;
}

// Unirse a la lista de espera
async function joinWaitlist({ spaceId, userId, start, end }) {
  const count = await WaitlistEntry.count({
    where: {
      space_id: spaceId,
      start_time: start,
      end_time: end,
      status: 'pending'
    }
  });

  const entry = await WaitlistEntry.create({
    space_id: spaceId,
    user_id: userId,
    start_time: start,
    end_time: end,
    status: 'pending',
    position: count + 1
  });

  return entry;
}

module.exports = {
  createReservation,
  cancelReservation,
  modifyReservation,
  joinWaitlist,
  hasOverlap
};
