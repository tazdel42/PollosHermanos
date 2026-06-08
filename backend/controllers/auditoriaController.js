const AuditLog = require('../models/AuditLog');

const getLogs = async (req, res) => {
  try {
    const filter = {};
    if (req.user && req.user.rol !== 'admin') {
      filter.sucursal = req.user.sucursal;
    }

    const logs = await AuditLog.find(filter)
      .populate('usuario', 'nombre email')
      .populate('sucursal', 'nombre')
      .sort({ createdAt: -1 })
      .limit(100); // Traemos los últimos 100 eventos por rendimiento

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener auditoría', error: error.message });
  }
};

module.exports = { getLogs };
