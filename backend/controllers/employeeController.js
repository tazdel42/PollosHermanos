const Employee = require('../models/Employee');


const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los empleados', error: error.message });
  }
};

const createEmployee = async (req, res) => {
  try {
    const { noEmpleado, nombre, rol, telefono, correo, estado } = req.body;

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
      usuario: correo
    });

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el empleado', error: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { noEmpleado, nombre, rol, telefono, correo, estado } = req.body;
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

    const updatedEmployee = await employee.save();
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
    res.json({ message: 'Empleado eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el empleado', error: error.message });
  }
};


const getUsers = async (req, res) => {
  try {
    const employeesAsUsers = await Employee.find({}, 'noEmpleado correo rol permisos estado');
    res.json(employeesAsUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { rol, permisos, estado } = req.body;
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    employee.rol = rol || employee.rol;
    employee.permisos = permisos || employee.permisos;
    employee.estado = estado || employee.estado;

    const updatedEmployee = await employee.save();
    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    await employee.deleteOne();
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
  }
};


const getAttendances = async (req, res) => {
  try {
    const employees = await Employee.find({}, 'noEmpleado nombre asistencias');
    
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
    const { idEmpleado, fecha, horaEntrada, horaSalida, horasTrabajadas, salarioDia, estadoAsistencia } = req.body;

    const employee = await Employee.findById(idEmpleado);
    if (!employee) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    const newAttendance = {
      fecha,
      horaEntrada,
      horaSalida,
      horasTrabajadas,
      salarioDia,
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
    const { horaEntrada, horaSalida, horasTrabajadas, salarioDia, estadoAsistencia } = req.body;
    const asistenciaId = req.params.id;

    const employee = await Employee.findOne({ 'asistencias._id': asistenciaId });
    if (!employee) {
      return res.status(404).json({ message: 'Registro de asistencia no encontrado' });
    }

    const asistencia = employee.asistencias.id(asistenciaId);
    if (horaEntrada !== undefined) asistencia.horaEntrada = horaEntrada;
    if (horaSalida !== undefined) asistencia.horaSalida = horaSalida;
    if (horasTrabajadas !== undefined) asistencia.horasTrabajadas = horasTrabajadas;
    if (salarioDia !== undefined) asistencia.salarioDia = salarioDia;
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
