const AuditLog = require('../models/AuditLog');

const logAction = async (req, accion, modulo, descripcion) => {
  try {
    // Si no hay usuario logueado, ignorar
    if (!req.user || !req.user._id) return;

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
