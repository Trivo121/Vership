# Vership Demo: Global Trade Compliance & Cross-Border Route Selector

## Overview

**Vership** is a demo prototype that streamlines global trade compliance and optimizes cross-border shipping routes. The application features two primary modules:

- **Compliance Checker:** Validates shipment details against country-specific regulations.
- **Cross-Border Route Selector:** Calculates and displays optimal multi-modal shipping routes (Air, Sea, Land, and combinations) based on cost and transit time.

## Key Features

- **User-Friendly Input Forms:**  
  - **Shipment Input:** Collects essential shipment details (origin, destination, weight, shipping priority, etc.).  
  - **Priority Selection:** Allows users to choose between Economy (Lowest Cost), Standard (Balanced), and Express (Fastest Time).

- **Multi-Modal Route Calculation:**  
  - Predefined routes for key scenarios (e.g., Mumbai–London, Mumbai–Singapore) using a simplified algorithm.
  - Uses the Haversine formula for air segment distance calculations and mock distances for sea/land segments.
  - Computes route costs and transit times using parameters from a SQLite database.

- **Dynamic Route Suggestions & Map Visualization:**  
  - Displays ranked route suggestions (based on cost or time) in a card-based layout.
  - An interactive map (using `react-leaflet`) visualizes the route segments with color-coded polylines.

- **Compliance Validation & Reporting:**  
  - Real-time validation of shipment details against compliance rules stored in SQLite.
  - Generates detailed error messages for restricted items and dangerous goods.
  - Option to generate a PDF report of compliance results.

## Workflow

### Frontend

1. **Initial State:**  
   - The Route Optimizer page loads with an empty route suggestions state.
   - The map is initialized (centered over a relevant region) with no route polylines.
   - The route table displays a prompt message (e.g., “Enter origin and destination to see route suggestions”).

2. **User Interaction:**  
   - The user fills out the shipment input form with details like origin, destination, weight, and priority.
   - On form submission, the frontend maps the input into location codes and sends a POST request to `/api/calculate-route`.

3. **Dynamic Update:**  
   - Once the backend responds with route data, the frontend updates:
     - The **Route Map** renders the calculated route segments as polylines.
     - The **Route Table** displays the ranked route suggestions (with cost, time, and mode details).

### Backend

1. **API Request Handling:**  
   - The `/api/calculate-route` endpoint receives shipment data and validates required fields.
   - Location details (including coordinates) are retrieved from the SQLite `Locations` table.

2. **Route Calculation:**  
   - Predefined routes (e.g., Air-Only, Sea-Air, Sea-Only) are evaluated:
     - **Distance Calculation:** Uses the Haversine formula for air segments; mock values for sea/land segments.
     - **Cost & Time Estimation:** Retrieves cost and time parameters from the `RouteCosts` table.
     - **Route Ranking:** Routes are sorted (e.g., by cost) based on calculated totals.
   - The backend sends a structured JSON response containing route suggestions and segment details.

3. **Compliance Validation (for the Compliance Checker):**  
   - Validates shipment data (including restricted items and dangerous goods) against rules stored in the SQLite database.
   - Returns a compliance status with error messages if any issues are detected.

## Tech Stack

- **Frontend:**  
  - **Framework:** React.js  
  - **Styling:** Tailwind CSS  
  - **Routing & Maps:** React Router, react-leaflet (OpenStreetMap)

- **Backend:**  
  - **Runtime:** Node.js  
  - **Framework:** Express.js  
  - **Database:** SQLite  

## Note

Some of the files previously uploaded have expired. If you need those files to be reloaded, please upload them again.

---

This README provides a concise overview of the project features, workflow, and tech stack for the Vership demo prototype.
