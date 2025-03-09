const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const db = req.app.locals.db;
  
  // Using nested queries. For more complex cases, you might use Promises.
  db.get("SELECT COUNT(*) as total FROM parcels", (err, totalRow) => {
    if (err) {
      console.error("Error fetching total shipments:", err);
      return res.status(500).json({ error: 'Database error' });
    }
    db.get("SELECT COUNT(*) as compliant FROM parcels WHERE status = 'Compliant'", (err2, compliantRow) => {
      if (err2) {
        console.error("Error fetching compliant shipments:", err2);
        return res.status(500).json({ error: 'Database error' });
      }
      db.get("SELECT AVG(declared_value) as avgDeclared FROM parcels", (err3, avgRow) => {
        if (err3) {
          console.error("Error fetching average declared value:", err3);
          return res.status(500).json({ error: 'Database error' });
        }
        const total = totalRow.total;
        const compliant = compliantRow.compliant;
        const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 0;
        res.json({
          totalShipments: total,
          compliantShipments: compliant,
          complianceRate,
          averageDeclaredValue: avgRow.avgDeclared || 0
        });
      });
    });
  });
});

module.exports = router;
