const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const roleCheck = require('../middleware/roleCheck');
const rentController = require('../controllers/rentController');

// Landlord routes
router.post('/', verifyToken, roleCheck('landlord', 'admin'), rentController.createRentRecord);
router.get('/all', verifyToken, roleCheck('landlord'), rentController.getAllMyRentRecords);
router.get('/unpaid', verifyToken, roleCheck('landlord'), rentController.getUnpaidRent);
router.get('/property/:property_id', verifyToken, roleCheck('landlord'), rentController.getRentByProperty);

// Tenant routes
router.get('/my', verifyToken, roleCheck('tenant'), rentController.getMyRentRecords);
router.put('/:id/pay', verifyToken, roleCheck('tenant'), rentController.markRentAsPaid);

module.exports = router;