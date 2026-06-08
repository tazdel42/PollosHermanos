const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: true 
    },
    tipo: { 
        type: String, 
        required: true, 
        enum: ['Especia', 'Ingrediente', 'Utensilio'] 
    },
    cantidad: { 
        type: Number, 
        required: true, 
        default: 0 
    },
    sucursal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sucursal'
    }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);