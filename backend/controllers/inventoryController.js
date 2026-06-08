const Inventory = require('../models/Inventory');

// Obtener todo el inventario
exports.getInventory = async (req, res) => {
    try {
        const query = {};
        if (req.user && req.user.rol !== 'admin') {
            query.sucursal = req.user.sucursal;
        }
        const items = await Inventory.find(query);
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener inventario' });
    }
};

// Agregar un nuevo artículo
exports.addInventory = async (req, res) => {
    const { nombre, tipo, cantidad } = req.body;
    const sucursal = (req.user && req.user.rol !== 'admin') ? req.user.sucursal : req.body.sucursal;
    try {
        const newItem = new Inventory({ nombre, tipo, cantidad, sucursal });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ message: 'Error al agregar artículo' });
    }
};

// Actualizar cantidad
exports.updateQuantity = async (req, res) => {
    const { cantidad } = req.body;
    try {
        const updatedItem = await Inventory.findByIdAndUpdate(
            req.params.id,
            { cantidad },
            { returnDocument: 'after' }
        );
        res.json(updatedItem);
    } catch (err) {
        res.status(500).json({ message: 'Error al actualizar cantidad' });
    }
};

// Eliminar artículo
exports.deleteInventory = async (req, res) => {
    try {
        await Inventory.findByIdAndDelete(req.params.id);
        res.json({ message: 'Artículo eliminado' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar artículo' });
    }
};