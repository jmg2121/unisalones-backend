const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const {
  createSpace,
  updateSpace,
  deleteSpace,
  searchAvailable
} = require('../controllers/space.controller');

const router = express.Router();

// 📌 Buscar espacios disponibles (requiere autenticación)
router.get('/available', authenticate, searchAvailable);

// 📌 Crear un nuevo espacio (solo para administradores)
router.post('/', authenticate, authorize(['admin']), createSpace);

// 📌 Actualizar datos de un espacio (solo para administradores)
router.put('/:id', authenticate, authorize(['admin']), updateSpace);

// 📌 Eliminar un espacio (solo para administradores)
router.delete('/:id', authenticate, authorize(['admin']), deleteSpace);

module.exports = router;
