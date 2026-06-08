const Platillo = require('../models/Platillo');

// Obtiene todos los platillos
exports.getPlatillos = async (req, res) => {
    try {
        const platillos = await Platillo.find().sort({ createdAt: -1 });
        res.status(200).json(platillos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener platillos', error: error.message });
    }
};

// Crea un nuevo platillo
exports.createPlatillo = async (req, res) => {
    try {
        const { nombre, receta, precio, estado } = req.body;

        const nuevoPlatillo = new Platillo({
            nombre,
            receta,
            precio,
            estado
        });

        const platilloGuardado = await nuevoPlatillo.save();
        res.status(201).json(platilloGuardado);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear platillo', error: error.message });
    }
};

// Actualiza un platillo
exports.updatePlatillo = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, receta, precio, estado } = req.body;

        const platilloActualizado = await Platillo.findByIdAndUpdate(
            id,
            { nombre, receta, precio, estado },
            { new: true } // Devuelve el documento actualizado
        );

        if (!platilloActualizado) {
            return res.status(404).json({ message: 'Platillo no encontrado' });
        }

        res.status(200).json(platilloActualizado);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar platillo', error: error.message });
    }
};

// Elimina un platillo
exports.deletePlatillo = async (req, res) => {
    try {
        const { id } = req.params;

        const platilloEliminado = await Platillo.findByIdAndDelete(id);

        if (!platilloEliminado) {
            return res.status(404).json({ message: 'Platillo no encontrado' });
        }

        res.status(200).json({ message: 'Platillo eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar platillo', error: error.message });
    }
};
