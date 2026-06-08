const mongoose = require('mongoose');

const proveedorSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: true 
    },
    descripcion: { 
        type: String, 
        required: true 
    },
    folios: {
        type: String,
        required: true,
        default: "N/A"
    }
}, { timestamps: true });

module.exports = mongoose.model('Proveedor', proveedorSchema);