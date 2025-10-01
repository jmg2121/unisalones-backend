const dayjs = require('dayjs');
const { Space, Reservation } = require('../models');
const { listAvailable } = require('../services/space.service');

async function createSpace(req, res, next) {
  try {
    const space = await Space.create(req.body);
    res.status(201).json(space);
  } catch (e) { next(e); }
}

async function updateSpace(req, res, next) {
  try {
    const space = await Space.findByPk(req.params.id);
    if (!space) return res.status(404).json({ error: 'No encontrado' });
    Object.assign(space, req.body);
    await space.save();
    res.json(space);
  } catch (e) { next(e); }
}

async function deleteSpace(req, res, next) {
  try {
    const space = await Space.findByPk(req.params.id);
    if (!space) return res.status(404).json({ error: 'No encontrado' });
    const active = await Reservation.count({ where: { space_id: space.id, status: 'confirmed' } });
    if (active > 0) throw new Error('No se puede eliminar: tiene reservas activas');
    await space.destroy();
    res.status(204).end();
  } catch (e) { next(e); }
}

async function searchAvailable(req, res, next) {
  try {
    const { date, start, end, type } = req.query;
    const dateStart = dayjs(fixDate(date, start)).toDate();
    const dateEnd = dayjs(fixDate(date, end)).toDate();
    const list = await listAvailable({ dateStart, dateEnd, type });
    res.json(list);
  } catch (e) { next(e); }
}

function fixDate(date, time) {
  // time "HH:mm"
  const [h,m] = time.split(':');
  return `${date}T${h.padStart(2,'0')}:${m.padStart(2,'0')}:00.000Z`;
}

module.exports = { createSpace, updateSpace, deleteSpace, searchAvailable };
