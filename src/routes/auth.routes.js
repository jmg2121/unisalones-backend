const express = require('express');
const { body, validationResult } = require('express-validator');
const { registerCtrl, loginCtrl } = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../middlewares/validation.middlewares');
const router = express.Router();

// 🧩 Middleware reutilizable para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Error de validación',
      errors: errors.array()
    });
  }
  next();
};

// 📌 Ruta: Registro de usuario
router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('El nombre es obligatorio'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Debe ser un correo válido'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    handleValidationErrors
  ],
  registerCtrl
);

// 📌 Ruta: Inicio de sesión
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Debe ser un correo válido'),
    body('password')
      .notEmpty()
      .withMessage('La contraseña es obligatoria'),
    handleValidationErrors
  ],
  loginCtrl
);

module.exports = router;
