// src/utils/mailer.js
const { transporter, FROM } = require('../config/email');

/**
 * Envía un correo electrónico utilizando Nodemailer y el transporter real (Mailtrap)
 * @param {Object} options
 * @param {string} options.to - Dirección del destinatario
 * @param {string} options.subject - Asunto del correo
 * @param {string} options.text - Contenido del correo en texto plano
 * @param {string} [options.html] - (Opcional) Contenido HTML del correo
 */
async function sendMail({ to, subject, text, html }) {
  try {
    if (!to) {
      throw new Error('Destinatario no definido (to).');
    }

    const mailOptions = {
      from: FROM,
      to,
      subject,
      text,
      html
    };

    console.log(' Enviando correo con opciones:', mailOptions);

    const info = await transporter.sendMail(mailOptions);
    console.log(' Correo enviado con éxito:', info.messageId || info.response);

    return info;
  } catch (error) {
    console.error(' Error enviando correo:', error.message);
    throw error;
  }
}

module.exports = { sendMail };
