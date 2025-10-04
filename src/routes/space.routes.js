const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const {
  createSpace,
  updateSpace,
  deleteSpace,
  searchAvailable
  create,
  list,
  get,
  update,
  remove,
  available   // 👈 este es el correcto
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
router.get('/available', authenticate, available); // 👈 aquí también
router.post('/', authenticate, authorize(['admin']), create);
router.get('/', authenticate, list);
router.get('/:id', authenticate, get);
router.put('/:id', authenticate, authorize(['admin']), update);
router.delete('/:id', authenticate, authorize(['admin']), remove);

module.exports = router;
