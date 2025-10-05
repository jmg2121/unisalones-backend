const { Reservation, WaitlistEntry, Space } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { createAndSend } = require('./notification.service');

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


async function createReservation({ spaceId, userId, start, end }) {
  const space = await Space.findByPk(spaceId);
  if (!space || !space.is_active) throw new Error('Espacio no disponible');

  const overlap = await hasOverlap(spaceId, start, end);
  if (overlap) {
    return { conflict: true };
  }

  const receipt = uuidv4();
 const reservation = await Reservation.create({
  user_id: userId,
  space_id: spaceId,   // 👈 aquí sí va space_id (DB)
  start_time: start,
  end_time: end,
  status: 'confirmed',
  receipt_code: `R-${Date.now()}`
});

  await createAndSend(userId, 'reservation_confirmed', { reservationId: reservation.id, receipt });
  return { reservation };
}

async function cancelReservation({ reservationId, userId, isAdmin }) {
  const resv = await Reservation.findByPk(reservationId);
  if (!resv) throw new Error('Reserva no encontrada');
  if (!isAdmin && resv.user_id !== userId) throw new Error('No autorizado');

  resv.status = 'canceled';
  await resv.save();

  await createAndSend(resv.user_id, 'reservation_canceled', { reservationId: resv.id });

  // Promover lista de espera
  const entry = await WaitlistEntry.findOne({
    where: {
      space_id: resv.space_id,
      status: 'pending',
      start_time: resv.start_time,
      end_time: resv.end_time
    },
    order: [['position','ASC']]
  });

  if (entry) {
    const { reservation } = await createReservation({ spaceId: entry.space_id, userId: entry.user_id, start: entry.start_time, end: entry.end_time });
    entry.status = 'converted';
    await entry.save();
    await createAndSend(entry.user_id, 'waitlist_promoted', { reservationId: reservation.id });
  }

  return resv;
}

async function modifyReservation({ reservationId, userId, isAdmin, newStart, newEnd }) {
  const resv = await Reservation.findByPk(reservationId);
  if (!resv) throw new Error('Reserva no encontrada');
  if (!isAdmin && resv.user_id !== userId) throw new Error('No autorizado');

  // check overlap excluding self
  const overlapping = await Reservation.findOne({
    where: {
      space_id: resv.space_id,
      status: 'confirmed',
      id: { [Op.ne]: reservationId },
      [Op.or]: [{ start_time: { [Op.lt]: newEnd }, end_time: { [Op.gt]: newStart } }]
    }
  });
  if (overlapping) throw new Error('Horario no disponible');

  resv.start_time = newStart;
  resv.end_time = newEnd;
  await resv.save();
  await createAndSend(resv.user_id, 'reservation_modified', { reservationId: resv.id });
  return resv;
}

async function joinWaitlist({ spaceId, userId, start, end }) {
  const count = await WaitlistEntry.count({
    where: { space_id: spaceId, start_time: start, end_time: end, status: 'pending' }
  });
  const entry = await WaitlistEntry.create({
    space_id: spaceId, user_id: userId, start_time: start, end_time: end, status: 'pending', position: count + 1
  });
  return entry;
}

module.exports = { createReservation, cancelReservation, modifyReservation, joinWaitlist, hasOverlap };
