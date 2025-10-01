const { Notification, User } = require('../models');
const { sendMail } = require('../utils/mailer');

async function createAndSend(userId, type, payload) {
  const notif = await Notification.create({ user_id: userId, type, payload });
  const user = await User.findByPk(userId);
  const message = await sendMail({
    to: user.email,
    subject: `[Unisalones] ${type}`,
    text: JSON.stringify(payload, null, 2)
  });
  notif.sent_at = new Date();
  await notif.save();
  return { notif, message };
}

module.exports = { createAndSend };
