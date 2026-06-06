const Inventory = require('../models/Inventory');

// Obtener todo el inventario
exports.getInventory = async (req, res) => {
    try {
        const items = await Inventory.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener inventario' });
    }
};

// Agregar un nuevo artículo
exports.addInventory = async (req, res) => {
    const { nombre, tipo, cantidad } = req.body;
    try {
        const newItem = new Inventory({ nombre, tipo, cantidad });
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
            { new: true }
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