const mongoose = require('mongoose');

const platilloSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: true 
    },
    receta: { 
        type: String, 
        required: true 
    },
    precio: { 
        type: Number, 
        required: true 
    },
    estado: { 
        type: String, 
        required: true,
        enum: ['Disponible', 'Agotado'],
        default: 'Disponible'
    },
    esMenuDelDia: {
        type: Boolean,
        default: false
    },
    imagen: {
        type: String,
        default: ''
    },
    sucursalesAgotado: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sucursal'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Platillo', platilloSchema);
