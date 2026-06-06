const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['admin', 'patient', 'reception', 'doctor', 'pharma', 'labs'],
    required: true
  },
  phone: {
    type: String,
    unique: true,
    sparse: true // Only required for patients
  },
  staffId: {
    type: String,
    unique: true,
    sparse: true // Only required for staff
  },
  password: {
    type: String,
    // Hashed password for staff. Patients use OTP so no password needed.
  },
  fullName: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
