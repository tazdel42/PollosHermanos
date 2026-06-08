const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
    proveedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proveedor',
        required: true
    },
    fechaPedido: {
        type: Date,
        default: Date.now
    },
    descripcionProductos: {
        type: String,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    estado: {
        type: String,
        enum: ['Pendiente', 'Entregado', 'Cancelado'],
        default: 'Pendiente'
    },
    sucursal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sucursal'
    }
}, { timestamps: true });

module.exports = mongoose.model('Pedido', pedidoSchema);
