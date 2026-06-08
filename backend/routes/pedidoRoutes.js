const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, pedidoController.getPedidos);
router.post('/', protect, pedidoController.createPedido);
router.put('/:id', protect, pedidoController.updatePedido);
router.delete('/:id', protect, pedidoController.deletePedido);

module.exports = router;
