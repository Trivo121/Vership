import React from 'react';
import { Plane, DollarSign, Clock, MapPin, LoaderIcon, AlertTriangle } from 'lucide-react';

const RouteOutputDisplay = ({ routes, loading, error }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <LoaderIcon className="animate-spin mr-2" />
        <span>Calculating optimal routes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg flex items-center">
        <AlertTriangle className="mr-2 text-red-500" />
        <span className="text-red-700">{error}</span>
      </div>
    );
  }

  if (!routes || routes.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg">
        <p className="text-gray-600 text-lg">
          Enter origin and destination to see route suggestions.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <Plane className="mr-3 text-blue-600" />
        Route Suggestions
      </h2>
      {routes.map((route) => (
        <div 
          key={route.id} 
          className="bg-white shadow-md rounded-lg p-6 mb-4 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">{route.title}</h3>
            <div className="flex space-x-2">
              {route.modes.map((mode, index) => (
                <div key={index} className="flex items-center">
                  {mode === 'Air' && <Plane className="w-6 h-6 text-blue-500" />}
                  {mode === 'Sea' && <DollarSign className="w-6 h-6 text-teal-500" />}
                  {mode === 'Land' && <Clock className="w-6 h-6 text-green-500" />}
                  {index < route.modes.length - 1 && <span className="mx-2 text-gray-400">→</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex items-center justify-center">
              <DollarSign className="mr-2 text-green-600" />
              <span className="font-medium text-gray-700">${route.estimatedCost}</span>
            </div>
            <div className="flex items-center justify-center">
              <Clock className="mr-2 text-blue-600" />
              <span className="font-medium text-gray-700">{route.estimatedTransitTime} days</span>
            </div>
            <div className="flex items-center justify-center">
              <MapPin className="mr-2 text-red-600" />
              <div>
                <span className="font-medium text-gray-700">
                  {route.segments && route.segments.length > 0
                    ? `${route.segments[0].start_location} → ${route.segments[route.segments.length - 1].end_location}`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500 flex justify-between">
            <span>Carbon Footprint: {route.carbonFootprint} tons CO2</span>
            <span>Reliability: {(route.reliabilityScore * 100).toFixed(0)}%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RouteOutputDisplay;
