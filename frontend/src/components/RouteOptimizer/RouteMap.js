import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

// Default center: roughly centered between Europe and Asia
const DEFAULT_CENTER = [30, 20];
const DEFAULT_ZOOM = 3;

const RouteMap = ({ routes = [] }) => {
  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer 
        center={DEFAULT_CENTER} 
        zoom={DEFAULT_ZOOM} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {routes.length > 0 &&
          // Iterate through each route and render its segments
          routes.map((route, routeIndex) => (
            <React.Fragment key={routeIndex}>
              {route.segments && route.segments.map((segment, index) => (
                <Polyline
                  key={index}
                  positions={[
                    [segment.start_lat, segment.start_lng],
                    [segment.end_lat, segment.end_lng]
                  ]}
                  color={segment.color || 'blue'}
                  weight={5}
                  opacity={0.7}
                />
              ))}
              {/* Optionally, render markers for the first and last segments of each route */}
              {route.segments && route.segments.length > 0 && (
                <>
                  <Marker position={[route.segments[0].start_lat, route.segments[0].start_lng]}>
                    <Popup>Origin: {route.segments[0].start_location || 'N/A'}</Popup>
                  </Marker>
                  <Marker position={[
                    route.segments[route.segments.length - 1].end_lat,
                    route.segments[route.segments.length - 1].end_lng
                  ]}>
                    <Popup>Destination: {route.segments[route.segments.length - 1].end_location || 'N/A'}</Popup>
                  </Marker>
                </>
              )}
            </React.Fragment>
          ))
        }
      </MapContainer>
    </div>
  );
};

export default RouteMap;
