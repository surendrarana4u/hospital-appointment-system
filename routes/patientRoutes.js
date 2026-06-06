const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

// Patients can read their own profile. Reception/Admin can read all.
router.get('/profile', authMiddleware, requireRole(['patient']), patientController.getMyProfile);

// Only Reception/Admin can update patient records
router.put('/:id', authMiddleware, requireRole(['admin', 'reception']), patientController.updatePatient);

// Doctors/Reception/Admin can get patient details by Patient ID
router.get('/:id', authMiddleware, requireRole(['admin', 'reception', 'doctor', 'pharma', 'labs']), patientController.getPatientById);

// Reception/Admin/Doctor can get all patients
router.get('/', authMiddleware, requireRole(['admin', 'reception', 'doctor']), patientController.getAllPatients);

module.exports = router;
