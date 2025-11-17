// src/controllers/calendar.controller.js
const { Op } = require("sequelize");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

const { Reservation, Space } = require("../models");

const APP_TZ = process.env.APP_TZ || "America/Bogota";
const SLOT_MINUTES = parseInt(process.env.CALENDAR_SLOT_MINUTES || "60", 10);
const DAY_START = process.env.CALENDAR_DAY_START || "08:00";
const DAY_END = process.env.CALENDAR_DAY_END || "20:00";

/* =============================================================
   GENERAR SLOTS EN HORA LOCAL
================================================================*/
function generateSlotsForDay(dayISO, tz = APP_TZ) {
  const [sh, sm] = DAY_START.split(":").map(Number);
  const [eh, em] = DAY_END.split(":").map(Number);

  let cursor = dayjs.tz(dayISO, tz)
    .hour(sh)
    .minute(sm)
    .second(0)
    .millisecond(0);

  const limit = dayjs.tz(dayISO, tz)
    .hour(eh)
    .minute(em)
    .second(0)
    .millisecond(0);

  const slots = [];
  while (cursor.isBefore(limit)) {
    const next = cursor.add(SLOT_MINUTES, "minute");
    if (next.isAfter(limit)) break;

    slots.push({
      start: cursor.format("HH:mm"),
      end: next.format("HH:mm"),
      spaces: [],
    });

    cursor = next;
  }
  return slots;
}

/* =============================================================
   NORMALIZAR RESERVAS → UTC → HORA LOCAL
================================================================*/
function normalizeReservation(r) {
  return {
    ...r,
    startLocal: dayjs(r.start_time),
    endLocal: dayjs(r.end_time),
  };
}

/* =============================================================
   CONTROLADOR PRINCIPAL
================================================================*/
async function getCalendar(req, res) {
  try {
    const { range = "day", date, spaceId } = req.query;

    if (!["day", "week"].includes(range)) {
      return res.status(400).json({ error: "range inválido. Usa 'day' o 'week'." });
    }
    if (!date) {
      return res.status(400).json({ error: "Falta 'date' (YYYY-MM-DD)." });
    }

    const base = dayjs.tz(date, APP_TZ);
    if (!base.isValid()) {
      return res.status(400).json({ error: "date inválido." });
    }

    const days = [];
    if (range === "day") {
      days.push(base.format("YYYY-MM-DD"));
    } else {
      for (let i = 0; i < 7; i++) {
        days.push(base.add(i, "day").format("YYYY-MM-DD"));
      }
    }

    let spaces = [];
    if (spaceId) {
      const s = await Space.findByPk(spaceId);
      if (!s || !s.is_active) {
        return res.status(404).json({ error: "spaceId no existe o está inactivo." });
      }
      spaces = [s];
    } else {
      spaces = await Space.findAll({
        where: { is_active: true },
        attributes: ["id"],
      });
      if (!spaces.length) {
        return res.json({
          date: base.format("YYYY-MM-DD"),
          range,
          days: days.map((d) => ({ day: d, slots: [] })),
        });
      }
    }

    const startRangeUTC = dayjs.tz(`${days[0]}T00:00:00`, APP_TZ).utc().toDate();
    const endRangeUTC = dayjs
      .tz(`${days[days.length - 1]}T23:59:59`, APP_TZ)
      .utc()
      .toDate();

    const where = {
      status: "confirmed",
      [Op.and]: [
        { start_time: { [Op.lt]: endRangeUTC } },
        { end_time: { [Op.gt]: startRangeUTC } },
      ],
    };
    if (spaceId) where.space_id = Number(spaceId);

    const rawReservations = await Reservation.findAll({
      where,
      attributes: ["id", "space_id", "start_time", "end_time", "status"],
      raw: true,
    });

    const reservationsLocal = rawReservations.map(normalizeReservation);

    const response = { date: base.format("YYYY-MM-DD"), range, days: [] };

    for (const d of days) {
      const slots = generateSlotsForDay(d, APP_TZ);

      /* =======================================================
         ESPACIO ESPECÍFICO
      =======================================================*/
      if (spaceId) {
        for (const slot of slots) {
          const slotStart = dayjs.tz(`${d}T${slot.start}:00`, APP_TZ);
          const slotEnd = dayjs.tz(`${d}T${slot.end}:00`, APP_TZ);

          const match = reservationsLocal.find(
            (r) =>
              r.space_id === Number(spaceId) &&
              r.startLocal.isBefore(slotEnd) &&
              r.endLocal.isAfter(slotStart)
          );

          slot.spaces = [
            {
              id: Number(spaceId),
              status: match ? "busy" : "available",
              reservationId: match?.id || null,
            },
          ];

          slot.status = match ? "reserved" : "available";
        }
      }

      /* =======================================================
         CALENDARIO GLOBAL 
      =======================================================*/
      else {
        for (const slot of slots) {
          const slotStart = dayjs.tz(`${d}T${slot.start}:00`, APP_TZ);
          const slotEnd = dayjs.tz(`${d}T${slot.end}:00`, APP_TZ);

          slot.spaces = [];

          for (const sp of spaces) {
            const match = reservationsLocal.find(
              (r) =>
                r.space_id === sp.id &&
                r.startLocal.isBefore(slotEnd) &&
                r.endLocal.isAfter(slotStart)
            );

            slot.spaces.push({
              id: sp.id,
              status: match ? "busy" : "available",
              reservationId: match?.id || null,
            });
          }

          const reservedCount = slot.spaces.filter((s) => s.status === "busy").length;
          const availableCount = spaces.length - reservedCount;

          slot.status = availableCount > 0 ? "available" : "full";
          slot.availableSpaces = availableCount;
          slot.reservedSpaces = reservedCount;
        }
      }

      response.days.push({ day: d, slots });
    }

    return res.json(response);
  } catch (e) {
    return res.status(500).json({
      error: e.message || "Error generando calendario",
    });
  }
}

module.exports = { getCalendar };
