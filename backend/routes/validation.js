// validation.js
// backend/routes/validation.js
const express = require('express');
const router = express.Router();

/**
 * Helper function: Promisified version of db.get
 */
function dbGet(db, sql, params) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

/**
 * Helper function: Promisified version of db.all
 */
function dbAll(db, sql, params) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/**
 * POST /api/compliance-check
 * Expects in req.body:
 *   - destination: country code (e.g., "US")
 *   - itemType: e.g., "Electronics", "Dangerous Goods", etc.
 *   - declaredValue: numeric value (as string or number)
 *   - htsCode: string value for HTS code
 *   - un_number (optional): for dangerous goods, if required
 */
router.post('/', async (req, res) => {
  try {
    const { destination, itemType, declaredValue, htsCode, un_number } = req.body;
    if (!destination || !itemType || declaredValue == null) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    const destCode = destination.trim();
    const itemTypeInput = itemType.trim();
    const declaredValNum = parseFloat(declaredValue);
    if (isNaN(declaredValNum)) {
      return res.status(400).json({ error: 'Declared value must be a valid number.' });
    }
    
    const db = req.app.locals.db;
    const countryRow = await dbGet(db, "SELECT * FROM countries WHERE country_code = ?", [destCode]);
    if (!countryRow) {
      return res.status(400).json({ error: 'Invalid destination country code.' });
    }
    
    const restrictions = [];
    const requirements = [];
    
    // HTS Code Validation
    let expectedHtsLength = countryRow.hts_code_length;
    if (destCode === "DE" && itemTypeInput.toLowerCase() === "electronics") {
      expectedHtsLength = 10;
    }
    const trimmedHts = (htsCode || "").trim();
    if (!trimmedHts || trimmedHts.length !== expectedHtsLength) {
      restrictions.push(`HTS code must be exactly ${expectedHtsLength} digits for ${countryRow.country_name}.`);
    } else if (!/^\d+$/.test(trimmedHts)) {
      restrictions.push('HTS code must contain only digits.');
    }
    
    // Declared Value Check
    if (declaredValNum > countryRow.value_threshold) {
      if (destCode === "CA") {
        requirements.push(`Declared value exceeds threshold of ${countryRow.value_threshold} ${countryRow.currency_code}. Please prepare the commercial invoice.`);
      } else {
        restrictions.push(`Declared value exceeds threshold of ${countryRow.value_threshold} ${countryRow.currency_code}.`);
      }
    }
    
    const itemTypeRow = await dbGet(db, "SELECT * FROM item_types WHERE LOWER(item_type_name) = LOWER(?)", [itemTypeInput]);
    if (!itemTypeRow) {
      return res.status(400).json({ error: 'Invalid item type.' });
    }
    
    // Enhanced Restriction Checking
    const restrictionRows = await dbAll(db,
      `SELECT cir.*, it.requires_un_number_check 
       FROM country_item_restrictions cir
       JOIN item_types it ON LOWER(it.item_type_name) = LOWER(cir.item_type_name)
       WHERE cir.country_code = ? 
       AND LOWER(cir.item_type_name) = LOWER(?)`,
      [countryRow.country_code, itemTypeInput]
    );
    restrictionRows.forEach(row => {
      if (row.restriction_description.toLowerCase().includes('prohibited')) {
        restrictions.push(`Prohibited item: ${row.restriction_description}`);
      }
      if (row.un_number_mandatory && (!un_number || un_number.trim() === "")) {
        restrictions.push('UN number required for this restricted item');
      }
    });
    
    // Dangerous Goods Validation
    if (itemTypeRow.is_dangerous_goods) {
      if (!un_number || un_number.trim() === "") {
        restrictions.push('UN number required for dangerous goods');
      } else {
        const dg = await dbGet(db, `SELECT * FROM dangerous_goods WHERE un_number = ?`, [un_number]);
        if (!dg) {
          restrictions.push('Invalid UN number for dangerous goods');
        }
      }
    }    
    
    if (restrictions.length === 0) {
      if (countryRow.general_notes) requirements.push(countryRow.general_notes);
      if (itemTypeRow.packaging_notes) requirements.push(itemTypeRow.packaging_notes);
      if (itemTypeRow.is_dangerous_goods && itemTypeRow.dangerous_goods_notes) {
        requirements.push(itemTypeRow.dangerous_goods_notes);
      }
    }
    
    const complianceStatus = restrictions.length > 0 ? 'Rejected' : 'Compliant';
    return res.json({ complianceStatus, restrictions, requirements });
  } catch (error) {
    return res.status(500).json({ error: 'Compliance check failed due to a server error.', details: error.message });
  }
});


module.exports = router;
