import React from 'react';
import { Phone, Star, ShieldCheck, KeyRound, Share2, ShieldAlert } from 'lucide-react';

/**
 * DriverCard Component
 * Displays verified driver credentials, vehicle specs, license plate, OTP PIN,
 * and safety action buttons.
 */
const DriverCard = ({
  driver,
  rideConfig,
  otp = '5824',
  isArrived = false,
  onCallDriver,
  onShareTrip,
}) => {
  if (!driver) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-4">
      {/* Top Profile Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <img
              src={driver.avatar}
              alt={driver.name}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-white shadow-md ring-1 ring-gray-200"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
              ✓
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-extrabold text-gray-950 tracking-tight">
                {driver.name}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 uppercase">
                Verified
              </span>
            </div>

            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {driver.vehicleModel} • {driver.vehicleColor}
            </p>

            <div className="flex items-center space-x-2 mt-1 text-xs">
              <span className="flex items-center text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-[11px]">
                <Star className="w-3 h-3 fill-amber-500 mr-1" />
                {driver.rating}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500 text-[11px] font-semibold">{driver.trips}</span>
            </div>
          </div>
        </div>

        {/* License Plate & Start OTP PIN */}
        <div className="flex flex-col items-end space-y-2">
          {/* License Plate Badge */}
          <div className="px-3 py-1 rounded-xl bg-amber-300/80 border border-amber-400/90 text-slate-950 font-mono font-black text-xs tracking-wider shadow-xs">
            {driver.plateNumber}
          </div>

          {/* Start PIN OTP */}
          <div className="bg-gray-50 border border-gray-200 px-3 py-1 rounded-xl text-right">
            <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider leading-none">
              Start PIN
            </span>
            <span className="text-sm font-black text-gray-900 font-mono tracking-widest leading-tight">
              {otp}
            </span>
          </div>
        </div>
      </div>

      {/* Safety Badge Banner */}
      <div className="p-2.5 rounded-2xl bg-gray-50 border border-gray-200/90 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-emerald-800 font-bold text-[11px]">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{driver.safetyBadge || 'DrivePulse Commercial Safety Shield'}</span>
        </div>
        <span className="text-[10px] text-gray-400 font-semibold hidden sm:inline">
          Active Trip Insurance
        </span>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <button
          type="button"
          onClick={onCallDriver || (() => alert(`Calling Captain ${driver.name} at ${driver.phone}`))}
          className="w-full py-2.5 px-4 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all active:scale-98"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Call Captain</span>
        </button>

        <button
          type="button"
          onClick={onShareTrip || (() => alert('Tracking link copied to clipboard!'))}
          className="w-full py-2.5 px-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-bold text-xs shadow-xs flex items-center justify-center space-x-2 transition-all active:scale-98"
        >
          <Share2 className="w-3.5 h-3.5 text-gray-500" />
          <span>Share Status</span>
        </button>
      </div>
    </div>
  );
};

export default DriverCard;
