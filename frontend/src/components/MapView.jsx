import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Layers, Crosshair, Navigation, Compass, ShieldCheck } from 'lucide-react';
import {
  fetchRoadRoute,
  generateRoadRoute,
  calculateBearing,
  getVehicleVisuals,
  samplePolylineWithLaneOffset,
  lerpAngle,
  getPolylineMetrics,
} from '../api/routeService';

// Raw Top-Down Vehicle SVGs (Pure vector graphics pointing 0 deg North)

// 1. Auto Rickshaw: Yellow canopy roof with white star in center (Image 3 exact match)
export const getAutoRickshawRawSvg = () => `
  <svg viewBox="0 0 44 64" width="30" height="44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Front Wheel & Mudguard -->
    <rect x="19" y="3" width="6" height="11" rx="3" fill="#18181b" />
    <path d="M 17 8 L 27 8" stroke="#f59e0b" stroke-width="2" />
    
    <!-- Auto Body Frame (Tapered front, wide rear) -->
    <path d="M 13 15 C 16 10, 28 10, 31 15 L 38 27 C 41 37, 41 49, 39 57 C 38 59, 6 59, 5 57 C 3 49, 3 37, 6 27 Z" fill="#f59e0b" stroke="#09090b" stroke-width="1.8" />
    
    <!-- Black Front Windshield & Dashboard -->
    <path d="M 13 15 C 17 12, 27 12, 31 15 L 34 23 C 33 24, 11 24, 10 23 Z" fill="#09090b" />
    <line x1="16" y1="17" x2="28" y2="19" stroke="#93c5fd" stroke-width="1.5" stroke-linecap="round" opacity="0.85" />
    
    <!-- Signature Rapido Bright Yellow Canopy Roof -->
    <rect x="7" y="23" width="30" height="32" rx="6" fill="#facc15" stroke="#18181b" stroke-width="1.8" />
    
    <!-- Signature White Star on Roof (Exact match to Image 3 screenshot!) -->
    <g transform="translate(22, 37)">
      <circle cx="0" cy="0" r="7.5" fill="#eab308" fill-opacity="0.45" />
      <path d="M 0 -5.5 L 1.6 -1.8 L 5.5 -1.8 L 2.4 0.6 L 3.5 4.5 L 0 2.2 L -3.5 4.5 L -2.4 0.6 L -5.5 -1.8 L -1.6 -1.8 Z" fill="#ffffff" />
    </g>

    <!-- Side Mirrors -->
    <rect x="2" y="19" width="4" height="3" rx="1.5" fill="#18181b" />
    <rect x="38" y="19" width="4" height="3" rx="1.5" fill="#18181b" />

    <!-- Rear Taillights -->
    <rect x="7" y="56" width="6" height="2.5" rx="1" fill="#ef4444" />
    <rect x="31" y="56" width="6" height="2.5" rx="1" fill="#ef4444" />
  </svg>
`;

// 2. Bike: Top-down dark chassis with rider wearing signature vibrant Rapido yellow helmet (Images 1 & 3)
export const getBikeRawSvg = () => `
  <svg viewBox="0 0 36 64" width="24" height="42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Front Wheel & Disc -->
    <rect x="15" y="2" width="6" height="15" rx="3" fill="#18181b" />
    <rect x="16.5" y="4" width="3" height="9" rx="1.5" fill="#71717a" />
    
    <!-- Front Mudguard & Headlight -->
    <path d="M 13 13 C 13 9, 23 9, 23 13 L 22 18 L 14 18 Z" fill="#facc15" stroke="#ca8a04" stroke-width="1" />
    <ellipse cx="18" cy="11" rx="3" ry="1.8" fill="#fef08a" />

    <!-- Handlebars with Mirrors -->
    <path d="M 4 20 L 32 20" stroke="#18181b" stroke-width="3.5" stroke-linecap="round" />
    <rect x="2" y="18.5" width="4" height="3" rx="1" fill="#000000" />
    <rect x="30" y="18.5" width="4" height="3" rx="1" fill="#000000" />

    <!-- Fuel Tank with Yellow Accent -->
    <path d="M 13 22 C 12 26, 12 30, 14 33 L 22 33 C 24 30, 24 26, 23 22 Z" fill="#facc15" stroke="#eab308" stroke-width="1.2" />

    <!-- Rider Body (Dark Jacket) & Arms -->
    <path d="M 6 22 L 12 29 L 24 29 L 30 22" stroke="#1e293b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
    <ellipse cx="18" cy="33" rx="9" ry="7" fill="#0f172a" />
    
    <!-- Iconic Rapido Bright Yellow Helmet -->
    <ellipse cx="18" cy="28" rx="6.5" ry="7" fill="#facc15" stroke="#18181b" stroke-width="1.5" />
    <!-- Helmet Black Visor Shield -->
    <path d="M 14.5 26 Q 18 24 21.5 26" stroke="#18181b" stroke-width="3" stroke-linecap="round" />
    <ellipse cx="18" cy="27" rx="4" ry="1.2" fill="#09090b" opacity="0.9" />

    <!-- Bike Seat & Rear Body -->
    <path d="M 14 38 L 22 38 L 21 50 L 15 50 Z" fill="#18181b" />
    
    <!-- Rear Wheel & Taillight -->
    <rect x="15" y="47" width="6" height="15" rx="3" fill="#18181b" />
    <rect x="15.5" y="48" width="5" height="2.5" rx="1" fill="#ef4444" />
  </svg>
`;

