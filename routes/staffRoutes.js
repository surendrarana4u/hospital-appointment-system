const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, requireRole(['admin']), staffController.createStaff);
router.get('/', authMiddleware, requireRole(['admin']), staffController.getAllStaff);

module.exports = router;
