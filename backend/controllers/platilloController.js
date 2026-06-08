const Platillo = require('../models/Platillo');
const Sucursal = require('../models/Sucursal');
const { logAction } = require('../utils/logger');

// Obtiene todos los platillos
exports.getPlatillos = async (req, res) => {
    try {
        const platillos = await Platillo.find()
            .populate({ path: 'sucursalesAgotado', select: 'nombre' })
            .sort({ createdAt: -1 });
        res.status(200).json(platillos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener platillos', error: error.message });
    }
};

// Crea un nuevo platillo
exports.createPlatillo = async (req, res) => {
    try {
        const { nombre, receta, precio, estado, esMenuDelDia, imagen } = req.body;

        const nuevoPlatillo = new Platillo({
            nombre,
            receta,
            precio,
            estado,
            imagen,
            esMenuDelDia: esMenuDelDia || false
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
        const { nombre, receta, precio, estado, esMenuDelDia, imagen } = req.body;

        const platilloActualizado = await Platillo.findByIdAndUpdate(
            id,
            { nombre, receta, precio, estado, esMenuDelDia, imagen },
            { returnDocument: 'after' } // Devuelve el documento actualizado
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

// Alternar estado agotado por sucursal
exports.toggleAgotado = async (req, res) => {
    try {
        const { id } = req.params;
        const sucursalId = req.user && req.user.sucursal;

        if (!sucursalId && req.user.rol !== 'admin') {
            return res.status(403).json({ message: 'No tienes una sucursal asignada' });
        }

        // Si es admin, puede mandar la sucursal por body, si no usa la suya
        const sucursalObjetivo = (req.user.rol === 'admin' && req.body.sucursal) ? req.body.sucursal : sucursalId;

        if (!sucursalObjetivo) {
             return res.status(400).json({ message: 'Se requiere especificar una sucursal' });
        }

        const platillo = await Platillo.findById(id);
        if (!platillo) {
            return res.status(404).json({ message: 'Platillo no encontrado' });
        }

        const index = platillo.sucursalesAgotado.indexOf(sucursalObjetivo);
        if (index === -1) {
            platillo.sucursalesAgotado.push(sucursalObjetivo);
            await logAction(req, 'Agotar', 'Platillos', `El platillo ${platillo.nombre} se marcó como agotado`);
        } else {
            platillo.sucursalesAgotado.splice(index, 1);
            await logAction(req, 'Actualizar', 'Platillos', `El platillo ${platillo.nombre} se reactivó`);
        }

        await platillo.save();
        res.status(200).json(platillo);
    } catch (error) {
        res.status(500).json({ message: 'Error al alternar estado agotado', error: error.message });
    }
};
