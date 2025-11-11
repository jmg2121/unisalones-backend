const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const {
  getNotifications,
  markAsRead,
  listAll,
  getById,
  remove,
  sendTest
} = require('../controllers/notification.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Gestión de notificaciones generadas por reservas y correos electrónicos
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Listar notificaciones del usuario autenticado
 *     description: Retorna todas las notificaciones asociadas al usuario que inició sesión.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de notificaciones del usuario autenticado.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       '404':
 *         description: No hay notificaciones disponibles.
 *       '401':
 *         description: No autenticado.
 */
router.get('/', authenticate, getNotifications);

/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     tags: [Notifications]
 *     summary: Marcar una notificación como leída
 *     description: Cambia el estado de una notificación a leída para el usuario autenticado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 5
 *         description: ID de la notificación a marcar como leída.
 *     responses:
 *       '200':
 *         description: Notificación marcada como leída correctamente.
 *       '404':
 *         description: Notificación no encontrada.
 *       '401':
 *         description: No autenticado.
 */
router.put('/:id/read', authenticate, markAsRead);

/**
 * @swagger
 * /notifications/all:
 *   get:
 *     tags: [Notifications]
 *     summary: Listar todas las notificaciones (solo administrador)
 *     description: Permite a los administradores visualizar todas las notificaciones registradas en el sistema.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista completa de notificaciones.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       '403':
 *         description: Acceso denegado. Solo administradores.
 *       '401':
 *         description: No autenticado.
 */
router.get('/all', authenticate, authorize(['admin']), listAll);

/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     tags: [Notifications]
 *     summary: Obtener una notificación específica
 *     description: Retorna una notificación concreta si pertenece al usuario autenticado o si el usuario es administrador.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 7
 *         description: ID de la notificación a consultar.
 *     responses:
 *       '200':
 *         description: Notificación encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       '404':
 *         description: Notificación no encontrada.
 *       '401':
 *         description: No autenticado.
 */
router.get('/:id', authenticate, getById);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Eliminar una notificación
 *     description: Elimina una notificación si pertenece al usuario autenticado o si el usuario es administrador.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 12
 *         description: ID de la notificación a eliminar.
 *     responses:
 *       '200':
 *         description: Notificación eliminada correctamente.
 *       '404':
 *         description: Notificación no encontrada.
 *       '401':
 *         description: No autenticado.
 */
router.delete('/:id', authenticate, remove);

/**
 * @swagger
 * /notifications/test:
 *   post:
 *     tags: [Notifications]
 *     summary: Enviar correo de prueba y registrar notificación
 *     description: Envía un correo electrónico de prueba usando las credenciales del servidor SMTP configurado y registra la notificación en la base de datos.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, subject, body]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ana@unicomfacauca.edu.co
 *               subject:
 *                 type: string
 *                 example: "Reserva cancelada"
 *               body:
 *                 type: string
 *                 example: "<p>Tu reserva ha sido cancelada correctamente.</p>"
 *     responses:
 *       '201':
 *         description: Correo enviado y notificación registrada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       '400':
 *         description: Faltan campos requeridos (email, subject o body).
 *       '401':
 *         description: No autenticado.
 */
router.post('/test', authenticate, sendTest);

module.exports = router;
