// src/middlewares/reservation.validators.js
const { body, validationResult } = require('express-validator');

const validateReservationCreate = [
  body('spaceId').isInt().withMessage('spaceId debe ser un número entero'),
  body('startTime').isISO8601().withMessage('startTime inválido (ISO8601)'),
  body('endTime').isISO8601().withMessage('endTime inválido (ISO8601)'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validación fallida',
        errors: errors.array(),
      });
    }
    next();
  },
];

module.exports = { validateReservationCreate };
