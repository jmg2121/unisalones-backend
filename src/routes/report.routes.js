// src/routes/report.routes.js
const { Router } = require('express');
const { query } = require('express-validator');
const { getUsageReport } = require('../controllers/report.controller');
const { authenticate } = require('../middlewares/auth'); // JWT
const requireRole = require('../middlewares/requireRole'); // requireRole('admin')

const router = Router();

/**
 * @openapi
 * /reports/usage:
 *   get:
 *     tags:
 *       - Reports
 *     summary: Reporte de uso de espacios // HU-006 — Reportes de uso de espacios (ADMIN)
 *     description: >
 *       Genera un reporte de uso de los espacios en un rango de fechas determinado.
 *       Soporta los formatos:
 *       - **JSON** → devuelve estructura de datos.
 *       - **PDF** → archivo descargable con encabezado y tabla.
 *       - **XLSX** → archivo Excel con datos tabulares.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         description: Fecha inicial (formato YYYY-MM-DD)
 *         required: true
 *         schema:
 *           type: string
 *           example: "2025-11-01"
 *       - in: query
 *         name: endDate
 *         description: Fecha final (formato YYYY-MM-DD)
 *         required: true
 *         schema:
 *           type: string
 *           example: "2025-11-12"
 *       - in: query
 *         name: spaceId
 *         description: (Opcional) ID del espacio para filtrar
 *         required: false
 *         schema:
 *           type: integer
 *           example: 3
 *       - in: query
 *         name: format
 *         description: Formato del reporte (json, pdf o xlsx)
 *         required: false
 *         schema:
 *           type: string
 *           enum: [json, pdf, xlsx]
 *           example: "json"
 *     responses:
 *       200:
 *         description: Reporte generado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportUsage'
 *             example:
 *               meta:
 *                 startDate: "2025-11-01"
 *                 endDate: "2025-11-07"
 *                 spaceId: null
 *                 generatedAt: "2025-11-12T13:00:00Z"
 *               data:
 *                 days:
 *                   - day: "2025-11-01"
 *                     totals:
 *                       reservationsCount: 5
 *                       totalHours: 12.5
 *                       spacesUsed: 3
 *                     spaces:
 *                       - spaceId: 1
 *                         spaceName: "Sala A"
 *                         reservationsCount: 2
 *                         totalHours: 5
 *                         statusBreakdown:
 *                           confirmed: 2
 *                       - spaceId: 2
 *                         spaceName: "Sala B"
 *                         reservationsCount: 3
 *                         totalHours: 7.5
 *                         statusBreakdown:
 *                           confirmed: 2
 *                           cancelled: 1
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *             example: "(archivo PDF descargable)"
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *             example: "(archivo XLSX descargable)"
 *       400:
 *         description: Parámetros inválidos (formato de fechas u opciones incorrectas).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               message: "Parámetros inválidos"
 *               details: ["startDate debe ser YYYY-MM-DD"]
 *       401:
 *         description: No autorizado. Token JWT faltante o inválido.
 *       403:
 *         description: Acceso denegado. Solo administradores pueden generar reportes.
 */

router.get(
  '/usage',
  authenticate,
  requireRole('admin'),
  [
    query('startDate').isISO8601().withMessage('startDate debe ser YYYY-MM-DD'),
    query('endDate').isISO8601().withMessage('endDate debe ser YYYY-MM-DD'),
    query('spaceId').optional().isInt().toInt(),
    query('format').optional().isIn(['json', 'pdf', 'xlsx']).withMessage('format inválido'),
  ],
  getUsageReport
);

module.exports = router;
