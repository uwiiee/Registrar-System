const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  getQueue
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, createAppointment);
router.get('/', protect, getAppointments);
router.get('/queue', protect, authorize('admin'), getQueue);
router.get('/:id', protect, getAppointmentById);
router.put('/:id/status', protect, authorize('admin'), updateAppointmentStatus);
router.put('/:id/cancel', protect, cancelAppointment);

module.exports = router;