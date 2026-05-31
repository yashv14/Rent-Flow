const db = require('../config/db');

const createBooking = (req, res) => {
  const { property_id, start_date, end_date } = req.body;
  const tenant_id = req.user.id;

  if (!property_id || !start_date) {
    return res.status(400).json({ message: 'Property ID and start date are required' });
  }

  db.query(
    'SELECT * FROM properties WHERE id = ? AND is_available = true',
    [property_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (results.length === 0) {
        return res.status(404).json({ message: 'Property not found or not available' });
      }

      db.query(
        'SELECT * FROM bookings WHERE tenant_id = ? AND property_id = ? AND status = "pending"',
        [tenant_id, property_id],
        (err, existing) => {
          if (err) return res.status(500).json({ message: err.message });
          if (existing.length > 0) {
            return res.status(400).json({ message: 'You already have a pending booking for this property' });
          }

          db.query(
            'INSERT INTO bookings (tenant_id, property_id, start_date, end_date) VALUES (?, ?, ?, ?)',
            [tenant_id, property_id, start_date, end_date || null],
            (err, result) => {
              if (err) return res.status(500).json({ message: err.message });
              res.status(201).json({
                message: 'Booking request submitted successfully',
                bookingId: result.insertId
              });
            }
          );
        }
      );
    }
  );
};

const getMyBookings = (req, res) => {
  const tenant_id = req.user.id;

  db.query(
    `SELECT bookings.*,
      properties.title AS property_title,
      properties.address AS property_address,
      properties.rent_amount AS rent_amount,
      users.name AS landlord_name
     FROM bookings
     JOIN properties ON bookings.property_id = properties.id
     JOIN users ON properties.landlord_id = users.id
     WHERE bookings.tenant_id = ?
     ORDER BY bookings.created_at DESC`,
    [tenant_id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      res.json(results);
    }
  );
};

const getBookingsByProperty = (req, res) => {
  const { property_id } = req.params;
  const landlord_id = req.user.id;

  db.query(
    'SELECT * FROM properties WHERE id = ? AND landlord_id = ?',
    [property_id, landlord_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (results.length === 0) {
        return res.status(403).json({ message: 'Property not found or access denied' });
      }

      db.query(
        `SELECT bookings.*,
          users.name AS tenant_name,
          users.email AS tenant_email,
          users.phone AS tenant_phone
         FROM bookings
         JOIN users ON bookings.tenant_id = users.id
         WHERE bookings.property_id = ?
         ORDER BY bookings.created_at DESC`,
        [property_id],
        (err, bookings) => {
          if (err) return res.status(500).json({ message: err.message });
          res.json(bookings);
        }
      );
    }
  );
};

const getAllMyPropertyBookings = (req, res) => {
  const landlord_id = req.user.id;

  db.query(
    `SELECT bookings.*,
      properties.title AS property_title,
      properties.address AS property_address,
      users.name AS tenant_name,
      users.email AS tenant_email
     FROM bookings
     JOIN properties ON bookings.property_id = properties.id
     JOIN users ON bookings.tenant_id = users.id
     WHERE properties.landlord_id = ?
     ORDER BY bookings.created_at DESC`,
    [landlord_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(results);
    }
  );
};

const updateBookingStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const landlord_id = req.user.id;

  const validStatuses = ['approved', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Status must be approved or rejected' });
  }

  db.query(
    `SELECT bookings.* FROM bookings
     JOIN properties ON bookings.property_id = properties.id
     WHERE bookings.id = ? AND properties.landlord_id = ?`,
    [id, landlord_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (results.length === 0) {
        return res.status(403).json({ message: 'Booking not found or access denied' });
      }

      db.query(
        'UPDATE bookings SET status = ? WHERE id = ?',
        [status, id],
        (err) => {
          if (err) return res.status(500).json({ message: err.message });

          if (status === 'approved') {
            db.query(
              'UPDATE properties SET is_available = false WHERE id = ?',
              [results[0].property_id]
            );
          }

          res.json({ message: `Booking ${status} successfully` });
        }
      );
    }
  );
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingsByProperty,
  getAllMyPropertyBookings,
  updateBookingStatus
};