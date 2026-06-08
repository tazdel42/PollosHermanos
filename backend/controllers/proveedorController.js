const Proveedor = require('../models/Proveedor');

// Obtener todos los proveedores
exports.getProveedores = async (req, res) => {
    try {
        const proveedores = await Proveedor.find();
        res.json(proveedores);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los proveedores', error: error.message });
    }
};

// Crear un proveedor
exports.createProveedor = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const nuevoProveedor = await Proveedor.create({ nombre, descripcion });
        res.status(201).json(nuevoProveedor);
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar proveedor', error: error.message });
    }
};

// Eliminar un proveedor
exports.deleteProveedor = async (req, res) => {
    try {
        const proveedor = await Proveedor.findById(req.params.id);
        if (!proveedor) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }
        await proveedor.deleteOne();
        res.json({ message: 'Proveedor eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar proveedor', error: error.message });
    }
};