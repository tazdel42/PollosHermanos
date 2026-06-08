const express = require('express');
const router = express.Router();
const sucursalController = require('../controllers/sucursalController');

const { protect, protectAdminCompleto } = require('../middleware/authMiddleware');

router.get('/', protect, sucursalController.getSucursales);
router.post('/', protectAdminCompleto, sucursalController.createSucursal);
router.put('/:id', protectAdminCompleto, sucursalController.updateSucursal);
router.delete('/:id', protectAdminCompleto, sucursalController.deleteSucursal);

module.exports = router;
