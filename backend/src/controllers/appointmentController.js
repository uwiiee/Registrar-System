const Appointment = require('../models/Appointment');

// CREATE — student books an appointment for themselves
const createAppointment = async (req, res) => {
  try {
    const { service, preferredDate, priorityTier } = req.body;

    const appointment = await Appointment.create({
      student: req.user._id, // from the protect middleware — student books for THEMSELVES, not an arbitrary id
      service,
      preferredDate,
      priorityTier
    });

    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// READ ALL — staff sees everyone's; student sees only their own
const getAppointments = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { student: req.user._id };

    const appointments = await Appointment.find(filter)
      .populate('student', 'name email studentId') // only pull these fields, not password etc.
      .populate('service', 'name avgDurationMins department')
      .sort({ preferredDate: 1 }); // soonest deadline first — a taste of EDF ordering

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ONE
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('student', 'name email studentId')
      .populate('service', 'name avgDurationMins department');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // students can only view their OWN appointment
    if (req.user.role !== 'admin' && appointment.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE STATUS — staff only (queued/serving/done)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// CANCEL — student cancels their own appointment
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (req.user.role !== 'admin' && appointment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const { sortQueue, buildQueueView } = require('../utils/queueEngine');

// GET /api/appointments/queue — staff-only live queue view
const getQueue = async (req, res) => {
  try {
    // only appointments actively waiting to be served
    const pendingAppointments = await Appointment.find({
      status: { $in: ['pending', 'queued'] }
    })
      .populate('student', 'name email studentId')
      .populate('service', 'name avgDurationMins department');

    const sorted = sortQueue(pendingAppointments);
    const queueView = buildQueueView(sorted);

    res.json(queueView);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  getQueue,
  updateAppointmentStatus,
  cancelAppointment
};