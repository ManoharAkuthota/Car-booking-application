/**
 * Live Road Routing & Telemetry Service
 * Generates instant organic road geometries and calculates real compass bearings
 * Includes non-blocking OSRM public routing enhancements
 */

// In-memory route cache to prevent redundant computations
const routeCache = new Map();

/**
 * Calculate compass bearing angle (0-360 degrees) between two coordinates
 */
export const calculateBearing = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  if (Math.abs(lat1 - lat2) < 0.000001 && Math.abs(lon1 - lon2) < 0.000001) return 0;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  const brng = toDeg(Math.atan2(y, x));
  return Math.round((brng + 360) % 360);
};

/**
 * Calculates geodesic distance between two points in meters (Haversine)
 */
export const distanceMeters = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Shortest circular angular lerp to prevent 360-degree snap jumps
 */
export const lerpAngle = (current, target, alpha = 0.2) => {
  const diff = ((target - current + 540) % 360) - 180;
  return Math.round(((current + diff * alpha + 360) % 360) * 10) / 10;
};

/**
 * Compute total distance and cumulative distances array along polyline in meters
 */
export const getPolylineMetrics = (points) => {
  if (!points || points.length < 2) {
    return { totalDistance: 0, cumulativeDistances: [0] };
  }
  const cumulative = [0];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const d = distanceMeters(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1]);
    total += d;
    cumulative.push(total);
  }
  return { totalDistance: total, cumulativeDistances: cumulative };
};

/**
 * Samples a continuous point along a polyline at fractional progress [0, 1]
 * Applies left-hand traffic lane offset (India drives on left) and smooth tangent heading
 */
export const samplePolylineWithLaneOffset = (points, progress, metrics = null, laneOffsetMeters = 2.5) => {
  if (!points || points.length === 0) return null;
  if (points.length === 1) return { lat: points[0][0], lng: points[0][1], heading: 0, rawLat: points[0][0], rawLng: points[0][1] };

  const pClamped = Math.max(0, Math.min(1, progress));
  const { totalDistance, cumulativeDistances } = metrics || getPolylineMetrics(points);

  if (totalDistance === 0) {
    return { lat: points[0][0], lng: points[0][1], heading: 0, rawLat: points[0][0], rawLng: points[0][1] };
  }

  const targetDist = pClamped * totalDistance;

  // Find segment [idx, idx+1]
  let idx = 0;
  for (let i = 0; i < cumulativeDistances.length - 1; i++) {
    if (targetDist >= cumulativeDistances[i] && targetDist <= cumulativeDistances[i + 1]) {
      idx = i;
      break;
    }
    if (i === cumulativeDistances.length - 2) {
      idx = i;
    }
  }

  const segStartDist = cumulativeDistances[idx];
  const segEndDist = cumulativeDistances[idx + 1] || segStartDist + 0.0001;
  const segLen = Math.max(0.0001, segEndDist - segStartDist);
  const t = Math.max(0, Math.min(1, (targetDist - segStartDist) / segLen));

  const p1 = points[idx];
  const p2 = points[idx + 1] || points[idx];

  const rawLat = p1[0] + (p2[0] - p1[0]) * t;
  const rawLng = p1[1] + (p2[1] - p1[1]) * t;

  // Calculate tangent heading with lookahead to prevent micro-segment jitter
  let pLookFrom = p1;
  let pLookTo = p2;

  if (distanceMeters(pLookFrom[0], pLookFrom[1], pLookTo[0], pLookTo[1]) < 3.0 && idx + 2 < points.length) {
    pLookTo = points[idx + 2];
  }

  let heading = calculateBearing(pLookFrom[0], pLookFrom[1], pLookTo[0], pLookTo[1]);
  if (heading === 0 && idx > 0) {
    // Retain previous segment heading if standing still or at final node
    const prevP = points[idx - 1];
    heading = calculateBearing(prevP[0], prevP[1], p1[0], p1[1]);
  }

  // Left-Hand Traffic (LHT) Lane Offset for India:
  // Normal vector to the left is heading - 90 degrees
  const laneAngleRad = ((heading - 90) * Math.PI) / 180;
  const offsetDegLat = (Math.cos(laneAngleRad) * laneOffsetMeters) / 111111;
  const cosLat = Math.cos((rawLat * Math.PI) / 180);
  const offsetDegLng = (Math.sin(laneAngleRad) * laneOffsetMeters) / (111111 * Math.max(0.001, cosLat));

  return {
    lat: rawLat + offsetDegLat,
    lng: rawLng + offsetDegLng,
    heading,
    rawLat,
    rawLng,
    segmentIndex: idx,
  };
};

