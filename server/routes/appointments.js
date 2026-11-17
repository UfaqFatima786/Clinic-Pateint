const express = require('express');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

// POST /api/appointments  (Patient only)
router.post('/', protect, authorize('patient'), async (req, res) => {
  try {
    const { doctor, appointmentDate, appointmentTime, reason } = req.body;
    if (!doctor || !appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({ message: 'Doctor, date, time and reason are required' });
    }
    if (!mongoose.isValidObjectId(doctor)) {
      return res.status(400).json({ message: 'Invalid doctor id' });
    }
    const doc = await User.findOne({ _id: doctor, role: 'doctor', isActive: true });
    if (!doc) return res.status(404).json({ message: 'Doctor not found or inactive' });

    const date = startOfDay(appointmentDate);
    if (isNaN(date.getTime())) return res.status(400).json({ message: 'Invalid date' });

    // Bonus: prevent booking in the past
    if (date < startOfDay(new Date())) {
      return res.status(400).json({ message: 'You cannot book an appointment in the past' });
    }

    // Rule 8: same patient cannot book same doctor at same date+time
    const duplicate = await Appointment.findOne({
      patient: req.user._id,
      doctor,
      appointmentDate: date,
      appointmentTime,
      status: { $in: ['pending', 'approved'] },
    });
    if (duplicate) {
      return res
        .status(400)
        .json({ message: 'You already have an appointment with this doctor at that date and time' });
    }

    // Bonus: prevent double booking of an already approved slot
    const taken = await Appointment.findOne({
      doctor,
      appointmentDate: date,
      appointmentTime,
      status: 'approved',
    });
    if (taken) {
      return res.status(400).json({ message: 'This slot is already booked. Choose another time.' });
    }

    const appt = await Appointment.create({
      patient: req.user._id,
      doctor,
      appointmentDate: date,
      appointmentTime,
      reason,
    });
    const populated = await appt.populate('doctor', 'name specialization experience');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/appointments/my  (Patient: only own appointments)
router.get('/my', protect, authorize('patient'), async (req, res) => {
  try {
    const list = await Appointment.find({ patient: req.user._id })
      .populate('doctor', 'name email specialization experience')
      .sort({ appointmentDate: -1, createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/appointments/doctor  (Doctor: appointments assigned to them)
router.get('/doctor', protect, authorize('doctor'), async (req, res) => {
  try {
    const { search } = req.query; // bonus: search by patient name
    let list = await Appointment.find({ doctor: req.user._id })
      .populate('patient', 'name email')
      .sort({ appointmentDate: -1, createdAt: -1 });
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((a) => a.patient && a.patient.name.toLowerCase().includes(s));
    }
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/appointments/:id/status  (Doctor: approve / reject own appointments only)
router.patch('/:id/status', protect, authorize('doctor'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid appointment id' });
    }
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    // Rule 4: doctor can only act on their own appointments
    if (appt.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'This appointment is not assigned to you' });
    }
    if (appt.status !== 'pending') {
      return res.status(400).json({ message: `Appointment is already ${appt.status}` });
    }

    // Bonus: do not approve if this doctor already has an approved appointment at the same slot
    if (status === 'approved') {
      const clash = await Appointment.findOne({
        _id: { $ne: appt._id },
        doctor: appt.doctor,
        appointmentDate: appt.appointmentDate,
        appointmentTime: appt.appointmentTime,
        status: 'approved',
      });
      if (clash) {
        return res.status(400).json({ message: 'You already approved another appointment at this time' });
      }
    }

    appt.status = status;
    await appt.save();
    const populated = await appt.populate('patient', 'name email');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/appointments/:id/cancel  (Patient: only own + only pending)
router.patch('/:id/cancel', protect, authorize('patient'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid appointment id' });
    }
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    if (appt.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'This is not your appointment' });
    }
    // Rule 6: only pending can be cancelled
    if (appt.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending appointments can be cancelled' });
    }
    appt.status = 'cancelled';
    await appt.save();
    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
