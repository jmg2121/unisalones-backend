const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const { createSpace, updateSpace, deleteSpace, searchAvailable } = require('../controllers/space.controller');
const router = express.Router();

router.get('/available', authenticate, searchAvailable);
router.post('/', authenticate, authorize(['admin']), createSpace);
router.put('/:id', authenticate, authorize(['admin']), updateSpace);
router.delete('/:id', authenticate, authorize(['admin']), deleteSpace);

module.exports = router;
