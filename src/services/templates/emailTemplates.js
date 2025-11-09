// NUEVO EN SPRINT 2 – BLOQUE B
// src/services/templates/emailTemplates.js

function commonStyle(content) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5">
    ${content}
    <hr/>
    <small>Unisalones – Sistema de Gestión de Espacios</small>
  </div>`;
}

function buildReservationMail(user, reservation, space) {
  const start = reservation.start_time || reservation.start;
  const end = reservation.end_time || reservation.end;

  const subject = `Confirmación de reserva – ${space?.name || 'Espacio'}`;
  const summary = `${space?.name || 'Espacio'} (${start} → ${end})`;

  const html = commonStyle(`
    <h2>¡Reserva confirmada!</h2>
    <p>Hola <b>${user.name || user.email}</b>, tu reserva fue confirmada.</p>
    <ul>
      <li><b>Espacio:</b> ${space?.name || reservation.space_id}</li>
      <li><b>Inicio:</b> ${start}</li>
      <li><b>Fin:</b> ${end}</li>
      <li><b>Código:</b> ${reservation.receipt_code || reservation.id}</li>
    </ul>
  `);

  return {
    subject,
    summary,
    html,
    text: `Reserva confirmada: ${summary}`,
  };
}

function buildCancellationMail(user, reservation, space) {
  const start = reservation.start_time || reservation.start;
  const end = reservation.end_time || reservation.end;

  const subject = `Cancelación de reserva – ${space?.name || 'Espacio'}`;
  const summary = `${space?.name || 'Espacio'} (${start} → ${end})`;

  const html = commonStyle(`
    <h2>Reserva cancelada</h2>
    <p>Hola <b>${user.name || user.email}</b>, tu reserva fue cancelada.</p>
    <ul>
      <li><b>Espacio:</b> ${space?.name || reservation.space_id}</li>
      <li><b>Inicio:</b> ${start}</li>
      <li><b>Fin:</b> ${end}</li>
      <li><b>Código:</b> ${reservation.receipt_code || reservation.id}</li>
    </ul>
  `);

  return {
    subject,
    summary,
    html,
    text: `Reserva cancelada: ${summary}`,
  };
}

module.exports = { buildReservationMail, buildCancellationMail };
