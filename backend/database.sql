PRAGMA foreign_keys = ON;

--------------------------------------------------
-- Drop existing tables (order matters due to FK constraints)
--------------------------------------------------
DROP TABLE IF EXISTS parcels;
DROP TABLE IF EXISTS compliance_rules;
DROP TABLE IF EXISTS country_item_restrictions;
DROP TABLE IF EXISTS item_types;
DROP TABLE IF EXISTS countries;

--------------------------------------------------
-- Drop additional tables for the Cross-Border Route Selector
--------------------------------------------------
DROP TABLE IF EXISTS FeasibilityRules;
DROP TABLE IF EXISTS RouteCosts;
DROP TABLE IF EXISTS TransportModes;
DROP TABLE IF EXISTS Locations;

--------------------------------------------------
-- 1. countries Table
-- Defines country-specific compliance parameters
--------------------------------------------------
CREATE TABLE countries (
  country_code TEXT PRIMARY KEY,         -- 2-letter code (e.g., 'US')
  country_name TEXT NOT NULL,            -- Full country name
  currency_code TEXT NOT NULL,           -- Currency code (e.g., 'USD')
  value_threshold REAL NOT NULL,         -- Declared value limit (e.g., 2500) for compliance checks
  hts_code_length INTEGER NOT NULL,      -- Required HTS code length (e.g., 10) for validation
  general_notes TEXT                     -- Optional general compliance notes for the country
);

INSERT INTO countries (country_code, country_name, currency_code, value_threshold, hts_code_length, general_notes)
VALUES
  ('US', 'United States', 'USD', 2500, 10, 'FDA regulations may apply to food shipments.'),
  ('CA', 'Canada', 'CAD', 3300, 10, 'Commercial Invoice required for shipments over CAD $3300.'),
  ('DE', 'Germany', 'EUR', 1000, 8, 'Strict import regulations on certain chemicals.'),
  ('AE', 'United Arab Emirates', 'AED', 10000, 8, 'Alcohol is strictly prohibited.');

--------------------------------------------------
-- 2. item_types Table
-- Defines properties of different item types, especially for dangerous goods
--------------------------------------------------
CREATE TABLE item_types (
  item_type_name TEXT PRIMARY KEY,         -- e.g., 'Electronics'
  is_dangerous_goods BOOLEAN NOT NULL,      -- 0 (false) or 1 (true)
  dangerous_goods_notes TEXT,               -- Optional details for dangerous goods
  requires_un_number_check BOOLEAN NOT NULL,  -- Flag if a UN number is required
  packaging_notes TEXT                      -- Optional packaging recommendations
);

INSERT INTO item_types (item_type_name, is_dangerous_goods, dangerous_goods_notes, requires_un_number_check, packaging_notes)
VALUES
  ('Electronics', 0, NULL, 0, 'Standard packaging recommended.'),
  ('Pharmaceuticals', 0, NULL, 0, 'Temperature-controlled packaging for some items.'),
  ('Lithium Batteries', 1, 'UN packaging and labeling mandatory. See DG regulations.', 1, 'Strictly follow IATA/ICAO regulations.'),
  ('Perfume', 1, 'Flammable liquid – limited quantities allowed.', 1, 'Leak-proof packaging required.'),
  ('Dangerous Goods', 1, 'Strict regulations apply. UN number, packaging, labeling required.', 1, 'Comply with all relevant regulations.'),
  ('Food', 0, NULL, 0, 'Ensure proper labeling for food safety.'),
  ('Alcohol', 1, 'Alcohol is regulated; check local rules.', 1, 'Requires secure packaging to prevent spillage.'),
  ('Perishables', 0, NULL, 0, 'Keep refrigerated or in temperature controlled conditions.'),
  ('Fragile Items', 0, NULL, 0, 'Handle with care; extra padding required.'),
  ('Clothing', 0, NULL, 0, 'Standard packaging recommended.'),
  ('Documents', 0, NULL, 0, 'No special packaging required.'),
  ('Heavy Machinery', 0, NULL, 0, 'Requires secure and sturdy packaging.'),
  ('Others', 0, NULL, 0, 'Review item details for specific requirements.');

