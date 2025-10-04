const { Op } = require('sequelize');
const dayjs = require('dayjs');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
dayjs.extend(isSameOrBefore);

const { Space, Reservation } = require('../models');
const { overlaps } = require('../utils/availability');

// =======================
// Crear espacio
// =======================
async function createSpace(data) {
  if (!data.name) throw new Error('name requerido');
  if (!data.capacity || Number(data.capacity) <= 0) {
    throw new Error('capacity debe ser > 0');
  }
  const space = await Space.create({
    name: data.name,
    type: data.type || null,
    capacity: data.capacity,
    description: data.description || null
  });
  return space;
}

// =======================
// Listar todos
// =======================
async function listSpaces() {
  return Space.findAll({ order: [['id', 'ASC']] });
}

// =======================
// Obtener por ID
// =======================
async function getSpace(id) {
  const space = await Space.findByPk(id);
  if (!space) throw new Error('space no encontrado');
  return space;
}

// =======================
// Actualizar
// =======================
async function updateSpace(id, data) {
  const space = await getSpace(id);
  if (data.capacity != null && Number(data.capacity) <= 0) {
    throw new Error('capacity debe ser > 0');
  }
  await space.update({
    name: data.name ?? space.name,
    type: data.type ?? space.type,
    capacity: data.capacity ?? space.capacity,
    description: data.description ?? space.description
  });
  return space;
}

// =======================
// Eliminar (validando reservas activas)
// =======================
async function deleteSpace(id) {
  const space = await getSpace(id);
  const now = dayjs().toDate();

  const active = await Reservation.count({
    where: {
      space_id: space.id,
      status: 'confirmed',
      end_time: { [Op.gt]: now }
    }
  });

  if (active > 0) {
    throw new Error('No se puede eliminar un espacio con reservas activas');
  }

  await space.destroy();
  return { ok: true };
}

// =======================
// Buscar disponibilidad
// =======================
// =======================
// Buscar disponibilidad
// =======================
async function searchAvailable({ date, start, end, type }) {
  if (!date || !start || !end) throw new Error('date, start y end son requeridos');

  // Normalizamos siempre como ISO
  const startTime = new Date(`${date}T${start}:00.000Z`);
  const endTime   = new Date(`${date}T${end}:00.000Z`);

  const spaces = await Space.findAll({
    where: { is_active: true, ...(type ? { type } : {}) }
  });

  const available = [];
  for (const space of spaces) {
    const overlapping = await Reservation.findOne({
      where: {
        space_id: space.id,
        status: 'confirmed',
        [Op.and]: [
          { start_time: { [Op.lt]: endTime } },
          { end_time: { [Op.gt]: startTime } }
        ]
      }
    });

    if (!overlapping) {
      available.push(space);
    }
  }

  return available;
}



// =======================
// Exportar todo
// =======================
module.exports = {
  createSpace,
  listSpaces,
  getSpace,
  updateSpace,
  deleteSpace,
  searchAvailable
};
