const { validationResult } = require('express-validator');
const { register, login } = require('../services/auth.service');

async function registerCtrl(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    const user = await register(req.body);
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (e) { next(e); }
}

async function loginCtrl(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    const result = await login(req.body);
    res.json({ token: result.token, user: { id: result.user.id, name: result.user.name, role: result.user.role } });
  } catch (e) { next(e); }
}

module.exports = { registerCtrl, loginCtrl };