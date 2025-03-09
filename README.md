Vership : Global Trade Compliance & Cross-Border Route Selector
Overview
Vership is a demo prototype designed to streamline global trade compliance and optimize cross-border shipping routes. The system comprises two main features:

Compliance Checker: Validates shipment details against country-specific regulations to ensure shipments comply with customs and trade rules.
Cross-Border Route Selector: Calculates optimal shipping routes using multi-modal transport options (Air, Sea, Land, and combinations) and visualizes the routes on an interactive map.
This prototype demonstrates how logistics providers can leverage modern technologies to reduce compliance errors, improve shipping efficiency, and generate detailed shipment reports.

Key Features
User-Friendly Input Forms:
Compliance Checker: A form for clerks to input shipment data (sender, recipient, item type, weight, etc.) with real-time validation feedback.
Route Optimizer: A dedicated form that collects shipment details including origin, destination, weight, shipping priority (Economy, Standard, Express), and additional compliance-related inputs like Purpose of Shipment and Shipping Terms.
Multi-Modal Route Calculation:
Predefined routes for key scenarios (e.g., Mumbai to London, Mumbai to Singapore) using a simplified algorithm.
Uses the Haversine formula for air distance calculations and mock distances for sea/land segments.
Computes cost and transit time for each route segment using parameters stored in a SQLite database.
Dynamic Route Suggestions:
Displays route suggestions in a card-based layout sorted by estimated cost or transit time.
An interactive map built with react-leaflet visualizes route segments with color-coded polylines.
Compliance Validation & Reporting:
Validates input against compliance rules stored in the SQLite database.
Provides immediate feedback on errors (e.g., missing required fields, restricted items) and generates a PDF report if needed.
Admin & Dashboard Modules (Optional):
An admin panel allows dynamic rule updates.
A dashboard displays real-time compliance trends and analytics.
Project Structure
less
Copy code
Vership/
├── backend/
│   ├── app.js               // Main Express application entry point
│   ├── database.sql         // SQL file for database schema and initial data
│   ├── database.sqlite      // SQLite database file
│   ├── package.json         // Node.js dependencies and scripts
│   ├── routes/
│   │   ├── validation.js    // Routes for compliance checker validation endpoints
│   │   ├── admin.js         // Routes for admin-related endpoints (rule updates)
│   │   ├── report.js        // Routes for PDF report generation
│   │   └── route.js         // Routes for the Cross-Border Router feature
├── frontend/
│   ├── public/
│   │   └── index.html       // Main HTML file for the React app
│   ├── src/
│   │   ├── App.js           // Main React application component
│   │   ├── index.js         // React entry point
│   │   ├── components/
│   │   │   ├── HomePage.js         // Home screen with feature cards
│   │   │   ├── ClerkPage.js        // Compliance Checker Clerk view
│   │   │   ├── Form.js             // Compliance form
│   │   │   ├── Dashboard.js        // Manager dashboard
│   │   │   ├── AdminPanel.js       // Admin panel for rule management
│   │   │   └── RouteOptimizer/
│   │   │       ├── RouteOptimizerPage.js  // Main page for the Route Optimizer feature
│   │   │       ├── RouteInputForm.js        // Input form for shipment details & priority selection
│   │   │       ├── RouteOutputDisplay.js    // Displays route suggestions
│   │   │       └── RouteMap.js              // Map component (react-leaflet) for route visualization
│   │   └── styles/
│   │       └── index.css        // Tailwind CSS file for styling
│   │   └── reportWebVitals.js
Technology Stack
Frontend: React.js, Tailwind CSS, React Router, react-leaflet (OpenStreetMap)
Backend: Node.js, Express.js
Database: SQLite
Validation & Form Management: Zod, react-hook-form
PDF Generation (Optional): PDFKit or Puppeteer
Installation and Setup
Prerequisites
Node.js (v12+)
npm (v6+)
Backend Setup
Clone the Repository:
bash
Copy code
git clone https://your-repo-url.git
cd Vership/backend
Install Dependencies:
bash
Copy code
npm install
Set Up the Database:
Initialize the SQLite database using the provided database.sql file:
bash
Copy code
sqlite3 database.sqlite < database.sql
Start the Backend Server:
bash
Copy code
npm start
The backend server will run on http://localhost:3000.
Frontend Setup
Navigate to the Frontend Directory:
bash
Copy code
cd ../frontend
Install Dependencies:
bash
Copy code
npm install
Start the React Development Server:
bash
Copy code
npm start
The frontend will be available on http://localhost:3001 (or the assigned port).
Usage
Homepage:
Visit the homepage to access feature cards for "Compliance Checker" and "Cross-Border Router".
Route Optimizer:
Click the "Cross-Border Router" card to navigate to the route optimizer page.
Fill in the shipment input form (origin, destination, package weight, shipping priority, etc.).
On form submission, the frontend sends a POST request to /api/calculate-route and displays route suggestions along with an interactive map.
Compliance Checker:
Clerks can enter parcel data to validate against compliance rules.
Real-time feedback is provided, and any errors (e.g., restricted items, missing required fields) are displayed immediately.
Generate a PDF report to document compliance details.
Backend Workflow
API Endpoint:
POST /api/calculate-route receives shipment data, validates inputs, retrieves location coordinates from the SQLite database, and calculates optimal routes using a simplified algorithm.
Route Calculation:
Distance Calculation: Uses the Haversine formula for air segments.
Cost & Time Estimation: Retrieves parameters from the RouteCosts table to calculate segment costs and transit times.
Route Ranking: Sorts routes (e.g., by cost) and returns structured JSON with route details and segment coordinates for map visualization.
Compliance Validation (via /api/validate_parcel in validation.js):
Validates required fields, checks restricted items and dangerous goods using data from the countries, restricted_items, and dangerous_goods tables.
Returns a compliance status along with detailed error messages.
Database Interaction:
SQLite is used to store and retrieve data such as location details, cost parameters, and compliance rules.
Additional Features & Future Enhancements
Admin Panel:
Update compliance rules dynamically through a secure admin interface.
Dashboard:
Visualize real-time compliance statistics and common validation errors using interactive charts.
Enhanced Routing:
Integrate live APIs (e.g., OpenStreetMap Nominatim) for dynamic location data and more complex routing algorithms.
Detailed Compliance Reporting:
Expand PDF report generation with detailed shipment and compliance information.
Improved Data Validation:
Extend form fields (e.g., shipping terms, purpose of shipment) and enforce more granular validation rules.
Top-Down Approach Plan: Cross-Border Route Selector Demo Prototype
I. Project Goal
Develop a functional demo prototype of a "Cross-Border Route Selector" feature.
Demonstrate multi-modal route optimization (Sea, Air, Land, Sea-Air combinations).
Showcase optimal route suggestions based on cost and transit time.
Integrate map visualization of routes.
II. Key Feature Breakdown
Shipment Input Form (Frontend):
Collect shipment details like origin, destination, cargo, weight, and criteria.

