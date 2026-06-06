const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  noEmpleado: {
    type: String,
    required: true,
    unique: true
  },
  nombre: {
    type: String,
    required: true
  },
  telefono: {
    type: String,
    required: true
  },
  correo: {
    type: String,
    required: true,
    unique: true
  },
  estado: {
    type: String,
    enum: ['Activo', 'Inactivo'],
    default: 'Activo'
  },


  usuario: {
    type: String
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


  asistencias: [{
    fecha: String,
    horaEntrada: String,
    horaSalida: String,
    horasTrabajadas: Number,
    salarioDia: Number,
    estadoAsistencia: {
      type: String,
      enum: ['Presente', 'Ausente', 'Retardo', 'Falta Injustificada'],
      default: 'Presente'
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);
