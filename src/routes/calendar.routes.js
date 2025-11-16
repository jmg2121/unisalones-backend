// src/routes/calendar.routes.js
const express = require('express');
const router = express.Router();

const { getCalendar } = require('../controllers/calendar.controller');
const { authenticate } = require('../middlewares/auth');

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
 *     summary: Calendario de disponibilidad diaria o semanal // HU-008 — Visualización de horarios (ESTUDIANTE/PROFESOR)
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
 *       400:
 *         description: Parámetros inválidos
 *       404:
 *         description: Espacio no encontrado o inactivo
 */
router.get('/', authenticate, getCalendar);

module.exports = router;