// 3. Cab: Aerodynamic white sedan with yellow taxi bar roof
export const getCabRawSvg = () => `
  <svg viewBox="0 0 36 68" width="26" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Aerodynamic Sedan Body -->
    <rect x="4" y="6" width="28" height="54" rx="9" fill="#ffffff" stroke="#18181b" stroke-width="2" />
    <path d="M 7 12 C 10 8, 26 8, 29 12" stroke="#e2e8f0" stroke-width="1.5" />
    <rect x="6" y="7" width="5" height="3" rx="1" fill="#fef08a" />
    <rect x="25" y="7" width="5" height="3" rx="1" fill="#fef08a" />
    <!-- Windshield -->
    <path d="M 7 19 L 29 19 L 26 27 L 10 27 Z" fill="#1e293b" />
    <!-- Roof with Taxi Bar Sign -->
    <rect x="8" y="27" width="20" height="20" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
    <rect x="13" y="34" width="10" height="4" rx="2" fill="#f59e0b" stroke="#18181b" stroke-width="1" />
    <!-- Rear Window -->
    <path d="M 10 48 L 26 48 L 28 54 L 8 54 Z" fill="#1e293b" />
    <!-- Side Mirrors & Taillights -->
    <rect x="1" y="20" width="3" height="4" rx="1" fill="#18181b" />
    <rect x="32" y="20" width="3" height="4" rx="1" fill="#18181b" />
    <rect x="6" y="58" width="5" height="2" rx="1" fill="#ef4444" />
    <rect x="25" y="58" width="5" height="2" rx="1" fill="#ef4444" />
  </svg>
`;

// 4. Porter: Mini-truck cabin with strapped cargo bed
export const getPorterRawSvg = () => `
  <svg viewBox="0 0 36 70" width="26" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="4" width="26" height="4" rx="2" fill="#18181b" />
    <!-- Driver Cabin -->
    <path d="M 5 8 C 5 6, 31 6, 31 8 L 31 24 L 5 24 Z" fill="#2563eb" stroke="#18181b" stroke-width="1.8" />
    <path d="M 8 9 L 28 9 L 27 18 L 9 18 Z" fill="#0f172a" />
    <rect x="2" y="12" width="3" height="4" rx="1" fill="#18181b" />
    <rect x="31" y="12" width="3" height="4" rx="1" fill="#18181b" />
    <!-- Cargo Bed with Strapped Boxes -->
    <rect x="4" y="25" width="28" height="38" rx="3" fill="#cbd5e1" stroke="#334155" stroke-width="2" />
    <rect x="7" y="28" width="10" height="15" rx="1" fill="#d97706" stroke="#92400e" stroke-width="1" />
    <rect x="19" y="28" width="10" height="15" rx="1" fill="#b45309" stroke="#78350f" stroke-width="1" />
    <rect x="8" y="45" width="20" height="14" rx="1" fill="#92400e" stroke="#451a03" stroke-width="1" />
    <line x1="4" y1="36" x2="32" y2="36" stroke="#facc15" stroke-width="1.5" />
    <line x1="4" y1="52" x2="32" y2="52" stroke="#facc15" stroke-width="1.5" />
  </svg>
`;

