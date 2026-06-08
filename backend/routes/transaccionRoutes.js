const express = require('express');
const router = express.Router();
const transaccionController = require('../controllers/transaccionController');

const { protect, protectAdmin } = require('../middleware/authMiddleware');

router.get('/', protectAdmin, transaccionController.getTransacciones);
router.post('/', protectAdmin, transaccionController.createTransaccion);
router.delete('/:id', protectAdmin, transaccionController.deleteTransaccion);

module.exports = router;
