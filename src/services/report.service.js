// src/services/report.service.js
const { Op } = require('sequelize');
const dayjs = require('dayjs');
const { Reservation, Space, User } = require('../models'); // Ajusta ruta si difiere

function toDateRangeInclusive(startDate, endDate) {
  const start = dayjs(startDate).startOf('day').toDate();
  const end = dayjs(endDate).endOf('day').toDate();
  return { start, end };
}

function diffHours(a, b) {
  const ms = dayjs(b).diff(dayjs(a), 'millisecond');
  return Math.max(ms / (1000 * 60 * 60), 0);
}

async function fetchReservations({ startDate, endDate, spaceId }) {
  const { start, end } = toDateRangeInclusive(startDate, endDate);

  const where = {
    start_time: { [Op.gte]: start },
    end_time: { [Op.lte]: end },
  };
  if (spaceId) where.space_id = spaceId;

  return Reservation.findAll({
    where,
    include: [
      { model: Space, as: 'space', attributes: ['id', 'name', 'type', 'is_active'] },
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
    ],
    order: [['start_time', 'ASC']],
  });
}

function aggregateUsage(reservations) {
  // Estructura: { [day]: { [spaceId]: { spaceName, reservationsCount, totalHours, statusBreakdown } } }
  const byDay = {};

  for (const r of reservations) {
    const day = dayjs(r.start_time).format('YYYY-MM-DD');
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
    byDay[day][sid].statusBreakdown[status] = (byDay[day][sid].statusBreakdown[status] || 0) + 1;
  }

  // Armar arreglo final por día
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
