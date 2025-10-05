const dayjs = require("dayjs");
const { Space, Reservation } = require("../models");
const { searchAvailable } = require("../services/space.service");

// Crear un nuevo espacio
async function create(req, res) {
  try {
    const { name, type, capacity, location } = req.body;
    if (!name || !type || !capacity) {
      return res
        .status(400)
        .json({ error: "Los campos name, type y capacity son obligatorios" });
    }

    const space = await Space.create({ name, type, capacity, location });
    return res
      .status(201)
      .json({ message: "Espacio creado correctamente", space });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Error al crear espacio" });
  }
}

// Listar todos los espacios
async function list(req, res) {
  try {
    const spaces = await Space.findAll();
    return res.json(spaces);
  } catch (e) {
    return res.status(500).json({ error: "Error al listar espacios" });
  }
}

// Obtener un espacio específico
async function get(req, res) {
  try {
    const space = await Space.findByPk(req.params.id);
    if (!space) {
      return res.status(404).json({ error: "Espacio no encontrado" });
    }
    return res.json(space);
  } catch (e) {
    return res.status(500).json({ error: "Error al obtener espacio" });
  }
}

// Actualizar un espacio existente
async function update(req, res) {
  try {
    const space = await Space.findByPk(req.params.id);
    if (!space) {
      return res.status(404).json({ error: "Espacio no encontrado" });
    }
    Object.assign(space, req.body);
    await space.save();
    return res.json({ message: "Espacio actualizado correctamente", space });
  } catch (e) {
    return res.status(500).json({ error: "Error al actualizar espacio" });
  }
}

// Eliminar un espacio (solo si no tiene reservas activas)
async function remove(req, res) {
  try {
    const { id } = req.params;
    const space = await Space.findByPk(id);
    if (!space) {
      return res.status(404).json({ error: "Espacio no encontrado" });
    }

    const activeReservations = await Reservation.count({
      where: { space_id: id, status: "confirmed" },
    });

    if (activeReservations > 0) {
      return res.status(409).json({
        error: "No se puede eliminar el espacio: tiene reservas activas",
      });
    }

    await space.destroy();
    return res.json({ message: "Espacio eliminado correctamente" });
  } catch (e) {
    return res.status(500).json({ error: "Error al eliminar espacio" });
  }
}

// Buscar espacios disponibles
async function available(req, res) {
  try {
    const { date, start, end, type } = req.query;
    if (!date || !start || !end) {
      return res
        .status(400)
        .json({ error: "Parámetros requeridos: date, start, end" });
    }

    const dateStart = dayjs(date + "T" + start + ":00.000Z");
    const dateEnd = dayjs(date + "T" + end + ":00.000Z");
    if (!dateStart.isValid() || !dateEnd.isValid()) {
      return res.status(400).json({ error: "Formato de fecha/hora inválido" });
    }

    const list = await searchAvailable({ date,start, end, type });

    if (!list || list.length === 0) {
      return res.json([]);
    }
    
    const plain = list.map((s) => {
      // si s es instancia de Sequelize:
      if (s && s.dataValues) return s.dataValues;
      return s;
    });

    console.log("📦 RESPUESTA DISPONIBLES:", list);
    return res.json(plain);
  } catch (e) {
    console.error("Error al buscar espacios disponibles:", e);
    return res
      .status(500)
      .json({ error: "Error al buscar espacios disponibles" });
  }
}

module.exports = {
  create,
  list,
  get,
  update,
  remove,
  available,
};