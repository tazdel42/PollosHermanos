const express = require('express');
const router = express.Router();
const { getInventory, addInventory, updateQuantity, deleteInventory } = require('../controllers/inventoryController');
const { protect, protectAdmin } = require('../middleware/authMiddleware');

// Rutas de Inventario
router.get('/', protect, getInventory);
router.post('/', protectAdmin, addInventory);
router.put('/:id', protect, updateQuantity);
router.delete('/:id', protectAdmin, deleteInventory);

module.exports = router;