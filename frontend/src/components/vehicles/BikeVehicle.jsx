import React from 'react';

/**
 * Premium SVG Vector Bike / Motorcycle Marker
 * Top-down view with rider helmet, handlebars, headlight beam, and realistic shadow.
 */
const BikeVehicle = ({ isMoving = true, speedKmh = 35 }) => {
  return (
    <div className="relative flex items-center justify-center pointer-events-none select-none">
      {/* Dynamic Headlight Beam Casting Forward */}
      {isMoving && (
        <div
          className="absolute -top-7 w-6 h-9 bg-gradient-to-t from-amber-300/40 via-amber-200/20 to-transparent rounded-full blur-[1px] transform -translate-x-1/2 left-1/2 pointer-events-none animate-pulse"
          style={{ clipPath: 'polygon(25% 100%, 75% 100%, 100% 0%, 0% 0%)' }}
        />
      )}

      {/* Ground Drop Shadow */}
      <div className="absolute top-2 w-9 h-4 bg-black/35 rounded-full blur-[2px] transform scale-y-75" />

      {/* Motorcycle SVG Graphic */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative drop-shadow-md"
      >
        {/* Rear Tire */}
        <rect x="22" y="34" width="4" height="10" rx="2" fill="#18181b" />
        
        {/* Exhaust pipe */}
        <rect x="27" y="30" width="2" height="11" rx="1" fill="#71717a" />
        <rect x="27.5" y="40" width="1" height="2" fill="#d4d4d8" />

        {/* Bike Frame & Seat */}
        <rect x="20" y="20" width="8" height="17" rx="3" fill="#27272a" />
        <rect x="21" y="23" width="6" height="12" rx="2" fill="#3f3f46" />

        {/* Fuel Tank / Rapido Bright Yellow Accents */}
        <ellipse cx="24" cy="18" rx="4.5" ry="6" fill="#f59e0b" />
        <path d="M22 13 L26 13 L25 16 L23 16 Z" fill="#d97706" />

        {/* Handlebars & Mirrors */}
        <path d="M12 12 Q24 15 36 12" stroke="#27272a" strokeWidth="2.5" strokeLinecap="round" />
        {/* Left Grip */}
        <rect x="11" y="10" width="4" height="3" rx="1" fill="#18181b" />
        {/* Right Grip */}
        <rect x="33" y="10" width="4" height="3" rx="1" fill="#18181b" />
        {/* Mirrors */}
        <circle cx="11" cy="9" r="1.5" fill="#a1a1aa" />
        <circle cx="37" cy="9" r="1.5" fill="#a1a1aa" />

        {/* Front Wheel Fork & Tire */}
        <rect x="22" y="2" width="4" height="9" rx="2" fill="#18181b" />

        {/* Headlight Lamp */}
        <circle cx="24" cy="9" r="2.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />

        {/* Rider Torso & Shoulders (Black leather jacket) */}
        <ellipse cx="24" cy="24" rx="6.5" ry="4.5" fill="#18181b" />

        {/* Rider Helmet (Iconic Rapido Yellow Safety Helmet) */}
        <circle cx="24" cy="22" r="5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
        {/* Visor */}
        <path d="M20 20 Q24 18 28 20" stroke="#09090b" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export default BikeVehicle;
