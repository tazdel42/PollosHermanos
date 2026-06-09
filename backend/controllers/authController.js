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

    // Buscar el último empleado creado para evitar colisiones si se han borrado registros
    const lastEmployee = await Employee.findOne().sort({ createdAt: -1 });
    let nextCount = 1;
    if (lastEmployee && lastEmployee.noEmpleado) {
      const parts = lastEmployee.noEmpleado.split('-');
      if (parts.length === 2) {
        const lastNumber = parseInt(parts[1], 10);
        if (!isNaN(lastNumber)) {
          nextCount = lastNumber + 1;
        }
      }
    } else {
      // Fallback a contar documentos si no hay último o formato extraño
      nextCount = (await Employee.countDocuments()) + 1;
    }
    const noEmpleado = `EMP-${String(nextCount).padStart(3, '0')}`;

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
        res.json({ token, rol: user.rol, nombre: user.nombre, email: user.email, sucursal: user.sucursal });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Error en el servidor al iniciar sesión' });
  }
};

// Devuelve los datos de sesión actualizados para verificar si cambiaron de rol o estado
exports.getMe = async (req, res) => {
  res.json({
    rol: req.user.rol,
    permisos: req.user.permisos,
    estado: req.user.estado
  });
};
