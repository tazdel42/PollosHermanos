const Transaccion = require('../models/Transaccion');
const { logAction } = require('../utils/logger');

exports.getTransacciones = async (req, res) => {
    try {
        const query = {};
        if (req.user && req.user.rol !== 'admin') {
            query.sucursal = req.user.sucursal;
        }
        const transacciones = await Transaccion.find(query).sort({ fecha: -1 });
        res.status(200).json(transacciones);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener transacciones', error: error.message });
    }
};

exports.createTransaccion = async (req, res) => {
    try {
        const { tipo, monto, descripcion } = req.body;
        const sucursal = (req.user && req.user.rol !== 'admin') ? req.user.sucursal : req.body.sucursal;
        const nuevaTransaccion = new Transaccion({ tipo, monto, descripcion, sucursal });
        const transaccionGuardada = await nuevaTransaccion.save();
        await logAction(req, 'Crear', 'Finanzas', `Transacción de $${monto} (${tipo}) añadida`);
        res.status(201).json(transaccionGuardada);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear transacción', error: error.message });
    }
};

exports.deleteTransaccion = async (req, res) => {
    try {
        const { id } = req.params;
        const transaccionEliminada = await Transaccion.findByIdAndDelete(id);
        if (!transaccionEliminada) {
            return res.status(404).json({ message: 'Transacción no encontrada' });
        }
        await logAction(req, 'Eliminar', 'Finanzas', `Transacción de $${transaccionEliminada.monto} eliminada`);
        res.status(200).json({ message: 'Transacción eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar transacción', error: error.message });
    }
};
