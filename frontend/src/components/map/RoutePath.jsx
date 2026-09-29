import React, { useEffect, useState } from 'react';

/**
 * RoutePath Component
 * Renders the realistic curved SVG route between driver start and customer pickup.
 * Features:
 * - Background street lane route
 * - Progressively highlighted active route synchronized with vehicle movement
 * - Glowing checkpoint waypoints
 */
const RoutePath = ({
  pathRef,
  pathD,
  progress = 0,
  accentColor = '#f59e0b',
  isDarkMode = false,
}) => {
  const [totalLength, setTotalLength] = useState(1000);

  useEffect(() => {
    if (pathRef.current) {
      try {
        const len = pathRef.current.getTotalLength();
        if (len && !isNaN(len)) {
          setTotalLength(Math.round(len));
        }
      } catch (err) {}
    }
  }, [pathRef, pathD]);

  // Dashoffset calculation: reveals route behind vehicle as progress increases (0 -> 1)
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = totalLength * (1 - clampedProgress);

  return (
    <g className="route-layer pointer-events-none select-none">
      {/* 1. Underlying Route Corridor / Road Footprint */}
      <path
        d={pathD}
        fill="none"
        stroke={isDarkMode ? '#1e293b' : '#cbd5e1'}
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />

      {/* 2. Route Soft Ambient Glow */}
      <path
        d={pathD}
        fill="none"
        stroke={accentColor}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={isDarkMode ? '0.25' : '0.2'}
        strokeDasharray={totalLength}
        strokeDashoffset={strokeDashoffset}
        className="transition-all duration-75 ease-linear"
      />

      {/* 3. Master Reference Path (Hidden element used for math calculations) */}
      <path
        ref={pathRef}
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth="1"
      />

      {/* 4. Active Progressively Highlighted Route (Follows vehicle exactly) */}
      <path
        d={pathD}
        fill="none"
        stroke={accentColor}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={totalLength}
        strokeDashoffset={strokeDashoffset}
        className="transition-all duration-75 ease-linear drop-shadow-sm"
      />

      {/* 5. Inactive Remaining Route (Dashed preview line ahead of vehicle) */}
      <path
        d={pathD}
        fill="none"
        stroke={isDarkMode ? '#64748b' : '#94a3b8'}
        strokeWidth="2.5"
        strokeDasharray="4 6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />

      {/* 6. Waypoint Checkpoint Rings */}
      <g fill={accentColor} opacity="0.6">
        <circle cx="290" cy="140" r="3.5" fillOpacity="0.4" />
        <circle cx="390" cy="290" r="3.5" fillOpacity="0.4" />
        <circle cx="520" cy="380" r="3.5" fillOpacity="0.4" />
        <circle cx="440" cy="600" r="3.5" fillOpacity="0.4" />
      </g>
    </g>
  );
};

export default RoutePath;
