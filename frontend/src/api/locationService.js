// Location search, geocoding and reverse geocoding service for DrivePulse (Rapido & Uber style)

export const DEFAULT_PRESET_LOCATIONS = [
  {
    name: 'Vidhana Soudha, Bengaluru',
    area: 'Ambedkar Veedhi, Bengaluru',
    lat: 12.9797,
    lng: 77.5907,
    type: 'landmark',
  },
  {
    name: 'Swami Vivekananda Road Metro',
    area: 'Indiranagar, Bengaluru',
    lat: 12.9860,
    lng: 77.6433,
    type: 'metro',
  },
  {
    name: 'Indiranagar 100ft Rd',
    area: 'Central Bengaluru',
    lat: 12.9784,
    lng: 77.6408,
    type: 'locality',
  },
  {
    name: 'Kempegowda International Airport (BLR)',
    area: 'Devanahalli, Bengaluru',
    lat: 13.1986,
    lng: 77.7066,
    type: 'airport',
  },
  {
    name: 'MG Road Metro Station',
    area: 'CBD, Bengaluru',
    lat: 12.9756,
    lng: 77.6066,
    type: 'metro',
  },
  {
    name: 'Koramangala 5th Block',
    area: 'Startup Hub, Bengaluru',
    lat: 12.9352,
    lng: 77.6245,
    type: 'locality',
  },
  {
    name: 'Electronic City Phase 1',
    area: 'South Tech Hub, Bengaluru',
    lat: 12.8452,
    lng: 77.6602,
    type: 'tech_park',
  },
  {
    name: 'Whitefield ITPL Tech Park',
    area: 'East Tech Hub, Bengaluru',
    lat: 12.9866,
    lng: 77.7382,
    type: 'tech_park',
  },
  {
    name: 'KSR Bengaluru Railway Station (Majestic)',
    area: 'Central City, Bengaluru',
    lat: 12.9781,
    lng: 77.5695,
    type: 'transit',
  },
  {
    name: 'HSR Layout Sector 1',
    area: 'Agara Lake, Bengaluru',
    lat: 12.9116,
    lng: 77.6389,
    type: 'locality',
  },
  {
    name: 'Jayanagar 4th Block',
    area: 'South Bengaluru',
    lat: 12.9299,
    lng: 77.5834,
    type: 'locality',
  },
];

// Simple in-memory search cache to prevent redundant network calls
const cache = new Map();

/**
 * Searches places and addresses dynamically using Photon (OSM) with Nominatim fallback
 * @param {string} query Search term
 * @param {number} [userLat] Optional user latitude for biasing results
 * @param {number} [userLng] Optional user longitude for biasing results
 * @returns {Promise<Array>} List of location objects
 */
export async function searchLocations(query, userLat = 12.9716, userLng = 77.5946) {
  if (!query || query.trim().length < 2) {
    return DEFAULT_PRESET_LOCATIONS.slice(0, 5);
  }

  const cleanQuery = query.trim();
  const cacheKey = `search_${cleanQuery.toLowerCase()}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  // 1. Check local preset matches first
  const localMatches = DEFAULT_PRESET_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(cleanQuery.toLowerCase()) ||
      loc.area.toLowerCase().includes(cleanQuery.toLowerCase())
  );

  try {
    // 2. Query Photon API (Free, fast autocomplete backed by OpenStreetMap)
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&lat=${userLat}&lon=${userLng}&limit=6`;
    const res = await fetch(photonUrl);

    if (res.ok) {
      const data = await res.json();
      if (data && data.features && data.features.length > 0) {
        const results = data.features.map((f) => {
          const p = f.properties;
          const coords = f.geometry.coordinates; // [lng, lat]
          const name = p.name || cleanQuery;
          const parts = [p.street, p.district, p.city || p.town || p.county, p.state].filter(Boolean);
          const area = parts.join(', ') || 'Bengaluru, India';

          return {
            name,
            area,
            lat: coords[1],
            lng: coords[0],
            type: p.osm_value || 'address',
          };
        });

        // Merge local presets and api results, removing exact duplicate names
        const merged = [...localMatches];
        for (const item of results) {
          if (!merged.some((m) => m.name.toLowerCase() === item.name.toLowerCase())) {
            merged.push(item);
          }
        }

        const finalResults = merged.slice(0, 6);
        cache.set(cacheKey, finalResults);
        return finalResults;
      }
    }
  } catch (err) {
    console.warn("Photon autocomplete fallback:", err.message);
  }

  // 3. Fallback to Nominatim if Photon returned no items
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      cleanQuery
    )}&format=json&limit=5&addressdetails=1`;
    const nomRes = await fetch(nomUrl, {
      headers: { 'User-Agent': 'DrivePulse-Mobility-App/1.0' },
    });

    if (nomRes.ok) {
      const nomData = await nomRes.json();
      if (Array.isArray(nomData) && nomData.length > 0) {
        const nomResults = nomData.map((item) => {
          const parts = (item.display_name || '').split(',');
          const name = parts[0] || cleanQuery;
          const area = parts.slice(1, 4).join(', ').trim() || 'India';
          return {
            name,
            area,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            type: item.type || 'place',
          };
        });

        const combined = [...localMatches, ...nomResults].slice(0, 6);
        cache.set(cacheKey, combined);
        return combined;
      }
    }
  } catch (e) {
    console.warn("Nominatim fallback warning:", e.message);
  }

  return localMatches.length > 0 ? localMatches : DEFAULT_PRESET_LOCATIONS.slice(0, 4);
}

/**
 * Reverse geocodes latitude and longitude into human-readable street & locality name
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<{ name: string, area: string, lat: number, lng: number }>}
 */
export async function reverseGeocode(lat, lng) {
  const cacheKey = `rev_${lat.toFixed(4)}_${lng.toFixed(4)}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'DrivePulse-Mobility-App/1.0' },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const a = data.address;
        const name =
          a.road ||
          a.neighbourhood ||
          a.suburb ||
          a.residential ||
          a.commercial ||
          a.building ||
          data.name ||
          'Current Location';

        const areaParts = [a.suburb || a.city_district, a.city || a.town || a.county, a.state].filter(Boolean);
        const area = areaParts.join(', ') || 'Bengaluru, Karnataka';

        const result = {
          name: name,
          area: area,
          lat: lat,
          lng: lng,
          isLive: true,
        };
        cache.set(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    console.warn("Reverse geocode failed:", err.message);
  }

  // Graceful fallback based on coordinates
  return {
    name: '📍 My Current Location',
    area: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
    lat: lat,
    lng: lng,
    isLive: true,
  };
}
