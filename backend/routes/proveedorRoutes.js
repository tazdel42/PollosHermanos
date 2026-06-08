const express = require('express');
const router = express.Router();
const { getProveedores, createProveedor, deleteProveedor } = require('../controllers/proveedorController');
const { protectAdminCompleto } = require('../middleware/authMiddleware');

// Aplicamos el middleware restrictivo a todas las rutas de este bloque
router.route('/')
    .get(protectAdminCompleto, getProveedores)
    .post(protectAdminCompleto, createProveedor);

router.route('/:id')
    .delete(protectAdminCompleto, deleteProveedor);

module.exports = router;