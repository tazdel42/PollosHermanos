const User = require('../models/User');
const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Crea un nuevo usuario en la base de datos
exports.registerUser = async (req, res) => {
  const { nombre, email, telefono, password, rol } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const permisosAsignados = rol === 'admin' ? 'Completo' : 'Básico';

    user = new User({
      nombre,
      email,
      password: hashedPassword,
      rol,
      permisos: permisosAsignados
    });

    const count = await Employee.countDocuments();
    const noEmpleado = `EMP-${String(count + 1).padStart(3, '0')}`;

    const newEmployee = new Employee({
      noEmpleado,
      nombre,
      telefono: telefono || 'Por definir',
      correo: email,
      estado: 'Activo',
      usuario: email,
      rol,
      permisos: permisosAsignados
    });
    
    await newEmployee.save();

    user.idEmpleado = newEmployee._id;
    await user.save();

    const payload = {
      user: {
        id: user.id,
        rol: user.rol
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Error en el servidor al registrar' });
  }
};

// Verifica las credenciales e inicia sesión
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const payload = {
      user: {
        id: user.id,
        rol: user.rol
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, rol: user.rol, nombre: user.nombre });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Error en el servidor al iniciar sesión' });
  }
};
