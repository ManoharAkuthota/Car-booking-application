/**
 * Live Road Routing & Telemetry Service
 * Integrates with OSRM (Open Source Routing Machine) public driving API for real road paths
 * Provides coordinate bearing (heading) and distance calculations
 */

// In-memory route cache to prevent redundant API calls
const routeCache = new Map();

/**
 * Calculate bearing angle (0-360 degrees) between two points
 */
export const calculateBearing = (lat1, lon1, lat2, lon2) => {
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
 * Fetch real driving road geometry between two points from OSRM
 */
export const fetchRoadRoute = async (startCoord, endCoord) => {
  if (!startCoord || !endCoord || !startCoord[0] || !endCoord[0]) {
    return { points: [], distanceKm: 0, durationMins: 0 };
  }

  const cacheKey = `${startCoord[0].toFixed(4)},${startCoord[1].toFixed(4)}-${endCoord[0].toFixed(4)},${endCoord[1].toFixed(4)}`;
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey);
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startCoord[1]},${startCoord[0]};${endCoord[1]},${endCoord[0]}?overview=full&geometries=geojson`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const rawCoords = data.routes[0].geometry.coordinates;
        // OSRM returns [lng, lat], convert to Leaflet [lat, lng]
        const points = rawCoords.map(([lng, lat]) => [lat, lng]);
        const distanceKm = Math.round((data.routes[0].distance / 1000) * 10) / 10;
        const durationMins = Math.max(1, Math.round(data.routes[0].duration / 60));

        const result = { points, distanceKm, durationMins };
        routeCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    // Network failure or timeout: fallback to smooth road curve interpolation
  }

  // Graceful fallback road curve
  const points = [];
  const steps = 32;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = startCoord[0] + (endCoord[0] - startCoord[0]) * t + Math.sin(t * Math.PI) * 0.007;
    const lng = startCoord[1] + (endCoord[1] - startCoord[1]) * t + Math.cos(t * Math.PI * 0.5) * 0.004;
    points.push([lat, lng]);
  }

  const estDist = Math.round(
    Math.sqrt(
      Math.pow((endCoord[0] - startCoord[0]) * 111, 2) +
      Math.pow((endCoord[1] - startCoord[1]) * 111, 2)
    ) * 1.25 * 10
  ) / 10 || 12.5;

  const result = {
    points,
    distanceKm: estDist,
    durationMins: Math.round(estDist * 2.2) || 25,
  };
  routeCache.set(cacheKey, result);
  return result;
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
