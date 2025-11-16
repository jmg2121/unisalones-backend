// ============================================
//  Importaciones
// ============================================
const { Reservation, WaitlistEntry, Space, User } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const {
  sendReservationConfirmation,
  sendReservationCancellation,
  sendWaitlistNotification, // <-- la agregamos aquí
} = require('./notificationService');

// ============================================
// TRABAJO 100% EN UTC
// (El controller ya normaliza a UTC)
// ============================================

/* =========================================================
    Verifica si hay traslape de horarios
   ========================================================= */
async function hasOverlap(spaceId, startUTC, endUTC, excludeId = null) {
  const whereClause = {
    space_id: spaceId,
    status: 'confirmed',
    [Op.and]: [
      { start_time: { [Op.lt]: endUTC } },
      { end_time: { [Op.gt]: startUTC } },
    ],
  };

  if (excludeId) {
    whereClause.id = { [Op.ne]: excludeId };
  }

  const count = await Reservation.count({ where: whereClause });
  return count > 0;
}

/* =========================================================
    Crear una nueva reserva
   ========================================================= */
async function createReservation({ spaceId, userId, start, end }) {
  // start y end YA VIENEN COMO Date UTC desde el controller
  const startUTC = start;
  const endUTC = end;

  const space = await Space.findByPk(spaceId);
  if (!space || !space.is_active) {
    const error = new Error('Espacio no disponible o inactivo');
    error.status = 400;
    throw error;
  }

  // Validar solapamiento
  const overlap = await hasOverlap(spaceId, startUTC, endUTC);
  if (overlap) {
    const error = new Error('El horario solicitado ya está reservado');
    error.status = 409;
    throw error;
  }

  const receiptCode = `R-${Date.now()}-${uuidv4().slice(0, 6)}`;

  const reservation = await Reservation.create({
    user_id: userId,
    space_id: spaceId,
    start_time: startUTC,
    end_time: endUTC,
    status: 'confirmed',
    receipt_code: receiptCode,
  });

  const user = await User.findByPk(userId);
  if (user) {
    await sendReservationConfirmation(user, reservation);
  }

  return { message: 'Reserva creada correctamente', reservation };
}

/* =========================================================
    Cancelar una reserva existente
   ========================================================= */
async function cancelReservation({ reservationId, userId, isAdmin }) {
  console.log(
    `Intentando cancelar reserva ID: ${reservationId} — userId: ${userId} — isAdmin: ${isAdmin}`
  );

  const reservation = await Reservation.findByPk(reservationId);

  if (!reservation) {
    const error = new Error('Reserva no encontrada');
    error.status = 404;
    throw error;
  }

  if (!userId) {
    const error = new Error('Usuario no autenticado');
    error.status = 401;
    throw error;
  }

  if (!(isAdmin || reservation.user_id === userId)) {
    console.warn(
      ` Cancelación denegada: Reserva pertenece a ${reservation.user_id}, usuario actual ${userId}`
    );
    const error = new Error('No autorizado');
    error.status = 403;
    throw error;
  }

  if (reservation.status === 'cancelled') {
    return {
      message: 'La reserva ya estaba cancelada.',
      cancelledId: reservation.id,
    };
  }

  reservation.status = 'cancelled';
  await reservation.save();

  try {
    const user = await User.findByPk(reservation.user_id);
    if (user) {
      await sendReservationCancellation(user, reservation);
    }
  } catch (err) {
    console.error('Error al enviar correo de cancelación:', err.message);
  }

  // Promover lista de espera
  try {
    const nextEntry = await WaitlistEntry.findOne({
      where: {
        space_id: reservation.space_id,
        status: 'pending',
        start_time: reservation.start_time,
        end_time: reservation.end_time,
      },
      order: [['position', 'ASC']],
    });

    if (nextEntry) {
      const { reservation: promotedResv } = await createReservation({
        spaceId: nextEntry.space_id,
        userId: nextEntry.user_id,
        start: nextEntry.start_time,
        end: nextEntry.end_time,
      });

      nextEntry.status = 'converted';
      await nextEntry.save();

      const promotedUser = await User.findByPk(nextEntry.user_id);
      if (promotedUser) {
        await sendReservationConfirmation(promotedUser, promotedResv);
      }
    }
  } catch (err) {
    console.error('Error promoviendo usuario en lista de espera:', err.message);
  }

  return {
    message: 'Reserva cancelada correctamente',
    cancelledId: reservation.id,
  };
}

/* =========================================================
    Modificar una reserva existente
   ========================================================= */
async function modifyReservation({ reservationId, userId, isAdmin, newStart, newEnd }) {
  const reservation = await Reservation.findByPk(reservationId);

  if (!reservation) {
    const error = new Error('Reserva no encontrada');
    error.status = 404;
    throw error;
  }

  if (!isAdmin && reservation.user_id !== userId) {
    const error = new Error('No autorizado');
    error.status = 403;
    throw error;
  }

  // newStart y newEnd YA VIENEN COMO Date UTC
  const newStartUTC = newStart;
  const newEndUTC = newEnd;

  const overlap = await hasOverlap(
    reservation.space_id,
    newStartUTC,
    newEndUTC,
    reservationId
  );
  if (overlap) {
    const error = new Error('Horario no disponible');
    error.status = 409;
    throw error;
  }

  reservation.start_time = newStartUTC;
  reservation.end_time = newEndUTC;
  await reservation.save();

  const user = await User.findByPk(reservation.user_id);
  if (user) {
    await sendReservationConfirmation(user, reservation);
  }

  return {
    message: 'Reserva actualizada correctamente',
    updatedReservation: reservation,
  };
}

/* =========================================================
    Unirse a la lista de espera — UTC ya viene del controller
   ========================================================= */
async function joinWaitlist({ spaceId, userId, start, end }) {
  const startUTC = start;  
  const endUTC = end;

  // 🚫 Verificar si ESTE usuario ya está inscrito en este rango
  const existing = await WaitlistEntry.findOne({
    where: {
      user_id: userId,
      space_id: spaceId,
      start_time: startUTC,
      end_time: endUTC,
      status: "pending"
    }
  });

  if (existing) {
    return {
      message: "Ya estás en la lista de espera para este horario.",
      entry: existing,
    };
  }

  // Calcular posición
  const position =
    (await WaitlistEntry.count({
      where: {
        space_id: spaceId,
        start_time: startUTC,
        end_time: endUTC,
        status: "pending",
      },
    })) + 1;

  // Crear nueva entrada
  const entry = await WaitlistEntry.create({
    space_id: spaceId,
    user_id: userId,
    start_time: startUTC,
    end_time: endUTC,
    status: "pending",
    position,
  });

  // Notificación (correo + registro)
  try {
    const user = await User.findByPk(userId);
    const space = await Space.findByPk(spaceId);
    if (user) {
      await sendWaitlistNotification(user, entry, space);
    }
  } catch (err) {
    console.error("Error al enviar notificación de lista de espera:", err.message);
  }

  return {
    message: "Usuario añadido a la lista de espera",
    entry,
  };
}


/* =========================================================
    Exportación
   ========================================================= */
module.exports = {
  createReservation,
  cancelReservation,
  modifyReservation,
  joinWaitlist,
  hasOverlap,
};
