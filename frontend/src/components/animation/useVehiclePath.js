import { useState, useEffect, useRef } from 'react';
import { lerpAngle } from './animationUtils';

/**
 * Hook to calculate vehicle position (x, y) and smooth tangent orientation (heading)
 * along an SVG path based on normalized progress (0.0 to 1.0).
 *
 * Uses native SVGPathElement.getPointAtLength() for exact pixel precision.
 */
export const useVehiclePath = (pathRef, progress = 0) => {
  const [transform, setTransform] = useState({
    x: 0,
    y: 0,
    rotation: 0,
    totalLength: 0,
    currentDist: 0,
  });

  const lastRotationRef = useRef(0);

  useEffect(() => {
    const pathEl = pathRef.current;
    if (!pathEl) return;

    try {
      const totalLen = pathEl.getTotalLength();
      if (!totalLen || isNaN(totalLen)) return;

      const clampedProgress = Math.min(Math.max(progress, 0), 1);
      const currentDist = clampedProgress * totalLen;

      // Sample current position
      const ptCurrent = pathEl.getPointAtLength(currentDist);

      // Sample a forward point along the tangent to determine facing angle
      const lookahead = 4; // 4px forward for smooth orientation vector
      let dx = 0;
      let dy = 0;

      if (currentDist + lookahead <= totalLen) {
        const ptAhead = pathEl.getPointAtLength(currentDist + lookahead);
        dx = ptAhead.x - ptCurrent.x;
        dy = ptAhead.y - ptCurrent.y;
      } else {
        // At the very end of the route, sample backward vector to maintain finish orientation
        const ptBehind = pathEl.getPointAtLength(Math.max(0, currentDist - lookahead));
        dx = ptCurrent.x - ptBehind.x;
        dy = ptCurrent.y - ptBehind.y;
      }

      // Compute exact mathematical heading in degrees (-180 to 180)
      let rawAngle = Math.atan2(dy, dx) * (180 / Math.PI);

      // Smoothly interpolate rotation to eliminate any sudden jitter on sharp turns
      const smoothedRotation = lerpAngle(lastRotationRef.current, rawAngle, 0.35);
      lastRotationRef.current = smoothedRotation;

      setTransform({
        x: ptCurrent.x,
        y: ptCurrent.y,
        rotation: Math.round(smoothedRotation * 10) / 10,
        totalLength: Math.round(totalLen),
        currentDist: Math.round(currentDist),
      });
    } catch (err) {
      // In case SVG is mounting or detached
    }
  }, [pathRef, progress]);

  return transform;
};

export default useVehiclePath;
