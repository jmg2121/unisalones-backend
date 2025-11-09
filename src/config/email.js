// NUEVO EN SPRINT 2 – BLOQUE B
// src/config/email.js
const nodemailer = require('nodemailer');

function buildTransport() {
  // 🧪 En entorno de pruebas: simula el envío (no usa Internet)
  if (process.env.NODE_ENV === 'test') {
    console.log('📦 Transporter en modo TEST (streamTransport)');
    return nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });
  }

  // 💻 En desarrollo o producción: usa Mailtrap (SMTP real)
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 2525),
    secure: false, // STARTTLS (Mailtrap no requiere SSL)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Verificar conexión al arrancar
  transport
    .verify()
    .then(() => console.log('✅ Servidor SMTP listo para enviar correos (Mailtrap).'))
    .catch(err => console.error('❌ Error al conectar con SMTP:', err.message));

  return transport;
}

const transporter = buildTransport();

// Remitente por defecto
const FROM = process.env.SMTP_FROM || 'Unisalones <no-reply@unisalones.com>';

module.exports = { transporter, FROM };
