const express = require('express');
const { authenticate } = require('../middlewares/auth');
const { create, modify, cancelCtrl, myHistory, joinWaitlistCtrl } = require('../controllers/reservation.controller');
const router = express.Router();

router.post('/', authenticate, create);
router.patch('/:id', authenticate, modify);
router.delete('/:id', authenticate, cancelCtrl);
router.get('/me', authenticate, myHistory);
router.post('/waitlist', authenticate, joinWaitlistCtrl);

module.exports = router;
