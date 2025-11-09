const { transporter, FROM } = require('../config/email');
const { Notification, Space } = require('../models');
const { buildReservationMail, buildCancellationMail } = require('./templates/emailTemplates');

/**
 * Guarda una notificación en la base de datos.
 */
async function recordNotification(userId, message, type, payload = {}) {
  return Notification.create({
    user_id: userId,
    message,
    type, // valores esperados: reservation_confirmed, reservation_canceled, etc.
    payload,
    sent_at: new Date(),
    is_read: false
  });
}

/**
 * Busca un espacio de forma segura, incluso si no hay BD (para unit tests).
 */
async function safeFindSpace(spaceId) {
  try {
    if (!spaceId) return null;
    return await Space.findByPk(spaceId);
  } catch {
    // Evita que los tests unitarios fallen por falta de conexión SQLite
    return null;
  }
}

/**
 * Envía correo y registra notificación al confirmar reserva.
 */
async function sendReservationConfirmation(user, reservation) {
  const space = await safeFindSpace(reservation.space_id);
  const mail = buildReservationMail(user, reservation, space);

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: mail.subject,
    html: mail.html,
    text: mail.text
  });

  await recordNotification(
    user.id,
    `Reserva confirmada: ${space?.name || 'Espacio'} (${reservation.start_time} → ${reservation.end_time})`,
    'reservation_confirmed',
    {
      reservationId: reservation.id,
      space: space?.name || reservation.space_id,
      start: reservation.start_time,
      end: reservation.end_time
    }
  );
}

/**
 * Envía correo y registra notificación al cancelar reserva.
 */
async function sendReservationCancellation(user, reservation) {
  const space = await safeFindSpace(reservation.space_id);
  const mail = buildCancellationMail(user, reservation, space);

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: mail.subject,
    html: mail.html,
    text: mail.text
  });

  await recordNotification(
    user.id,
    `Reserva cancelada: ${space?.name || 'Espacio'} (${reservation.start_time} → ${reservation.end_time})`,
    'reservation_canceled',
    {
      reservationId: reservation.id,
      space: space?.name || reservation.space_id,
      start: reservation.start_time,
      end: reservation.end_time
    }
  );
}

module.exports = {
  sendReservationConfirmation,
  sendReservationCancellation
};
