const { Notification, User } = require('../models');
const { transporter, FROM } = require('../config/email');

// =============================
//  GET /notifications  → Listar notificaciones del usuario autenticado
// =============================
async function getNotifications(req, res, next) {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    if (!notifications.length) {
      return res.status(404).json({ message: 'No hay notificaciones disponibles.' });
    }

    return res.status(200).json(notifications);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error al obtener notificaciones:', err);
    }
    return next(err);
  }
}

// =============================
//  PUT /notifications/:id/read  → Marcar notificación como leída
// =============================
async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'ID de notificación inválido.' });
    }

    const notification = await Notification.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada.' });
    }

    if (notification.is_read) {
      return res.status(200).json({ message: 'La notificación ya estaba marcada como leída.' });
    }

    await notification.update({ is_read: true });
    return res.status(200).json({ message: 'Notificación marcada como leída.' });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error al marcar notificación como leída:', err);
    }
    return next(err);
  }
}

// =============================
//  GET /notifications/all  → Listar todas las notificaciones (solo admin)
// =============================
async function listAll(req, res, next) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
    }

    const items = await Notification.findAll({
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });

    if (!items.length) {
      return res.status(404).json({ message: 'No hay notificaciones registradas.' });
    }

    return res.status(200).json(items);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error al listar todas las notificaciones:', err);
    }
    return next(err);
  }
}

// =============================
//  GET /notifications/:id  → Obtener notificación por ID
// =============================
async function getById(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'ID de notificación inválido.' });
    }

    const where = req.user.role === 'admin'
      ? { id }
      : { id, user_id: req.user.id };

    const item = await Notification.findOne({ where });

    if (!item) {
      return res.status(404).json({ message: 'Notificación no encontrada.' });
    }

    return res.status(200).json(item);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error al obtener notificación por ID:', err);
    }
    return next(err);
  }
}

// =============================
//  DELETE /notifications/:id  → Eliminar notificación
// =============================
async function remove(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'ID de notificación inválido.' });
    }

    const where = req.user.role === 'admin'
      ? { id }
      : { id, user_id: req.user.id };

    const deleted = await Notification.destroy({ where });

    if (!deleted) {
      return res.status(404).json({ message: 'Notificación no encontrada.' });
    }

    return res.status(200).json({ message: 'Notificación eliminada correctamente.' });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error al eliminar notificación:', err);
    }
    return next(err);
  }
}

// =============================
//  POST /notifications/test  → Enviar correo de prueba y registrar notificación
// =============================
async function sendTest(req, res, next) {
  try {
    const { email, subject, body } = req.body || {};

    if (!email || !subject || !body) {
      return res.status(400).json({
        message: 'Los campos email, subject y body son requeridos.'
      });
    }

    const mailOptions = {
      from: FROM,
      to: email,
      subject,
      html: body,
      text: body.replace(/<[^>]+>/g, ' ')
    };

    const result = await transporter.sendMail(mailOptions);
    const status = result?.accepted?.length ? 'sent' : 'failed';

    const record = await Notification.create({
      user_id: req.user.id,
      message: subject,
      type: status === 'sent' ? 'reservation_confirmed' : 'reminder',
      payload: {
        email,
        subject,
        body,
        status,
        response: result.response || null
      },
      is_read: false,
      sent_at: new Date()
    });

    return res.status(201).json({
      message: 'Correo enviado y notificación registrada.',
      status,
      record
    });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error al enviar correo de prueba:', err);
    }
    return next(err);
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  listAll,
  getById,
  remove,
  sendTest
};
