import React from 'react';
import RoadNetwork from './RoadNetwork';
import RoutePath from './RoutePath';
import CustomerMarker from './CustomerMarker';
import DriverMarker from './DriverMarker';
import AnimatedVehicle from './AnimatedVehicle';
import { Compass, Crosshair, Zap, Activity } from 'lucide-react';

/**
 * RideMap Master SVG Canvas Component
 * 
 * Assembles:
 * - City road network backdrop (streets, parks, buildings, lake)
 * - Dynamic SVG route path with progressive line reveal
 * - Customer pickup marker with sonar ripple wave
 * - Starting driver hub marker with fade-out
 * - Realistic animated vehicle with 60 FPS rotation along the path
 * - Floating HUD telemetry overlay controls
 */
const RideMap = ({
  pathRef,
  rideConfig,
  selectedRideKey = 'bike',
  animationState,
  progress = 0,
  speedKmh = 0,
  isMoving = false,
  isArrived = false,
  isNearby = false,
  transform = { x: 140, y: 90, rotation: 0 },
  isDarkMode = false,
  onRecenter,
}) => {
  return (
    <div className="relative w-full h-full min-h-[460px] lg:min-h-[580px] bg-slate-100 rounded-3xl overflow-hidden shadow-inner border border-gray-200 select-none">
      {/* 1. MASTER SVG CANVAS */}
      <svg
        className="w-full h-full block touch-pan-x touch-pan-y"
        viewBox="0 0 700 850"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* City Road Network Background */}
        <RoadNetwork isDarkMode={isDarkMode} />

        {/* Dynamic Route Path with Progressive Dashoffset Reveal */}
        <RoutePath
          pathRef={pathRef}
          pathD={rideConfig?.routePathD || 'M 140 90 C 180 90, 240 100, 290 140 C 340 180, 360 250, 390 290 C 420 330, 480 340, 520 380 C 560 420, 570 470, 550 510 C 530 550, 470 560, 440 600 C 410 640, 430 700, 460 740'}
          progress={progress}
          accentColor={rideConfig?.accentColor || '#f59e0b'}
          isDarkMode={isDarkMode}
        />

        {/* Starting Driver Hub Marker */}
        <DriverMarker
          x={140}
          y={90}
          isDeparted={progress > 0.04}
          accentColor={rideConfig?.accentColor || '#f59e0b'}
          vehicleEmoji={rideConfig?.symbol || '🏍️'}
        />

        {/* Customer Pickup Location Pin with Sonar Waves */}
        <CustomerMarker
          x={460}
          y={740}
          isArrived={isArrived}
          isNearby={isNearby}
        />

        {/* Smoothly Moving and Rotating Vector Vehicle */}
        <AnimatedVehicle
          x={transform.x || 140}
          y={transform.y || 90}
          rotation={transform.rotation || 0}
          selectedRideKey={selectedRideKey}
          isMoving={isMoving}
          speedKmh={speedKmh}
          isArrived={isArrived}
          pilotName={rideConfig?.driver?.name}
        />
      </svg>

      {/* 2. FLOATING TOP-LEFT HUD: LIVE VEHICLE TELEMETRY */}
      <div className="absolute top-3.5 left-3.5 flex flex-col space-y-2 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-2xl px-3.5 py-2 shadow-md flex items-center space-x-2.5 pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 tracking-wider uppercase leading-none">
              Live Vector Telemetry
            </span>
            <span className="text-xs font-extrabold text-gray-950 font-mono flex items-center space-x-1.5 mt-0.5">
              <span>{rideConfig?.name || 'Ride'} Arrival Path</span>
              <span className="text-gray-300">•</span>
              <span className="text-emerald-700 font-bold">60 FPS</span>
            </span>
          </div>
        </div>

        {/* Live Velocity Badge */}
        {isMoving && (
          <div className="bg-gray-950/85 text-white backdrop-blur-md rounded-xl px-3 py-1 shadow-sm flex items-center space-x-2 w-max animate-fade-in">
            <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-tight">
              Speed: <span className="text-amber-400">{speedKmh} km/h</span>
            </span>
          </div>
        )}
      </div>

      {/* 3. FLOATING TOP-RIGHT HUD: MAP CONTROLS */}
      <div className="absolute top-3.5 right-3.5 flex flex-col space-y-2 pointer-events-auto">
        {onRecenter && (
          <button
            type="button"
            onClick={onRecenter}
            className="w-10 h-10 rounded-2xl bg-white border border-gray-200 shadow-md text-gray-700 hover:text-brand-600 hover:border-brand-300 flex items-center justify-center transition-all active:scale-95"
            title="Recenter Map"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        )}

        <div className="w-10 h-10 rounded-2xl bg-white border border-gray-200 shadow-md text-gray-700 flex items-center justify-center">
          <Compass className="w-4 h-4 text-rose-500" />
        </div>
      </div>

      {/* 4. FLOATING BOTTOM-LEFT BADGE: DESTINATION STATUS */}
      <div className="absolute bottom-3.5 left-3.5 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl px-3 py-1.5 shadow-md flex items-center space-x-2">
          <span className="text-xs">📍</span>
          <span className="text-[11px] font-bold text-gray-800">
            Pickup: <span className="text-emerald-700">100ft Road, Indiranagar</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default RideMap;
