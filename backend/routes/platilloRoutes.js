const express = require('express');
const router = express.Router();
const platilloController = require('../controllers/platilloController');

// Rutas de los platillos
router.get('/', platilloController.getPlatillos);
router.post('/', platilloController.createPlatillo);
router.put('/:id', platilloController.updatePlatillo);
router.delete('/:id', platilloController.deletePlatillo);

module.exports = router;
