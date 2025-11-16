/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación y gestión de usuarios
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { registerCtrl, loginCtrl } = require('../controllers/auth.controller');
const router = express.Router();

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validación fallida',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registro de un nuevo usuario // HU-007 — Validación de identidad (ESTUDIANTE/PROFESOR)
 *     description: Registra un nuevo usuario. El rol permitido es únicamente **student** o **professor**.
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
 *                 example: Passw0rd!
 *               role:
 *                 type: string
 *                 enum: [student, professor]
 *                 example: student
 *     responses:
 *       '201':
 *         description: Usuario creado exitosamente.
 *       '400':
 *         description: Validación fallida.
 */

/**
 * REGISTRO
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

    // 🔒 VALIDACIÓN DE CONTRASEÑA FUERTE
    body('password')
      .isString()
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener mínimo 8 caracteres.')
      .matches(/[A-Z]/)
      .withMessage('Debe incluir al menos una letra mayúscula.')
      .matches(/[a-z]/)
      .withMessage('Debe incluir al menos una letra minúscula.')
      .matches(/\d/)
      .withMessage('Debe incluir al menos un número.')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('Debe incluir al menos un símbolo.'),

    body('role')
      .isIn(['student', 'professor'])
      .withMessage('El rol debe ser student o professor'),

    handleValidationErrors,
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
 *                 example: Passw0rd!
 *     responses:
 *       '200':
 *         description: Inicio de sesión exitoso.
 *       '400':
 *         description: Credenciales inválidas.
 *       '429':
 *         description: Demasiadas solicitudes.
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

    handleValidationErrors,
  ],
  loginCtrl
);

// IMPORTAR MIDDLEWARES
const { authenticate } = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');

// IMPORTAR SERVICIO
const authService = require('../services/auth.service');

// ======================================
//  ENDPOINT INTERNO: CREAR ADMIN
//  NO APARECE EN SWAGGER (intencional)
// ======================================
router.post(
  '/create-admin',
  authenticate,
  isAdmin,
  [
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Debe ser un correo válido'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener mínimo 8 caracteres.')
      .matches(/[A-Z]/)
      .withMessage('Debe incluir una mayúscula.')
      .matches(/[a-z]/)
      .withMessage('Debe incluir una minúscula.')
      .matches(/\d/)
      .withMessage('Debe incluir un número.')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('Debe incluir un símbolo.'),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const newAdmin = await authService.register({
        name,
        email,
        password,
        role: 'admin',
      });

      return res.status(201).json({
        message: 'Administrador creado correctamente',
        admin: {
          id: newAdmin.id,
          name: newAdmin.name,
          email: newAdmin.email,
          role: newAdmin.role,
        },
      });

    } catch (e) {
      if (e.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'El correo ya está registrado' });
      }
      return res.status(400).json({ error: e.message || 'Error al crear administrador' });
    }
  }
);

module.exports = router;
