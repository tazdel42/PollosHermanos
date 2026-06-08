const Sucursal = require('../models/Sucursal');

exports.getSucursales = async (req, res) => {
    try {
        const sucursales = await Sucursal.find().sort({ createdAt: -1 });
        res.status(200).json(sucursales);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener sucursales', error: error.message });
    }
};

exports.createSucursal = async (req, res) => {
    try {
        const { nombre, direccion, telefono, estado } = req.body;
        const nuevaSucursal = new Sucursal({ nombre, direccion, telefono, estado });
        const sucursalGuardada = await nuevaSucursal.save();
        res.status(201).json(sucursalGuardada);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear sucursal', error: error.message });
    }
};

exports.updateSucursal = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, direccion, telefono, estado } = req.body;
        const sucursalActualizada = await Sucursal.findByIdAndUpdate(
            id,
            { nombre, direccion, telefono, estado },
            { returnDocument: 'after' }
        );
        if (!sucursalActualizada) {
            return res.status(404).json({ message: 'Sucursal no encontrada' });
        }
        res.status(200).json(sucursalActualizada);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar sucursal', error: error.message });
    }
};

exports.deleteSucursal = async (req, res) => {
    try {
        const { id } = req.params;
        const sucursalEliminada = await Sucursal.findByIdAndDelete(id);
        if (!sucursalEliminada) {
            return res.status(404).json({ message: 'Sucursal no encontrada' });
        }
        res.status(200).json({ message: 'Sucursal eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar sucursal', error: error.message });
    }
};