// Exact Rapido Pickup Marker (Green Circle with Ring)
const pickupIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center pointer-events-none">
      <div class="absolute w-10 h-10 rounded-full bg-emerald-500/25 animate-ping"></div>
      <div class="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center ring-4 ring-emerald-500/30">
        <div class="w-2.5 h-2.5 rounded-full bg-white"></div>
      </div>
      <div class="absolute -bottom-2 w-1.5 h-2.5 bg-emerald-800 rounded-b"></div>
    </div>
  `,
  className: 'rapido-pickup-marker',
  iconSize: [32, 42],
  iconAnchor: [16, 38],
});

// Exact Rapido Dropoff Target Marker (Red Bullseye)
const dropoffIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center pointer-events-none">
      <div class="w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-xl flex items-center justify-center ring-4 ring-rose-500/30">
        <div class="w-4 h-4 rounded-full bg-white flex items-center justify-center">
          <div class="w-2 h-2 rounded-full bg-rose-600"></div>
        </div>
      </div>
      <div class="absolute -bottom-2 w-1.5 h-2.5 bg-rose-800 rounded-b"></div>
    </div>
  `,
  className: 'rapido-dropoff-marker',
  iconSize: [32, 42],
  iconAnchor: [16, 38],
});

// Unified Rotated Vehicle Marker Generator:
// Entire vehicle, forward headlight beam cone, and taillights rotate in 100% unison with heading
export const createRotatedVehicleIcon = ({
  category = 'BIKE',
  heading = 0,
  isArrived = false,
  isLive = false,
  showHeadlight = true,
}) => {
  let rawSvg = '';
  let size = [28, 44];
  let anchor = [14, 22];

  if (category === 'AUTO') {
    rawSvg = getAutoRickshawRawSvg();
    size = [30, 44];
    anchor = [15, 22];
  } else if (category === 'CAB' || category === 'SEDAN' || category === 'SUV') {
    rawSvg = getCabRawSvg();
    size = [26, 48];
    anchor = [13, 24];
  } else if (category === 'TROLLEY_PORTER') {
    rawSvg = getPorterRawSvg();
    size = [28, 50];
    anchor = [14, 25];
  } else {
    // BIKE
    rawSvg = getBikeRawSvg();
    size = [24, 42];
    anchor = [12, 21];
  }

  if (isArrived) {
    return L.divIcon({
      html: `
        <div style="position: relative; width: ${size[0]}px; height: ${size[1]}px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 54px; height: 54px; border-radius: 50%; background: rgba(16, 185, 129, 0.3); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="transform: rotate(${heading}deg); transform-origin: center center; width: ${size[0]}px; height: ${size[1]}px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.45));">
            ${rawSvg}
          </div>
          <div style="position: absolute; top: -14px; left: 50%; transform: translateX(-50%); white-space: nowrap; padding: 2px 7px; border-radius: 9999px; background-color: #059669; color: #ffffff; font-size: 9px; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 1.5px solid #ffffff; z-index: 10;">
            Arrived
          </div>
        </div>
      `,
      className: 'rapido-vehicle-arrived',
      iconSize: size,
      iconAnchor: anchor,
    });
  }

  return L.divIcon({
    html: `
      <div style="position: relative; width: ${size[0]}px; height: ${size[1]}px;">
        <div style="position: absolute; inset: 0; transform: rotate(${heading}deg); transform-origin: center center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));">
          <!-- Forward Headlight Light Cone (Attached to front bumper, shines in travel direction) -->
          ${showHeadlight ? `
            <div style="position: absolute; top: -18px; left: 50%; transform: translateX(-50%); width: 26px; height: 22px; background: radial-gradient(ellipse at bottom, rgba(254, 240, 138, 0.8) 0%, rgba(250, 204, 21, 0.3) 55%, transparent 85%); clip-path: polygon(25% 100%, 75% 100%, 100% 0%, 0% 0%); pointer-events: none; z-index: 1;"></div>
          ` : ''}

          <!-- Centered Top-Down Vector Sprite -->
          <div style="width: ${size[0]}px; height: ${size[1]}px; position: relative; z-index: 2;">
            ${rawSvg}
          </div>

          <!-- Rear Taillight Glow -->
          <div style="position: absolute; bottom: -2px; left: 50%; transform: translateX(-50%); width: 6px; height: 3px; background: #ef4444; border-radius: 1px; box-shadow: 0 0 5px #ef4444; z-index: 3;"></div>
        </div>

        ${isLive ? `
          <!-- Pulsing Radar Dot behind live tracking vehicle -->
          <div style="position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); width: 8px; height: 8px; border-radius: 50%; background-color: #10b981; border: 1.5px solid #ffffff; box-shadow: 0 0 6px #10b981; z-index: 4;"></div>
        ` : ''}
      </div>
    `,
    className: isLive ? 'rapido-vehicle-live' : 'rapido-vehicle-nearby',
    iconSize: size,
    iconAnchor: anchor,
  });
};

