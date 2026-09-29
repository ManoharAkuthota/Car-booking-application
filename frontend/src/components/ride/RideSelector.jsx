import React from 'react';
import { RIDE_TYPES } from '../../data/rideTypes';
import { Zap, Clock, ShieldCheck, Check } from 'lucide-react';

/**
 * RideSelector Component
 * Allows user to seamlessly switch between the 4 arrival animation models:
 * 1. 🏍️ Bike
 * 2. 🛺 Auto Rickshaw
 * 3. 🚗 Cab
 * 4. 🛻 Porter Cargo
 */
const RideSelector = ({
  selectedRideKey = 'bike',
  onSelectRide,
  disabled = false,
}) => {
  const rideList = Object.values(RIDE_TYPES);

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-black uppercase text-gray-900 tracking-wider">
            Vehicle Arrival Simulation
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
            Real Vector Paths
          </span>
        </div>
        <span className="text-[11px] text-gray-400 font-semibold">
          Select to Test
        </span>
      </div>

      {/* Grid of 4 Service Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {rideList.map((item) => {
          const isSelected = selectedRideKey === item.id;

          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectRide(item.id)}
              className={`relative rounded-2xl p-3 text-left transition-all duration-200 flex flex-col justify-between border ${
                isSelected
                  ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-400/40 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-98'}`}
            >
              {/* Selected Checkmark Badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brand-500 text-slate-950 flex items-center justify-center text-[10px] font-black shadow-xs">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}

              {/* Icon & Tag */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-2xl select-none">{item.symbol}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wider ${item.tagColor}`}>
                    {item.tag}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-extrabold text-gray-950 leading-tight">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium truncate mt-0.5">
                    {item.capacity}
                  </div>
                </div>
              </div>

              {/* Pricing & ETA */}
              <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-black text-gray-950 text-xs">₹{item.basePrice}</span>
                  <span className="text-[9px] text-gray-400 font-mono line-through ml-1">₹{item.strikePrice}</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-bold flex items-center">
                  <Clock className="w-2.5 h-2.5 mr-0.5 text-emerald-600" />
                  {item.baseEtaMins}m
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RideSelector;
