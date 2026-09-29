import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Layers, Crosshair, Navigation, Compass, ShieldCheck } from 'lucide-react';
import { fetchRoadRoute, calculateBearing, getVehicleVisuals } from '../api/routeService';

// Custom SVG icons for Pickup, Dropoff, and Markers
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

// Live animated moving vehicle with heading rotation & motion beam
const createLiveVehicleIcon = (category = 'BIKE', heading = 0, isArrived = false) => {
  const visuals = getVehicleVisuals(category);

  if (isArrived) {
    return L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-14 h-14 rounded-full bg-emerald-500/20 animate-ping"></div>
          <div class="w-11 h-11 rounded-2xl ${visuals.bg} flex items-center justify-center shadow-2xl border-2 border-white ring-4 ring-emerald-400 text-xl font-black">
            ${visuals.emoji}
          </div>
          <div class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
        </div>
      `,
      className: 'live-arrived-marker',
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
  }

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center transition-transform duration-700 ease-linear" style="transform: rotate(${heading}deg);">
        <div class="w-11 h-11 rounded-2xl ${visuals.bg} flex items-center justify-center shadow-2xl border-2 border-white ring-4 ${visuals.ring} text-xl font-black">
          ${visuals.emoji}
        </div>
        <!-- Forward motion beam -->
        <div class="absolute -top-3 w-3 h-5 bg-gradient-to-t from-white/70 to-transparent rounded-full opacity-60 pointer-events-none"></div>
        <!-- Live pulse dot -->
        <div class="absolute -bottom-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white animate-pulse"></div>
      </div>
    `,
    className: 'live-animated-vehicle-marker',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
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
const AutoFitBounds = ({ boundsPoints, triggerRecenter }) => {
  const map = useMap();

  useEffect(() => {
    if (boundsPoints && boundsPoints.length >= 2) {
      const bounds = L.latLngBounds(boundsPoints);
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 16,
        animate: true,
      });
    } else if (boundsPoints && boundsPoints.length === 1) {
      map.setView(boundsPoints[0], 14, { animate: true });
    }
  }, [map, boundsPoints, triggerRecenter]);

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
  category = 'BIKE',
  isLiveTrip = false,
  tripStatus = null, // 'REQUESTED' | 'ACCEPTED' | 'DRIVER_ARRIVING' | 'IN_PROGRESS' | 'COMPLETED'
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

  const visuals = useMemo(() => getVehicleVisuals(vehicleType), [vehicleType]);

  // Real OSRM Road Route Points between Pickup and Dropoff
  const [tripRoadPoints, setTripRoadPoints] = useState([]);
  const [tripDistanceKm, setTripDistanceKm] = useState(0);

  // Approach Route Points (Driver -> Pickup when ACCEPTED)
  const [approachRoadPoints, setApproachRoadPoints] = useState([]);

  // Live Vehicle Animated Position & Heading
  const [liveVehiclePos, setLiveVehiclePos] = useState(null);
  const [liveHeading, setLiveHeading] = useState(0);
  const [liveEtaMins, setLiveEtaMins] = useState(3);
  const [liveRemainingKm, setLiveRemainingKm] = useState(1.2);

  // Animation step tracker
  const animIndexRef = useRef(0);

  // Fetch real road routes whenever pickup or dropoff changes
  useEffect(() => {
    let isCancelled = false;
    const loadRoutes = async () => {
      if (!pickup || !dropoff) return;

      // 1. Fetch Main Trip Route (Pickup -> Dropoff)
      const tripRes = await fetchRoadRoute(pickup, dropoff);
      if (!isCancelled) {
        setTripRoadPoints(tripRes.points);
        setTripDistanceKm(tripRes.distanceKm);
      }

      // 2. If trip is accepted, fetch Approach Route (Driver -> Pickup)
      if (isLiveTrip && (tripStatus === 'ACCEPTED' || tripStatus === 'DRIVER_ARRIVING')) {
        const driverStartPos = [pickup[0] + 0.0085, pickup[1] - 0.0075];
        const approachRes = await fetchRoadRoute(driverStartPos, pickup);
        if (!isCancelled) {
          setApproachRoadPoints(approachRes.points);
        }
      }
    };

    loadRoutes();
    return () => {
      isCancelled = true;
    };
  }, [pickup?.[0], pickup?.[1], dropoff?.[0], dropoff?.[1], isLiveTrip, tripStatus]);

  // Live Vehicle Auto-Movement Animation Engine
  useEffect(() => {
    if (!isLiveTrip) return;

    animIndexRef.current = 0;

    // Phase 1: ACCEPTED -> Moving from driver start toward Pickup
    if (tripStatus === 'ACCEPTED') {
      if (!approachRoadPoints || approachRoadPoints.length === 0) return;

      const total = approachRoadPoints.length;
      setLiveVehiclePos(approachRoadPoints[0]);

      const interval = setInterval(() => {
        animIndexRef.current = (animIndexRef.current + 1) % total;
        const curIdx = animIndexRef.current;
        const currentCoord = approachRoadPoints[curIdx];
        const nextCoord = approachRoadPoints[Math.min(curIdx + 1, total - 1)];

        const heading = calculateBearing(
          currentCoord[0], currentCoord[1],
          nextCoord[0], nextCoord[1]
        );

        const remainingFraction = (total - curIdx) / total;
        const remKm = Math.round(1.5 * remainingFraction * 10) / 10;
        const eta = Math.max(1, Math.round(remKm * 2.2));

        setLiveVehiclePos(currentCoord);
        setLiveHeading(heading);
        setLiveRemainingKm(remKm);
        setLiveEtaMins(eta);
      }, 1200);

      return () => clearInterval(interval);
    }

    // Phase 2: DRIVER_ARRIVING -> Arrived at Pickup
    if (tripStatus === 'DRIVER_ARRIVING') {
      setLiveVehiclePos(pickup);
      setLiveHeading(0);
      setLiveRemainingKm(0);
      setLiveEtaMins(0);
      return;
    }

    // Phase 3: IN_PROGRESS -> Moving from Pickup to Dropoff
    if (tripStatus === 'IN_PROGRESS') {
      if (!tripRoadPoints || tripRoadPoints.length === 0) return;

      const total = tripRoadPoints.length;
      setLiveVehiclePos(tripRoadPoints[0]);

      const interval = setInterval(() => {
        animIndexRef.current = (animIndexRef.current + 1) % total;
        const curIdx = animIndexRef.current;
        const currentCoord = tripRoadPoints[curIdx];
        const nextCoord = tripRoadPoints[Math.min(curIdx + 1, total - 1)];

        const heading = calculateBearing(
          currentCoord[0], currentCoord[1],
          nextCoord[0], nextCoord[1]
        );

        const remainingFraction = (total - curIdx) / total;
        const remKm = Math.round(tripDistanceKm * remainingFraction * 10) / 10;
        const eta = Math.max(1, Math.round(remKm * 2.1));

        setLiveVehiclePos(currentCoord);
        setLiveHeading(heading);
        setLiveRemainingKm(remKm);
        setLiveEtaMins(eta);
      }, 1200);

      return () => clearInterval(interval);
    }

    // Phase 4: COMPLETED -> At Destination
    if (tripStatus === 'COMPLETED') {
      setLiveVehiclePos(dropoff);
      setLiveHeading(0);
      setLiveRemainingKm(0);
      setLiveEtaMins(0);
    }
  }, [isLiveTrip, tripStatus, approachRoadPoints, tripRoadPoints, tripDistanceKm, pickup, dropoff]);

  // Nearby simulated idle vehicles (only shown in explore mode)
  const [nearbyVehicles, setNearbyVehicles] = useState(() =>
    generateNearbyDrivers(pickup, vehicleType)
  );

  useEffect(() => {
    if (pickup && pickup[0]) {
      setNearbyVehicles(generateNearbyDrivers(pickup, vehicleType));
    }
  }, [pickup?.[0], pickup?.[1], vehicleType]);

  useEffect(() => {
    if (isLiveTrip) return;
    const interval = setInterval(() => {
      setNearbyVehicles((prev) =>
        prev.map((v) => {
          let newOffsetLat = v.offsetLat + v.speedLat + (Math.random() - 0.5) * 0.0002;
          let newOffsetLng = v.offsetLng + v.speedLng + (Math.random() - 0.5) * 0.0002;
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
  }, [isLiveTrip]);

  // Determine bounds points for map auto-center
  const boundsPoints = useMemo(() => {
    if (isLiveTrip && liveVehiclePos) {
      if (tripStatus === 'ACCEPTED' || tripStatus === 'DRIVER_ARRIVING') {
        return [liveVehiclePos, pickup];
      }
      return [liveVehiclePos, dropoff];
    }
    if (pickup && dropoff) return [pickup, dropoff];
    if (pickup) return [pickup];
    return [[12.9716, 77.5946]];
  }, [isLiveTrip, liveVehiclePos, tripStatus, pickup, dropoff]);

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
        <AutoFitBounds boundsPoints={boundsPoints} triggerRecenter={recenterCount} />

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

        {/* Approach Route Polyline (Driver -> Pickup when ACCEPTED) */}
        {isLiveTrip && tripStatus === 'ACCEPTED' && approachRoadPoints.length > 0 && (
          <>
            <Polyline
              positions={approachRoadPoints}
              color="#0284c7"
              weight={7}
              opacity={0.3}
            />
            <Polyline
              positions={approachRoadPoints}
              color="#0284c7"
              weight={4}
              opacity={0.95}
              dashArray="6, 8"
            />
          </>
        )}

        {/* Main Trip Real Road Polyline (Pickup -> Dropoff) */}
        {tripRoadPoints.length > 0 && (
          <>
            <Polyline
              positions={tripRoadPoints}
              color="#1e293b"
              weight={7}
              opacity={0.25}
            />
            <Polyline
              positions={tripRoadPoints}
              color="#2563eb"
              weight={4.5}
              opacity={0.95}
              dashArray={isLiveTrip && tripStatus !== 'IN_PROGRESS' ? '8, 8' : null}
            />
          </>
        )}

        {/* Explore Mode: ONLY Nearby Drivers of the Selected Vehicle Category around Pickup */}
        {!isLiveTrip && pickup && nearbyVehicles.map((v) => (
          <Marker
            key={v.id}
            position={[pickup[0] + v.offsetLat, pickup[1] + v.offsetLng]}
            icon={getNearbyIcon(v.type)}
          >
            <Popup className="text-gray-900 font-bold text-[11px]">
              <div className="space-y-0.5">
                <p className="font-extrabold text-xs text-gray-950 flex items-center space-x-1">
                  <span>{visuals.emoji} Nearby {visuals.label} Pilot</span>
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold">⚡ ~{v.eta} mins to pickup</p>
                <p className="text-[10px] text-gray-500 font-normal">⭐ 4.9 Verified Pilot • Ready to ride</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Live Trip Mode: Auto-Moving Animated Vehicle with Heading Rotation */}
        {isLiveTrip && liveVehiclePos && (
          <Marker
            position={liveVehiclePos}
            icon={createLiveVehicleIcon(
              category,
              liveHeading,
              tripStatus === 'DRIVER_ARRIVING'
            )}
          >
            <Popup className="text-gray-900 font-bold text-xs">
              <div className="space-y-1">
                <p className="font-black text-sm flex items-center space-x-1.5">
                  <span>{visuals.emoji}</span>
                  <span>{visuals.label} Pilot</span>
                </p>
                {tripStatus === 'ACCEPTED' && (
                  <p className="text-xs text-cyan-800 font-bold">
                    🚀 En route to pickup • ~{liveEtaMins}m ({liveRemainingKm} km)
                  </p>
                )}
                {tripStatus === 'DRIVER_ARRIVING' && (
                  <p className="text-xs text-emerald-700 font-bold">
                    📍 Arrived at your pickup point!
                  </p>
                )}
                {tripStatus === 'IN_PROGRESS' && (
                  <p className="text-xs text-emerald-700 font-bold">
                    🟢 Trip in Progress • Destination ETA ~{liveEtaMins}m
                  </p>
                )}
                {tripStatus === 'COMPLETED' && (
                  <p className="text-xs text-brand-700 font-bold">
                    🏁 Destination Reached!
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Top Floating Map Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center space-x-2">
        <div className="bg-white/95 backdrop-blur-md rounded-xl border border-gray-200 p-1 flex items-center space-x-1 shadow-md text-[11px] font-bold text-gray-700">
          <button
            type="button"
            onClick={() => setSelectedLayer('google_roadmap')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              selectedLayer === 'google_roadmap'
                ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                : 'hover:text-gray-950 hover:bg-gray-100'
            }`}
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
          >
            Satellite
          </button>
        </div>

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

      {/* Top-Left Floating Live Status Telemetry Pill */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-gray-200 shadow-md flex items-center space-x-2 text-xs font-extrabold text-gray-950 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        {!isLiveTrip && (
          <span>
            {visuals.emoji} 6 {visuals.label}s near pickup <strong className="text-emerald-700 font-semibold">• ~2-3 mins away</strong>
          </span>
        )}
        {isLiveTrip && tripStatus === 'ACCEPTED' && (
          <span>
            {visuals.emoji} Pilot arriving in <strong className="text-cyan-700">~{liveEtaMins}m</strong> ({liveRemainingKm} km away)
          </span>
        )}
        {isLiveTrip && tripStatus === 'DRIVER_ARRIVING' && (
          <span className="text-emerald-700">
            📍 {visuals.emoji} Pilot arrived at pickup • Ready to board
          </span>
        )}
        {isLiveTrip && tripStatus === 'IN_PROGRESS' && (
          <span>
            {visuals.emoji} En route to destination <strong className="text-emerald-700">• ETA ~{liveEtaMins}m</strong> ({liveRemainingKm} km)
          </span>
        )}
        {isLiveTrip && tripStatus === 'COMPLETED' && (
          <span className="text-brand-700">
            🏁 Trip Completed
          </span>
        )}
      </div>

      {/* Bottom Floating Telemetry Pill */}
      <div className="absolute bottom-3 left-3 z-[1000] px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-mono text-gray-700 flex items-center space-x-2 border border-gray-200 shadow-md pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">
          OSRM Real Road Routing • Rapido Live Telemetry
        </span>
      </div>
    </div>
  );
};

export default MapView;
