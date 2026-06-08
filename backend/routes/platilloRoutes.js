const express = require('express');
const router = express.Router();
const platilloController = require('../controllers/platilloController');
const { protect, protectAdmin } = require('../middleware/authMiddleware');

// Rutas de los platillos
router.get('/', protect, platilloController.getPlatillos);
router.post('/', protectAdmin, platilloController.createPlatillo);
router.put('/:id', protectAdmin, platilloController.updatePlatillo);
router.delete('/:id', protectAdmin, platilloController.deletePlatillo);
router.put('/:id/agotado', protect, platilloController.toggleAgotado);

module.exports = router;