Route Calculation (Backend):
Generate and evaluate predefined routes for Mumbai-London and Mumbai-Singapore scenarios.

Optimal Route Suggestions (Frontend & Backend):
Rank and present top route options based on cost and transit time.

Route Details Display (Frontend):
Show mode sequence, estimated cost, and transit time for each route.

Map Visualization (Frontend):
Display routes on an interactive map using react-leaflet.

III. Component-Based Breakdown
Backend (Node.js & SQLite):

Database Setup:
Define and populate tables for Locations, TransportModes, RouteCosts, and FeasibilityRules.

API Endpoint:
Create /api/calculate-route to handle shipment data and perform route calculations.

Route Calculation Logic:
Implement functions to calculate distances, costs, transit times, and rank routes.

Frontend (React & Tailwind CSS):

Components:
Create RouteInputForm, RouteOutputDisplay, and RouteMap components.

Page Integration:
Build a /route-optimizer page to host the input form, route suggestions, and map visualization.

API Integration:
Handle form submission, call the backend API, and update UI based on the response.

IV. Building Process
Backend Setup:
Initialize the Node.js/Express project, set up the SQLite database, and create the API endpoint.

Frontend Component Structure:
Build React components for the input form, output display, and map.

Backend Route Calculation Logic:
Implement functions to calculate distances, costs, and transit times.

Frontend-Backend Integration:
Connect the input form to the backend API and update the UI dynamically.

Testing and Refinement:
Test all scenarios and refine both the UI and backend logic.
