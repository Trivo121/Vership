import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import ClerkPage from './components/ClerkPage';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import RouteOptimizerPage from './components/RouteOptimizer/RouteOptimizerPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/clerk" element={<ClerkPage />} />
        <Route path="/route-optimizer" element={<RouteOptimizerPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;