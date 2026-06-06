const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  instructions: { type: String }
});

const prescriptionSchema = new mongoose.Schema({
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
  medications: [medicationSchema],
  prescriptionFileUrl: {
    type: String // URL to uploaded image if handwritten
  },
  diagnosis: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending_pharma', 'completed'],
    default: 'pending_pharma'
  }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
