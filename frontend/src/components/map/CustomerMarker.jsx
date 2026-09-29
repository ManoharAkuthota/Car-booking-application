import React from 'react';

/**
 * Premium SVG Customer Pickup Marker
 * Features expanding circular sonar pulse, central emerald pin,
 * "You" floating badge, and realistic ground shadow.
 */
const CustomerMarker = ({ x = 460, y = 740, isArrived = false, isNearby = false }) => {
  return (
    <g
      className="customer-marker pointer-events-none select-none"
      transform={`translate(${x}, ${y})`}
    >
      {/* 1. CONTINUOUS EXPANDING SONAR RIPPLE RINGS */}
      {/* Outer Pulse Ring */}
      <circle
        cx="0"
        cy="0"
        r="28"
        fill="none"
        stroke="#10b981"
        strokeWidth="1.5"
        className={isArrived ? 'animate-ping opacity-75' : 'animate-ping opacity-40'}
        style={{ animationDuration: isArrived ? '1.2s' : '2.2s' }}
      />

      {/* Middle Pulse Ring */}
      <circle
        cx="0"
        cy="0"
        r="18"
        fill="#10b981"
        fillOpacity={isArrived ? '0.25' : '0.15'}
        stroke="#059669"
        strokeWidth="1.2"
        className={isNearby || isArrived ? 'animate-pulse' : ''}
      />

      {/* Ground Contact Shadow */}
      <ellipse cx="0" cy="8" rx="10" ry="4" fill="rgba(0, 0, 0, 0.25)" />

      {/* 2. CUSTOM LOCATION PIN */}
      {/* Pin Body */}
      <path
        d="M 0 0 C -9 -10 -9 -24 0 -30 C 9 -24 9 -10 0 0 Z"
        fill="#10b981"
        stroke="#ffffff"
        strokeWidth="2"
        className="drop-shadow-md"
      />

      {/* Inner White Core Dot */}
      <circle cx="0" cy="-19" r="4" fill="#ffffff" />
      <circle cx="0" cy="-19" r="2" fill="#047857" />

      {/* 3. "YOU" / PICKUP FLOATING BADGE */}
      <g transform="translate(0, -42)">
        <rect
          x="-22"
          y="-12"
          width="44"
          height="18"
          rx="9"
          fill="#18181b"
          stroke="#ffffff"
          strokeWidth="1.2"
          className="drop-shadow-sm"
        />
        <text
          x="0"
          y="1"
          fill="#ffffff"
          fontSize="9.5"
          fontWeight="800"
          textAnchor="middle"
          dominantBaseline="middle"
          letterSpacing="0.5"
        >
          {isArrived ? 'PICKUP' : 'YOU'}
        </text>
      </g>
    </g>
  );
};

export default CustomerMarker;
