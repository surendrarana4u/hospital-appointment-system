const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');

exports.createPrescription = async (req, res) => {
  try {
    const { patientId, medications, diagnosis } = req.body;
    const doctor = req.user.id;

    let patient = await Patient.findOne({ patientId });
    if (!patient) patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const prescription = new Prescription({
      patient: patient._id,
      doctor,
      medications,
      diagnosis,
      status: 'pending_pharma'
    });

    await prescription.save();
    res.status(201).json({ message: 'Prescription created successfully', prescription });
  } catch (error) {
    res.status(500).json({ message: 'Error creating prescription', error: error.message });
  }
};

exports.getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    let patient = await Patient.findOne({ patientId });
    if (!patient) patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const prescriptions = await Prescription.find({ patient: patient._id }).populate('doctor', 'fullName role');
    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prescriptions', error: error.message });
  }
};

exports.updatePrescriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const prescription = await Prescription.findByIdAndUpdate(id, { status }, { new: true });
    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });

    res.status(200).json({ message: 'Prescription status updated', prescription });
  } catch (error) {
    res.status(500).json({ message: 'Error updating prescription status', error: error.message });
  }
};

exports.getAllPrescriptions = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'doctor') {
      filter = { doctor: req.user.id };
    }
    const prescriptions = await Prescription.find(filter)
      .populate('patient')
      .populate('doctor', 'fullName')
      .sort({ createdAt: -1 });
    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prescriptions', error: error.message });
  }
};
