import React from 'react';

/**
 * Premium SVG Vector Modern Cab / Sedan Marker
 * Sleek top-down view with aerodynamic hood, curved tinted windshields,
 * side mirrors, twin front headlights, and soft ground shadow.
 */
const CabVehicle = ({ isMoving = true, speedKmh = 36 }) => {
  return (
    <div className="relative flex items-center justify-center pointer-events-none select-none">
      {/* Front Headlight Beams */}
      {isMoving && (
        <div
          className="absolute -top-8 w-9 h-11 bg-gradient-to-t from-blue-200/40 via-blue-100/20 to-transparent rounded-full blur-[1px] transform -translate-x-1/2 left-1/2 pointer-events-none animate-pulse"
          style={{ clipPath: 'polygon(15% 100%, 85% 100%, 100% 0%, 0% 0%)' }}
        />
      )}

      {/* Ground Vehicle Shadow */}
      <div className="absolute top-2 w-11 h-6 bg-black/40 rounded-full blur-[2.5px] transform scale-y-80" />

      {/* Cab SVG Graphic */}
      <svg
        width="46"
        height="46"
        viewBox="0 0 54 54"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative drop-shadow-lg"
      >
        {/* 4 Tires (Wheels) */}
        <rect x="7" y="10" width="5" height="9" rx="2" fill="#18181b" />
        <rect x="42" y="10" width="5" height="9" rx="2" fill="#18181b" />
        <rect x="7" y="35" width="5" height="9" rx="2" fill="#18181b" />
        <rect x="42" y="35" width="5" height="9" rx="2" fill="#18181b" />

        {/* Car Main Body (Crisp White / Silver with Blue Accents) */}
        <path
          d="M17 5 Q27 3 37 5 Q42 12 43 25 Q43 38 41 49 Q27 52 13 49 Q11 38 11 25 Q12 12 17 5 Z"
          fill="#f8fafc"
          stroke="#0284c7"
          strokeWidth="1.2"
        />

        {/* Front Hood Contours */}
        <path d="M19 13 Q27 15 35 13" stroke="#cbd5e1" strokeWidth="1" fill="none" />

        {/* Front Windshield (Tinted Cyan/Slate Glass) */}
        <path
          d="M16 15 Q27 13 38 15 L36 24 Q27 23 18 24 Z"
          fill="#38bdf8"
          fillOpacity="0.85"
          stroke="#0284c7"
          strokeWidth="0.8"
        />

        {/* Roof Area */}
        <rect x="18" y="23" width="18" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
        
        {/* Taxi / Cab Roof Signboard */}
        <rect x="23" y="27" width="8" height="3" rx="1.5" fill="#f59e0b" stroke="#d97706" strokeWidth="0.6" />

        {/* Rear Windshield */}
        <path
          d="M18 38 Q27 37 36 38 L38 44 Q27 45 16 44 Z"
          fill="#38bdf8"
          fillOpacity="0.85"
          stroke="#0284c7"
          strokeWidth="0.8"
        />

        {/* Side Mirrors */}
        <rect x="9" y="16" width="3" height="4" rx="1.5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.6" />
        <rect x="42" y="16" width="3" height="4" rx="1.5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.6" />

        {/* Headlight Lenses */}
        <ellipse cx="16" cy="6" rx="2.5" ry="1.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.6" />
        <ellipse cx="38" cy="6" rx="2.5" ry="1.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.6" />

        {/* Rear Red Brake Lamps */}
        <rect x="15" y="48" width="4" height="2" rx="1" fill="#ef4444" />
        <rect x="35" y="48" width="4" height="2" rx="1" fill="#ef4444" />
      </svg>
    </div>
  );
};

export default CabVehicle;
