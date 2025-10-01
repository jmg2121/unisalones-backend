const express = require('express');
const { body } = require('express-validator');
const { registerCtrl, loginCtrl } = require('../controllers/auth.controller');
const router = express.Router();

router.post('/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], registerCtrl);

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], loginCtrl);

module.exports = router;
