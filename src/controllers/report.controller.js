// src/controllers/report.controller.js
const { validationResult } = require('express-validator');
const dayjs = require('dayjs');

// Plugins para manejar zona horaria
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const APP_TZ = process.env.APP_TZ || 'America/Bogota';

const { fetchReservations, aggregateUsage } = require('../services/report.service');
const { generatePDF, generateXLSX } = require('../utils/reportGenerator');

async function getUsageReport(req, res, next) {
  try {
    // ============================================================
    // 1️ Validar parámetros de entrada
    // ============================================================
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn(' Validación fallida en /api/reports/usage:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    // ============================================================
    // 2️ Obtener parámetros y procesar datos
    // ============================================================
    const { startDate, endDate, spaceId, format = 'json' } = req.query;
    console.log(` Generando reporte: ${startDate} → ${endDate}, formato=${format}`);

    const reservations = await fetchReservations({ startDate, endDate, spaceId });
    console.log(` Reservas encontradas: ${reservations.length}`);

    const aggregated = aggregateUsage(reservations);
    const rangeLabel = `Rango: ${startDate} a ${endDate}`;

    // ============================================================
    // 3️ Formatos de salida
    // ============================================================
    if (format === 'json') {
      return res.json({
        meta: {
          startDate,
          endDate,
          spaceId: spaceId ? Number(spaceId) : null,
          // AHORA en hora de Colombia
          generatedAt: dayjs().tz(APP_TZ).format(), // ej: 2025-11-16T21:30:00-05:00
        },
        data: aggregated,
      });
    }

    if (format === 'pdf') {
      console.log(' Generando PDF...');
      const stream = generatePDF({
        title: 'Reporte de Uso de Espacios',
        rangeLabel,
        data: aggregated,
      });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="usage_${startDate}_${endDate}.pdf"`
      );
      return stream.pipe(res);
    }

    if (format === 'xlsx') {
      console.log(' Generando XLSX...');
      const buffer = await generateXLSX({
        title: 'Reporte de Uso de Espacios',
        rangeLabel,
        data: aggregated,
      });
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="usage_${startDate}_${endDate}.xlsx"`
      );
      return res.send(Buffer.from(buffer));
    }

    // ============================================================
    // 4️ Formato no soportado
    // ============================================================
    console.warn(' Formato inválido solicitado:', format);
    return res
      .status(400)
      .json({ error: 'Formato no soportado. Use format=json|pdf|xlsx' });

  } catch (err) {
    // ============================================================
    // 5️ Manejo de errores detallado y forzado
    // ============================================================
    console.log('\n==============================');
    console.log(' ERROR DETECTADO EN REPORTES');
    console.log('Mensaje:', err.message);
    console.log('Tipo:', err.name);
    console.log('Stack:\n', err.stack);
    if (err.errors) console.log('Detalles Sequelize:', err.errors.map(e => e.message));
    console.log('==============================\n');

    // Devolvemos respuesta explícita (sin next) para Jest
    return res.status(500).json({
      error: 'Error interno del servidor',
      details: err.message,
      stack: err.stack?.split('\n').slice(0, 2).join(' '), // mostramos 2 primeras líneas del stack
    });
  }
}

module.exports = { getUsageReport };
