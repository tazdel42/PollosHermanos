const mongoose = require('mongoose');

const sucursalSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    direccion: {
        type: String,
        required: true
    },
    telefono: {
        type: String,
        required: true
    },
    estado: {
        type: String,
        enum: ['Activa', 'Inactiva'],
        default: 'Activa'
    }
}, { timestamps: true });

module.exports = mongoose.model('Sucursal', sucursalSchema);
