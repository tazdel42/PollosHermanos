const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

//Registrar un usuario
router.post('/register', authController.registerUser);

//Autenticar usuario y obtener token
router.post('/login', authController.loginUser);

//Obtener información actual del usuario (valida token y rol)
router.get('/me', protect, authController.getMe);

module.exports = router;
