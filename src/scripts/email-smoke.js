require('dotenv').config();
const { transporter, FROM } = require('../config/email');


(async () => {
  try {
    const info = await transporter.sendMail({
      from: FROM,
      to: 'test@unicomfacauca.edu.co',
      subject: 'Smoke Test – Unisalones',
      html: '<b>SMTP OK</b>',
    });
    console.log(' SMTP OK:', info.messageId || info);
  } catch (e) {
    console.error(' SMTP FAIL:', e);
    process.exit(1);
  }
})();
