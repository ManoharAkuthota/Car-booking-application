import React from 'react';
import BikeVehicle from '../vehicles/BikeVehicle';
import AutoVehicle from '../vehicles/AutoVehicle';
import CabVehicle from '../vehicles/CabVehicle';
import PorterVehicle from '../vehicles/PorterVehicle';

/**
 * AnimatedVehicle Component
 * Positions and smoothly rotates the specific vehicle along the SVG route path.
 * Renders appropriate vector graphic according to selected ride type.
 */
const AnimatedVehicle = ({
  x = 0,
  y = 0,
  rotation = 0,
  selectedRideKey = 'bike',
  isMoving = false,
  speedKmh = 35,
  isArrived = false,
  pilotName = 'Rajesh Kumar',
}) => {
  // Select the appropriate vector vehicle
  const renderVehicleGraphic = () => {
    switch (selectedRideKey) {
      case 'bike':
        return <BikeVehicle isMoving={isMoving} speedKmh={speedKmh} />;
      case 'auto':
        return <AutoVehicle isMoving={isMoving} speedKmh={speedKmh} />;
      case 'cab':
        return <CabVehicle isMoving={isMoving} speedKmh={speedKmh} />;
      case 'porter':
        return <PorterVehicle isMoving={isMoving} speedKmh={speedKmh} />;
      default:
        return <BikeVehicle isMoving={isMoving} speedKmh={speedKmh} />;
    }
  };

  return (
    <g
      className="animated-vehicle-layer pointer-events-none select-none transition-transform duration-75 ease-linear"
      transform={`translate(${x}, ${y})`}
    >
      {/* Vehicle Vector Graphic with Rotational Tangent Alignment */}
      <g transform={`rotate(${rotation})`}>
        {/* Render HTML Vector Component via foreignObject centered at (0, 0) */}
        <foreignObject x="-27" y="-27" width="54" height="54">
          <div className="w-full h-full flex items-center justify-center">
            {renderVehicleGraphic()}
          </div>
        </foreignObject>
      </g>

      {/* Floating Arrival Indicator / Pilot Tag */}
      {isArrived ? (
        <g transform="translate(0, -38)">
          <rect
            x="-44"
            y="-12"
            width="88"
            height="22"
            rx="11"
            fill="#10b981"
            stroke="#ffffff"
            strokeWidth="1.5"
            className="drop-shadow-lg"
          />
          <text
            x="0"
            y="2"
            fill="#ffffff"
            fontSize="10"
            fontWeight="900"
            textAnchor="middle"
            dominantBaseline="middle"
            letterSpacing="0.4"
          >
            ✓ ARRIVED
          </text>
        </g>
      ) : isMoving ? (
        <g transform="translate(0, -34)">
          <rect
            x="-32"
            y="-10"
            width="64"
            height="18"
            rx="9"
            fill="#18181b"
            stroke="#ffffff"
            strokeWidth="1"
            className="drop-shadow-sm opacity-90"
          />
          <text
            x="0"
            y="1"
            fill="#ffffff"
            fontSize="9"
            fontWeight="800"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {speedKmh > 0 ? `${speedKmh} km/h` : 'Starting...'}
          </text>
        </g>
      ) : null}
    </g>
  );
};

export default AnimatedVehicle;
