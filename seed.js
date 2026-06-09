const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./backend/models/User');
const connectDB = require('./backend/config/db');

const seedAdminUser = async () => {
  try {
    //Conecta a la base de datos
    await connectDB();

    //Verifica si el usuario administrador ya existe
    const adminExists = await User.findOne({ email: 'admin@polloshermanos.com' });
    if (adminExists) {
      console.log('El usuario administrador ya existe.');
      process.exit();
    }

    //Encripta la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    //Guarda el nuevo usuario administrador
    const adminUser = new User({
      nombre: 'Gustavo Fring',
      email: 'admin@polloshermanos.com',
      password: hashedPassword,
      rol: 'admin',
      permisos: 'Completo'
    });

    await adminUser.save();
    console.log('¡Usuario administrador creado con éxito!');
    console.log('Email: admin@polloshermanos.com');
    console.log('Contraseña: admin123');

    process.exit();
  } catch (error) {
    console.error('Error al poblar la base de datos:', error);
    process.exit(1);
  }
};

seedAdminUser();
