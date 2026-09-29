import React from 'react';
import ETA from './ETA';
import RideStatus from './RideStatus';
import DriverCard from './DriverCard';
import RideSelector from './RideSelector';
import { RotateCcw, XCircle, Play, ShieldAlert, Sparkles } from 'lucide-react';
import { ANIMATION_STATES } from '../../data/rideTypes';

/**
 * RideBottomSheet Component
 * Master interaction card providing real-time telemetry, driver status,
 * vehicle selection controls, and animation replay triggers.
 */
const RideBottomSheet = ({
  rideConfig,
  selectedRideKey,
  onSelectRide,
  animationState,
  progress = 0,
  distanceKm = 2.4,
  etaMins = 4,
  statusText = '',
  speedKmh = 0,
  isArrived = false,
  isNearby = false,
  onReplay,
  onCancel,
}) => {
  return (
    <div className="space-y-4">
      {/* 1. Dynamic Status Banner */}
      <RideStatus
        animationState={animationState}
        statusText={statusText}
        vehicleName={rideConfig.name}
        driverName={rideConfig.driver.name}
        arrivalTitle={rideConfig.arrivalTitle}
        arrivalSubtitle={rideConfig.arrivalSubtitle}
      />

      {/* 2. Dynamic ETA & Remaining Distance Countdown */}
      <ETA
        etaMins={etaMins}
        distanceKm={distanceKm}
        isArrived={isArrived}
        isNearby={isNearby}
        progress={progress}
        accentColor={rideConfig.accentColor}
      />

      {/* 3. Assigned Verified Pilot Details Card */}
      <DriverCard
        driver={rideConfig.driver}
        rideConfig={rideConfig}
        otp="5824"
        isArrived={isArrived}
      />

      {/* 4. Quick Vehicle Type Switcher */}
      <RideSelector
        selectedRideKey={selectedRideKey}
        onSelectRide={onSelectRide}
      />

      {/* 5. Master Simulation Test Controls */}
      <div className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold text-gray-900 uppercase tracking-wider">
            Interactive Test Cockpit
          </span>
          <span className="text-[10px] text-gray-400 font-mono">
            {speedKmh} km/h • {Math.round(progress * 100)}%
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onReplay}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-brand-500 hover:from-amber-500 hover:to-brand-600 text-slate-950 font-black text-xs shadow-md flex items-center justify-center space-x-2 transition-all active:scale-98"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>Replay Arrival</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={animationState === ANIMATION_STATES.CANCELLED}
            className={`w-full py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center space-x-2 transition-all active:scale-98 ${
              animationState === ANIMATION_STATES.CANCELLED
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-white border-rose-200 text-rose-700 hover:bg-rose-50 shadow-xs'
            }`}
          >
            <XCircle className="w-4 h-4 stroke-[2]" />
            <span>Cancel Ride</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RideBottomSheet;
