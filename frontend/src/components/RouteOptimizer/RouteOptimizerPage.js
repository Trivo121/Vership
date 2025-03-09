import React, { useState } from 'react';
import RouteInputForm from './RouteInputForm';
import RouteOutputDisplay from './RouteOutputDisplay';
import RouteMap from './RouteMap';

const RouteOptimizerPage = () => {
  const [routeSuggestions, setRouteSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFormSubmit = async (payload) => {
    setLoading(true);
    setError(null);
    setRouteSuggestions([]);

    try {
      const response = await fetch('/api/calculate-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }
      
      const data = await response.json();
      setRouteSuggestions(data.routes);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
        {/* Input Form Section */}
        <div className="md:col-span-1">
          <RouteInputForm onSubmit={handleFormSubmit} />
        </div>

        {/* Route Output and Map Section */}
        <div className="md:col-span-2 space-y-6">
          <RouteOutputDisplay routes={routeSuggestions} loading={loading} error={error} />
          <RouteMap routes={routeSuggestions} />
        </div>
      </div>
    </div>
  );
};

export default RouteOptimizerPage;
