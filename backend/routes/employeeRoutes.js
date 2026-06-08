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
const { protect, protectAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protectAdmin, getEmployees)
  .post(protectAdmin, createEmployee);

router.route('/:id')
  .put(protectAdmin, updateEmployee)
  .delete(protectAdmin, deleteEmployee);

// Usuarios
router.route('/users/list')
  .get(protect, getUsers);

router.route('/users/:id')
  .put(protect, updateUser)
  .delete(protect, deleteUser);

// Asistencias
router.route('/attendances/list')
  .get(protect, getAttendances)
  .post(protect, createAttendance);

router.route('/attendances/:id')
  .put(protectAdmin, updateAttendance)
  .delete(protectAdmin, deleteAttendance);

module.exports = router;
