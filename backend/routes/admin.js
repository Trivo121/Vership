const express = require('express');
const router = express.Router();

// Simple input validation function
const validateRestrictionInput = (data) => {
  const { country_code, item_type_name, restriction_description, un_number_mandatory } = data;
  if (!country_code || !item_type_name || !restriction_description) {
    return 'country_code, item_type_name and restriction_description are required.';
  }
  if (typeof un_number_mandatory !== 'boolean') {
    return 'un_number_mandatory must be a boolean.';
  }
  return null;
};

// GET all country item restrictions
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  db.all(`SELECT * FROM country_item_restrictions`, (err, rows) => {
    if (err) {
      console.error('Error fetching restrictions:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// GET a single restriction by ID
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  if (isNaN(Number(id))) {
    return res.status(400).json({ error: 'Invalid restriction ID' });
  }
  db.get(`SELECT * FROM country_item_restrictions WHERE restriction_id = ?`, [id], (err, row) => {
    if (err) {
      console.error('Error fetching restriction:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Restriction not found' });
    }
    res.json(row);
  });
});

// POST: Create a new country item restriction
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const errorMsg = validateRestrictionInput(req.body);
  if (errorMsg) {
    return res.status(400).json({ error: errorMsg });
  }
  const { country_code, item_type_name, restriction_description, un_number_mandatory, additional_packaging_notes } = req.body;
  const query = `
    INSERT INTO country_item_restrictions 
      (country_code, item_type_name, restriction_description, un_number_mandatory, additional_packaging_notes)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.run(query, [country_code, item_type_name, restriction_description, un_number_mandatory, additional_packaging_notes], function(err) {
    if (err) {
      console.error('Error inserting restriction:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({
      restriction_id: this.lastID,
      country_code,
      item_type_name,
      restriction_description,
      un_number_mandatory,
      additional_packaging_notes
    });
  });
});

// PUT: Update an existing restriction by ID
router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  if (isNaN(Number(id))) {
    return res.status(400).json({ error: 'Invalid restriction ID' });
  }
  const errorMsg = validateRestrictionInput(req.body);
  if (errorMsg) {
    return res.status(400).json({ error: errorMsg });
  }
  const { country_code, item_type_name, restriction_description, un_number_mandatory, additional_packaging_notes } = req.body;
  const query = `
    UPDATE country_item_restrictions
    SET country_code = ?, item_type_name = ?, restriction_description = ?, un_number_mandatory = ?, additional_packaging_notes = ?
    WHERE restriction_id = ?
  `;
  db.run(query, [country_code, item_type_name, restriction_description, un_number_mandatory, additional_packaging_notes, id], function(err) {
    if (err) {
      console.error('Error updating restriction:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({
      restriction_id: id,
      country_code,
      item_type_name,
      restriction_description,
      un_number_mandatory,
      additional_packaging_notes
    });
  });
});

// DELETE: Delete a restriction by ID
router.delete('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  if (isNaN(Number(id))) {
    return res.status(400).json({ error: 'Invalid restriction ID' });
  }
  db.run(`DELETE FROM country_item_restrictions WHERE restriction_id = ?`, [id], function(err) {
    if (err) {
      console.error('Error deleting restriction:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Restriction deleted successfully' });
  });
});

module.exports = router;
