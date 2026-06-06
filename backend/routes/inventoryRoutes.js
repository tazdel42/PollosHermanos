const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.get('/', inventoryController.getInventory);
router.post('/', inventoryController.addInventory);
router.put('/:id', inventoryController.updateQuantity);
router.delete('/:id', inventoryController.deleteInventory);

module.exports = router;