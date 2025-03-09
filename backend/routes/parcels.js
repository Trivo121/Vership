const express = require('express');
const router = express.Router();

// GET all parcels (ordered by submission_date descending)
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  db.all("SELECT * FROM parcels ORDER BY submission_date DESC", (err, rows) => {
    if (err) {
      console.error("Error fetching parcels:", err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// GET a single parcel by ID (extension)
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  if (isNaN(Number(id))) {
    return res.status(400).json({ error: 'Invalid parcel ID' });
  }
  db.get("SELECT * FROM parcels WHERE id = ?", [id], (err, parcel) => {
    if (err) {
      console.error("Error fetching parcel:", err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!parcel) {
      return res.status(404).json({ error: 'Parcel not found' });
    }
    res.json(parcel);
  });
});

router.post('/', (req, res) => {
  console.log("Received payload:", req.body);
  const db = req.app.locals.db;
  let {
    sender,
    recipient_address,
    item_type,
    weight,
    destination,
    declared_value,
    hts_code,
    status,
    compliance_notes,
    purpose_of_shipment,
    shipping_terms,
    origin_country
  } = req.body;

  // Basic validation: Check required fields
  if (!sender || !recipient_address || !item_type || !weight || !destination || !declared_value) {
    const missing = [];
    if (!sender) missing.push('sender');
    if (!recipient_address) missing.push('recipient_address');
    if (!item_type) missing.push('item_type');
    if (!weight) missing.push('weight');
    if (!destination) missing.push('destination');
    if (!declared_value) missing.push('declared_value');

    return res.status(400).json({
      error: `Missing fields: ${missing.join(', ')}`
    });
  }
  
  weight = parseFloat(weight);
  declared_value = parseFloat(declared_value);
  
  if (isNaN(weight) || isNaN(declared_value)) {
    return res.status(400).json({ error: 'Invalid number for weight or declared value' });
  }
  
  // Convert optional fields: if origin_country is empty, set to null.
  origin_country = origin_country && origin_country.trim() !== "" ? origin_country : null;
  
  const query = `
    INSERT INTO parcels 
      (sender, recipient_address, item_type, weight, destination, declared_value, hts_code, status, compliance_notes, purpose_of_shipment, shipping_terms, origin_country)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [sender, recipient_address, item_type, weight, destination, declared_value, hts_code, status, compliance_notes, purpose_of_shipment, shipping_terms, origin_country], function(err) {
    console.log("db.run() execution completed. Checking for errors...");
    if (err) {
      console.error("Insertion error:", err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({
      id: this.lastID,
      sender,
      recipient_address,
      item_type,
      weight,
      destination,
      declared_value,
      hts_code,
      status,
      compliance_notes,
      purpose_of_shipment,
      shipping_terms,
      origin_country
    });
  });
});


module.exports = router;
