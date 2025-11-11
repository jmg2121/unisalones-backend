const { body, validationResult } = require('express-validator');

const validateReservationCreate = [
  body(['start', 'startTime']).custom((value, { req }) => {
    const date = new Date(value || req.body.startTime || req.body.start);
    if (isNaN(date.getTime())) throw new Error('startTime inválido (ISO8601)');
    return true;
  }),
  body(['end', 'endTime']).custom((value, { req }) => {
    const date = new Date(value || req.body.endTime || req.body.end);
    if (isNaN(date.getTime())) throw new Error('endTime inválido (ISO8601)');
    return true;
  }),
  body('spaceId')
    .notEmpty().withMessage('spaceId es requerido')
    .isInt({ min: 1 }).withMessage('spaceId debe ser un número entero positivo'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: 'Validación fallida', errors: errors.array() });
    next();
  }
];

module.exports = { validateReservationCreate };
