const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

router.get('/all', authMiddleware, requireRole(['labs', 'admin']), labController.getAllLabOrders);
router.post('/', authMiddleware, requireRole(['doctor']), labController.createLabOrder);
router.get('/patient/:patientId', authMiddleware, labController.getPatientLabOrders);
router.patch('/:id', authMiddleware, requireRole(['labs', 'admin']), labController.updateLabOrder);

module.exports = router;
