const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, requireRole(['doctor', 'pharma', 'admin', 'reception']), prescriptionController.getAllPrescriptions);
router.post('/', authMiddleware, requireRole(['doctor']), prescriptionController.createPrescription);
router.get('/patient/:patientId', authMiddleware, prescriptionController.getPatientPrescriptions);
router.patch('/:id/status', authMiddleware, requireRole(['pharma', 'admin']), prescriptionController.updatePrescriptionStatus);

module.exports = router;
