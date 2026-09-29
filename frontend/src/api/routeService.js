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
  if (lat1 === lat2 && lon1 === lon2) return 0;
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
