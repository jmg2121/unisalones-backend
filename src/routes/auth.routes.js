/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación y gestión de usuarios
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { registerCtrl, loginCtrl } = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../middlewares/validation.middlewares');
const router = express.Router();

// Middleware reutilizable para manejar errores de validación
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

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registro de un nuevo usuario
 *     description: Permite registrar un nuevo usuario como administrador o estudiante.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 example: juan@unicomfacauca.edu.co
 *               password:
 *                 type: string
 *                 example: 123456
 *               role:
 *                 type: string
 *                 enum: [admin, student]
 *                 example: student
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       422:
 *         description: Error de validación.
 */
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

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión en el sistema
 *     description: Devuelve un token JWT si las credenciales son válidas.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: juan@unicomfacauca.edu.co
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso, devuelve token JWT.
 *       400:
 *         description: Credenciales inválidas.
 *       422:
 *         description: Error de validación.
 */
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
