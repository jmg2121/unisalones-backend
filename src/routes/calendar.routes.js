// src/routes/calendar.routes.js
const express = require('express');
const router = express.Router();
const { getCalendar } = require('../controllers/calendar.controller');
// Si quieres proteger con JWT: const { authenticate } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   - name: Calendar
 *     description: Disponibilidad en formato calendario
 */

/**
 * @swagger
 * /calendar:
 *   get:
 *     tags: [Calendar]
 *     summary: Calendario de disponibilidad diaria o semanal
 *     description: |
 *       - Con `spaceId`: cada slot es `available` o `reserved` (+ `reservationId`).  
 *       - Sin `spaceId`: cada slot es `available` o `full` con `availableSpaces`/`reservedSpaces`.
 *     parameters:
 *       - in: query
 *         name: range
 *         required: true
 *         schema: { type: string, enum: [day, week] }
 *         example: day
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, format: date }
 *         example: 2025-11-08
 *       - in: query
 *         name: spaceId
 *         required: false
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date: { type: string, format: date }
 *                 range: { type: string, enum: [day, week] }
 *                 days:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       day: { type: string, format: date }
 *                       slots:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             start: { type: string, example: "08:00" }
 *                             end:   { type: string, example: "09:00" }
 *                             status:
 *                               type: string
 *                               description: >
 *                                 Con `spaceId`: available|reserved.
 *                                 Sin `spaceId`: available|full.
 *                               example: available
 *                               reservationId: { type: integer, nullable: true }
 *                             availableSpaces: { type: integer, nullable: true }
 *                             reservedSpaces: { type: integer, nullable: true }
 *       400:
 *         description: Parámetros inválidos
 *       404:
 *         description: Espacio no encontrado o inactivo
 */
router.get('/', /* authenticate, */ getCalendar);

module.exports = router;
