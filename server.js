const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Configura los Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Sirve los archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// Inicia la conexión a la Base de Datos
const connectDB = require('./backend/config/db');
connectDB();

// Define las rutas de la API
app.use('/api/auth', require('./backend/routes/authRoutes'));

app.use('/api/inventory', require('./backend/routes/inventoryRoutes'));
app.use('/api/employees', require('./backend/routes/employeeRoutes'));

app.use('/api/proveedores', require('./backend/routes/proveedorRoutes'));
app.use('/api/platillos', require('./backend/routes/platilloRoutes'));

// Nuevas Rutas Faltantes Implementadas
app.use('/api/sucursales', require('./backend/routes/sucursalRoutes'));
app.use('/api/pedidos', require('./backend/routes/pedidoRoutes'));
app.use('/api/transacciones', require('./backend/routes/transaccionRoutes'));
app.use('/api/reportes', require('./backend/routes/reporteRoutes'));
app.use('/api/auditoria', require('./backend/routes/auditoriaRoutes'));
app.use('/api/public', require('./backend/routes/publicRoutes'));

// Levanta el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor de Los Pollos Hermanos corriendo en puerto ${PORT}`);
});
