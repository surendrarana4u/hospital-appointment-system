const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

// Route to get all bills for a patient
router.get('/patient/:patientId', authMiddleware, billingController.getPatientBills);

// Route to generate NOC
router.get('/noc/:patientId', authMiddleware, billingController.generateNOC);

// Route to create a bill (Only Staff)
router.post('/', authMiddleware, requireRole(['doctor', 'pharma', 'labs', 'admin']), billingController.createBill);

// Route to mark bill as paid
router.patch('/:id/pay', authMiddleware, billingController.payBill);

module.exports = router;
