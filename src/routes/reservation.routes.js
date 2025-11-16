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

// ====== ZONA HORARIA: AMÉRICA/BOGOTÁ ======
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const APP_TZ = 'America/Bogota';

// ===========================
// Normalizar fechas (COL → UTC)
// ===========================
function normalizeDateFields(req, res, next) {
  try {
    const { start, end } = req.body;

    if (start) {
      req.body.startUTC = dayjs.tz(start, APP_TZ).utc().toDate();
    }
    if (end) {
      req.body.endUTC = dayjs.tz(end, APP_TZ).utc().toDate();
    }

    next();
  } catch (error) {
    return res.status(400).json({ error: 'Formato de fecha inválido' });
  }
}

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
 *     summary: Crear una nueva reserva // HU-002 — Reserva de espacio (ADMIN/ESTUDIANTE/PROFESOR)
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
 *                 example: "2025-11-12T08:00:00"
 *               end:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-12T09:00:00"
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
 *                 start_time: "2025-11-12T08:00:00"
 *                 end_time: "2025-11-12T09:00:00"
 *                 status: "confirmed"
 *       '400':
 *         description: Error en los datos enviados
 *       '409':
 *         description: Conflicto de horario
 *       '401':
 *         description: Usuario no autenticado
 */
router.post('/', authenticate, validateReservationCreate, normalizeDateFields, create);

/**
 * @swagger
 * /reservations/{id}:
 *   patch:
 *     tags: [Reservations]
 *     summary: Modificar una reserva existente // HU-003 — Cancelar o modificar reserva
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *                 example: "2025-11-13T10:00:00"
 *               end:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-13T11:00:00"
 *     responses:
 *       '200':
 *         description: Reserva actualizada correctamente
 *       '400':
 *         description: Validación fallida
 *       '403':
 *         description: No autorizado
 *       '404':
 *         description: Reserva no encontrada
 */
router.patch('/:id', authenticate, normalizeDateFields, modify);

/**
 * @swagger
 * /reservations/{id}:
 *   delete:
 *     tags: [Reservations]
 *     summary: Cancelar una reserva existente // HU-003 — Cancelar o modificar reserva
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Reserva cancelada correctamente
 *       '403':
 *         description: No autorizado
 *       '404':
 *         description: Reserva no encontrada
 */
router.delete('/:id', authenticate, cancelCtrl);

/**
 * @swagger
 * /reservations/me:
 *   get:
 *     tags: [Reservations]
 *     summary: Listar reservas del usuario autenticado // HU-009 — Historial de reservas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Historial obtenido
 *       '404':
 *         description: No se encontraron reservas
 */
router.get('/me', authenticate, myHistory);

/**
 * @swagger
 * /reservations:
 *   get:
 *     tags: [Reservations]
 *     summary: Listar todas las reservas del usuario autenticado
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
 *     summary: Unirse a la lista de espera // HU-010 — Lista de espera
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
 *                 example: "2025-11-14T14:00:00"
 *               end:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-14T15:00:00"
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
router.post('/waitlist', authenticate, normalizeDateFields, joinWaitlistCtrl);

/**
 * @swagger
 * /reservations/waitlist:
 *   get:
 *     tags: [Reservations]
 *     summary: Obtener lista de espera del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista obtenida correctamente
 *       '404':
 *         description: No hay registros en la lista de espera
 */
router.get('/waitlist', authenticate, getWaitlistCtrl);

module.exports = router;
