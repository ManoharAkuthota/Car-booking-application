import React, { useRef } from 'react';
import { useRideAnimation } from '../components/animation/useRideAnimation';
import { useVehiclePath } from '../components/animation/useVehiclePath';
import RideMap from '../components/map/RideMap';
import RideBottomSheet from '../components/ride/RideBottomSheet';
import { ANIMATION_STATES, RIDE_TYPES } from '../data/rideTypes';
import {
  RotateCcw, Sparkles, Navigation, ShieldCheck, Zap,
  CheckCircle2, Compass, Layers, Car, HardHat, Package
} from 'lucide-react';

/**
 * RideBooking Interactive Experience Page
 * 
 * Showcase page for the Realistic Vehicle Arrival Animation system.
 * Allows testing of:
 * 1. 🏍️ Bike (Rapido Bike Taxi)
 * 2. 🛺 Auto (Auto Rickshaw)
 * 3. 🚗 Cab (DrivePulse Cab AC)
 * 4. 🛻 Porter (Goods & Cargo)
 */
const RideBooking = ({ onBackToExplore }) => {
  const pathRef = useRef(null);

  // Master Ride Animation Controller Hook
  const {
    rideConfig,
    selectedRideKey,
    selectRideType,
    animationState,
    progress,
    distanceKm,
    etaMins,
    speedKmh,
    statusText,
    replayAnimation,
    cancelRide,
    isArrived,
    isMoving,
  } = useRideAnimation('bike', true);

  // Hook calculating exact position (x, y) and tangent rotation along SVG path
  const transform = useVehiclePath(pathRef, progress);

  const isNearby = animationState === ANIMATION_STATES.NEARBY || animationState === ANIMATION_STATES.ARRIVING;

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">

        {/* 1. TOP HEADER & INTERACTIVE QUICK VEHICLE SWITCHER */}
        <div className="bg-white border border-gray-200 rounded-3xl p-4 sm:p-5 shadow-sm mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shadow-amber-400/20">
                ⚡
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-base sm:text-lg font-black text-gray-950 tracking-tight">
                    Drive<span className="text-brand-600">Pulse</span> • Real-Time Vehicle Arrival Animation
                  </h1>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-300 uppercase tracking-wide">
                    Live 60 FPS
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  Realistic multi-modal vector simulation along curved city roadways
                </p>
              </div>
            </div>

            {/* Quick Action Replay Button */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={replayAnimation}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-brand-500 hover:from-amber-500 hover:to-brand-600 text-slate-950 font-black text-xs shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Replay Animation</span>
              </button>

              {onBackToExplore && (
                <button
                  type="button"
                  onClick={onBackToExplore}
                  className="py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all active:scale-95"
                >
                  Back
                </button>
              )}
            </div>
          </div>

          {/* Quick Vehicle Type Buttons for Direct Testing */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'bike', label: 'Bike', symbol: '🏍️', tag: 'Fastest' },
              { id: 'auto', label: 'Auto', symbol: '🛺', tag: 'Popular' },
              { id: 'cab', label: 'Cab', symbol: '🚗', tag: 'AC Sedan' },
              { id: 'porter', label: 'Porter', symbol: '🛻', tag: 'Cargo' },
            ].map((v) => {
              const isSelected = selectedRideKey === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => selectRideType(v.id)}
                  className={`py-3 px-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/70 ring-2 ring-brand-400/40 shadow-sm'
                      : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-2xl select-none">{v.symbol}</span>
                    <div>
                      <div className="text-xs font-black text-gray-950">{v.label}</div>
                      <div className="text-[10px] text-gray-500 font-medium">{v.tag}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. MAIN RESPONSIVE TWO-COLUMN VIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: TELEMETRY & BOTTOM SHEET COCKPIT */}
          <div className="lg:col-span-5 xl:col-span-5 order-2 lg:order-1">
            <RideBottomSheet
              rideConfig={rideConfig}
              selectedRideKey={selectedRideKey}
              onSelectRide={selectRideType}
              animationState={animationState}
              progress={progress}
              distanceKm={distanceKm}
              etaMins={etaMins}
              statusText={statusText}
              speedKmh={speedKmh}
              isArrived={isArrived}
              isNearby={isNearby}
              onReplay={replayAnimation}
              onCancel={cancelRide}
            />
          </div>

          {/* RIGHT COLUMN: HIGH-DEFINITION VECTOR MAP */}
          <div className="lg:col-span-7 xl:col-span-7 order-1 lg:order-2 sticky top-4">
            <RideMap
              pathRef={pathRef}
              rideConfig={rideConfig}
              selectedRideKey={selectedRideKey}
              animationState={animationState}
              progress={progress}
              speedKmh={speedKmh}
              isMoving={isMoving}
              isArrived={isArrived}
              isNearby={isNearby}
              transform={transform}
              onRecenter={replayAnimation}
            />
          </div>

        </div>

      </div>
    </div>
  );
};

export default RideBooking;
