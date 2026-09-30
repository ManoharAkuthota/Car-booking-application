import React, { useState } from 'react';
import {
  ArrowLeft, ArrowUpDown, MapPin, Search, Crosshair, Navigation,
  ChevronRight, Building2, Plane, Train, Clock, Sparkles, Check
} from 'lucide-react';
import LocationSearchInput from '../LocationSearchInput';
import { DEFAULT_PRESET_LOCATIONS } from '../../api/locationService';

const LocationSearchScreen = ({
  pickupLocation,
  dropoffLocation,
  onUpdatePickup,
  onUpdateDropoff,
  onSwapLocations,
  onDetectLiveGPS,
  isDetectingGPS = false,
  selectedServiceName = 'Ride',
  onBack,
  onProceedToRides,
}) => {
  const [activeInput, setActiveInput] = useState('dropoff'); // 'pickup' | 'dropoff'

  // Estimate preliminary distance
  const distanceKm = Math.round(
    (Math.sqrt(
      Math.pow((dropoffLocation.lat - pickupLocation.lat) * 111, 2) +
      Math.pow((dropoffLocation.lng - pickupLocation.lng) * 111, 2)
    ) * 1.28) * 10
  ) / 10 || 4.2;

  const durationMins = Math.max(5, Math.round(distanceKm * 2.3));

  return (
    <div className="w-full min-h-[calc(100vh-64px)] pb-24 bg-slate-50 text-gray-900 flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-4 pt-4 sm:pt-6 space-y-4">
        
        {/* 1. TOP HEADER WITH BACK BUTTON */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 rounded-2xl bg-white border border-gray-200 text-gray-800 flex items-center justify-center shadow-xs hover:bg-gray-100 active:scale-95 transition-all"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-black text-gray-950 tracking-tight leading-tight">
                Select Route for {selectedServiceName}
              </h1>
              <p className="text-[11px] text-gray-500 font-semibold">
                Set pickup & destination to view nearest drivers
              </p>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-300 text-[11px] font-black uppercase tracking-wider">
            {selectedServiceName}
          </div>
        </div>

        {/* 2. PICKUP & DROPOFF INPUT CONTAINER CARD */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-md space-y-3">
          
          {/* Pickup Input Row */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 px-1">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Pick Up Location</span>
              </span>
              {pickupLocation.isLive && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-[9px] font-bold">
                  GPS Active
                </span>
              )}
            </div>

            <LocationSearchInput
              value={pickupLocation}
              onChange={(val) => onUpdatePickup({ ...pickupLocation, name: val })}
              onSelect={(item) => onUpdatePickup(item)}
              placeholder="Search pickup landmark, building, metro..."
              isPickup={true}
              onUseCurrentLocation={onDetectLiveGPS}
              isDetectingGPS={isDetectingGPS}
            />
          </div>

          {/* Swap Button Divider */}
          <div className="relative flex items-center justify-center my-1">
            <div className="w-full border-t border-gray-100" />
            <button
              type="button"
              onClick={onSwapLocations}
              className="absolute p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-xs active:scale-95 transition-all"
              title="Swap Pickup and Drop-off"
            >
              <ArrowUpDown className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
          </div>

          {/* Dropoff Input Row */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-rose-800 px-1">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Drop Off Destination</span>
              </span>
              <span className="text-[10px] text-gray-400 font-bold normal-case">
                Where to?
              </span>
            </div>

            <LocationSearchInput
              value={dropoffLocation}
              onChange={(val) => onUpdateDropoff({ ...dropoffLocation, name: val })}
              onSelect={(item) => onUpdateDropoff(item)}
              placeholder="Enter destination, area or transit hub..."
              isPickup={false}
            />
          </div>

          {/* Live Route Preview Pill */}
          <div className="pt-1 flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 font-bold">
            <div className="flex items-center space-x-1.5">
              <span>📍 Est. Distance:</span>
              <span className="font-extrabold text-gray-950 font-mono">{distanceKm} km</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span>⏱️ Duration:</span>
              <span className="font-extrabold text-gray-950 font-mono">~{durationMins} mins</span>
            </div>
          </div>
        </div>

        {/* 3. POPULAR & RECENT LOCATIONS LIST (Down the location inputs) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-black text-gray-950 uppercase tracking-wider">
              Popular City Destinations
            </h3>
            <span className="text-[11px] text-gray-400 font-semibold">1-Tap Select</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DEFAULT_PRESET_LOCATIONS.map((loc, idx) => {
              const isCurrentDropoff = dropoffLocation.name === loc.name;

              return (
                <div
                  key={idx}
                  onClick={() => onUpdateDropoff(loc)}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isCurrentDropoff
                      ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-300/40'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center flex-shrink-0">
                      {loc.type === 'airport' && <Plane className="w-4 h-4 text-sky-600" />}
                      {loc.type === 'metro' && <Train className="w-4 h-4 text-emerald-600" />}
                      {loc.type === 'tech_park' && <Building2 className="w-4 h-4 text-indigo-600" />}
                      {loc.type === 'landmark' && <MapPin className="w-4 h-4 text-amber-600" />}
                      {!['airport', 'metro', 'tech_park', 'landmark'].includes(loc.type) && (
                        <MapPin className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-gray-950 truncate">
                        {loc.name}
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium truncate">
                        {loc.area}
                      </p>
                    </div>
                  </div>

                  {isCurrentDropoff ? (
                    <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-xs font-black flex-shrink-0">
                      ✓
                    </div>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. PRIMARY SEARCH OPTION ACTION BUTTON */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onProceedToRides}
            className="w-full py-4 px-6 rounded-2xl bg-[#FFCC00] hover:bg-[#FFD633] text-gray-950 font-black text-base sm:text-lg shadow-xl hover:shadow-2xl active:scale-98 transition-all flex items-center justify-center space-x-2.5"
          >
            <Search className="w-5 h-5 stroke-[2.5]" />
            <span>Search Rides & Nearest Drivers</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default LocationSearchScreen;
