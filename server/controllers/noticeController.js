const db = require('../config/db');

// SEND a notice (admin or landlord only)
const sendNotice = (req, res) => {
  const { receiver_id, title, message } = req.body;
  const sender_id = req.user.id;

  if (!receiver_id || !title || !message) {
    return res.status(400).json({ message: 'Receiver, title and message are required' });
  }

  // Check if receiver exists
  db.query(
    'SELECT * FROM users WHERE id = ?',
    [receiver_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (results.length === 0) {
        return res.status(404).json({ message: 'Receiver not found' });
      }

      db.query(
        'INSERT INTO notices (sender_id, receiver_id, title, message) VALUES (?, ?, ?, ?)',
        [sender_id, receiver_id, title, message],
        (err, result) => {
          if (err) return res.status(500).json({ message: err.message });
          res.status(201).json({
            message: 'Notice sent successfully',
            noticeId: result.insertId
          });
        }
      );
    }
  );
};

// GET all notices received by the logged in user
const getMyNotices = (req, res) => {
  const receiver_id = req.user.id;

  db.query(
    `SELECT notices.*,
      users.name AS sender_name,
      users.role AS sender_role
     FROM notices
     JOIN users ON notices.sender_id = users.id
     WHERE notices.receiver_id = ?
     ORDER BY notices.created_at DESC`,
    [receiver_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(results);
    }
  );
};

// GET all notices sent by the logged in user
const getSentNotices = (req, res) => {
  const sender_id = req.user.id;

  db.query(
    `SELECT notices.*,
      users.name AS receiver_name,
      users.role AS receiver_role
     FROM notices
     JOIN users ON notices.receiver_id = users.id
     WHERE notices.sender_id = ?
     ORDER BY notices.created_at DESC`,
    [sender_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(results);
    }
  );
};

// MARK a notice as read (receiver only)
const markAsRead = (req, res) => {
  const { id } = req.params;
  const receiver_id = req.user.id;

  // Make sure this notice belongs to the logged in user
  db.query(
    'SELECT * FROM notices WHERE id = ? AND receiver_id = ?',
    [id, receiver_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (results.length === 0) {
        return res.status(403).json({ message: 'Notice not found or access denied' });
      }

      if (results[0].is_read) {
        return res.status(400).json({ message: 'Notice is already marked as read' });
      }

      db.query(
        'UPDATE notices SET is_read = true WHERE id = ?',
        [id],
        (err) => {
          if (err) return res.status(500).json({ message: err.message });
          res.json({ message: 'Notice marked as read' });
        }
      );
    }
  );
};

// GET all unread notices for the logged in user
const getUnreadNotices = (req, res) => {
  const receiver_id = req.user.id;

  db.query(
    `SELECT notices.*,
      users.name AS sender_name,
      users.role AS sender_role
     FROM notices
     JOIN users ON notices.sender_id = users.id
     WHERE notices.receiver_id = ? AND notices.is_read = false
     ORDER BY notices.created_at DESC`,
    [receiver_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(results);
    }
  );
};

// DELETE a notice (sender only)
const deleteNotice = (req, res) => {
  const { id } = req.params;
  const sender_id = req.user.id;

  db.query(
    'SELECT * FROM notices WHERE id = ? AND sender_id = ?',
    [id, sender_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (results.length === 0) {
        return res.status(403).json({ message: 'Notice not found or access denied' });
      }

      db.query(
        'DELETE FROM notices WHERE id = ?',
        [id],
        (err) => {
          if (err) return res.status(500).json({ message: err.message });
          res.json({ message: 'Notice deleted successfully' });
        }
      );
    }
  );
};

module.exports = {
  sendNotice,
  getMyNotices,
  getSentNotices,
  markAsRead,
  getUnreadNotices,
  deleteNotice
};