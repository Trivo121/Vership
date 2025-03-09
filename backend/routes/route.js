// backend/routes/route.js

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Haversine formula for air distance calculations
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

router.post('/calculate-route', (req, res) => {
  const { origin, destination, weight, priority } = req.body;
  if (!origin || !destination || !weight) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if we're in our demo scenario: Mumbai (Port) -> London (Airport)
  if (origin === 'INBOM' && destination === 'LHR') {
    // Get the location info for origin and destination
    db.all(`SELECT * FROM Locations WHERE LocationCode IN (?, ?)`, [origin, destination], (err, locations) => {
      if (err) {
        return res.status(500).json({ error: 'Database query failed' });
      }
      if (locations.length < 2) {
        return res.status(400).json({ error: 'Invalid origin or destination' });
      }
      const originLoc = locations.find(loc => loc.LocationCode === origin);
      const destLoc = locations.find(loc => loc.LocationCode === destination);
      
      // Predefined routes for Mumbai-London demo
      const routes = [
        {
          id: "route-air",
          title: "Air-Only",
          modes: ["Air"],
          estimatedCost: 6000,
          estimatedTransitTime: 1, // in days
          segments: [
            {
              start_location: "Mumbai",
              end_location: "London",
              start_lat: originLoc.Latitude,
              start_lng: originLoc.Longitude,
              end_lat: destLoc.Latitude,
              end_lng: destLoc.Longitude,
              color: "red"
            }
          ],
          carbonFootprint: 1.2,
          reliabilityScore: 0.95
        },
        {
          id: "route-sea-air",
          title: "Sea-Air",
          modes: ["Sea", "Air"],
          estimatedCost: 1500,
          estimatedTransitTime: 22, // in days
          segments: [
            {
              start_location: "Mumbai Port",
              end_location: "Rotterdam Port",
              start_lat: originLoc.Latitude,
              start_lng: originLoc.Longitude,
              end_lat: 51.8850,   // Rotterdam Port latitude (from Locations table)
              end_lng: 4.2697,    // Rotterdam Port longitude
              color: "blue"
            },
            {
              start_location: "Rotterdam Airport",
              end_location: "London Airport",
              start_lat: 51.9044, // Rotterdam Airport latitude
              start_lng: 4.4212,  // Rotterdam Airport longitude
              end_lat: destLoc.Latitude,
              end_lng: destLoc.Longitude,
              color: "red"
            }
          ],
          carbonFootprint: 0.75,
          reliabilityScore: 0.85
        },
        {
          id: "route-sea",
          title: "Sea-Only",
          modes: ["Sea"],
          estimatedCost: 500,
          estimatedTransitTime: 24, // in days
          segments: [
            {
              start_location: "Mumbai Port",
              end_location: "London Port",
              start_lat: originLoc.Latitude,
              start_lng: originLoc.Longitude,
              end_lat: 51.4638,   // London Port latitude
              end_lng: 0.3507,    // London Port longitude
              color: "blue"
            }
          ],
          carbonFootprint: 0.65,
          reliabilityScore: 0.80
        }
      ];
      return res.json({ routes });
    });
  } else {
    // Fallback: Use a basic calculation based on RouteCosts table
    db.all(`SELECT * FROM Locations WHERE LocationCode IN (?, ?)`, [origin, destination], (err, locations) => {
      if (err) return res.status(500).json({ error: 'Database query failed' });
      if (locations.length < 2) return res.status(400).json({ error: 'Invalid origin or destination' });
      
      const originLoc = locations.find(loc => loc.LocationCode === origin);
      const destLoc = locations.find(loc => loc.LocationCode === destination);
      const distance = getDistance(originLoc.Latitude, originLoc.Longitude, destLoc.Latitude, destLoc.Longitude);
      
      db.all(`SELECT * FROM RouteCosts`, [], (err, costs) => {
        if (err) return res.status(500).json({ error: 'Database query failed' });
        
        const routes = costs.map(cost => {
          return {
            id: `route-${cost.ModeID}`,
            title: cost.ModeID === 1 ? "Air-Only" : (cost.ModeID === 2 ? "Sea-Only" : "Land Route"),
            modes: cost.ModeID === 1 ? ["Air"] : (cost.ModeID === 2 ? ["Sea"] : ["Land"]),
            estimatedCost: weight * cost.CostPerUnitWeight,
            estimatedTransitTime: Math.ceil((distance * cost.TimePerUnitDistance) / 24),
            segments: [
              {
                start_location: originLoc.Name,
                end_location: destLoc.Name,
                start_lat: originLoc.Latitude,
                start_lng: originLoc.Longitude,
                end_lat: destLoc.Latitude,
                end_lng: destLoc.Longitude,
                color: cost.ModeID === 1 ? "red" : (cost.ModeID === 2 ? "blue" : "green")
              }
            ],
            carbonFootprint: 1.0,
            reliabilityScore: 0.9
          };
        });
        routes.sort((a, b) => a.estimatedCost - b.estimatedCost);
        return res.json({ routes });
      });
    });
  }
});

module.exports = router;
