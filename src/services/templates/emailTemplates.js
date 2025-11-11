// ========================================================
//  Plantillas de correos — Unisalones (Sprint Final)
// ========================================================

function commonStyle(content, titleColor = "#0d6efd") {
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
  </div>
  `;
}

// ========================================================
//  Correo: Confirmación de reserva
// ========================================================
function buildReservationMail(user, reservation, space) {
  const start = new Date(reservation.start_time || reservation.start).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    dateStyle: "full",
    timeStyle: "short",
  });
  const end = new Date(reservation.end_time || reservation.end).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    dateStyle: "full",
    timeStyle: "short",
  });

  const subject = `Confirmación de reserva – ${space?.name || "Espacio"}`;
  const summary = `${space?.name || "Espacio"} (${start} → ${end})`;

  const html = commonStyle(`
    <h2 style="color: #198754; text-align: center;">✅ ¡Reserva confirmada!</h2>
    <p>Hola <strong>${user.name || user.email}</strong>,</p>
    <p>Tu reserva ha sido confirmada exitosamente en el sistema <b>Unisalones</b>.</p>

    <div style="background-color: #f6f6f6; padding: 16px; border-radius: 6px; margin-top: 16px;">
      <p><b>📍 Espacio:</b> ${space?.name || reservation.space_id}</p>
      <p><b>🕐 Inicio:</b> ${start}</p>
      <p><b>🕓 Fin:</b> ${end}</p>
      <p><b>🔖 Código:</b> ${reservation.receipt_code || reservation.id}</p>
    </div>

    <p style="margin-top: 20px;">
      Puedes consultar tus reservas activas o hacer nuevas solicitudes desde tu cuenta en el portal Unisalones.
    </p>
  `);

  return {
    subject,
    summary,
    html,
    text: `Reserva confirmada: ${summary}`,
  };
}

// ========================================================
//  Correo: Cancelación de reserva
// ========================================================
function buildCancellationMail(user, reservation, space) {
  const start = new Date(reservation.start_time || reservation.start).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    dateStyle: "full",
    timeStyle: "short",
  });
  const end = new Date(reservation.end_time || reservation.end).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    dateStyle: "full",
    timeStyle: "short",
  });

  const subject = `Cancelación de reserva – ${space?.name || "Espacio"}`;
  const summary = `${space?.name || "Espacio"} (${start} → ${end})`;

  const html = commonStyle(`
    <h2 style="color: #dc3545; text-align: center;">❌ Reserva cancelada</h2>
    <p>Hola <strong>${user.name || user.email}</strong>,</p>
    <p>Tu reserva fue <strong>cancelada correctamente</strong> en el sistema <b>Unisalones</b>.</p>

    <div style="background-color: #f6f6f6; padding: 16px; border-radius: 6px; margin-top: 16px;">
      <p><b>📍 Espacio:</b> ${space?.name || reservation.space_id}</p>
      <p><b>🕐 Inicio:</b> ${start}</p>
      <p><b>🕓 Fin:</b> ${end}</p>
      <p><b>🔖 Código:</b> ${reservation.receipt_code || reservation.id}</p>
    </div>

    <p style="margin-top: 20px;">
      Si esta cancelación no fue realizada por ti, contacta con el administrador del sistema.
    </p>
  `);

  return {
    subject,
    summary,
    html,
    text: `Reserva cancelada: ${summary}`,
  };
}

module.exports = { buildReservationMail, buildCancellationMail };
