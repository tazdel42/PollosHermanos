const Employee = require('../models/Employee');
const { logAction } = require('../utils/logger');


const getEmployees = async (req, res) => {
  try {
    const query = {};
    if (req.user && req.user.rol !== 'admin') {
      query.sucursal = req.user.sucursal;
    }
    const employees = await Employee.find(query).populate('sucursal', 'nombre');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los empleados', error: error.message });
  }
};

const createEmployee = async (req, res) => {
  try {
    const { noEmpleado, nombre, rol, telefono, correo, estado } = req.body;
    const sucursal = (req.user && req.user.rol !== 'admin') ? req.user.sucursal : req.body.sucursal;

    const employeeExists = await Employee.findOne({ $or: [{ noEmpleado }, { correo }] });
    if (employeeExists) {
      return res.status(400).json({ message: 'El empleado o correo ya existe' });
    }

    const employee = await Employee.create({
      noEmpleado,
      nombre,
      rol,
      telefono,
      correo,
      estado,
      sucursal,
      usuario: correo
    });

    await logAction(req, 'Crear', 'Empleados', `Alta de empleado ${nombre} (${noEmpleado})`);

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el empleado', error: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { noEmpleado, nombre, rol, telefono, correo, estado, sucursal } = req.body;
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    employee.noEmpleado = noEmpleado || employee.noEmpleado;
    employee.nombre = nombre || employee.nombre;
    employee.rol = rol || employee.rol;
    employee.telefono = telefono || employee.telefono;
    employee.correo = correo || employee.correo;
    employee.estado = estado || employee.estado;
    
    if (req.user && req.user.rol === 'admin') {
      employee.sucursal = sucursal ? sucursal : null;
    }

    const updatedEmployee = await employee.save();

    await logAction(req, 'Actualizar', 'Empleados', `Modificación del empleado ${updatedEmployee.nombre} (${updatedEmployee.noEmpleado})`);

    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el empleado', error: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    await employee.deleteOne();

    await logAction(req, 'Eliminar', 'Empleados', `Baja del empleado ${employee.nombre} (${employee.noEmpleado})`);

    res.json({ message: 'Empleado eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el empleado', error: error.message });
  }
};


const User = require('../models/User');

const getUsers = async (req, res) => {
  try {
    const query = {};
    if (req.user && req.user.rol !== 'admin') {
      query.sucursal = req.user.sucursal;
    }
    const users = await User.find(query, 'email rol permisos estado').populate('idEmpleado', 'noEmpleado');
    
    const usersMapped = users.map(user => ({
      _id: user._id,
      correo: user.email,
      rol: user.rol,
      permisos: user.permisos,
      estado: user.estado,
      noEmpleado: user.idEmpleado ? user.idEmpleado.noEmpleado : 'N/A'
    }));

    res.json(usersMapped);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { rol, permisos, estado } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    user.rol = rol || user.rol;
    user.permisos = permisos || user.permisos;
    user.estado = estado || user.estado;

    const updatedUser = await user.save();
    
    if (user.idEmpleado) {
      await Employee.findByIdAndUpdate(user.idEmpleado, { rol: user.rol, estado: user.estado, permisos: user.permisos });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    if (user.idEmpleado) {
      await Employee.findByIdAndDelete(user.idEmpleado);
    }

    await user.deleteOne();

    await logAction(req, 'Eliminar', 'Usuarios', `Usuario ${user.email} eliminado`);

    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
  }
};


const getAttendances = async (req, res) => {
  try {
    const query = {};
    if (req.user && req.user.rol !== 'admin') {
      // Un empleado solo debe ver sus propias asistencias
      if (req.user.idEmpleado) {
        query._id = req.user.idEmpleado;
      } else {
        query.correo = req.user.email;
      }
    }
    const employees = await Employee.find(query, 'noEmpleado nombre asistencias');
    
    let allAttendances = [];
    employees.forEach(emp => {
      emp.asistencias.forEach(asis => {
        allAttendances.push({
          ...asis.toObject(),
          idEmpleado: emp
        });
      });
    });

    res.json(allAttendances);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener asistencias', error: error.message });
  }
};

const createAttendance = async (req, res) => {
  try {
    const { fecha, horaEntrada, horaSalida, horasTrabajadas, bonoDiario, laborDia, estadoAsistencia } = req.body;
    let { idEmpleado } = req.body;

    if (req.user && req.user.rol !== 'admin') {
      // Si no es admin, forzar que el idEmpleado sea el suyo propio
      if (req.user.idEmpleado) {
        idEmpleado = req.user.idEmpleado;
      } else {
        // Buscar empleado por correo
        const emp = await Employee.findOne({ correo: req.user.email });
        if (emp) {
            idEmpleado = emp._id;
        } else {
            return res.status(403).json({ message: 'No se encontró tu perfil de empleado vinculado a tu usuario.' });
        }
      }
    }

    const employee = await Employee.findById(idEmpleado);
    if (!employee) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    const newAttendance = {
      fecha,
      horaEntrada,
      horaSalida,
      horasTrabajadas,
      bonoDiario,
      laborDia,
      estadoAsistencia
    };

    employee.asistencias.push(newAttendance);
    await employee.save();

    res.status(201).json(employee.asistencias[employee.asistencias.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar asistencia', error: error.message });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { horaEntrada, horaSalida, horasTrabajadas, bonoDiario, laborDia, estadoAsistencia } = req.body;
    const asistenciaId = req.params.id;

    const employee = await Employee.findOne({ 'asistencias._id': asistenciaId });
    if (!employee) {
      return res.status(404).json({ message: 'Registro de asistencia no encontrado' });
    }

    const asistencia = employee.asistencias.id(asistenciaId);
    if (horaEntrada !== undefined) asistencia.horaEntrada = horaEntrada;
    if (horaSalida !== undefined) asistencia.horaSalida = horaSalida;
    if (horasTrabajadas !== undefined) asistencia.horasTrabajadas = horasTrabajadas;
    if (bonoDiario !== undefined) asistencia.bonoDiario = bonoDiario;
    if (laborDia !== undefined) asistencia.laborDia = laborDia;
    if (estadoAsistencia !== undefined) asistencia.estadoAsistencia = estadoAsistencia;

    await employee.save();
    res.json(asistencia);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar asistencia', error: error.message });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const asistenciaId = req.params.id;
    const employee = await Employee.findOne({ 'asistencias._id': asistenciaId });

    if (!employee) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    employee.asistencias.pull(asistenciaId);
    await employee.save();

    res.json({ message: 'Registro de asistencia eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar asistencia', error: error.message });
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getUsers,
  updateUser,
  deleteUser,
  getAttendances,
  createAttendance,
  updateAttendance,
  deleteAttendance
};