// Convenient wrappers for Explore & Live Trip markers
export const getNearbyIcon = (type = 'BIKE', heading = 0) => {
  return createRotatedVehicleIcon({
    category: type,
    heading,
    isArrived: false,
    isLive: false,
    showHeadlight: false,
  });
};

export const createLiveVehicleIcon = (category = 'BIKE', heading = 0, isArrived = false) => {
  return createRotatedVehicleIcon({
    category,
    heading,
    isArrived,
    isLive: true,
    showHeadlight: !isArrived,
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

// Generate realistic dynamic street cruising drivers around pickup point
const generateNearbyDrivers = (centerCoord, type) => {
  if (!centerCoord || !centerCoord[0]) return [];
  // 10 realistic street road offsets and street directions around center (matching Rapido Image 3)
  const streetSpots = [
    { offsetLat: 0.0016, offsetLng: 0.0022, heading: 45 },
    { offsetLat: 0.0024, offsetLng: -0.0018, heading: 135 },
    { offsetLat: -0.0018, offsetLng: 0.0025, heading: 90 },
    { offsetLat: 0.0031, offsetLng: 0.0012, heading: 210 },
    { offsetLat: -0.0025, offsetLng: -0.0020, heading: 315 },
    { offsetLat: 0.0012, offsetLng: -0.0028, heading: 60 },
    { offsetLat: -0.0020, offsetLng: 0.0032, heading: 180 },
    { offsetLat: 0.0035, offsetLng: -0.0025, heading: 270 },
    { offsetLat: -0.0010, offsetLng: -0.0015, heading: 120 },
    { offsetLat: 0.0020, offsetLng: 0.0035, heading: 330 },
  ];

  return streetSpots.map((spot, idx) => ({
    id: `${type}-${idx}`,
    type: type,
    baseLat: centerCoord[0] + spot.offsetLat,
    baseLng: centerCoord[1] + spot.offsetLng,
    lat: centerCoord[0] + spot.offsetLat,
    lng: centerCoord[1] + spot.offsetLng,
    heading: spot.heading,
    step: idx * 1.5,
    eta: idx % 2 === 0 ? 1 : idx % 3 === 0 ? 3 : 2,
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
  onDriverArrived = null,
  onTripCompleted = null,
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

  // Synchronously compute initial road route to guarantee 0ms latency
  const initialTripRoute = useMemo(
    () => generateRoadRoute(pickup, dropoff),
    [pickup?.[0], pickup?.[1], dropoff?.[0], dropoff?.[1]]
  );

  const [tripRoadPoints, setTripRoadPoints] = useState(() => initialTripRoute.points);
  const [tripDistanceKm, setTripDistanceKm] = useState(() => initialTripRoute.distanceKm);

  // Approach Route (Driver -> Pickup when ACCEPTED) dynamically relative to pickup
  const driverStartPos = useMemo(
    () => [pickup[0] + 0.0078, pickup[1] - 0.0068],
    [pickup?.[0], pickup?.[1]]
  );

  const initialApproachRoute = useMemo(
    () => generateRoadRoute(driverStartPos, pickup),
    [driverStartPos, pickup?.[0], pickup?.[1]]
  );

  const [approachRoadPoints, setApproachRoadPoints] = useState(() => initialApproachRoute.points);

  // Live Vehicle Animated Position & Heading (Initializes immediately)
  const [liveVehiclePos, setLiveVehiclePos] = useState(() => {
    if (tripStatus === 'ACCEPTED') return initialApproachRoute.points[0] || driverStartPos;
    if (tripStatus === 'DRIVER_ARRIVING') return pickup;
    if (tripStatus === 'IN_PROGRESS') return initialTripRoute.points[0] || pickup;
    if (tripStatus === 'COMPLETED') return dropoff;
    return pickup;
  });

  const [liveHeading, setLiveHeading] = useState(() => {
    if (initialApproachRoute.points.length >= 2) {
      return calculateBearing(
        initialApproachRoute.points[0][0], initialApproachRoute.points[0][1],
        initialApproachRoute.points[1][0], initialApproachRoute.points[1][1]
      );
    }
    return 45;
  });
  const [liveEtaMins, setLiveEtaMins] = useState(3);
  const [liveRemainingKm, setLiveRemainingKm] = useState(1.2);

  // Non-blocking background route upgrade from OSRM
  useEffect(() => {
    let isCancelled = false;
    const upgradeRoutes = async () => {
      if (!pickup || !dropoff) return;

      const tripRes = await fetchRoadRoute(pickup, dropoff);
      if (!isCancelled && tripRes.points.length > 0) {
        setTripRoadPoints(tripRes.points);
        setTripDistanceKm(tripRes.distanceKm);
      }

      if (isLiveTrip && (tripStatus === 'ACCEPTED' || tripStatus === 'DRIVER_ARRIVING')) {
        const approachRes = await fetchRoadRoute(driverStartPos, pickup);
        if (!isCancelled && approachRes.points.length > 0) {
          setApproachRoadPoints(approachRes.points);
        }
      }
    };

    upgradeRoutes();
    return () => {
      isCancelled = true;
    };
  }, [pickup?.[0], pickup?.[1], dropoff?.[0], dropoff?.[1], isLiveTrip, tripStatus, driverStartPos]);

  // High-performance 60 FPS requestAnimationFrame vehicle animation engine
  useEffect(() => {
    if (!isLiveTrip) return;

    let animFrameId = null;
    let startTime = null;

    // Phase 1: ACCEPTED -> Smoothly driving along approach road towards Pickup
    if (tripStatus === 'ACCEPTED') {
      const route = approachRoadPoints.length > 0 ? approachRoadPoints : initialApproachRoute.points;
      if (!route || route.length < 2) return;

      const metrics = getPolylineMetrics(route);
      const totalDist = metrics.totalDistance || 1200;
      // Duration scaled realistically: ~12-14 seconds
      const durationMs = Math.max(10000, Math.min(18000, (totalDist / 1000) * 9000));

      let headingTracker = calculateBearing(route[0][0], route[0][1], route[1][0], route[1][1]);
      setLiveVehiclePos(route[0]);
      setLiveHeading(headingTracker);

      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(1.0, elapsed / durationMs);

        // Left-hand traffic lane offset for India (2.5 meters in left lane)
        const sampled = samplePolylineWithLaneOffset(route, progress, metrics, 2.5);
        if (sampled) {
          headingTracker = lerpAngle(headingTracker, sampled.heading, 0.25);
          setLiveVehiclePos([sampled.lat, sampled.lng]);
          setLiveHeading(headingTracker);

          const remFraction = 1.0 - progress;
          const remKm = Math.round((totalDist / 1000) * remFraction * 10) / 10;
          const eta = Math.max(1, Math.round(remKm * 2.2));
          setLiveRemainingKm(remKm);
          setLiveEtaMins(eta);
        }

        if (progress < 1.0) {
          animFrameId = requestAnimationFrame(step);
        } else {
          // Reached Pickup cleanly! Stop moving, do not loop
          setLiveVehiclePos(pickup);
          setLiveRemainingKm(0);
          setLiveEtaMins(0);
          if (onDriverArrived) {
            onDriverArrived();
          }
        }
      };

      animFrameId = requestAnimationFrame(step);
      return () => {
        if (animFrameId) cancelAnimationFrame(animFrameId);
      };
    }

    // Phase 2: DRIVER_ARRIVING -> At Pickup
    if (tripStatus === 'DRIVER_ARRIVING') {
      setLiveVehiclePos(pickup);
      setLiveRemainingKm(0);
      setLiveEtaMins(0);
      return;
    }

    // Phase 3: IN_PROGRESS -> Smoothly driving along main road towards Dropoff
    if (tripStatus === 'IN_PROGRESS') {
      const route = tripRoadPoints.length > 0 ? tripRoadPoints : initialTripRoute.points;
      if (!route || route.length < 2) return;

      const metrics = getPolylineMetrics(route);
      const totalDist = metrics.totalDistance || (tripDistanceKm * 1000);
      // Duration scaled realistically: ~18-24 seconds
      const durationMs = Math.max(14000, Math.min(26000, (totalDist / 1000) * 4500));

      let headingTracker = calculateBearing(route[0][0], route[0][1], route[1][0], route[1][1]);
      setLiveVehiclePos(route[0]);
      setLiveHeading(headingTracker);

      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(1.0, elapsed / durationMs);

        // Left-hand traffic lane offset for India (2.5 meters in left lane)
        const sampled = samplePolylineWithLaneOffset(route, progress, metrics, 2.5);
        if (sampled) {
          headingTracker = lerpAngle(headingTracker, sampled.heading, 0.25);
          setLiveVehiclePos([sampled.lat, sampled.lng]);
          setLiveHeading(headingTracker);

          const remFraction = 1.0 - progress;
          const remKm = Math.round(tripDistanceKm * remFraction * 10) / 10;
          const eta = Math.max(1, Math.round(remKm * 2.1));
          setLiveRemainingKm(remKm);
          setLiveEtaMins(eta);
        }

        if (progress < 1.0) {
          animFrameId = requestAnimationFrame(step);
        } else {
          // Reached Dropoff cleanly! Stop moving, do not loop
          setLiveVehiclePos(dropoff);
          setLiveRemainingKm(0);
          setLiveEtaMins(0);
          if (onTripCompleted) {
            onTripCompleted();
          }
        }
      };

      animFrameId = requestAnimationFrame(step);
      return () => {
        if (animFrameId) cancelAnimationFrame(animFrameId);
      };
    }

    // Phase 4: COMPLETED -> At Destination
    if (tripStatus === 'COMPLETED') {
      setLiveVehiclePos(dropoff);
      setLiveRemainingKm(0);
      setLiveEtaMins(0);
    }
  }, [
    isLiveTrip,
    tripStatus,
    approachRoadPoints,
    tripRoadPoints,
    initialApproachRoute.points,
    initialTripRoute.points,
    tripDistanceKm,
    pickup,
    dropoff,
    onDriverArrived,
    onTripCompleted,
  ]);

  // Explore Mode: Nearby active patrolling vehicles cruising around Pickup
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

    let animId = null;
    let lastTime = performance.now();

    const cruise = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      setNearbyVehicles((prev) =>
        prev.map((v) => {
          const newStep = v.step + dt * 0.4;
          const drift = Math.sin(newStep) * 0.00045;
          const currentHeading = Math.cos(newStep) >= 0 ? v.heading : (v.heading + 180) % 360;

          const rad = (currentHeading * Math.PI) / 180;
          const lat = v.baseLat + Math.cos(rad) * drift;
          const lng = v.baseLng + Math.sin(rad) * drift;

          return {
            ...v,
            step: newStep,
            lat,
            lng,
            heading: currentHeading,
          };
        })
      );

      animId = requestAnimationFrame(cruise);
    };

    animId = requestAnimationFrame(cruise);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
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
              weight={4.5}
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
              color="#334155"
              weight={5.5}
              opacity={0.95}
              dashArray={isLiveTrip && tripStatus !== 'IN_PROGRESS' ? '8, 8' : null}
            />
          </>
        )}

        {/* Explore Mode: ONLY Nearby Drivers of the Selected Category actively moving around Pickup */}
        {!isLiveTrip && pickup && nearbyVehicles.map((v) => (
          <Marker
            key={v.id}
            position={[v.lat, v.lng]}
            icon={getNearbyIcon(v.type, v.heading)}
          >
            <Popup className="text-gray-900 font-bold text-[11px]">
              <div className="space-y-0.5">
                <p className="font-extrabold text-xs text-gray-950 flex items-center space-x-1">
                  <span>{visuals.emoji} Nearby {visuals.label} Pilot</span>
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold">⚡ ~{v.eta} mins to pickup</p>
                <p className="text-[10px] text-gray-500 font-normal">⭐ 4.9 Verified Pilot • Cruising nearby</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Live Trip Mode: Auto-Moving Animated Vehicle with Heading Rotation & Motion Beam */}
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
          Live GPS Telemetry Active
        </span>
      </div>
    </div>
  );
};

export default MapView;
