const AuditLog = require('../models/AuditLog');

const logAction = async (req, accion, modulo, descripcion) => {
  try {
    if (!req.user || !req.user._id) return; // Si no hay usuario logueado, ignorar

    await AuditLog.create({
      usuario: req.user._id,
      sucursal: req.user.sucursal,
      accion,
      modulo,
      descripcion
    });
  } catch (error) {
    console.error('Error al registrar auditoría:', error.message);
  }
};

module.exports = { logAction };
