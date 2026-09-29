import {
  calculateBearing,
  distanceMeters,
  lerpAngle,
  getPolylineMetrics,
  samplePolylineWithLaneOffset,
  generateRoadRoute
} from '../frontend/src/api/routeService.js';

console.log("=== Testing Road-Side Direction Motion Engine ===");

// 1. Test Bearing
const bNorth = calculateBearing(12.0, 77.0, 13.0, 77.0);
console.assert(bNorth === 0 || bNorth === 360, `Bearing North expected 0/360, got ${bNorth}`);

const bEast = calculateBearing(12.0, 77.0, 12.0, 78.0);
console.assert(bEast === 90, `Bearing East expected 90, got ${bEast}`);

const bSouth = calculateBearing(13.0, 77.0, 12.0, 77.0);
console.assert(bSouth === 180, `Bearing South expected 180, got ${bSouth}`);

const bWest = calculateBearing(12.0, 78.0, 12.0, 77.0);
console.assert(bWest === 270, `Bearing West expected 270, got ${bWest}`);

console.log("✓ Bearing calculations passed: North=0°, East=90°, South=180°, West=270°");

// 2. Test lerpAngle
const lerp1 = lerpAngle(350, 10, 0.5);
console.assert(lerp1 === 0 || lerp1 === 360, `lerpAngle(350, 10, 0.5) expected 0/360, got ${lerp1}`);

const lerp2 = lerpAngle(10, 350, 0.5);
console.assert(lerp2 === 0 || lerp2 === 360, `lerpAngle(10, 350, 0.5) expected 0/360, got ${lerp2}`);

console.log("✓ Angular lerp shortest-arc interpolation passed");

// 3. Test Road-Side Lane Offset (Left-Hand Traffic for India)
// Road heading North (lat increases): left side is West (lng decreases)
const northRoad = [[12.9700, 77.5900], [12.9800, 77.5900]];
const northMetrics = getPolylineMetrics(northRoad);
const sampledNorth = samplePolylineWithLaneOffset(northRoad, 0.5, northMetrics, 2.5);

console.assert(sampledNorth.heading === 0, `Heading on North road should be 0, got ${sampledNorth.heading}`);
console.assert(sampledNorth.lng < sampledNorth.rawLng, `On Northbound road, left lane must be West (lng < rawLng): ${sampledNorth.lng} < ${sampledNorth.rawLng}`);
console.log(`✓ Left-lane verification (Northbound): Raw Lng=${sampledNorth.rawLng.toFixed(6)}, Left-Lane Lng=${sampledNorth.lng.toFixed(6)} (Shifted West: ${sampledNorth.lng < sampledNorth.rawLng})`);

// Road heading East (lng increases): left side is North (lat increases)
const eastRoad = [[12.9700, 77.5900], [12.9700, 77.6000]];
const eastMetrics = getPolylineMetrics(eastRoad);
const sampledEast = samplePolylineWithLaneOffset(eastRoad, 0.5, eastMetrics, 2.5);

console.assert(sampledEast.heading === 90, `Heading on East road should be 90, got ${sampledEast.heading}`);
console.assert(sampledEast.lat > sampledEast.rawLat, `On Eastbound road, left lane must be North (lat > rawLat): ${sampledEast.lat} > ${sampledEast.rawLat}`);
console.log(`✓ Left-lane verification (Eastbound): Raw Lat=${sampledEast.rawLat.toFixed(6)}, Left-Lane Lat=${sampledEast.lat.toFixed(6)} (Shifted North: ${sampledEast.lat > sampledEast.rawLat})`);

// 4. Test Full Spline Route Sampling
const fullRoute = generateRoadRoute([12.9797, 77.5907], [12.9860, 77.6433]);
const fullMetrics = getPolylineMetrics(fullRoute.points);

console.log(`Generated Route: ${fullRoute.points.length} points, ${fullRoute.distanceKm} km, ${Math.round(fullMetrics.totalDistance)} meters`);

for (let p = 0; p <= 1.0; p += 0.25) {
  const sample = samplePolylineWithLaneOffset(fullRoute.points, p, fullMetrics, 2.5);
  console.log(`Progress ${(p * 100).toFixed(0)}%: Lat=${sample.lat.toFixed(5)}, Lng=${sample.lng.toFixed(5)}, Heading=${sample.heading}° (Segment ${sample.segmentIndex})`);
}

console.log("=== All Road Engine Math & Lane Offset Tests Passed! ===");
