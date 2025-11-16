// src/services/report.service.js
const { Op } = require('sequelize');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const { Reservation, Space, User } = require('../models');

const APP_TZ = process.env.APP_TZ || 'America/Bogota';

// =============================================
// Convertir rangos YYYY-MM-DD a UTC real
// =============================================
function toDateRangeInclusive(startDate, endDate) {
  const start = dayjs.tz(`${startDate} 00:00:00`, APP_TZ).utc().toDate();
  const end   = dayjs.tz(`${endDate} 23:59:59`, APP_TZ).utc().toDate();
  return { start, end };
}

function diffHours(a, b) {
  const ms = dayjs(b).diff(dayjs(a), 'millisecond');
  return Math.max(ms / (1000 * 60 * 60), 0);
}

// =============================================
// Fetch de reservas (con TZ correcta)
// =============================================
async function fetchReservations({ startDate, endDate, spaceId }) {
  const { start, end } = toDateRangeInclusive(startDate, endDate);

  const where = {
    status: 'confirmed',
    [Op.and]: [
      { start_time: { [Op.lt]: end } },
      { end_time:   { [Op.gt]: start } }
    ]
  };
  if (spaceId) where.space_id = spaceId;

  return Reservation.findAll({
    where,
    include: [
      { model: Space, as: 'space', attributes: ['id', 'name', 'type', 'is_active'] },
      { model: User,  as: 'user',  attributes: ['id', 'name', 'email'] },
    ],
    order: [['start_time', 'ASC']],
  });
}

// =============================================
// Agregación por día (día en Colombia)
// =============================================
function aggregateUsage(reservations) {
  const byDay = {};

  for (const r of reservations) {
    // Convertir r.start_time (UTC) a día colombiano
    const day = dayjs.utc(r.start_time).tz(APP_TZ).format('YYYY-MM-DD');

    const sid = r.space_id;
    const sname = r.space?.name || `Space ${sid}`;
    const hours = diffHours(r.start_time, r.end_time);
    const status = r.status || 'unknown';

    if (!byDay[day]) byDay[day] = {};
    if (!byDay[day][sid]) {
      byDay[day][sid] = {
        spaceId: sid,
        spaceName: sname,
        reservationsCount: 0,
        totalHours: 0,
        statusBreakdown: {},
      };
    }

    byDay[day][sid].reservationsCount += 1;
    byDay[day][sid].totalHours += hours;
    byDay[day][sid].statusBreakdown[status] =
      (byDay[day][sid].statusBreakdown[status] || 0) + 1;
  }

  // Convertir estructura interna a respuesta final
  const days = Object.keys(byDay).sort();

  const result = days.map((d) => {
    const spaces = Object.values(byDay[d]).map((row) => ({
      spaceId: row.spaceId,
      spaceName: row.spaceName,
      reservationsCount: row.reservationsCount,
      totalHours: Number(row.totalHours.toFixed(2)),
      statusBreakdown: row.statusBreakdown,
    }));

    const totals = spaces.reduce(
      (acc, s) => {
        acc.reservationsCount += s.reservationsCount;
        acc.totalHours += s.totalHours;
        return acc;
      },
      { reservationsCount: 0, totalHours: 0 }
    );

    return {
      day: d,
      totals: {
        reservationsCount: totals.reservationsCount,
        totalHours: Number(totals.totalHours.toFixed(2)),
        spacesUsed: spaces.length,
      },
      spaces,
    };
  });

  return { days: result };
}

module.exports = {
  fetchReservations,
  aggregateUsage,
};
