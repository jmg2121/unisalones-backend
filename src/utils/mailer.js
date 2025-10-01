const nodemailer = require('nodemailer');

// Transport simulado (no envía a internet). Para SMTP real, reconfigure aquí.
const transport = nodemailer.createTransport({
  streamTransport: true,
  newline: 'unix',
  buffer: true
});

async function sendMail({ to, subject, text, html }) {
  const info = await transport.sendMail({
    from: 'no-reply@unisalones.edu',
    to, subject, text, html
  });
  return info.message.toString();
}

module.exports = { sendMail };
