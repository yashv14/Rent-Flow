const db = require('../config/db');

// ADD a new property (landlord only)
const addProperty = (req, res) => {
  const { title, address, city, rent_amount } = req.body;
  const landlord_id = req.user.id;

  if (!title || !address || !rent_amount) {
    return res.status(400).json({ message: 'Title, address and rent amount are required' });
  }

  db.query(
    'INSERT INTO properties (landlord_id, title, address, city, rent_amount) VALUES (?, ?, ?, ?, ?)',
    [landlord_id, title, address, city || null, rent_amount],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      res.status(201).json({
        message: 'Property added successfully',
        propertyId: result.insertId
      });
    }
  );
};

// GET all available properties (any logged in user)
const getAllProperties = (req, res) => {
  db.query(
    `SELECT properties.*, users.name AS landlord_name 
     FROM properties 
     JOIN users ON properties.landlord_id = users.id
     WHERE properties.is_available = true`,
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(results);
    }
  );
};

// GET a single property by ID
const getPropertyById = (req, res) => {
  const { id } = req.params;

  db.query(
    `SELECT properties.*, users.name AS landlord_name 
     FROM properties 
     JOIN users ON properties.landlord_id = users.id
     WHERE properties.id = ?`,
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (results.length === 0) {
        return res.status(404).json({ message: 'Property not found' });
      }
      res.json(results[0]);
    }
  );
};

// GET all properties belonging to the logged in landlord
const getMyProperties = (req, res) => {
  const landlord_id = req.user.id;

  db.query(
    'SELECT * FROM properties WHERE landlord_id = ?',
    [landlord_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(results);
    }
  );
};

// UPDATE a property (landlord only, must own the property)
const updateProperty = (req, res) => {
  const { id } = req.params;
  const { title, address, city, rent_amount, is_available } = req.body;
  const landlord_id = req.user.id;

  // First check if this property belongs to the landlord
  db.query(
    'SELECT * FROM properties WHERE id = ? AND landlord_id = ?',
    [id, landlord_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (results.length === 0) {
        return res.status(403).json({ message: 'Property not found or access denied' });
      }

      db.query(
        `UPDATE properties 
         SET title = ?, address = ?, city = ?, rent_amount = ?, is_available = ?
         WHERE id = ?`,
        [
          title || results[0].title,
          address || results[0].address,
          city || results[0].city,
          rent_amount || results[0].rent_amount,
          is_available !== undefined ? is_available : results[0].is_available,
          id
        ],
        (err) => {
          if (err) return res.status(500).json({ message: err.message });
          res.json({ message: 'Property updated successfully' });
        }
      );
    }
  );
};

// DELETE a property (landlord only, must own the property)
const deleteProperty = (req, res) => {
  const { id } = req.params;
  const landlord_id = req.user.id;

  // First check if this property belongs to the landlord
  db.query(
    'SELECT * FROM properties WHERE id = ? AND landlord_id = ?',
    [id, landlord_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (results.length === 0) {
        return res.status(403).json({ message: 'Property not found or access denied' });
      }

      db.query('DELETE FROM properties WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'Property deleted successfully' });
      });
    }
  );
};

module.exports = {
  addProperty,
  getAllProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty
};