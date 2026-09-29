import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Layers, Crosshair, Navigation, Compass } from 'lucide-react';

// Custom SVG icons for Pickup, Dropoff, and Vehicles
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

// Nearby vehicle icon generator matching selected vehicle category
const getNearbyIcon = (type = 'BIKE') => {
  let emoji = '🏍️';
  let bg = 'bg-amber-400 text-amber-950 border-amber-300 ring-amber-400/40';
  if (type === 'AUTO') {
    emoji = '🛺';
    bg = 'bg-emerald-500 text-white border-emerald-300 ring-emerald-500/40';
  } else if (type === 'CAB') {
    emoji = '🚗';
    bg = 'bg-blue-600 text-white border-blue-400 ring-blue-500/40';
  } else if (type === 'TROLLEY_PORTER') {
    emoji = '🛻';
    bg = 'bg-purple-600 text-white border-purple-300 ring-purple-500/40';
  }

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <div class="w-8 h-8 rounded-full ${bg} flex items-center justify-center shadow-lg border-2 ring-2 text-sm transform transition-all duration-1000 ease-linear">
          ${emoji}
        </div>
      </div>
    `,
    className: 'nearby-fleet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
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

// Generate realistic nearby drivers around the pickup location
const generateNearbyDrivers = (centerCoord, type) => {
  if (!centerCoord || !centerCoord[0]) return [];
  const baseOffsets = [
    { dLat: 0.0024, dLng: 0.0018, speedLat: 0.0001, speedLng: -0.00008, eta: 2 },
    { dLat: -0.0019, dLng: 0.0026, speedLat: -0.00008, speedLng: 0.00012, eta: 3 },
    { dLat: 0.0016, dLng: -0.0029, speedLat: 0.00012, speedLng: 0.00006, eta: 2 },
    { dLat: -0.0028, dLng: -0.0016, speedLat: -0.00006, speedLng: -0.0001, eta: 4 },
    { dLat: 0.0036, dLng: -0.0008, speedLat: 0.00005, speedLng: 0.00011, eta: 3 },
    { dLat: -0.0011, dLng: 0.0035, speedLat: -0.00011, speedLng: -0.00005, eta: 4 },
  ];

  return baseOffsets.map((o, idx) => ({
    id: `${type}-${idx}`,
    type: type,
    offsetLat: o.dLat,
    offsetLng: o.dLng,
    speedLat: o.speedLat,
    speedLng: o.speedLng,
    eta: o.eta,
  }));
};

const MapView = ({
  pickup = [12.9716, 77.5946],
  dropoff = [13.0358, 77.5970],
  carPosition = null,
  category = 'BIKE',
  isLiveTrip = false,
  className = "h-[340px]",
  onLocateMe = null,
  onMapClick = null,
  pickupAddress = "Pickup Point",
  dropoffAddress = "Destination Drop-off",
}) => {
  const [selectedLayer, setSelectedLayer] = useState('google_roadmap');
  const [recenterCount, setRecenterCount] = useState(0);

  // Normalize category to vehicle type
  const vehicleType = useMemo(() => {
    if (category === 'BIKE') return 'BIKE';
    if (category === 'AUTO') return 'AUTO';
    if (category === 'TROLLEY_PORTER') return 'TROLLEY_PORTER';
    return 'CAB';
  }, [category]);

  const vehicleLabel = useMemo(() => {
    if (vehicleType === 'BIKE') return 'Bike';
    if (vehicleType === 'AUTO') return 'Auto';
    if (vehicleType === 'TROLLEY_PORTER') return 'Porter';
    return 'Cab';
  }, [vehicleType]);

  const vehicleEmoji = useMemo(() => {
    if (vehicleType === 'BIKE') return '🏍️';
    if (vehicleType === 'AUTO') return '🛺';
    if (vehicleType === 'TROLLEY_PORTER') return '🛻';
    return '🚗';
  }, [vehicleType]);

  // Nearby vehicles exclusively matching selected vehicle type around pickup point
  const [nearbyVehicles, setNearbyVehicles] = useState(() =>
    generateNearbyDrivers(pickup, vehicleType)
  );

  // Re-generate nearby drivers whenever pickup point or vehicle category changes
  useEffect(() => {
    if (pickup && pickup[0]) {
      setNearbyVehicles(generateNearbyDrivers(pickup, vehicleType));
    }
  }, [pickup?.[0], pickup?.[1], vehicleType]);

  // Animate nearby vehicles every 2 seconds to simulate active city drivers
  useEffect(() => {
    const interval = setInterval(() => {
      setNearbyVehicles((prev) =>
        prev.map((v) => {
          let newOffsetLat = v.offsetLat + v.speedLat + (Math.random() - 0.5) * 0.0002;
          let newOffsetLng = v.offsetLng + v.speedLng + (Math.random() - 0.5) * 0.0002;

          // Boundary bounce within ~600m
          if (Math.abs(newOffsetLat) > 0.005) v.speedLat = -v.speedLat;
          if (Math.abs(newOffsetLng) > 0.005) v.speedLng = -v.speedLng;

          return {
            ...v,
            offsetLat: newOffsetLat,
            offsetLng: newOffsetLng,
          };
        })
      );
    }, 2000);

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
        zoom={14}
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
              <strong>📍 Pickup: {pickupAddress}</strong>
              <p className="text-[10px] text-gray-500 font-normal">Drivers will meet you here</p>
            </Popup>
          </Marker>
        )}

        {/* Dropoff Pin */}
        {dropoff && (
          <Marker position={dropoff} icon={dropoffIcon}>
            <Popup className="text-gray-900 font-bold text-xs">
              <strong>🏁 Destination: {dropoffAddress}</strong>
            </Popup>
          </Marker>
        )}

        {/* ONLY Nearby Drivers of the Selected Vehicle Category around Pickup Point */}
        {!isLiveTrip && pickup && nearbyVehicles.map((v) => (
          <Marker
            key={v.id}
            position={[pickup[0] + v.offsetLat, pickup[1] + v.offsetLng]}
            icon={getNearbyIcon(v.type)}
          >
            <Popup className="text-gray-900 font-bold text-[11px]">
              <div className="space-y-0.5">
                <p className="font-extrabold text-xs text-gray-950 flex items-center space-x-1">
                  <span>{vehicleEmoji} Nearby {vehicleLabel} Pilot</span>
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold">⚡ ~{v.eta} mins to pickup</p>
                <p className="text-[10px] text-gray-500 font-normal">⭐ 4.9 Verified Pilot • Ready to ride</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Active En-Route Driver Marker (if trip ongoing) */}
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
              opacity={0.25}
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

      {/* Floating Status Pill: Shows nearby pilots of the currently selected service */}
      {!isLiveTrip && (
        <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200 shadow-md flex items-center space-x-2 text-xs font-extrabold text-gray-950 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{vehicleEmoji} {nearbyVehicles.length} {vehicleLabel}s near pickup</span>
          <span className="text-emerald-700 font-semibold text-[11px]">• ~2-3 mins away</span>
        </div>
      )}

      {/* Floating GPS HUD Pill */}
      <div className="absolute bottom-3 left-3 z-[1000] px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-mono text-gray-700 flex items-center space-x-2 border border-gray-200 shadow-md pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">Live GPS Telemetry</span>
      </div>
    </div>
  );
};

export default MapView;
