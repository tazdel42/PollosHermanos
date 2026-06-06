const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/employeeController');

router.route('/')
  .get(getEmployees)
  .post(createEmployee);

router.route('/:id')
  .put(updateEmployee)
  .delete(deleteEmployee);

// Usuarios
router.route('/users/list')
  .get(getUsers);

router.route('/users/:id')
  .put(updateUser)
  .delete(deleteUser);

// Asistencias
router.route('/attendances/list')
  .get(getAttendances)
  .post(createAttendance);

router.route('/attendances/:id')
  .put(updateAttendance)
  .delete(deleteAttendance);

module.exports = router;
