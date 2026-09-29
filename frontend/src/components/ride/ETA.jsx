import React from 'react';
import { Clock, Navigation, Zap, CheckCircle2 } from 'lucide-react';
import { formatDistance, formatETA } from '../animation/animationUtils';

/**
 * ETA & Distance Dynamic Telemetry Component
 * Displays live synchronized ETA countdown and remaining distance
 * as the driver advances along the road.
 */
const ETA = ({
  etaMins = 4,
  distanceKm = 2.4,
  isArrived = false,
  isNearby = false,
  progress = 0,
  accentColor = '#f59e0b',
}) => {
  const percentComplete = Math.round(progress * 100);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        {/* Left: ETA Status */}
        <div className="flex items-center space-x-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm transition-colors duration-300 ${
              isArrived ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-gray-900 shadow-gray-900/20'
            }`}
          >
            {isArrived ? (
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            ) : (
              <Clock className="w-5 h-5 text-amber-400" />
            )}
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              {isArrived ? 'Status' : isNearby ? 'Almost There' : 'Estimated Arrival'}
            </div>
            <div className="text-xl font-black text-gray-950 font-mono tracking-tight flex items-center space-x-2">
              <span>{formatETA(etaMins, isArrived)}</span>
              {isNearby && !isArrived && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300 uppercase animate-pulse">
                  Nearby
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Distance Remaining */}
        <div className="text-right">
          <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
            Distance
          </div>
          <div className="text-lg font-black text-gray-900 font-mono">
            {formatDistance(distanceKm, isArrived)}
          </div>
          <div className="text-[10px] text-gray-500 font-semibold mt-0.5">
            to pickup spot
          </div>
        </div>
      </div>

      {/* Progress Bar Track */}
      <div className="space-y-1">
        <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden relative border border-gray-200/60">
          <div
            className="h-full rounded-full transition-all duration-100 ease-linear"
            style={{
              width: `${percentComplete}%`,
              backgroundColor: isArrived ? '#10b981' : accentColor,
            }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono font-semibold">
          <span>Indiranagar Hub</span>
          <span>{percentComplete}% of route</span>
          <span>100ft Pickup</span>
        </div>
      </div>
    </div>
  );
};

export default ETA;
