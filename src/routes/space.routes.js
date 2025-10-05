const express = require("express");
const { authenticate, authorize } = require("../middlewares/auth");
const {
  create,
  list,
  get,
  update,
  remove,
  available,
} = require("../controllers/space.controller");

const router = express.Router();

// Buscar espacios disponibles (requiere autenticación)
router.get("/available", authenticate, available);

// Crear un nuevo espacio (solo para administradores)
router.post("/", authenticate, authorize(["admin"]), create);

// Listar todos los espacios
router.get("/", authenticate, list);

// Obtener un espacio específico
router.get("/:id", authenticate, get);

// Actualizar datos de un espacio (solo para administradores)
router.put("/:id", authenticate, authorize(["admin"]), update);

// Eliminar un espacio (solo para administradores)
router.delete("/:id", authenticate, authorize(["admin"]), remove);

module.exports = router;