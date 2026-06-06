const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ['admin', 'empleado', 'cocinero', 'limpieza'],
    default: 'empleado'
  },
  permisos: {
    type: String,
    enum: ['Básico', 'Completo'],
    default: 'Básico'
  },
  estado: {
    type: String,
    enum: ['Activo', 'Inactivo'],
    default: 'Activo'
  },
  idEmpleado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
