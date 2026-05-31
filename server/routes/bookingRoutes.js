// const express = require('express');
// const router = express.Router();
// const {
//   createBooking,
//   getAllBookings,
//   getBookingById,
//   updateBookingStatus,
//   deleteBooking
// } = require('../controllers/bookingController');
// const verifyToken  = require('../middleware/verifyToken');
// const roleCheck    = require('../middleware/roleCheck');
// const bookingController = require('../controllers/bookingController');

// // All booking routes require login
// router.get('/',           verifyToken, getAllBookings);
// router.get('/:id',        verifyToken, getBookingById);
// router.post('/',          verifyToken, roleCheck('tenant'), createBooking);
// router.put('/:id/status', verifyToken, roleCheck('landlord', 'admin'), updateBookingStatus);
// router.delete('/:id',     verifyToken, roleCheck('tenant', 'admin'), deleteBooking);

// module.exports = router;4

const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const roleCheck = require('../middleware/roleCheck');
const bookingController = require('../controllers/bookingController');

// Tenant routes
router.post('/', verifyToken, roleCheck('tenant'), bookingController.createBooking);
router.get('/my', verifyToken, roleCheck('tenant'), bookingController.getMyBookings);

// Landlord routes
router.get('/all', verifyToken, roleCheck('landlord'), bookingController.getAllMyPropertyBookings);
router.get('/property/:property_id', verifyToken, roleCheck('landlord'), bookingController.getBookingsByProperty);
router.put('/:id', verifyToken, roleCheck('landlord'), bookingController.updateBookingStatus);

module.exports = router;