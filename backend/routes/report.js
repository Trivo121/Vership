const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');

router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  // Basic validation: ensure id is a number
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
    
    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=parcel_${id}_report.pdf`);
    doc.pipe(res);
    
    // Header
    doc.fontSize(22).text('Parcel Compliance Report', { align: 'center' });
    doc.moveDown();
    
    // Basic details
    doc.fontSize(12);
    doc.text(`Report Date: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.moveDown();
    doc.text(`Parcel ID: ${parcel.id}`);
    doc.text(`Sender: ${parcel.sender}`);
    doc.text(`Recipient: ${parcel.recipient_address}`);
    doc.text(`Item Type: ${parcel.item_type}`);
    doc.text(`Weight: ${parcel.weight}`);
    doc.text(`Destination: ${parcel.destination}`);
    doc.text(`Declared Value: ${parcel.declared_value}`);
    doc.text(`HTS Code: ${parcel.hts_code || 'N/A'}`);
    doc.text(`Purpose of Shipment: ${parcel.purpose_of_shipment || 'N/A'}`);
    doc.text(`Shipping Terms: ${parcel.shipping_terms || 'N/A'}`);
    doc.text(`Origin Country: ${parcel.origin_country || 'N/A'}`);
    doc.text(`Status: ${parcel.status}`);
    doc.moveDown();
    
    // Compliance Notes
    doc.fontSize(14).text('Compliance Notes', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(parcel.compliance_notes || 'None');
    
    doc.end();
  });
});

module.exports = router;
