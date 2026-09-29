import React from 'react';

/**
 * Premium SVG Vector Auto Rickshaw Marker
 * Authentic Indian 3-wheeler top-down view with characteristic yellow canopy,
 * tapered front wheel, passenger cabin, and twin headlights.
 */
const AutoVehicle = ({ isMoving = true, speedKmh = 28 }) => {
  return (
    <div className="relative flex items-center justify-center pointer-events-none select-none">
      {/* Twin Headlight Beams */}
      {isMoving && (
        <div
          className="absolute -top-7 w-8 h-9 bg-gradient-to-t from-emerald-300/30 via-amber-200/20 to-transparent rounded-full blur-[1px] transform -translate-x-1/2 left-1/2 pointer-events-none animate-pulse"
          style={{ clipPath: 'polygon(20% 100%, 80% 100%, 100% 0%, 0% 0%)' }}
        />
      )}

      {/* Ground Chassis Shadow */}
      <div className="absolute top-2 w-10 h-6 bg-black/35 rounded-full blur-[2px] transform scale-y-80" />

      {/* Auto Rickshaw SVG Graphic */}
      <svg
        width="44"
        height="44"
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative drop-shadow-md"
      >
        {/* Rear Wheels Left & Right */}
        <rect x="7" y="34" width="5" height="10" rx="2" fill="#18181b" />
        <rect x="40" y="34" width="5" height="10" rx="2" fill="#18181b" />

        {/* Front Single Wheel */}
        <rect x="24" y="2" width="4" height="9" rx="2" fill="#18181b" />
        {/* Front Mudguard */}
        <path d="M22 6 Q26 3 30 6 L30 11 L22 11 Z" fill="#047857" />

        {/* Lower Main Body (Classic Green or Black Base) */}
        <path
          d="M26 10 L38 20 L40 43 Q26 46 12 43 L14 20 Z"
          fill="#065f46"
          stroke="#047857"
          strokeWidth="1.2"
        />

        {/* Front Windshield Glass */}
        <path
          d="M22 13 L30 13 L33 19 L19 19 Z"
          fill="#bae6fd"
          stroke="#0284c7"
          strokeWidth="0.8"
        />
        {/* Wiper */}
        <line x1="26" y1="18" x2="29" y2="15" stroke="#334155" strokeWidth="1" strokeLinecap="round" />

        {/* Driver Area */}
        <ellipse cx="26" cy="22" rx="4.5" ry="3.5" fill="#1e293b" />
        {/* Driver Cap / Helmet */}
        <circle cx="26" cy="21" r="3.5" fill="#f59e0b" stroke="#d97706" strokeWidth="0.8" />

        {/* Iconic Bright Yellow Canopy Roof */}
        <path
          d="M17 19 Q26 16 35 19 L37 40 Q26 42 15 40 Z"
          fill="#fbbf24"
          stroke="#d97706"
          strokeWidth="1.2"
        />

        {/* Signature White Star on Roof (Exact Rapido Accent) */}
        <g transform="translate(26, 30)">
          <circle cx="0" cy="0" r="5.5" fill="#d97706" fillOpacity="0.4" />
          <path d="M 0 -4 L 1.2 -1.3 L 4 -1.3 L 1.8 0.4 L 2.6 3.2 L 0 1.6 L -2.6 3.2 L -1.8 0.4 L -4 -1.3 L -1.2 -1.3 Z" fill="#ffffff" />
        </g>

        {/* Roof Beading & Rib Lines */}
        <path d="M19 25 Q26 23 33 25" stroke="#f59e0b" strokeWidth="1" fill="none" />
        <path d="M18 32 Q26 30 34 32" stroke="#f59e0b" strokeWidth="1" fill="none" />

        {/* Twin Headlight Lamps */}
        <circle cx="21" cy="9" r="1.8" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.6" />
        <circle cx="31" cy="9" r="1.8" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.6" />

        {/* Rear Bumper & Tail-lamps */}
        <rect x="13" y="42" width="26" height="2" rx="1" fill="#334155" />
        <circle cx="15" cy="42" r="1.5" fill="#ef4444" />
        <circle cx="37" cy="42" r="1.5" fill="#ef4444" />
      </svg>
    </div>
  );
};

export default AutoVehicle;
