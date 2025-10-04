const { Space } = require('../models');
const {
  createSpace,
  listSpaces,
  getSpace,
  updateSpace,
  deleteSpace,
  searchAvailable   // ✅ importamos la función correcta
} = require('../services/space.service');

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
