const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const roleCheck = require('../middleware/roleCheck');
const noticeController = require('../controllers/noticeController');

// Send a notice (landlord or admin only)
router.post('/', verifyToken, roleCheck('landlord', 'admin'), noticeController.sendNotice);

// View received notices (any logged in user)
router.get('/my', verifyToken, noticeController.getMyNotices);
router.get('/unread', verifyToken, noticeController.getUnreadNotices);

// View sent notices (landlord or admin only)
router.get('/sent', verifyToken, roleCheck('landlord', 'admin'), noticeController.getSentNotices);

// Mark as read (any logged in user)
router.put('/:id/read', verifyToken, noticeController.markAsRead);

// Delete a notice (landlord or admin only)
router.delete('/:id', verifyToken, roleCheck('landlord', 'admin'), noticeController.deleteNotice);

module.exports = router;