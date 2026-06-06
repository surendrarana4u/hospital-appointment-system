const mongoose = require('mongoose');

const labOrderSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testsOrdered: [{
    type: String,
    required: true
  }],
  reportFileUrl: {
    type: String // URL to uploaded lab report
  },
  status: {
    type: String,
    enum: ['pending_lab', 'completed'],
    default: 'pending_lab'
  }
}, { timestamps: true });

module.exports = mongoose.model('LabOrder', labOrderSchema);
