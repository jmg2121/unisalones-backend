const dayjs = require('dayjs');
const { Space, Reservation } = require('../models');
const { listAvailable } = require('../services/space.service');

// ✅ Crear un nuevo espacio
async function createSpace(req, res, next) {
  try {
    const { name, type, capacity, location } = req.body;

    // 🔍 Validaciones básicas
    if (!name || !type || !capacity) {
      return res.status(400).json({ message: 'Los campos name, type y capacity son obligatorios' });
    }

    const space = await Space.create({ name, type, capacity, location });
    res.status(201).json({
      message: 'Espacio creado correctamente',
      space
    });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') console.error('Error al crear espacio:', e);
    next(e);
  }
}

// ✅ Actualizar un espacio existente
async function updateSpace(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const space = await Space.findByPk(id);
    if (!space) {
      return res.status(404).json({ message: 'Espacio no encontrado' });
    }

    Object.assign(space, updates);
    await space.save();

    res.json({
      message: 'Espacio actualizado correctamente',
      space
    });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') console.error('Error al actualizar espacio:', e);
    next(e);
  }
}

// ✅ Eliminar un espacio
async function deleteSpace(req, res, next) {
  try {
    const { id } = req.params;

    const space = await Space.findByPk(id);
    if (!space) {
      return res.status(404).json({ message: 'Espacio no encontrado' });
    }

    const activeReservations = await Reservation.count({
      where: { space_id: space.id, status: 'confirmed' }
    });

    if (activeReservations > 0) {
      return res.status(409).json({
        message: 'No se puede eliminar el espacio: tiene reservas activas'
      });
    }

    await space.destroy();
    res.status(200).json({ message: 'Espacio eliminado correctamente' });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') console.error('Error al eliminar espacio:', e);
    next(e);
  }
}

// ✅ Buscar espacios disponibles
async function searchAvailable(req, res, next) {
  try {
    const { date, start, end, type } = req.query;

    // 🔍 Validaciones básicas
    if (!date || !start || !end) {
      return res.status(400).json({ message: 'date, start y end son obligatorios' });
    }

    const dateStart = dayjs(fixDate(date, start)).toDate();
    const dateEnd = dayjs(fixDate(date, end)).toDate();

    const list = await listAvailable({ dateStart, dateEnd, type });

    if (!list.length) {
      return res.status(404).json({ message: 'No hay espacios disponibles en ese rango' });
    }

    res.json({
      message: 'Espacios disponibles encontrados',
      list
    });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') console.error('Error al buscar espacios disponibles:', e);
    next(e);
  }
}

// 🧩 Helper para unir fecha y hora
function fixDate(date, time) {
  const [h, m] = time.split(':');
  return `${date}T${h.padStart(2, '0')}:${m.padStart(2, '0')}:00.000Z`;
}

module.exports = { createSpace, updateSpace, deleteSpace, searchAvailable };
