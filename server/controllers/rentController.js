const db = require('../config/db');

// CREATE a rent record (landlord or admin only)
const createRentRecord = (req, res) => {
  const { tenant_id, property_id, amount, due_date } = req.body;

  if (!tenant_id || !property_id || !amount || !due_date) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check if property exists
  db.query(
    'SELECT * FROM properties WHERE id = ?',
    [property_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (results.length === 0) {
        return res.status(404).json({ message: 'Property not found' });
      }

      // Check if tenant exists
      db.query(
        'SELECT * FROM users WHERE id = ? AND role = "tenant"',
        [tenant_id],
        (err, tenantResults) => {
          if (err) return res.status(500).json({ message: err.message });
          if (tenantResults.length === 0) {
            return res.status(404).json({ message: 'Tenant not found' });
          }

          // Create rent record
          db.query(
            'INSERT INTO rent_records (tenant_id, property_id, amount, due_date) VALUES (?, ?, ?, ?)',
            [tenant_id, property_id, amount, due_date],
            (err, result) => {
              if (err) return res.status(500).json({ message: err.message });
              res.status(201).json({
                message: 'Rent record created successfully',
                rentId: result.insertId
              });
            }
          );
        }
      );
    }
  );
};

// GET all rent records for the logged in tenant
const getMyRentRecords = (req, res) => {
  const tenant_id = req.user.id;

  db.query(
    `SELECT rent_records.*,
      properties.title AS property_title,
      properties.address AS property_address,
      users.name AS landlord_name
     FROM rent_records
     JOIN properties ON rent_records.property_id = properties.id
     JOIN users ON properties.landlord_id = users.id
     WHERE rent_records.tenant_id = ?
     ORDER BY rent_records.due_date DESC`,
    [tenant_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(results);
    }
  );
};

// GET all rent records for a specific property (landlord only)
const getRentByProperty = (req, res) => {
  const { property_id } = req.params;
  const landlord_id = req.user.id;

  // Make sure this property belongs to the landlord
  db.query(
    'SELECT * FROM properties WHERE id = ? AND landlord_id = ?',
    [property_id, landlord_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (results.length === 0) {
        return res.status(403).json({ message: 'Property not found or access denied' });
      }

      db.query(
        `SELECT rent_records.*,
          users.name AS tenant_name,
          users.email AS tenant_email,
          users.phone AS tenant_phone
         FROM rent_records
         JOIN users ON rent_records.tenant_id = users.id
         WHERE rent_records.property_id = ?
         ORDER BY rent_records.due_date DESC`,
        [property_id],
        (err, records) => {
          if (err) return res.status(500).json({ message: err.message });
          res.json(records);
        }
      );
    }
  );
};

// GET all rent records for all properties (landlord only)
const getAllMyRentRecords = (req, res) => {
  const landlord_id = req.user.id;

  db.query(
    `SELECT rent_records.*,
      properties.title AS property_title,
      users.name AS tenant_name,
      users.email AS tenant_email
     FROM rent_records
     JOIN properties ON rent_records.property_id = properties.id
     JOIN users ON rent_records.tenant_id = users.id
     WHERE properties.landlord_id = ?
     ORDER BY rent_records.due_date DESC`,
    [landlord_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(results);
    }
  );
};

// MARK rent as paid (tenant only)
const markRentAsPaid = (req, res) => {
  const { id } = req.params;
  const tenant_id = req.user.id;

  // Make sure this rent record belongs to the tenant
  db.query(
    'SELECT * FROM rent_records WHERE id = ? AND tenant_id = ?',
    [id, tenant_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (results.length === 0) {
        return res.status(403).json({ message: 'Rent record not found or access denied' });
      }

      if (results[0].is_paid) {
        return res.status(400).json({ message: 'Rent is already marked as paid' });
      }

      db.query(
        'UPDATE rent_records SET is_paid = true, paid_on = CURDATE() WHERE id = ?',
        [id],
        (err) => {
          if (err) return res.status(500).json({ message: err.message });
          res.json({ message: 'Rent marked as paid successfully' });
        }
      );
    }
  );
};

// GET unpaid rent records (landlord only)
const getUnpaidRent = (req, res) => {
  const landlord_id = req.user.id;

  db.query(
    `SELECT rent_records.*,
      properties.title AS property_title,
      users.name AS tenant_name,
      users.email AS tenant_email,
      users.phone AS tenant_phone
     FROM rent_records
     JOIN properties ON rent_records.property_id = properties.id
     JOIN users ON rent_records.tenant_id = users.id
     WHERE properties.landlord_id = ? AND rent_records.is_paid = false
     ORDER BY rent_records.due_date ASC`,
    [landlord_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(results);
    }
  );
};

module.exports = {
  createRentRecord,
  getMyRentRecords,
  getRentByProperty,
  getAllMyRentRecords,
  markRentAsPaid,
  getUnpaidRent
};