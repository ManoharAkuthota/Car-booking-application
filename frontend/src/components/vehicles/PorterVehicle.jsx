import React from 'react';

/**
 * Premium SVG Vector Porter / Mini-Truck Marker
 * Authentic cargo vehicle top-down view with driver cabin,
 * rear payload bed with freight packages, heavy tires, and dual headlights.
 */
const PorterVehicle = ({ isMoving = true, speedKmh = 25 }) => {
  return (
    <div className="relative flex items-center justify-center pointer-events-none select-none">
      {/* Headlight Beams */}
      {isMoving && (
        <div
          className="absolute -top-7 w-8 h-9 bg-gradient-to-t from-purple-200/35 via-amber-100/20 to-transparent rounded-full blur-[1px] transform -translate-x-1/2 left-1/2 pointer-events-none animate-pulse"
          style={{ clipPath: 'polygon(15% 100%, 85% 100%, 100% 0%, 0% 0%)' }}
        />
      )}

      {/* Sturdy Heavy Chassis Shadow */}
      <div className="absolute top-2 w-11 h-7 bg-black/45 rounded-full blur-[2.5px] transform scale-y-85" />

      {/* Porter Mini-Truck SVG Graphic */}
      <svg
        width="46"
        height="48"
        viewBox="0 0 54 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative drop-shadow-lg"
      >
        {/* Front & Dual Rear Tires */}
        <rect x="6" y="9" width="5" height="9" rx="2" fill="#18181b" />
        <rect x="43" y="9" width="5" height="9" rx="2" fill="#18181b" />
        {/* Heavy Rear Tires */}
        <rect x="5" y="38" width="6" height="11" rx="2" fill="#18181b" />
        <rect x="43" y="38" width="6" height="11" rx="2" fill="#18181b" />

        {/* FRONT DRIVER CABIN (Blue/White Industrial Finish) */}
        <path
          d="M14 4 Q27 2 40 4 Q44 9 44 20 L10 20 Q10 9 14 4 Z"
          fill="#3b82f6"
          stroke="#1d4ed8"
          strokeWidth="1.2"
        />

        {/* Front Windshield */}
        <path
          d="M15 6 Q27 5 39 6 L37 14 Q27 13 17 14 Z"
          fill="#bae6fd"
          stroke="#0284c7"
          strokeWidth="0.8"
        />

        {/* Cabin Roof */}
        <rect x="15" y="14" width="24" height="6" rx="2" fill="#2563eb" />

        {/* Side Mirrors */}
        <rect x="7" y="12" width="4" height="3" rx="1.5" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.6" />
        <rect x="43" y="12" width="4" height="3" rx="1.5" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.6" />

        {/* Headlight Lamps */}
        <circle cx="15" cy="5" r="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.6" />
        <circle cx="39" cy="5" r="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.6" />

        {/* REAR CARGO BED (Tata Ace Style Payload Container) */}
        <rect
          x="10"
          y="22"
          width="34"
          height="30"
          rx="2.5"
          fill="#f1f5f9"
          stroke="#94a3b8"
          strokeWidth="1.2"
        />

        {/* Cargo Straps / Payload Railings */}
        <line x1="10" y1="32" x2="44" y2="32" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="10" y1="42" x2="44" y2="42" stroke="#cbd5e1" strokeWidth="1" />

        {/* Strapped Cargo Packages / Boxes (Brown cardboard cartons) */}
        <rect x="13" y="25" width="12" height="12" rx="1" fill="#d97706" stroke="#b45309" strokeWidth="0.8" />
        <line x1="13" y1="31" x2="25" y2="31" stroke="#fef3c7" strokeWidth="0.8" />
        
        <rect x="27" y="27" width="14" height="10" rx="1" fill="#b45309" stroke="#92400e" strokeWidth="0.8" />
        <line x1="34" y1="27" x2="34" y2="37" stroke="#fef3c7" strokeWidth="0.8" />

        <rect x="16" y="39" width="22" height="10" rx="1" fill="#f59e0b" stroke="#d97706" strokeWidth="0.8" />
        <line x1="27" y1="39" x2="27" y2="49" stroke="#fef3c7" strokeWidth="0.8" />

        {/* Rear Red Reflector Strip */}
        <rect x="12" y="52" width="30" height="2" rx="1" fill="#ef4444" />
      </svg>
    </div>
  );
};

export default PorterVehicle;
