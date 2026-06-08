const mongoose = require('mongoose');

const transaccionSchema = new mongoose.Schema({
    tipo: {
        type: String,
        enum: ['Ingreso', 'Egreso'],
        required: true
    },
    monto: {
        type: Number,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    sucursal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sucursal'
    },
    fecha: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaccion', transaccionSchema);