--------------------------------------------------
-- 3. country_item_restrictions Table
-- **CRITICAL TABLE**: Defines specific import restrictions for item types in certain countries.
--------------------------------------------------
CREATE TABLE country_item_restrictions (
  restriction_id INTEGER PRIMARY KEY AUTOINCREMENT,
  country_code TEXT NOT NULL,       -- FK to countries(country_code)
  item_type_name TEXT NOT NULL,     -- FK to item_types(item_type_name)
  restriction_description TEXT NOT NULL, -- Description of the restriction
  un_number_mandatory BOOLEAN NOT NULL, -- Flag if UN number is mandatory
  additional_packaging_notes TEXT,      -- Extra packaging notes
  FOREIGN KEY (country_code) REFERENCES countries(country_code),
  FOREIGN KEY (item_type_name) REFERENCES item_types(item_type_name)
);

INSERT INTO country_item_restrictions (country_code, item_type_name, restriction_description, un_number_mandatory, additional_packaging_notes)
VALUES
  ('DE', 'Perfume', 'Perfume restricted to max 50ml per shipment to Germany.', 0, 'Leak-proof inner packaging.'),
  ('AE', 'Alcohol', 'Alcohol is strictly prohibited in UAE.', 1, NULL),
  ('US', 'Food', 'FDA prior notice required for food shipments to the US.', 0, 'Ensure proper labeling for US customs.'),
  ('CA', 'Pharmaceuticals', 'Health Canada regulations apply. Import permit needed.', 0, NULL);

--------------------------------------------------
-- 4. compliance_rules Table (General Form Validation Rules)
--------------------------------------------------
CREATE TABLE compliance_rules (
  rule_id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_description TEXT NOT NULL,
  rule_type TEXT,   -- e.g., 'Mandatory Field', 'Value Check', 'Format Check'
  rule_severity TEXT DEFAULT 'Error' CHECK(rule_severity IN ('Error', 'Warning', 'Information')),
  applies_to_item_type TEXT,  -- FK to item_types(item_type_name), optional
  FOREIGN KEY (applies_to_item_type) REFERENCES item_types(item_type_name)
);

INSERT INTO compliance_rules (rule_description, rule_type, rule_severity, applies_to_item_type)
VALUES
  ('Declared Value must be a positive number.', 'Value Check', 'Error', NULL),
  ('Sender Name is required.', 'Mandatory Field', 'Error', NULL),
  ('Recipient Address is required.', 'Mandatory Field', 'Error', NULL),
  ('Product Description is required.', 'Mandatory Field', 'Error', NULL),
  ('Item Type must be selected.', 'Mandatory Field', 'Error', NULL),
  ('Quantity must be a positive number.', 'Value Check', 'Error', NULL),
  ('Weight must be a positive number.', 'Value Check', 'Error', NULL),
  ('Destination Country must be selected.', 'Mandatory Field', 'Error', NULL),
  ('HTS Code must be in correct format for destination.', 'Format Check', 'Error', NULL),
  ('UN Number is required for Dangerous Goods.', 'Conditional', 'Error', 'Dangerous Goods');

--------------------------------------------------
-- 5. parcels Table
-- Stores submitted parcel data and compliance status.
--------------------------------------------------
CREATE TABLE parcels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  item_type TEXT NOT NULL REFERENCES item_types(item_type_name), -- FK to item_types
  weight REAL NOT NULL,
  destination TEXT NOT NULL,        -- Country code (e.g., 'US')
  declared_value REAL NOT NULL,
  hts_code TEXT,
  status TEXT CHECK(status IN ('Compliant', 'Rejected')),
  compliance_notes TEXT,
  purpose_of_shipment TEXT,
  shipping_terms TEXT,
  origin_country TEXT,              -- FK to countries(country_code), optional
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (origin_country) REFERENCES countries(country_code)
);

