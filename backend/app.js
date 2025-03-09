// backend/app.js

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// Connect to SQLite database (database.sqlite is created from database.sql)
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Make the database available to all route handlers
app.locals.db = db;

// Mount route handlers
const validationRoutes = require('./routes/validation');
app.use('/api/compliance-check', validationRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin/country-rules', adminRoutes);

const parcelsRoutes = require('./routes/parcels');
app.use('/api/parcels', parcelsRoutes);

const reportRoutes = require('./routes/report');
app.use('/api/report', reportRoutes);

const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);

// Mount the Cross-Border Route Selector API endpoint
const routeRoutes = require('./routes/route');
app.use('/api', routeRoutes);

// Optionally serve static files (e.g., frontend public folder)
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
