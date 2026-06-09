const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


//Registrar un usuario
router.post('/register', authController.registerUser);

//Autenticar usuario y obtener token
router.post('/login', authController.loginUser);

module.exports = router;
