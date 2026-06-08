const express = require('express');
const router = express.Router();
const Platillo = require('../models/Platillo');
const Sucursal = require('../models/Sucursal');

// GET /api/public/menu
// Devuelve los platillos para el cliente final
router.get('/menu', async (req, res) => {
    try {
        const platillos = await Platillo.find({})
            .populate({ path: 'sucursalesAgotado', select: 'nombre' });
        res.json(platillos);
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo menú público' });
    }
});

// GET /api/public/sucursales
// Devuelve las sucursales para el cliente final
router.get('/sucursales', async (req, res) => {
    try {
        const sucursales = await Sucursal.find({ estado: 'Activa' });
        res.json(sucursales);
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo sucursales públicas' });
    }
});

module.exports = router;
