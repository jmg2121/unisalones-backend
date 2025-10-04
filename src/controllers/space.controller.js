const { Space } = require('../models');
const {
  createSpace,
  listSpaces,
  getSpace,
  updateSpace,
  deleteSpace,
  searchAvailable   // ✅ importamos la función correcta
} = require('../services/space.service');

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
// Crear espacio (solo admin)
async function create(req, res, next) {
  try {
    const space = await createSpace(req.body);
    res.status(201).json(space);
  } catch (e) { next(e); }
}

// Listar todos los espacios
async function list(req, res, next) {
  try {
    const spaces = await listSpaces();
    res.json(spaces);
  } catch (e) { next(e); }
}

// Obtener un espacio específico
async function get(req, res, next) {
  try {
    const space = await getSpace(req.params.id);
    if (!space) return res.status(404).json({ message: 'Espacio no encontrado' });
    res.json(space);
  } catch (e) { next(e); }
}

// Actualizar un espacio
async function update(req, res, next) {
  try {
    const space = await updateSpace(req.params.id, req.body);
    res.json(space);
  } catch (e) { next(e); }
}

// Eliminar un espacio (solo si no tiene reservas activas)
async function remove(req, res, next) {
  try {
    await deleteSpace(req.params.id);
    res.status(204).end();
  } catch (e) { next(e); }
}

// Buscar espacios disponibles por fecha, hora y tipo
async function available(req, res, next) {
  try {
    const { date, start, end, type } = req.query;

    // Validaciones rápidas
    if (!date || !start || !end) {
      return res.status(400).json({ message: 'Parámetros requeridos: date, start, end' });
    }

    // ✅ Pasar como objeto
    const spaces = await searchAvailable({ date, start, end, type });
    res.json(spaces);
  } catch (e) {
    next(e);
  }
}

module.exports = {
  create,
  list,
  get,
  update,
  remove,
  available   // ✅ exportamos correctamente
};
