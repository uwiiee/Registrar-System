const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  preferredDate: {
    type: Date,
    required: true
  },
  priorityTier: {
    type: String,
    enum: ['normal', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['pending', 'queued', 'serving', 'done', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);