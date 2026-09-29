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

// Nearby vehicle icon generator matching selected vehicle category with compass heading
const getNearbyIcon = (type = 'BIKE', heading = 0) => {
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
      <div class="relative flex items-center justify-center transition-all duration-700 ease-linear" style="transform: rotate(${heading}deg);">
        <div class="w-8 h-8 rounded-full ${bg} flex items-center justify-center shadow-lg border-2 ring-2 text-sm">
          ${emoji}
        </div>
      </div>
    `,
    className: 'nearby-fleet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Live animated moving vehicle with heading rotation & forward motion beam
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
      <div class="relative flex items-center justify-center transition-transform duration-500 ease-linear" style="transform: rotate(${heading}deg);">
        <div class="w-11 h-11 rounded-2xl ${visuals.bg} flex items-center justify-center shadow-2xl border-2 border-white ring-4 ${visuals.ring} text-xl font-black">
          ${visuals.emoji}
        </div>
        <!-- Forward motion beam -->
        <div class="absolute -top-3 w-3 h-5 bg-gradient-to-t from-white/70 to-transparent rounded-full opacity-60 pointer-events-none"></div>
        <!-- Live motion indicator dot -->
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

// Generate realistic dynamic orbital patrols around pickup point
const generateNearbyDrivers = (centerCoord, type) => {
  if (!centerCoord || !centerCoord[0]) return [];
  const patrols = [
    { radiusLat: 0.0028, radiusLng: 0.0035, angle: 0.2, speed: 0.06, eta: 2 },
    { radiusLat: 0.0035, radiusLng: 0.0022, angle: 1.5, speed: -0.05, eta: 3 },
    { radiusLat: 0.0022, radiusLng: 0.0040, angle: 2.8, speed: 0.07, eta: 2 },
    { radiusLat: 0.0040, radiusLng: 0.0028, angle: 3.9, speed: -0.06, eta: 4 },
    { radiusLat: 0.0030, radiusLng: 0.0032, angle: 4.8, speed: 0.05, eta: 3 },
    { radiusLat: 0.0025, radiusLng: 0.0025, angle: 5.8, speed: -0.07, eta: 4 },
  ];

  return patrols.map((p, idx) => {
    const lat = centerCoord[0] + p.radiusLat * Math.sin(p.angle);
    const lng = centerCoord[1] + p.radiusLng * Math.cos(p.angle);
    const heading = Math.round(((p.angle + (p.speed > 0 ? Math.PI / 2 : -Math.PI / 2)) * 180) / Math.PI + 360) % 360;

    return {
      id: `${type}-${idx}`,
      type: type,
      lat: lat,
      lng: lng,
      angle: p.angle,
      radiusLat: p.radiusLat,
      radiusLng: p.radiusLng,
      speed: p.speed,
      eta: p.eta,
      heading: heading,
    };
  });
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
          const newAngle = v.angle + v.speed;
          const newLat = pickup[0] + v.radiusLat * Math.sin(newAngle);
          const newLng = pickup[1] + v.radiusLng * Math.cos(newAngle);
          const newHeading =
            Math.round(((newAngle + (v.speed > 0 ? Math.PI / 2 : -Math.PI / 2)) * 180) / Math.PI + 360) % 360;

          return {
            ...v,
            angle: newAngle,
            lat: newLat,
            lng: newLng,
            heading: newHeading,
          };
        })
      );
    }, 700);

    return () => clearInterval(interval);
  }, [isLiveTrip, pickup?.[0], pickup?.[1]]);

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
              color="#2563eb"
              weight={4.5}
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
