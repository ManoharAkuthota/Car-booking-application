import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Layers, Crosshair, Navigation, Compass } from 'lucide-react';

// Custom SVG icons for Pickup, Dropoff, User Live Location, and Vehicles
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
  <div class="flex items-center justify-center w-8 h-8 bg-emerald-600 rounded-full shadow-lg shadow-emerald-600/40 border-2 border-white ring-4 ring-emerald-500/20">
    <div class="w-2.5 h-2.5 rounded-full bg-white"></div>
  </div>
`);

const dropoffIcon = createIcon(`
  <div class="flex items-center justify-center w-8 h-8 bg-rose-600 rounded-full shadow-lg shadow-rose-600/40 border-2 border-white ring-4 ring-rose-500/20">
    <div class="w-2.5 h-2.5 bg-white rounded-sm"></div>
  </div>
`);

// Live User GPS Location Radar Dot (Uber/Rapido style blue pulsing dot)
const userLocationIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center w-10 h-10">
      <div class="absolute w-10 h-10 rounded-full bg-blue-500/30 animate-ping"></div>
      <div class="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg ring-4 ring-blue-500/40"></div>
    </div>
  `,
  className: 'user-live-radar-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// Nearby patrol moving vehicle icons
const getNearbyIcon = (type = 'BIKE') => {
  let emoji = '🏍️';
  let bg = 'bg-amber-400';
  if (type === 'AUTO') { emoji = '🛺'; bg = 'bg-amber-500'; }
  if (type === 'CAB') { emoji = '🚗'; bg = 'bg-gray-900'; }

  return L.divIcon({
    html: `
      <div class="w-7 h-7 rounded-full ${bg} flex items-center justify-center shadow-md border border-white text-xs transform transition-all duration-1000 ease-linear">
        ${emoji}
      </div>
    `,
    className: 'nearby-fleet-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const getVehicleMarkerIcon = (category = 'SEDAN') => {
  let emoji = '🚗';
  let color = 'bg-gray-900';
  let ring = 'ring-gray-900/20';

  if (category === 'BIKE') {
    emoji = '🏍️';
    color = 'bg-amber-500';
    ring = 'ring-amber-500/30';
  } else if (category === 'AUTO') {
    emoji = '🛺';
    color = 'bg-amber-600';
    ring = 'ring-amber-600/30';
  } else if (category === 'TROLLEY_PORTER') {
    emoji = '🛻';
    color = 'bg-purple-600';
    ring = 'ring-purple-600/30';
  }

  return L.divIcon({
    html: `
      <div class="flex items-center justify-center w-10 h-10 ${color} rounded-full shadow-xl border-2 border-white ring-4 ${ring} text-lg animate-bounce">
        ${emoji}
      </div>
    `,
    className: 'custom-vehicle-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// Map click handler component to place pins dynamically
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
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

// Map Tile Providers (Google Maps Roadmap and Satellite)
const MAP_LAYERS = {
  google_roadmap: {
    id: 'google_roadmap',
    name: 'Google Map',
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
};

const MapView = ({
  pickup = [12.9716, 77.5946],
  dropoff = [13.0358, 77.5970],
  carPosition = null,
  category = 'SEDAN',
  isLiveTrip = false,
  className = "h-[340px]",
  onLocateMe = null,
  onMapClick = null,
  pickupAddress = "Pickup Point",
  dropoffAddress = "Destination Drop-off",
}) => {
  const [selectedLayer, setSelectedLayer] = useState('google_roadmap');
  const [recenterCount, setRecenterCount] = useState(0);

  // Simulated live nearby moving fleet (bikes, autos, cabs) crawling around pickup point
  const [nearbyVehicles, setNearbyVehicles] = useState(() => [
    { id: 1, type: 'BIKE', offsetLat: 0.0035, offsetLng: 0.0020 },
    { id: 2, type: 'BIKE', offsetLat: -0.0028, offsetLng: 0.0035 },
    { id: 3, type: 'AUTO', offsetLat: 0.0018, offsetLng: -0.0032 },
    { id: 4, type: 'AUTO', offsetLat: -0.0031, offsetLng: -0.0021 },
    { id: 5, type: 'CAB', offsetLat: 0.0042, offsetLng: -0.0015 },
    { id: 6, type: 'CAB', offsetLat: -0.0015, offsetLng: 0.0048 },
  ]);

  // Animate nearby vehicles every 2.5 seconds to simulate traffic patrol
  useEffect(() => {
    const interval = setInterval(() => {
      setNearbyVehicles((prev) =>
        prev.map((v) => ({
          ...v,
          offsetLat: v.offsetLat + (Math.random() - 0.5) * 0.0006,
          offsetLng: v.offsetLng + (Math.random() - 0.5) * 0.0006,
        }))
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Generate realistic route interpolation between points
  const points = [];
  if (pickup && dropoff) {
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const lat = pickup[0] + (dropoff[0] - pickup[0]) * t + Math.sin(t * Math.PI) * 0.008;
      const lng = pickup[1] + (dropoff[1] - pickup[1]) * t;
      points.push([lat, lng]);
    }
  }

  const currentTileConfig = MAP_LAYERS[selectedLayer] || MAP_LAYERS.google_roadmap;

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-gray-200 shadow-md ${className}`}>
      <MapContainer
        center={pickup || [12.9716, 77.5946]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full z-0 cursor-crosshair"
      >
        <TileLayer
          key={currentTileConfig.id}
          url={currentTileConfig.url}
          subdomains={currentTileConfig.subdomains}
          attribution={currentTileConfig.attribution}
          maxZoom={currentTileConfig.maxZoom}
        />

        <MapClickHandler onMapClick={onMapClick} />
        <AutoFitBounds pickup={pickup} dropoff={dropoff} triggerRecenter={recenterCount} />

        {/* Pickup Pin */}
        {pickup && (
          <Marker position={pickup} icon={pickupIcon}>
            <Popup className="text-gray-900 font-bold text-xs">
              <strong>📍 {pickupAddress}</strong>
              <p className="text-[10px] text-gray-500 font-normal">Click elsewhere on map to reposition</p>
            </Popup>
          </Marker>
        )}

        {/* Dropoff Pin */}
        {dropoff && (
          <Marker position={dropoff} icon={dropoffIcon}>
            <Popup className="text-gray-900 font-bold text-xs">
              <strong>🏁 {dropoffAddress}</strong>
            </Popup>
          </Marker>
        )}

        {/* Nearby Moving Patrol Vehicles */}
        {!isLiveTrip && pickup && nearbyVehicles.map((v) => (
          <Marker
            key={v.id}
            position={[pickup[0] + v.offsetLat, pickup[1] + v.offsetLng]}
            icon={getNearbyIcon(v.type)}
          >
            <Popup className="text-gray-900 font-bold text-[11px]">
              Nearby {v.type === 'BIKE' ? 'Rapido Bike' : v.type === 'AUTO' ? 'Auto Rickshaw' : 'Cab'} • 2 min away
            </Popup>
          </Marker>
        ))}

        {/* Active En-Route Driver Marker */}
        {carPosition && (
          <Marker position={carPosition} icon={getVehicleMarkerIcon(category)}>
            <Popup className="text-gray-900 font-semibold text-xs">
              <strong>Pilot En Route</strong>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline (High-visibility Google Blue) */}
        {points.length > 0 && (
          <>
            <Polyline
              positions={points}
              color="#1e293b"
              weight={7}
              opacity={0.3}
            />
            <Polyline
              positions={points}
              color="#2563eb"
              weight={4.5}
              opacity={0.95}
              dashArray={isLiveTrip ? "8, 10" : null}
            />
          </>
        )}
      </MapContainer>

      {/* Top Floating White Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center space-x-2">
        {/* Layer Switcher */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl border border-gray-200 p-1 flex items-center space-x-1 shadow-md text-[11px] font-bold text-gray-700">
          <button
            type="button"
            onClick={() => setSelectedLayer('google_roadmap')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              selectedLayer === 'google_roadmap'
                ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                : 'hover:text-gray-950 hover:bg-gray-100'
            }`}
            title="Google Maps Standard Roadmap"
          >
            Map
          </button>
          <button
            type="button"
            onClick={() => setSelectedLayer('google_satellite')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              selectedLayer === 'google_satellite'
                ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                : 'hover:text-gray-950 hover:bg-gray-100'
            }`}
            title="Google Maps Satellite Hybrid"
          >
            Satellite
          </button>
        </div>

        {/* Locate Me / GPS Button */}
        <button
          type="button"
          onClick={() => {
            if (onLocateMe) onLocateMe();
            setRecenterCount((c) => c + 1);
          }}
          className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 flex items-center justify-center text-emerald-600 hover:text-emerald-700 shadow-md active:scale-90 transition-all"
          title="Detect live GPS location & re-center"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Floating GPS HUD Pill */}
      <div className="absolute bottom-3 left-3 z-[1000] px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-mono text-gray-700 flex items-center space-x-2 border border-gray-200 shadow-md pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">Google Maps Live GPS • Moving Fleet</span>
      </div>
    </div>
  );
};

export default MapView;
