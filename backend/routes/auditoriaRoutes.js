const express = require('express');
const router = express.Router();
const { getLogs } = require('../controllers/auditoriaController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getLogs);

module.exports = router;
