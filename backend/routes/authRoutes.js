const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Registrar un usuario
// @access  Public (Temporalmente, idealmente solo admin)
router.post('/register', authController.registerUser);

// @route   POST /api/auth/login
// @desc    Autenticar usuario y obtener token
// @access  Public
router.post('/login', authController.loginUser);

module.exports = router;
