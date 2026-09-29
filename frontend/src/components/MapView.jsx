import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Layers, Crosshair, Navigation, Compass, ShieldCheck } from 'lucide-react';
import { fetchRoadRoute, generateRoadRoute, calculateBearing, getVehicleVisuals } from '../api/routeService';

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

// Top-Down Vector Vehicle SVG Sprites (100% Rapido & Uber Top-Down Vector Graphics)
export const getAutoRickshawSvg = (heading = 0) => `
  <div style="transform: rotate(${heading}deg); width: 30px; height: 44px; position: relative; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.38)); transition: transform 0.35s ease-out;">
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
  </div>
`;

export const getBikeSvg = (heading = 0) => `
  <div style="transform: rotate(${heading}deg); width: 24px; height: 42px; position: relative; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.4)); transition: transform 0.35s ease-out;">
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
  </div>
`;

export const getCabSvg = (heading = 0) => `
  <div style="transform: rotate(${heading}deg); width: 26px; height: 48px; position: relative; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.35)); transition: transform 0.35s ease-out;">
    <svg viewBox="0 0 36 68" width="26" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Aerodynamic White Sedan Body -->
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
  </div>
`;

export const getPorterSvg = (heading = 0) => `
  <div style="transform: rotate(${heading}deg); width: 26px; height: 48px; position: relative; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.35)); transition: transform 0.35s ease-out;">
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
  </div>
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

// Nearby vehicle icon generator matching selected vehicle category with compass heading
const getNearbyIcon = (type = 'BIKE', heading = 0) => {
  let svg = '';
  let size = [28, 40];
  let anchor = [14, 20];

  if (type === 'AUTO') {
    svg = getAutoRickshawSvg(heading);
    size = [28, 40];
    anchor = [14, 20];
  } else if (type === 'CAB') {
    svg = getCabSvg(heading);
    size = [26, 48];
    anchor = [13, 24];
  } else if (type === 'TROLLEY_PORTER') {
    svg = getPorterSvg(heading);
    size = [26, 48];
    anchor = [13, 24];
  } else {
    // BIKE
    svg = getBikeSvg(heading);
    size = [22, 40];
    anchor = [11, 20];
  }

  return L.divIcon({
    html: svg,
    className: 'rapido-nearby-vehicle-marker',
    iconSize: size,
    iconAnchor: anchor,
  });
};

// Live animated moving vehicle with heading rotation & forward motion beam
const createLiveVehicleIcon = (category = 'BIKE', heading = 0, isArrived = false) => {
  let vehicleSvg = '';
  let size = [28, 40];
  let anchor = [14, 20];

  if (category === 'AUTO') {
    vehicleSvg = getAutoRickshawSvg(heading);
    size = [28, 40];
    anchor = [14, 20];
  } else if (category === 'CAB' || category === 'SEDAN' || category === 'SUV') {
    vehicleSvg = getCabSvg(heading);
    size = [26, 48];
    anchor = [13, 24];
  } else if (category === 'TROLLEY_PORTER') {
    vehicleSvg = getPorterSvg(heading);
    size = [26, 48];
    anchor = [13, 24];
  } else {
    vehicleSvg = getBikeSvg(heading);
    size = [22, 40];
    anchor = [11, 20];
  }

  if (isArrived) {
    return L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-14 h-14 rounded-full bg-emerald-500/30 animate-ping"></div>
          ${vehicleSvg}
          <div class="absolute -top-3 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[9px] uppercase tracking-wider shadow-md border border-white">
            Arrived
          </div>
        </div>
      `,
      className: 'rapido-live-vehicle-arrived',
      iconSize: size,
      iconAnchor: anchor,
    });
  }

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <!-- Forward motion headlight beam -->
        <div class="absolute -top-4 w-6 h-8 bg-gradient-to-t from-yellow-300/40 to-transparent rounded-t-full pointer-events-none transform -rotate-12"></div>
        ${vehicleSvg}
        <!-- Pulsing radar dot behind vehicle -->
        <div class="absolute -bottom-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white animate-pulse"></div>
      </div>
    `,
    className: 'rapido-live-vehicle-moving',
    iconSize: size,
    iconAnchor: anchor,
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

  // Approach Route (Driver -> Pickup when ACCEPTED)
  const driverStartPos = useMemo(
    () => [pickup[0] + 0.0085, pickup[1] - 0.0075],
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

  const [liveHeading, setLiveHeading] = useState(45);
  const [liveEtaMins, setLiveEtaMins] = useState(3);
  const [liveRemainingKm, setLiveRemainingKm] = useState(1.2);

  // Animation step tracker
  const animIndexRef = useRef(0);

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

  // Live Vehicle Smooth Auto-Movement Animation Engine (500ms intervals)
  useEffect(() => {
    if (!isLiveTrip) return;

    animIndexRef.current = 0;

    // Phase 1: ACCEPTED -> Moving from driver start toward Pickup
    if (tripStatus === 'ACCEPTED') {
      const route = approachRoadPoints.length > 0 ? approachRoadPoints : initialApproachRoute.points;
      const total = route.length;
      if (total === 0) return;

      setLiveVehiclePos(route[0]);

      const interval = setInterval(() => {
        animIndexRef.current = (animIndexRef.current + 1) % total;
        const curIdx = animIndexRef.current;
        const currentCoord = route[curIdx];
        const nextCoord = route[Math.min(curIdx + 1, total - 1)];

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
      }, 500);

      return () => clearInterval(interval);
    }

    // Phase 2: DRIVER_ARRIVING -> At Pickup
    if (tripStatus === 'DRIVER_ARRIVING') {
      setLiveVehiclePos(pickup);
      setLiveHeading(0);
      setLiveRemainingKm(0);
      setLiveEtaMins(0);
      return;
    }

    // Phase 3: IN_PROGRESS -> Moving from Pickup to Dropoff
    if (tripStatus === 'IN_PROGRESS') {
      const route = tripRoadPoints.length > 0 ? tripRoadPoints : initialTripRoute.points;
      const total = route.length;
      if (total === 0) return;

      setLiveVehiclePos(route[0]);

      const interval = setInterval(() => {
        animIndexRef.current = (animIndexRef.current + 1) % total;
        const curIdx = animIndexRef.current;
        const currentCoord = route[curIdx];
        const nextCoord = route[Math.min(curIdx + 1, total - 1)];

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
      }, 500);

      return () => clearInterval(interval);
    }

    // Phase 4: COMPLETED -> At Destination
    if (tripStatus === 'COMPLETED') {
      setLiveVehiclePos(dropoff);
      setLiveHeading(0);
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
  ]);

  // Explore Mode: Nearby simulated active patrolling vehicles (700ms smooth updates)
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
          const newStep = v.step + 0.12;
          const drift = Math.sin(newStep) * 0.0006;
          const currentHeading = Math.cos(newStep) >= 0 ? v.heading : (v.heading + 180) % 360;

          const lat = v.baseLat + Math.sin((v.heading * Math.PI) / 180) * drift;
          const lng = v.baseLng + Math.cos((v.heading * Math.PI) / 180) * drift;

          return {
            ...v,
            step: newStep,
            lat,
            lng,
            heading: currentHeading,
          };
        })
      );
    }, 600);

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
