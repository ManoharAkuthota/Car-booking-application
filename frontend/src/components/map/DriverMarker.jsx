import React from 'react';

/**
 * Driver Starting Location Marker
 * Indicates pilot location before journey begins and fades gracefully as vehicle departs.
 */
const DriverMarker = ({
  x = 140,
  y = 90,
  isDeparted = false,
  accentColor = '#f59e0b',
  vehicleEmoji = '🏍️',
}) => {
  return (
    <g
      className={`driver-marker pointer-events-none select-none transition-opacity duration-700 ${
        isDeparted ? 'opacity-30' : 'opacity-100'
      }`}
      transform={`translate(${x}, ${y})`}
    >
      {/* 1. Pulsing Starting Beacon */}
      {!isDeparted && (
        <circle
          cx="0"
          cy="0"
          r="22"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.5"
          className="animate-ping opacity-60"
        />
      )}

      {/* Ground Shadow */}
      <ellipse cx="0" cy="5" rx="10" ry="4" fill="rgba(0, 0, 0, 0.2)" />

      {/* Base Starting Hub Dot */}
      <circle cx="0" cy="0" r="10" fill="#ffffff" stroke={accentColor} strokeWidth="3" className="drop-shadow-sm" />
      <circle cx="0" cy="0" r="4" fill={accentColor} />

      {/* Floating Driver Label */}
      {!isDeparted && (
        <g transform="translate(0, -22)">
          <rect
            x="-26"
            y="-10"
            width="52"
            height="18"
            rx="9"
            fill="#ffffff"
            stroke="#e2e8f0"
            strokeWidth="1"
            className="drop-shadow-sm"
          />
          <text
            x="0"
            y="2"
            fill="#0f172a"
            fontSize="9"
            fontWeight="800"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {vehicleEmoji} Driver
          </text>
        </g>
      )}
    </g>
  );
};

export default DriverMarker;
