const Patient = require('../models/Patient');
const User = require('../models/User');

exports.getMyProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id }).populate('user', 'fullName phone role');
    if (!patient) return res.status(404).json({ message: 'Patient profile not found' });
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params; // _id of the patient
    const updateData = req.body;
    
    // Update patient collection
    const updatedPatient = await Patient.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json({ message: 'Patient updated successfully', patient: updatedPatient });
  } catch (error) {
    res.status(500).json({ message: 'Error updating patient', error: error.message });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    // can be _id or patientId
    let patient = await Patient.findOne({ patientId: id }).populate('user', 'fullName phone');
    if (!patient) {
      patient = await Patient.findById(id).populate('user', 'fullName phone');
    }

    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient', error: error.message });
  }
};

exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().populate('user', 'fullName phone');
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients', error: error.message });
  }
};
