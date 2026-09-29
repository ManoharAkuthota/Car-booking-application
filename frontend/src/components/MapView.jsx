import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Layers, Crosshair, Navigation, Compass } from 'lucide-react';

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
  <div class="flex items-center justify-center w-9 h-9 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50 border-2 border-white ring-4 ring-emerald-500/30">
    <div class="w-3 h-3 rounded-full bg-white"></div>
  </div>
`);

const dropoffIcon = createIcon(`
  <div class="flex items-center justify-center w-9 h-9 bg-rose-500 rounded-full shadow-lg shadow-rose-500/50 border-2 border-white ring-4 ring-rose-500/30">
    <div class="w-3 h-3 bg-white rounded-sm"></div>
  </div>
`);

const getVehicleMarkerIcon = (category = 'SEDAN') => {
  let emoji = '🚗';
  let color = 'bg-cyan-500';
  let ring = 'ring-cyan-500/30';
  let shadow = 'shadow-cyan-500/50';

  if (category === 'BIKE') {
    emoji = '🏍️';
    color = 'bg-emerald-500';
    ring = 'ring-emerald-500/30';
    shadow = 'shadow-emerald-500/50';
  } else if (category === 'AUTO') {
    emoji = '🛺';
    color = 'bg-amber-500';
    ring = 'ring-amber-500/30';
    shadow = 'shadow-amber-500/50';
  } else if (category === 'TROLLEY_PORTER') {
    emoji = '🛻';
    color = 'bg-purple-500';
    ring = 'ring-purple-500/30';
    shadow = 'shadow-purple-500/50';
  }

  return L.divIcon({
    html: `
      <div class="flex items-center justify-center w-10 h-10 ${color} rounded-full shadow-xl ${shadow} border-2 border-white ring-4 ${ring} text-lg animate-bounce">
        ${emoji}
      </div>
    `,
    className: 'custom-vehicle-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// Auto-center and fit bounds component
const AutoFitBounds = ({ pickup, dropoff, triggerRecenter }) => {
  const map = useMap();

  useEffect(() => {
    if (pickup && dropoff) {
      const bounds = L.latLngBounds([pickup, dropoff]);
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 15,
        animate: true,
      });
    } else if (pickup) {
      map.setView(pickup, 14, { animate: true });
    }
  }, [map, pickup, dropoff, triggerRecenter]);

  return null;
};

// Map Tile Providers (Google Maps Roadmap, Satellite Hybrid, and Dark Night)
const MAP_LAYERS = {
  google_roadmap: {
    id: 'google_roadmap',
    name: 'Google Maps',
    url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; Google Maps',
    maxZoom: 20,
  },
  google_satellite: {
    id: 'google_satellite',
    name: 'Satellite',
    url: 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; Google Maps Satellite',
    maxZoom: 20,
  },
  dark_matter: {
    id: 'dark_matter',
    name: 'Night Navigation',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    subdomains: ['a', 'b', 'c', 'd'],
    attribution: '&copy; CartoDB & OpenStreetMap',
    maxZoom: 19,
  }
};

const MapView = ({
  pickup = [12.9716, 77.5946], // Default Bengaluru coordinates
  dropoff = [13.0358, 77.5970],
  carPosition = null,
  category = 'SEDAN',
  isLiveTrip = false,
  className = "h-[340px]",
}) => {
  const [selectedLayer, setSelectedLayer] = useState('google_roadmap');
  const [recenterCount, setRecenterCount] = useState(0);

  // Generate realistic route interpolation between points
  const points = [];
  if (pickup && dropoff) {
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Slight smooth curvature to simulate real city road route
      const lat = pickup[0] + (dropoff[0] - pickup[0]) * t + Math.sin(t * Math.PI) * 0.008;
      const lng = pickup[1] + (dropoff[1] - pickup[1]) * t;
      points.push([lat, lng]);
    }
  }

  const currentTileConfig = MAP_LAYERS[selectedLayer] || MAP_LAYERS.google_roadmap;

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-xl ${className}`}>
      <MapContainer
        center={pickup || [12.9716, 77.5946]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <TileLayer
          key={currentTileConfig.id}
          url={currentTileConfig.url}
          subdomains={currentTileConfig.subdomains}
          attribution={currentTileConfig.attribution}
          maxZoom={currentTileConfig.maxZoom}
        />

        <AutoFitBounds pickup={pickup} dropoff={dropoff} triggerRecenter={recenterCount} />

        {/* Pickup Pin */}
        {pickup && (
          <Marker position={pickup} icon={pickupIcon}>
            <Popup className="text-slate-900 font-semibold text-xs">
              <strong>Pickup Point</strong>
            </Popup>
          </Marker>
        )}

        {/* Dropoff Pin */}
        {dropoff && (
          <Marker position={dropoff} icon={dropoffIcon}>
            <Popup className="text-slate-900 font-semibold text-xs">
              <strong>Destination Drop-off</strong>
            </Popup>
          </Marker>
        )}

        {/* Active Vehicle Marker */}
        {carPosition && (
          <Marker position={carPosition} icon={getVehicleMarkerIcon(category)}>
            <Popup className="text-slate-900 font-semibold text-xs">
              <strong>Pilot On The Way</strong>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline (High-visibility Google blue / Neon Emerald) */}
        {points.length > 0 && (
          <>
            {/* Outline shadow layer */}
            <Polyline
              positions={points}
              color="#0f172a"
              weight={8}
              opacity={0.4}
            />
            {/* Main vibrant path */}
            <Polyline
              positions={points}
              color="#3b82f6"
              weight={5}
              opacity={0.95}
              dashArray={isLiveTrip ? "8, 10" : null}
            />
          </>
        )}
      </MapContainer>

      {/* Top Floating Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center space-x-2">
        {/* Layer Switcher Dropdown / Pills */}
        <div className="bg-slate-950/85 backdrop-blur-md rounded-xl border border-slate-700/60 p-1 flex items-center space-x-1 shadow-lg text-[11px] font-semibold text-slate-300">
          <button
            type="button"
            onClick={() => setSelectedLayer('google_roadmap')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              selectedLayer === 'google_roadmap'
                ? 'bg-brand-500 text-slate-950 font-bold shadow'
                : 'hover:text-white'
            }`}
            title="Google Maps Standard Roadmap"
          >
            Google Map
          </button>
          <button
            type="button"
            onClick={() => setSelectedLayer('google_satellite')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              selectedLayer === 'google_satellite'
                ? 'bg-brand-500 text-slate-950 font-bold shadow'
                : 'hover:text-white'
            }`}
            title="Google Maps Satellite Hybrid"
          >
            Satellite
          </button>
        </div>

        {/* Re-center Button */}
        <button
          type="button"
          onClick={() => setRecenterCount((c) => c + 1)}
          className="w-8 h-8 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white shadow-lg active:scale-95 transition-all"
          title="Re-center route on map"
        >
          <Crosshair className="w-4 h-4 text-brand-400" />
        </button>
      </div>

      {/* Floating GPS HUD Pill */}
      <div className="absolute bottom-3 left-3 z-[1000] px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-[11px] font-mono text-slate-300 flex items-center space-x-2 border border-slate-700/60 shadow-lg pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Google Maps Live GPS</span>
      </div>
    </div>
  );
};

export default MapView;
