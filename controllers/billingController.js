const Bill = require('../models/Bill');
const Patient = require('../models/Patient');

exports.getPatientBills = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Determine the _id of the patient
    let patient = await Patient.findOne({ patientId });
    if (!patient) patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const bills = await Bill.find({ patient: patient._id }).populate('issuedBy', 'fullName role');
    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bills', error: error.message });
  }
};

exports.createBill = async (req, res) => {
  try {
    const { patientId, amount, type } = req.body;
    const issuedBy = req.user.id;

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const bill = new Bill({
      patient: patient._id,
      issuedBy,
      amount,
      type
    });

    await bill.save();
    res.status(201).json({ message: 'Bill created successfully', bill });
  } catch (error) {
    res.status(500).json({ message: 'Error creating bill', error: error.message });
  }
};

exports.payBill = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await Bill.findByIdAndUpdate(id, { status: 'Paid' }, { new: true });
    
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.status(200).json({ message: 'Bill paid successfully', bill });
  } catch (error) {
    res.status(500).json({ message: 'Error paying bill', error: error.message });
  }
};

exports.generateNOC = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    let patient = await Patient.findOne({ patientId }).populate('user', 'fullName');
    if (!patient) patient = await Patient.findById(patientId).populate('user', 'fullName');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const bills = await Bill.find({ patient: patient._id });

    if (bills.length === 0) {
      return res.status(400).json({ message: 'No bills found for this patient. NOC cannot be generated.' });
    }

    const hasPendingBills = bills.some(b => b.status === 'Pending');

    if (hasPendingBills) {
      return res.status(403).json({ message: 'Cannot generate NOC. There are pending bills that need to be cleared.' });
    }

    // Generate NOC Payload
    const nocData = {
      nocId: `NOC-${Date.now()}`,
      patientName: patient.user.fullName,
      patientId: patient.patientId,
      issueDate: new Date(),
      message: 'This is to certify that all outstanding dues from Doctor, Pharmacy, and Labs have been cleared. We have no objection to the patient being discharged or transferring records.',
      status: 'APPROVED'
    };

    res.status(200).json({ message: 'NOC generated successfully', noc: nocData });
  } catch (error) {
    res.status(500).json({ message: 'Error generating NOC', error: error.message });
  }
};
