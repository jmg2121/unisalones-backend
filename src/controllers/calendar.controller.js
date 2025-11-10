// src/controllers/calendar.controller.js
const { Op } = require('sequelize');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const { Reservation, Space } = require('../models');

// Config por defecto (ajusta por .env si quieres)
const APP_TZ = process.env.APP_TZ || 'America/Bogota';
const SLOT_MINUTES = parseInt(process.env.CALENDAR_SLOT_MINUTES || '60', 10);
const DAY_START = process.env.CALENDAR_DAY_START || '08:00';
const DAY_END   = process.env.CALENDAR_DAY_END   || '20:00';

function generateSlotsForDay(dayISO, tz = APP_TZ) {
  const [sh, sm] = DAY_START.split(':').map(Number);
  const [eh, em] = DAY_END.split(':').map(Number);

  let cursor = dayjs.tz(dayISO, tz).hour(sh).minute(sm).second(0).millisecond(0);
  const limit  = dayjs.tz(dayISO, tz).hour(eh).minute(em).second(0).millisecond(0);

  const slots = [];
  while (cursor.isBefore(limit)) {
    const next = cursor.add(SLOT_MINUTES, 'minute');
    if (next.isAfter(limit)) break;
    slots.push({ start: cursor.format('HH:mm'), end: next.format('HH:mm') });
    cursor = next;
  }
  return slots;
}

function toUtcRangeForSlot(dayISO, slot, tz = APP_TZ) {
  const startLocal = dayjs.tz(`${dayISO}T${slot.start}:00`, tz);
  const endLocal   = dayjs.tz(`${dayISO}T${slot.end}:00`, tz);
  return [startLocal.utc().toDate(), endLocal.utc().toDate()];
}

async function getCalendar(req, res) {
  try {
    const { range = 'day', date, spaceId } = req.query;

    if (!['day', 'week'].includes(range)) {
      return res.status(400).json({ error: "range inválido. Usa 'day' o 'week'." });
    }
    if (!date) return res.status(400).json({ error: "Falta 'date' (YYYY-MM-DD)." });

    const base = dayjs.tz(date, APP_TZ);
    if (!base.isValid()) {
      return res.status(400).json({ error: "date inválido. Usa formato YYYY-MM-DD." });
    }

    // Conjunto de días a responder
    const days = [];
    if (range === 'day') {
      days.push(base.format('YYYY-MM-DD'));
    } else {
      for (let i = 0; i < 7; i++) days.push(base.add(i, 'day').format('YYYY-MM-DD'));
    }

    // Filtrado de espacios
    let spaces = [];
    if (spaceId) {
      const s = await Space.findByPk(spaceId);
      if (!s || !s.is_active) return res.status(404).json({ error: 'spaceId no existe o inactivo.' });
      spaces = [s];
    } else {
      spaces = await Space.findAll({ where: { is_active: true }, attributes: ['id'] });
      if (!spaces.length) {
        return res.json({ date: base.format('YYYY-MM-DD'), range, days: days.map(d => ({ day: d, slots: [] })) });
      }
    }

    // Rango “grande” para precargar reservas en una sola consulta
    const startRangeUTC = dayjs.tz(`${days[0]}T00:00:00`, APP_TZ).utc().toDate();
    const endRangeUTC   = dayjs.tz(`${days[days.length - 1]}T23:59:59`, APP_TZ).utc().toDate();

    const where = {
      status: 'confirmed',
      [Op.and]: [
        { start_time: { [Op.lt]: endRangeUTC } },
        { end_time:   { [Op.gt]: startRangeUTC } }
      ]
    };
    if (spaceId) where.space_id = Number(spaceId);

    const allReservations = await Reservation.findAll({
      where,
      attributes: ['id', 'space_id', 'start_time', 'end_time', 'status'],
      raw: true
    });

    const response = { date: base.format('YYYY-MM-DD'), range, days: [] };

    for (const d of days) {
      const slots = generateSlotsForDay(d, APP_TZ);

      if (spaceId) {
        // Modo detallado para un espacio: available|reserved + reservationId
        for (const slot of slots) {
          const [sUTC, eUTC] = toUtcRangeForSlot(d, slot, APP_TZ);
          const match = allReservations.find(r =>
            r.space_id === Number(spaceId) &&
            (new Date(r.start_time) < eUTC) &&
            (new Date(r.end_time)   > sUTC)
          );
          if (match) {
            slot.status = 'reserved';
            slot.reservationId = match.id;
          } else {
            slot.status = 'available';
          }
        }
      } else {
        // Modo agregado global: available|full + contadores
        for (const slot of slots) {
          const [sUTC, eUTC] = toUtcRangeForSlot(d, slot, APP_TZ);
          const reservationsInSlot = allReservations.filter(r =>
            (new Date(r.start_time) < eUTC) && (new Date(r.end_time) > sUTC)
          );
          const reservedSet = new Set(reservationsInSlot.map(r => r.space_id));
          const total = spaces.length;
          const reservedCount = reservedSet.size;
          const availableCount = Math.max(total - reservedCount, 0);

          slot.status = availableCount > 0 ? 'available' : 'full';
          slot.availableSpaces = availableCount;
          slot.reservedSpaces = reservedCount;
        }
      }

      response.days.push({ day: d, slots });
    }

    return res.json(response);
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Error generando calendario' });
  }
}

module.exports = { getCalendar };
