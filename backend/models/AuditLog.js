const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sucursal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sucursal'
  },
  accion: {
    type: String,
    required: true,
    enum: ['Crear', 'Actualizar', 'Eliminar', 'Agotar']
  },
  modulo: {
    type: String,
    required: true,
    enum: ['Empleados', 'Usuarios', 'Asistencias', 'Finanzas', 'Inventario', 'Pedidos', 'Proveedores', 'Platillos', 'Sucursales']
  },
  descripcion: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
