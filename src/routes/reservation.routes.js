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
 *             required: [spaceId, start, end]
 *             properties:
 *               spaceId:
 *                 type: integer
 *                 example: 2
 *               start:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-12T08:00:00.000Z"
 *               end:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-12T09:00:00.000Z"
 *     responses:
 *       '201':
 *         description: Reserva creada exitosamente
 *         content:
 *           application/json:
 *             example:
 *               message: "Reserva creada correctamente"
 *               reservation:
 *                 id: 10
 *                 user_id: 5
 *                 space_id: 2
 *                 start_time: "2025-11-12T08:00:00.000Z"
 *                 end_time: "2025-11-12T09:00:00.000Z"
 *                 status: "confirmed"
 *       '400':
 *         description: Error en los datos enviados
 *         content:
 *           application/json:
 *             example:
 *               message: "Faltan campos requeridos: spaceId, start y end."
 *       '409':
 *         description: Conflicto de horario (ya ocupado)
 *         content:
 *           application/json:
 *             example:
 *               message: "El horario solicitado ya está reservado"
 *       '401':
 *         description: Usuario no autenticado
 */
router.post('/', authenticate, validateReservationCreate, create);

/**
 * @swagger
 * /reservations/{id}:
 *   patch:
 *     tags: [Reservations]
 *     summary: Modificar una reserva existente
 *     description: Permite al usuario autenticado actualizar su reserva (solo se pueden cambiar las horas de inicio y fin).
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
 *             required: [start, end]
 *             properties:
 *               start:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-13T10:00:00.000Z"
 *               end:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-13T11:00:00.000Z"
 *     responses:
 *       '200':
 *         description: Reserva modificada correctamente
 *         content:
 *           application/json:
 *             example:
 *               message: "Reserva actualizada correctamente"
 *               updatedReservation:
 *                 id: 10
 *                 start_time: "2025-11-13T10:00:00.000Z"
 *                 end_time: "2025-11-13T11:00:00.000Z"
 *                 status: "confirmed"
 *       '400':
 *         description: Validación fallida
 *         content:
 *           application/json:
 *             example:
 *               message: "Los campos start y end son obligatorios."
 *       '403':
 *         description: Usuario no autorizado para modificar esta reserva
 *         content:
 *           application/json:
 *             example:
 *               message: "No autorizado"
 *       '404':
 *         description: Reserva no encontrada
 *         content:
 *           application/json:
 *             example:
 *               message: "Reserva no encontrada"
 */
router.patch('/:id', authenticate, modify);

/**
 * @swagger
 * /reservations/{id}:
 *   delete:
 *     tags: [Reservations]
 *     summary: Cancelar una reserva existente
 *     description: Permite al usuario autenticado o a un administrador cancelar una reserva activa.
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
 *         content:
 *           application/json:
 *             example:
 *               message: "Reserva cancelada correctamente"
 *               canceledId: 10
 *       '403':
 *         description: No autorizado
 *         content:
 *           application/json:
 *             example:
 *               message: "No autorizado"
 *       '404':
 *         description: Reserva no encontrada
 *         content:
 *           application/json:
 *             example:
 *               message: "Reserva no encontrada"
 */
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
 *         description: Historial de reservas encontrado
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 space_id: 2
 *                 start_time: "2025-11-10T08:00:00.000Z"
 *                 end_time: "2025-11-10T09:00:00.000Z"
 *                 status: "confirmed"
 *       '404':
 *         description: Sin reservas en el historial
 *         content:
 *           application/json:
 *             example:
 *               message: "No se encontraron reservas en el historial."
 */
router.get('/me', authenticate, myHistory);

/**
 * @swagger
 * /reservations:
 *   get:
 *     tags: [Reservations]
 *     summary: Listar todas las reservas del usuario autenticado
 *     description: Devuelve todas las reservas registradas por el usuario.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de reservas obtenida correctamente
 */
router.get('/', authenticate, getAllReservations);

/**
 * @swagger
 * /reservations/waitlist:
 *   post:
 *     tags: [Reservations]
 *     summary: Unirse a la lista de espera
 *     description: Permite al usuario autenticado unirse a la lista de espera de un espacio ocupado.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [spaceId, start, end]
 *             properties:
 *               spaceId:
 *                 type: integer
 *                 example: 3
 *               start:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-14T14:00:00.000Z"
 *               end:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-14T15:00:00.000Z"
 *     responses:
 *       '201':
 *         description: Usuario añadido a la lista de espera
 *         content:
 *           application/json:
 *             example:
 *               message: "Usuario añadido a la lista de espera"
 *               entry:
 *                 id: 5
 *                 space_id: 3
 *                 position: 1
 *       '400':
 *         description: Datos faltantes o inválidos
 */
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
 *         description: Lista de espera obtenida correctamente
 *       '404':
 *         description: No hay registros en la lista de espera
 */
router.get('/waitlist', authenticate, getWaitlistCtrl);

module.exports = router;
