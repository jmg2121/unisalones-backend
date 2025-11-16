// src/utils/availability.js

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

// Zona horaria oficial del sistema
const APP_TZ = process.env.APP_TZ || "America/Bogota";

/**
 * Normaliza cualquier fecha (string o Date) a un Date UTC limpio.
 */
function toUTC(dateInput) {
  return dayjs.tz(dateInput, APP_TZ).utc().toDate();
}

/**
 * Devuelve true si hay solapamiento entre dos intervalos de tiempo.
 * 
 * Las fechas se normalizan a UTC para evitar inconsistencias cuando:
 * - Swagger manda formato ISO con Z
 * - Se envían horas locales (ej: "2025-11-16 08:00")
 * - BD guarda UTC
 * - El backend mezcla zonas horarias
 */
function overlaps(startA, endA, startB, endB) {
  const aStart = toUTC(startA);
  const aEnd   = toUTC(endA);
  const bStart = toUTC(startB);
  const bEnd   = toUTC(endB);

  return aStart < bEnd && aEnd > bStart;
}

module.exports = { overlaps, toUTC };