--------------------------------------------------
-- Additional Tables for the Cross-Border Route Selector Demo Prototype
--------------------------------------------------

-- 6. Locations Table
-- Stores details for ports, airports, and other key nodes.
CREATE TABLE Locations (
  LocationID INTEGER PRIMARY KEY AUTOINCREMENT,
  Name TEXT NOT NULL,
  Type TEXT NOT NULL,       -- e.g., 'port', 'airport', 'city'
  Country TEXT NOT NULL,
  Latitude REAL NOT NULL,
  Longitude REAL NOT NULL,
  LocationCode TEXT NOT NULL UNIQUE
);

INSERT INTO Locations (Name, Type, Country, Latitude, Longitude, LocationCode) VALUES
  ('Mumbai Port (JNPT)', 'port', 'IN', 18.9750, 72.8258, 'INBOM'),
  ('Mumbai Airport (BOM)', 'airport', 'IN', 19.0902, 72.8684, 'BOM'),
  ('London Port (Tilbury)', 'port', 'GB', 51.4638, 0.3507, 'GBROY'),
  ('London Airport (Heathrow)', 'airport', 'GB', 51.4700, -0.4543, 'LHR'),
  ('Rotterdam Port', 'port', 'NL', 51.8850, 4.2697, 'NLRTM'),
  ('Rotterdam Airport', 'airport', 'NL', 51.9044, 4.4212, 'RTM'),
  ('Singapore Port', 'port', 'SG', 1.2833, 103.8500, 'SGSIN'),
  ('Singapore Airport (Changi)', 'airport', 'SG', 1.3521, 103.9830, 'SIN');

-- 7. TransportModes Table
-- Defines available transportation modes.
CREATE TABLE TransportModes (
  ModeID INTEGER PRIMARY KEY AUTOINCREMENT,
  ModeName TEXT NOT NULL UNIQUE
);

INSERT INTO TransportModes (ModeName) VALUES
  ('air'),
  ('sea'),
  ('land');

-- 8. RouteCosts Table
-- Stores cost and time parameters for each transportation mode between location types.
CREATE TABLE RouteCosts (
  RouteCostID INTEGER PRIMARY KEY AUTOINCREMENT,
  OriginLocationType TEXT NOT NULL,
  DestinationLocationType TEXT NOT NULL,
  ModeID INTEGER NOT NULL,
  CostPerUnitWeight REAL NOT NULL,      -- Cost addition per kg for the segment
  TimePerUnitDistance REAL NOT NULL,     -- Time per unit distance (e.g., hrs/km)
  FOREIGN KEY (ModeID) REFERENCES TransportModes(ModeID)
);

INSERT INTO RouteCosts (OriginLocationType, DestinationLocationType, ModeID, CostPerUnitWeight, TimePerUnitDistance) VALUES
('port', 'port', (SELECT ModeID FROM TransportModes WHERE ModeName = 'sea'), 0.5, 72.0),  -- Sea Segment: ~$0.5/kg, ~72 hours transit
('airport', 'airport', (SELECT ModeID FROM TransportModes WHERE ModeName = 'air'), 5.0, 5.0), -- Air Segment (Long Haul): ~$5.0/kg, ~5 hours transit
('airport', 'airport', (SELECT ModeID FROM TransportModes WHERE ModeName = 'air'), 2.0, 2.0), -- Air Segment (Short Haul): ~$2.0/kg, ~2 hours transit
('city', 'city', (SELECT ModeID FROM TransportModes WHERE ModeName = 'land'), 1.0, 24.0);   -- Land Segment: ~$1.0/kg, ~24 hours transit

-- 9. FeasibilityRules Table
-- Defines basic feasibility rules for route validation.
CREATE TABLE FeasibilityRules (
  RuleID INTEGER PRIMARY KEY AUTOINCREMENT,
  Description TEXT NOT NULL
);

INSERT INTO FeasibilityRules (Description) VALUES
  ('Route must have valid departure and arrival points.'),
  ('Total transit time should be within acceptable limits.'),
  ('Multi-modal transitions are allowed only at designated hubs.');
