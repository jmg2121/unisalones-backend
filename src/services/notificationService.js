const { transporter, FROM } = require('../config/email');
const { Notification, Space } = require('../models');

const {
  buildReservationMail,
  buildCancellationMail,
  buildWaitlistMail
} = require('./templates/emailTemplates');

// ================================
// Manejo de fechas en zona Colombia
// ================================
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const APP_TZ = process.env.APP_TZ || 'America/Bogota';

function formatColombia(date) {
  if (!date) return '';
  return dayjs(date).tz(APP_TZ).format('YYYY-MM-DD HH:mm');
}

async function recordNotification(userId, message, type, payload = {}) {
  return Notification.create({
    user_id: userId,
    message,
    type,
    payload,
    sent_at: dayjs().tz(APP_TZ).toDate(),
    is_read: false,
  });
}

async function safeFindSpace(spaceId) {
  try {
    if (!spaceId) return null;
    return await Space.findByPk(spaceId);
  } catch {
    return null;
  }
}

// ======================================================
// CONFIRMACIÓN DE RESERVA
// ======================================================
async function sendReservationConfirmation(user, reservation) {
  const space = await safeFindSpace(reservation.space_id);
  const mail = buildReservationMail(user, reservation, space);

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  });

  const startCOL = formatColombia(reservation.start_time);
  const endCOL = formatColombia(reservation.end_time);

  await recordNotification(
    user.id,
    `Reserva confirmada en ${space?.name}: ${startCOL} → ${endCOL}`,
    "reservation_confirmed",
    {
      reservationId: reservation.id,
      receipt_code: reservation.receipt_code,
      space: space?.name,
      start: startCOL,
      end: endCOL,
    }
  );
}

// ======================================================
// CANCELACIÓN DE RESERVA
// ======================================================
async function sendReservationCancellation(user, reservation) {
  const space = await safeFindSpace(reservation.space_id);
  const mail = buildCancellationMail(user, reservation, space);

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  });

  const startCOL = formatColombia(reservation.start_time);
  const endCOL = formatColombia(reservation.end_time);

  await recordNotification(
    user.id,
    `Reserva cancelada en ${space?.name}: ${startCOL} → ${endCOL}`,
    "reservation_canceled",
    {
      reservationId: reservation.id,
      receipt_code: reservation.receipt_code,
      space: space?.name,
      start: startCOL,
      end: endCOL,
    }
  );
}

// ======================================================
// LISTA DE ESPERA
// ======================================================
async function sendWaitlistNotification(user, waitlistEntry) {
  const space = await safeFindSpace(waitlistEntry.space_id);
  const mail = buildWaitlistMail(user, waitlistEntry, space);

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  });

  const startCOL = formatColombia(waitlistEntry.start_time);
  const endCOL = formatColombia(waitlistEntry.end_time);

  await recordNotification(
    user.id,
    `Añadido a lista de espera en ${space?.name}: ${startCOL} → ${endCOL}`,
    "waitlist",
    {
      waitlistId: waitlistEntry.id,
      position: waitlistEntry.position,
      space: space?.name,
      start: startCOL,
      end: endCOL,
    }
  );
}

module.exports = {
  sendReservationConfirmation,
  sendReservationCancellation,
  sendWaitlistNotification
};
