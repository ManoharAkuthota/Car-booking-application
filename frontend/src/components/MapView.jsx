import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom modern SVG icons for Pickup, Dropoff, and Animated Car
const createIcon = (svgString, className) => {
  return L.divIcon({
    html: svgString,
    className: className || 'custom-map-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const pickupIcon = createIcon(`
  <div class="flex items-center justify-center w-9 h-9 bg-brand-500 rounded-full shadow-lg shadow-brand-500/50 border-2 border-white ring-4 ring-brand-500/30">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  </div>
`);

const dropoffIcon = createIcon(`
  <div class="flex items-center justify-center w-9 h-9 bg-rose-500 rounded-full shadow-lg shadow-rose-500/50 border-2 border-white ring-4 ring-rose-500/30">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
      <line x1="4" y1="22" x2="4" y2="15"></line>
    </svg>
  </div>
`);

const carMarkerIcon = createIcon(`
  <div class="flex items-center justify-center w-10 h-10 bg-slate-900 rounded-full shadow-xl shadow-cyan-500/50 border-2 border-accent-cyan ring-4 ring-accent-cyan/30 animate-pulse">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 3c-.1.2-.1.5-.1.8V16c0 .6.4 1 1 1h2"></path>
      <circle cx="7" cy="17" r="2"></circle>
      <circle cx="17" cy="17" r="2"></circle>
    </svg>
  </div>
`);

// Auto-center and fit bounds component
const AutoFitBounds = ({ pickup, dropoff }) => {
  const map = useMap();

  useEffect(() => {
    if (pickup && dropoff) {
      const bounds = L.latLngBounds([pickup, dropoff]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (pickup) {
      map.setView(pickup, 13);
    }
  }, [map, pickup, dropoff]);

  return null;
};

const MapView = ({
  pickup = [12.9716, 77.5946], // Default Bengaluru coordinates
  dropoff = [13.0358, 77.5970],
  carPosition = null,
  isLiveTrip = false,
  className = "h-[340px]",
}) => {
  // Generate curved path interpolation between points
  const points = [];
  if (pickup && dropoff) {
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const lat = pickup[0] + (dropoff[0] - pickup[0]) * t + Math.sin(t * Math.PI) * 0.01;
      const lng = pickup[1] + (dropoff[1] - pickup[1]) * t;
      points.push([lat, lng]);
    }
  }

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-xl ${className}`}>
      <MapContainer
        center={pickup || [12.9716, 77.5946]}
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        {/* OpenStreetMap CartoDB Dark Matter / OSM standard tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <AutoFitBounds pickup={pickup} dropoff={dropoff} />

        {/* Pickup Pin */}
        {pickup && (
          <Marker position={pickup} icon={pickupIcon}>
            <Popup className="text-slate-900 font-semibold">
              Pickup Point
            </Popup>
          </Marker>
        )}

        {/* Dropoff Pin */}
        {dropoff && (
          <Marker position={dropoff} icon={dropoffIcon}>
            <Popup className="text-slate-900 font-semibold">
              Destination Drop-off
            </Popup>
          </Marker>
        )}

        {/* Active Car Marker */}
        {carPosition && (
          <Marker position={carPosition} icon={carMarkerIcon}>
            <Popup className="text-slate-900 font-semibold">
              Driver En Route
            </Popup>
          </Marker>
        )}

        {/* Polyline Route */}
        {points.length > 0 && (
          <Polyline
            positions={points}
            color="#22c55e"
            weight={5}
            opacity={0.8}
            dashArray={isLiveTrip ? "10, 10" : null}
          />
        )}
      </MapContainer>

      {/* Floating GPS HUD Pill */}
      <div className="absolute top-3 right-3 z-[1000] px-3 py-1 rounded-full glass-panel text-xs font-mono text-slate-300 flex items-center space-x-2 border border-slate-700/60 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
        <span>GPS LIVE TELEMETRY</span>
      </div>
    </div>
  );
};

export default MapView;
