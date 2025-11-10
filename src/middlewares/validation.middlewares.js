// middlewares/validation.middlewares.js
const { body, validationResult } = require('express-validator');

// Validaciones para registro
const validateRegister = [
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

  // Middleware centralizado para manejar errores de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Error de validación en el registro',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validaciones para inicio de sesión
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un correo válido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Error de validación en el inicio de sesión',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = { validateRegister, validateLogin };
