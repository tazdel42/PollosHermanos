const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');

const { protect } = require('../middleware/authMiddleware');

router.get('/global', protect, reporteController.getResumenGlobal);
router.get('/alertas', protect, reporteController.getAlertas);

module.exports = router;
