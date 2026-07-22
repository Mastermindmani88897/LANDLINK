const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  requestAppointment,
  getOwnerAppointments,
  getBuyerAppointments,
  acceptAppointment,
  rejectAppointment,
  cancelAppointment,
} = require('../controllers/appointmentController');

router.post('/request', protect, requestAppointment);
router.get('/owner', protect, getOwnerAppointments);
router.get('/buyer', protect, getBuyerAppointments);
router.patch('/:id/accept', protect, acceptAppointment);
router.patch('/:id/reject', protect, rejectAppointment);
router.patch('/:id/cancel', protect, cancelAppointment);

module.exports = router;
