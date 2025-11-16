// ========================================================
//  Plantillas de correos — Unisalones (Sprint Final)
//  Manejo de fechas unificado (Dayjs + Colombia + Español)
// ========================================================

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const locale_es = require('dayjs/locale/es'); // ← IMPORTANTE: idioma español

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es"); // ← ACTIVAR ESPAÑOL COMPLETO

const APP_TZ = "America/Bogota";

// ========================================================
//  Formateo profesional con AM/PM y días en español
// ========================================================
function formatColombia(date) {
  return dayjs(date)
    .tz(APP_TZ)
    .format("dddd, DD MMMM YYYY — hh:mm A")
    .replace("AM", "a. m.")
    .replace("PM", "p. m.");
}

function commonStyle(content) {
  return `
  <div style="
    font-family: Arial, Helvetica, sans-serif;
    background-color: #f8f9fa;
    padding: 24px;
    line-height: 1.6;
  ">
    <div style="
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      padding: 24px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    ">
      ${content}
      <hr style="margin-top: 24px; border: none; border-top: 1px solid #ddd;">
      <p style="text-align: center; color: #888; font-size: 13px; margin-top: 12px;">
        Unisalones – Sistema de Gestión de Espacios<br>
        Universidad Unicomfacauca<br>
        <i>Este es un mensaje automático. Por favor, no respondas a este correo.</i>
      </p>
    </div>
  </div>`;
}

// ========================================================
//  Correo: Confirmación de reserva
// ========================================================
function buildReservationMail(user, reservation, space) {

  const start = formatColombia(reservation.start_time);
  const end   = formatColombia(reservation.end_time);

  const subject = `Confirmación de reserva – ${space?.name || "Espacio"}`;
  const summary = `${space?.name || "Espacio"} (${start} → ${end})`;

  const html = commonStyle(`
    <h2 style="color: #198754; text-align: center;">Reserva Confirmada</h2>

    <p>Hola <strong>${user.name || user.email}</strong>,</p>
    <p>Tu reserva ha sido confirmada exitosamente:</p>

    <div style="background-color: #f6f6f6; padding: 16px; border-radius: 6px; margin-top: 16px;">
      <p><b>📍 Espacio:</b> ${space?.name || reservation.space_id}</p>
      <p><b>🕒 Inicio:</b> ${start} (hora Colombia)</p>
      <p><b>🕤 Fin:</b> ${end} (hora Colombia)</p>
      <p><b>🆔 ID de reserva:</b> ${reservation.id}</p>
      <p><b>🔖 Código:</b> ${reservation.receipt_code}</p>
    </div>

    <p style="margin-top: 20px;">
      Puedes ingresar a tu cuenta para revisar tus reservas activas.
    </p>
  `);

  return { subject, summary, html, text: `Reserva confirmada: ${summary}` };
}

// ========================================================
//  Correo: Cancelación de reserva
// ========================================================
function buildCancellationMail(user, reservation, space) {

  const start = formatColombia(reservation.start_time);
  const end   = formatColombia(reservation.end_time);

  const subject = `Cancelación de reserva – ${space?.name || "Espacio"}`;
  const summary = `${space?.name || "Espacio"} (${start} → ${end})`;

  const html = commonStyle(`
    <h2 style="color: #dc3545; text-align: center;">Reserva Cancelada</h2>

    <p>Hola <strong>${user.name || user.email}</strong>,</p>
    <p>Tu reserva ha sido cancelada correctamente:</p>

    <div style="background-color: #f6f6f6; padding: 16px; border-radius: 6px; margin-top: 16px;">
      <p><b>📍 Espacio:</b> ${space?.name || reservation.space_id}</p>
      <p><b>🕒 Inicio:</b> ${start} (hora Colombia)</p>
      <p><b>🕤 Fin:</b> ${end} (hora Colombia)</p>
      <p><b>🆔 ID de reserva:</b> ${reservation.id}</p>
      <p><b>🔖 Código:</b> ${reservation.receipt_code}</p>
    </div>

    <p style="margin-top: 20px;">
      Si esta cancelación no fue realizada por ti, contacta al administrador del sistema.
    </p>
  `);

  return { subject, summary, html, text: `Reserva cancelada: ${summary}` };
}

// ========================================================
//  Correo: Confirmación de ingreso a Lista de Espera
// ========================================================
function buildWaitlistMail(user, waitlistEntry, space) {

  const start = formatColombia(waitlistEntry.start_time);
  const end   = formatColombia(waitlistEntry.end_time);

  const subject = `Ingreso a lista de espera – ${space?.name || "Espacio"}`;
  const summary = `${space?.name || "Espacio"} (${start} → ${end})`;

  const html = commonStyle(`
    <h2 style="color: #0d6efd; text-align: center;">Ingreso a Lista de Espera</h2>

    <p>Hola <strong>${user.name || user.email}</strong>,</p>
    <p>Te has unido correctamente a la <b>lista de espera</b> para este espacio:</p>

    <div style="background-color: #f6f6f6; padding: 16px; border-radius: 6px; margin-top: 16px;">
      <p><b>📍 Espacio:</b> ${space?.name || waitlistEntry.space_id}</p>
      <p><b>🕒 Inicio solicitado:</b> ${start} (hora Colombia)</p>
      <p><b>🕤 Fin solicitado:</b> ${end} (hora Colombia)</p>
      <p><b>🔢 Posición actual:</b> ${waitlistEntry.position}</p>
      <p><b>🆔 ID de lista de espera:</b> ${waitlistEntry.id}</p>
      <p><b>🔖 Código:</b> WL-${waitlistEntry.id}</p>
    </div>

    <p style="margin-top: 20px;">
      Cuando el espacio quede disponible recibirás una notificación inmediata.
    </p>
  `);

  return {
    subject,
    summary,
    html,
    text: `Ingreso a lista de espera: ${summary}`
  };
}

module.exports = {
  buildReservationMail,
  buildCancellationMail,
  buildWaitlistMail
};

