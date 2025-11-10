const express = require('express');
const { authenticate } = require('../middlewares/auth');
const { validateReservationCreate } = require('../middlewares/reservation.validators');
const {
  create,
  modify,
  cancelCtrl,
  myHistory,
  joinWaitlistCtrl,
  getAllReservations,
  getWaitlistCtrl,
} = require('../controllers/reservation.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: Gestión de reservas y lista de espera
 */

/**
 * @swagger
 * /reservations:
 *   post:
 *     tags: [Reservations]
 *     summary: Crear una nueva reserva
 *     description: Permite al usuario autenticado crear una reserva de un espacio disponible.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [spaceId, startTime, endTime]
 *             properties:
 *               spaceId:
 *                 type: integer
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-09T08:00:00Z"
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-09T09:00:00Z"
 *     responses:
 *       '201':
 *         description: Reserva creada exitosamente
 *       '400':
 *         description: Validación fallida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validación fallida
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: startTime inválido (ISO8601)
 *                       param:
 *                         type: string
 *                         example: startTime
 *                       location:
 *                         type: string
 *                         example: body
 *       '401':
 *         description: Usuario no autenticado
 */
// Crear nueva reserva (con validación OWASP)
router.post('/', authenticate, validateReservationCreate, create);

/**
 * @swagger
 * /reservations/{id}:
 *   patch:
 *     tags: [Reservations]
 *     summary: Modificar una reserva existente
 *     description: Permite al usuario autenticado actualizar los datos de su reserva.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva a modificar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       '200':
 *         description: Reserva modificada exitosamente
 *       '400':
 *         description: Validación fallida o conflicto de horario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validación fallida
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: endTime inválido (ISO8601)
 *                       param:
 *                         type: string
 *                         example: endTime
 *                       location:
 *                         type: string
 *                         example: body
 *       '401':
 *         description: Usuario no autenticado
 */
// Modificar una reserva existente
router.patch('/:id', authenticate, modify);

/**
 * @swagger
 * /reservations/{id}:
 *   delete:
 *     tags: [Reservations]
 *     summary: Cancelar una reserva
 *     description: Cancela la reserva del usuario autenticado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva a cancelar
 *     responses:
 *       '200':
 *         description: Reserva cancelada exitosamente
 *       '401':
 *         description: Usuario no autenticado
 *       '404':
 *         description: Reserva no encontrada
 */
// Cancelar una reserva
router.delete('/:id', authenticate, cancelCtrl);

/**
 * @swagger
 * /reservations/me:
 *   get:
 *     tags: [Reservations]
 *     summary: Listar reservas del usuario autenticado
 *     description: Devuelve el historial de reservas del usuario que inició sesión.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Historial de reservas del usuario
 *       '401':
 *         description: No autenticado
 */
// Listar reservas del usuario autenticado
router.get('/me', authenticate, myHistory);

/**
 * @swagger
 * /reservations:
 *   get:
 *     tags: [Reservations]
 *     summary: Listar todas las reservas
 *     description: Devuelve todas las reservas registradas (solo administradores o personal autorizado).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista completa de reservas
 *       '401':
 *         description: No autenticado
 */
// Listar todas las reservas (GET /api/reservations)
router.get('/', authenticate, getAllReservations);

/**
 * @swagger
 * /reservations/waitlist:
 *   post:
 *     tags: [Reservations]
 *     summary: Unirse a la lista de espera
 *     description: Agrega al usuario autenticado a la lista de espera de un espacio ya ocupado.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [spaceId, reservationDate]
 *             properties:
 *               spaceId:
 *                 type: integer
 *               reservationDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-11-10"
 *     responses:
 *       '201':
 *         description: Usuario añadido a la lista de espera
 *       '400':
 *         description: Error en los datos
 *       '401':
 *         description: No autenticado
 */
// Unirse a la lista de espera de un espacio ocupado
router.post('/waitlist', authenticate, joinWaitlistCtrl);

/**
 * @swagger
 * /reservations/waitlist:
 *   get:
 *     tags: [Reservations]
 *     summary: Obtener lista de espera del usuario autenticado
 *     description: Devuelve las entradas de lista de espera asociadas al usuario autenticado.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de espera del usuario
 *       '401':
 *         description: No autenticado
 */
// Obtener lista de espera del usuario autenticado
router.get('/waitlist', authenticate, getWaitlistCtrl);

module.exports = router;
