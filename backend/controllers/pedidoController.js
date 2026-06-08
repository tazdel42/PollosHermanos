const Pedido = require('../models/Pedido');

exports.getPedidos = async (req, res) => {
    try {
        const query = {};
        if (req.user && req.user.rol !== 'admin') {
            query.sucursal = req.user.sucursal;
        }
        const pedidos = await Pedido.find(query).populate('proveedor', 'nombre').sort({ createdAt: -1 });
        res.status(200).json(pedidos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener pedidos', error: error.message });
    }
};

exports.createPedido = async (req, res) => {
    try {
        const { proveedor, descripcionProductos, total, estado } = req.body;
        const sucursal = (req.user && req.user.rol !== 'admin') ? req.user.sucursal : req.body.sucursal;
        const nuevoPedido = new Pedido({ proveedor, descripcionProductos, total, estado, sucursal });
        const pedidoGuardado = await nuevoPedido.save();
        res.status(201).json(pedidoGuardado);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear pedido', error: error.message });
    }
};

exports.updatePedido = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; // Solo permitiremos actualizar el estado para simplificar

        const pedidoActualizado = await Pedido.findByIdAndUpdate(
            id,
            { estado },
            { returnDocument: 'after' }
        ).populate('proveedor', 'nombre');

        if (!pedidoActualizado) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        res.status(200).json(pedidoActualizado);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar pedido', error: error.message });
    }
};

exports.deletePedido = async (req, res) => {
    try {
        const { id } = req.params;
        const pedidoEliminado = await Pedido.findByIdAndDelete(id);
        if (!pedidoEliminado) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        res.status(200).json({ message: 'Pedido eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar pedido', error: error.message });
    }
};
