const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protectAdminCompleto = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            // Verifica el token usando la clave secreta
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Busca al usuario en la BD para verificar sus permisos actuales
            req.user = await User.findById(decoded.user.id).select('-password');

            if (req.user && req.user.rol === 'admin' && req.user.permisos === 'Completo') {
                next(); // Tiene permisos, continúa a la ruta
            } else {
                res.status(403).json({ message: 'Acceso denegado. Se requiere rol "admin" y permisos "Completo".' });
            }
        } catch (error) {
            res.status(401).json({ message: 'No autorizado, token falló o expiró.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No autorizado, no se proporcionó token.' });
    }
};

const protectAdmin = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            req.user = await User.findById(decoded.user.id).select('-password');

            if (req.user && req.user.rol === 'admin') {
                next();
            } else {
                res.status(403).json({ message: 'Acceso denegado. Se requiere rol "admin".' });
            }
        } catch (error) {
            res.status(401).json({ message: 'No autorizado, token falló o expiró.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No autorizado, no se proporcionó token.' });
    }
};

const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            req.user = await User.findById(decoded.user.id).select('-password');
            if (req.user) {
                next();
            } else {
                res.status(401).json({ message: 'No autorizado, usuario no encontrado.' });
            }
        } catch (error) {
            res.status(401).json({ message: 'No autorizado, token falló o expiró.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No autorizado, no se proporcionó token.' });
    }
};

module.exports = { protectAdminCompleto, protectAdmin, protect };