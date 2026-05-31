const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const roleCheck = require('../middleware/roleCheck');
const {
  addProperty,
  getAllProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty
} = require('../controllers/propertyController');

// Any logged in user can view properties
router.get('/', verifyToken, getAllProperties);
router.get('/my', verifyToken, roleCheck('landlord'), getMyProperties);
router.get('/:id', verifyToken, getPropertyById);

// Only landlords can add, update, delete
router.post('/', verifyToken, roleCheck('landlord'), addProperty);
router.put('/:id', verifyToken, roleCheck('landlord'), updateProperty);
router.delete('/:id', verifyToken, roleCheck('landlord'), deleteProperty);

module.exports = router;