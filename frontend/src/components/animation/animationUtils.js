/**
 * Mathematical & Interpolation Utilities for Realistic Vehicle Motion
 */

/**
 * Linear interpolation between two numbers
 */
export const lerp = (start, end, t) => {
  return start + (end - start) * Math.min(Math.max(t, 0), 1);
};

/**
 * Shortest angular distance interpolation (handles 0-360 wrap-around gracefully)
 * Prevents vehicle from doing a full 350-degree reverse spin when crossing the 0° mark.
 */
export const lerpAngle = (startAngle, endAngle, t) => {
  const diff = ((((endAngle - startAngle) % 360) + 540) % 360) - 180;
  return startAngle + diff * Math.min(Math.max(t, 0), 1);
};

/**
 * Clamp a value between min and max
 */
export const clamp = (val, min, max) => {
  return Math.min(Math.max(val, min), max);
};

/**
 * Cubic Bezier easing for realistic vehicle acceleration and deceleration
 * Acceleration at start, cruising in mid-journey, smooth deceleration near arrival.
 */
export const easeInOutCubic = (t) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

/**
 * Smooth ease-out for arrival slowdown
 */
export const easeOutQuad = (t) => {
  return 1 - (1 - t) * (1 - t);
};

/**
 * Format dynamic distance string
 * Example: 2.4 km, 850 m, Arrived
 */
export const formatDistance = (distanceKm) => {
  if (distanceKm <= 0.05) return 'Arrived';
  if (distanceKm < 1.0) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
};

/**
 * Format dynamic ETA string
 * Example: 5 min, 1 min, Arriving, Arrived
 */
export const formatETA = (minsRemaining, isArrived = false) => {
  if (isArrived) return 'Arrived';
  if (minsRemaining <= 0) return 'Arriving now';
  if (minsRemaining === 1) return '1 min away';
  return `${Math.ceil(minsRemaining)} mins away`;
};
