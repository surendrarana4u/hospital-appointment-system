const LabOrder = require('../models/LabOrder');
const Patient = require('../models/Patient');

exports.createLabOrder = async (req, res) => {
  try {
    const { patientId, testsOrdered } = req.body;
    const doctor = req.user.id;

    let patient = await Patient.findOne({ patientId });
    if (!patient) patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const labOrder = new LabOrder({
      patient: patient._id,
      doctor,
      testsOrdered,
      status: 'pending_lab'
    });

    await labOrder.save();
    res.status(201).json({ message: 'Lab order created successfully', labOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error creating lab order', error: error.message });
  }
};

exports.getPatientLabOrders = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    let patient = await Patient.findOne({ patientId });
    if (!patient) patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const labOrders = await LabOrder.find({ patient: patient._id }).populate('doctor', 'fullName role');
    res.status(200).json(labOrders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lab orders', error: error.message });
  }
};

exports.updateLabOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reportFileUrl } = req.body;

    const labOrder = await LabOrder.findByIdAndUpdate(id, { status, reportFileUrl }, { new: true });
    if (!labOrder) return res.status(404).json({ message: 'Lab order not found' });

    res.status(200).json({ message: 'Lab order updated', labOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error updating lab order', error: error.message });
  }
};

exports.getAllLabOrders = async (req, res) => {
  try {
    const labOrders = await LabOrder.find()
      .populate('doctor', 'fullName role')
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'fullName phone'
        }
      })
      .sort({ createdAt: -1 });
    res.status(200).json(labOrders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all lab orders', error: error.message });
  }
};
