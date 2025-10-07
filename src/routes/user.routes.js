const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById } = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middlewares/auth');

// 📋 Obtener todos los usuarios (solo admin)
router.get('/', authenticate, authorize(['admin']), getAllUsers);

// 🔍 Obtener un usuario por ID (solo admin)
router.get('/:id', authenticate, authorize(['admin']), getUserById);

module.exports = router;
