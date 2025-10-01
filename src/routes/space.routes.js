const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const {
  create,
  list,
  get,
  update,
  remove,
  available   // 👈 este es el correcto
} = require('../controllers/space.controller');

const router = express.Router();

router.get('/available', authenticate, available); // 👈 aquí también
router.post('/', authenticate, authorize(['admin']), create);
router.get('/', authenticate, list);
router.get('/:id', authenticate, get);
router.put('/:id', authenticate, authorize(['admin']), update);
router.delete('/:id', authenticate, authorize(['admin']), remove);

module.exports = router;