/**
 * Generates instant, high-resolution realistic city road coordinates (Zero Latency)
 * Uses cubic Bezier splines through simulated city intersections and avenues
 */
export const generateRoadRoute = (startCoord, endCoord) => {
  if (!startCoord || !endCoord || !startCoord[0] || !endCoord[0]) {
    return { points: [], distanceKm: 0, durationMins: 0 };
  }

  const [lat1, lng1] = startCoord;
  const [lat2, lng2] = endCoord;

  // Real distance in km (with circuity factor of 1.28 for city road turns)
  const dLat = (lat2 - lat1) * 111;
  const dLng = (lng2 - lng1) * 111 * Math.cos(((lat1 + lat2) / 2) * (Math.PI / 180));
  const directDist = Math.sqrt(dLat * dLat + dLng * dLng);
  const distanceKm = Math.round(Math.max(1.2, directDist * 1.28) * 10) / 10;
  const durationMins = Math.max(2, Math.round(distanceKm * 2.2));

  // Intermediate turning points to mimic city road grid
  const midLat1 = lat1 + (lat2 - lat1) * 0.35 + (lng2 - lng1) * 0.12;
  const midLng1 = lng1 + (lng2 - lng1) * 0.28 - (lat2 - lat1) * 0.10;

  const midLat2 = lat1 + (lat2 - lat1) * 0.70 - (lng2 - lng1) * 0.08;
  const midLng2 = lng1 + (lng2 - lng1) * 0.75 + (lat2 - lat1) * 0.06;

  // Spline interpolation: 60 smooth road steps
  const points = [];
  const numSegments = 60;

  for (let i = 0; i <= numSegments; i++) {
    const t = i / numSegments;
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    const lat = uuu * lat1 + 3 * uu * t * midLat1 + 3 * u * tt * midLat2 + ttt * lat2;
    const lng = uuu * lng1 + 3 * uu * t * midLng1 + 3 * u * tt * midLng2 + ttt * lng2;

    points.push([lat, lng]);
  }

  return { points, distanceKm, durationMins };
};

/**
 * Fetch road route with instant synchronous fallback so animation is NEVER delayed
 */
export const fetchRoadRoute = async (startCoord, endCoord) => {
  // Always compute instant route first
  const fallback = generateRoadRoute(startCoord, endCoord);
  if (!startCoord || !endCoord || !startCoord[0] || !endCoord[0]) {
    return fallback;
  }

  const cacheKey = `${startCoord[0].toFixed(4)},${startCoord[1].toFixed(4)}-${endCoord[0].toFixed(4)},${endCoord[1].toFixed(4)}`;
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey);
  }

  // Attempt OSRM in non-blocking manner with 2-second timeout
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startCoord[1]},${startCoord[0]};${endCoord[1]},${endCoord[0]}?overview=full&geometries=geojson`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const rawCoords = data.routes[0].geometry.coordinates;
        const points = rawCoords.map(([lng, lat]) => [lat, lng]);
        const distanceKm = Math.round((data.routes[0].distance / 1000) * 10) / 10;
        const durationMins = Math.max(1, Math.round(data.routes[0].duration / 60));

        const result = { points, distanceKm, durationMins };
        routeCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (e) {
    // Graceful fallback to instant spline
  }

  routeCache.set(cacheKey, fallback);
  return fallback;
};

/**
 * Visual configuration for Rapido & Uber vehicle modalities
 */
export const getVehicleVisuals = (category = 'BIKE') => {
  switch (category) {
    case 'BIKE':
      return {
        emoji: '🏍️',
        label: 'Rapido Bike',
        bg: 'bg-amber-400',
        ring: 'ring-amber-400/50',
        border: 'border-amber-500',
        text: 'text-amber-950',
      };
    case 'AUTO':
      return {
        emoji: '🛺',
        label: 'Auto Rickshaw',
        bg: 'bg-emerald-500',
        ring: 'ring-emerald-500/50',
        border: 'border-emerald-600',
        text: 'text-white',
      };
    case 'TROLLEY_PORTER':
      return {
        emoji: '🛻',
        label: 'Porter Cargo',
        bg: 'bg-purple-600',
        ring: 'ring-purple-600/50',
        border: 'border-purple-700',
        text: 'text-white',
      };
    default:
      return {
        emoji: '🚗',
        label: 'Cab',
        bg: 'bg-blue-600',
        ring: 'ring-blue-600/50',
        border: 'border-blue-700',
        text: 'text-white',
      };
  }
};
