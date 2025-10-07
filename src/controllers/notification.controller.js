const { Notification } = require('../models');

// 📬 Obtener todas las notificaciones del usuario autenticado
async function getNotifications(req, res, next) {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    if (!notifications.length) {
      return res.status(404).json({ message: 'No hay notificaciones disponibles.' });
    }

    res.json(notifications);
  } catch (e) {
    if (process.env.NODE_ENV === 'development') console.error('Error al obtener notificaciones:', e);
    next(e);
  }
}

// 📨 Marcar una notificación como leída
async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const notif = await Notification.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!notif) {
      return res.status(404).json({ message: 'Notificación no encontrada.' });
    }

    notif.read = true;
    await notif.save();

    res.status(200).json({ message: 'Notificación marcada como leída.' });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') console.error('Error al marcar notificación:', e);
    next(e);
  }
}

module.exports = { getNotifications, markAsRead };
