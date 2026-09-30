import React from 'react';
import {
  MapPin, Search, ChevronRight, Navigation, Clock, ShieldCheck,
  Tag, Zap, Star, Package, Truck, Sparkles, RefreshCw, Car, ArrowRight
} from 'lucide-react';

const HomeScreen = ({
  pickupLocation,
  onOpenSearch,
  onSelectService,
  onSelectQuickDestination,
  onRefreshGPS,
  isDetectingGPS = false,
  user,
  activeRideBanner = null,
}) => {
  // Service Options Grid directly addressing "option like ride and parcel some other"
  const services = [
    {
      id: 'BIKE',
      title: 'Ride',
      subtitle: 'Fast Bike Taxi',
      badge: 'Fastest',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      iconSvg: (
        <svg viewBox="0 0 54 36" width="40" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="26" r="6.5" fill="#18181b" stroke="#52525b" strokeWidth="1.5" />
          <circle cx="10" cy="26" r="2.8" fill="#e2e8f0" />
          <circle cx="44" cy="26" r="6.5" fill="#18181b" stroke="#52525b" strokeWidth="1.5" />
          <circle cx="44" cy="26" r="2.8" fill="#e2e8f0" />
          <path d="M 10 26 L 18 16 L 28 16 L 36 22 L 44 26" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 16 16 C 18 10, 24 9, 29 14 L 35 20 C 37 22, 33 26, 27 25 L 18 25 Z" fill="#facc15" stroke="#09090b" strokeWidth="1.2" />
          <path d="M 17 16 L 14 7 L 11 8" stroke="#09090b" strokeWidth="2" strokeLinecap="round" />
          <circle cx="34" cy="9" r="5.5" fill="#facc15" stroke="#09090b" strokeWidth="1.2" />
          <path d="M 33 4 C 33.5 3.8, 34.5 3.8, 35 4 L 35 14 C 34.5 14.2, 33.5 14.2, 33 14 Z" fill="#ffffff" />
          <path d="M 31 8 Q 34 6 37 8" stroke="#09090b" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
      bg: 'bg-amber-50 hover:bg-amber-100/70 border-amber-200',
    },
    {
      id: 'AUTO',
      title: 'Auto',
      subtitle: '3-Seater Meter',
      badge: 'Popular',
      badgeBg: 'bg-amber-100 text-amber-900',
      iconSvg: (
        <svg viewBox="0 0 54 36" width="40" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="27" r="6" fill="#18181b" stroke="#52525b" strokeWidth="1.2" />
          <circle cx="11" cy="27" r="2.5" fill="#cbd5e1" />
          <circle cx="43" cy="27" r="6" fill="#18181b" stroke="#52525b" strokeWidth="1.2" />
          <circle cx="43" cy="27" r="2.5" fill="#cbd5e1" />
          <path d="M 7 20 C 7 17, 11 15, 15 15 L 39 15 C 44 15, 47 18, 47 23 L 47 26 C 47 28, 43 28, 41 28 L 13 28 C 9 28, 7 25, 7 20 Z" fill="#18181b" stroke="#09090b" strokeWidth="1.2" />
          <path d="M 7 20 L 11 9 C 12 7, 15 6, 17 6 L 24 6 L 24 15 L 7 15 Z" fill="#93c5fd" fillOpacity="0.6" stroke="#09090b" strokeWidth="1" />
          <line x1="12" y1="10" x2="20" y2="8" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M 11 6 C 14 3, 41 3, 46 6 L 47 15 L 11 15 Z" fill="#facc15" stroke="#09090b" strokeWidth="1.2" />
          <rect x="25" y="11" width="16" height="11" rx="2" fill="#3f3f46" stroke="#18181b" strokeWidth="0.8" />
        </svg>
      ),
      bg: 'bg-yellow-50 hover:bg-yellow-100/70 border-yellow-200',
    },
    {
      id: 'CAR',
      title: 'Cab',
      subtitle: 'Comfort AC Daily',
      badge: 'AC Cab',
      badgeBg: 'bg-blue-100 text-blue-900',
      iconSvg: (
        <svg viewBox="0 0 56 34" width="42" height="26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="25" r="5.5" fill="#18181b" stroke="#52525b" strokeWidth="1.2" />
          <circle cx="12" cy="25" r="2" fill="#cbd5e1" />
          <circle cx="44" cy="25" r="5.5" fill="#18181b" stroke="#52525b" strokeWidth="1.2" />
          <circle cx="44" cy="25" r="2" fill="#cbd5e1" />
          <path d="M 4 20 C 4 17, 8 16, 12 16 L 16 10 C 18 6, 36 6, 38 10 L 44 16 C 48 16, 52 18, 52 22 L 51 25 C 51 26, 48 26, 45 26 L 11 26 C 7 26, 4 24, 4 20 Z" fill="#f8fafc" stroke="#09090b" strokeWidth="1.2" />
          <path d="M 17 15 L 19 9 C 20 8, 26 8, 27 8 L 27 15 Z" fill="#0f172a" />
          <path d="M 29 8 C 30 8, 35 8, 36 9 L 38 15 L 29 15 Z" fill="#0f172a" />
          <rect x="24" y="4" width="8" height="3" rx="1.5" fill="#f59e0b" stroke="#09090b" strokeWidth="0.8" />
        </svg>
      ),
      bg: 'bg-blue-50 hover:bg-blue-100/70 border-blue-200',
    },
    {
      id: 'PARCEL',
      title: 'Parcel',
      subtitle: 'Send Packages',
      badge: 'Doorstep',
      badgeBg: 'bg-purple-100 text-purple-900',
      iconSvg: (
        <div className="w-10 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
          <Package className="w-5 h-5 stroke-[2.2]" />
        </div>
      ),
      bg: 'bg-purple-50 hover:bg-purple-100/70 border-purple-200',
    },
    {
      id: 'TROLLEY_PORTER',
      title: 'Porter',
      subtitle: 'Trucks & Logistics',
      badge: 'Up to 750kg',
      badgeBg: 'bg-sky-100 text-sky-900',
      iconSvg: (
        <svg viewBox="0 0 56 36" width="42" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="27" r="5.5" fill="#18181b" stroke="#52525b" strokeWidth="1.2" />
          <circle cx="12" cy="27" r="2" fill="#cbd5e1" />
          <circle cx="44" cy="27" r="5.5" fill="#18181b" stroke="#52525b" strokeWidth="1.2" />
          <circle cx="44" cy="27" r="2" fill="#cbd5e1" />
          <path d="M 5 25 L 5 16 C 5 13, 8 11, 12 11 L 18 11 L 21 17 L 21 25 Z" fill="#2563eb" stroke="#09090b" strokeWidth="1.2" />
          <path d="M 8 16 L 12 12 L 18 12 L 18 16 Z" fill="#93c5fd" fillOpacity="0.6" stroke="#09090b" strokeWidth="0.8" />
          <rect x="21" y="16" width="28" height="10" rx="1.5" fill="#94a3b8" stroke="#334155" strokeWidth="1.2" />
          <rect x="23" y="9" width="11" height="8" rx="1" fill="#d97706" stroke="#78350f" strokeWidth="0.8" />
          <rect x="35" y="11" width="10" height="6" rx="1" fill="#b45309" stroke="#78350f" strokeWidth="0.8" />
          <line x1="21" y1="19" x2="49" y2="19" stroke="#facc15" strokeWidth="1.2" strokeDasharray="3 1" />
        </svg>
      ),
      bg: 'bg-sky-50 hover:bg-sky-100/70 border-sky-200',
    },
    {
      id: 'AUTO_PLUS',
      title: 'Auto Plus',
      subtitle: 'Top-Rated Pilots',
      badge: 'Premium',
      badgeBg: 'bg-amber-100 text-amber-900',
      iconSvg: (
        <svg viewBox="0 0 54 36" width="40" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="27" r="6" fill="#18181b" stroke="#ca8a04" strokeWidth="1.5" />
          <circle cx="11" cy="27" r="2.5" fill="#facc15" />
          <circle cx="43" cy="27" r="6" fill="#18181b" stroke="#ca8a04" strokeWidth="1.5" />
          <circle cx="43" cy="27" r="2.5" fill="#facc15" />
          <path d="M 7 20 C 7 17, 11 15, 15 15 L 39 15 C 44 15, 47 18, 47 23 L 47 26 C 47 28, 43 28, 41 28 L 13 28 C 9 28, 7 25, 7 20 Z" fill="#eab308" stroke="#09090b" strokeWidth="1.2" />
          <path d="M 11 6 C 14 3, 41 3, 46 6 L 47 15 L 11 15 Z" fill="#1d4ed8" stroke="#09090b" strokeWidth="1.2" />
          <circle cx="41" cy="5" r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
          <path d="M 41 2.5 L 42 4.2 L 43.8 4.2 L 42.4 5.3 L 42.9 7 L 41 5.9 L 39.1 7 L 39.6 5.3 L 38.2 4.2 L 40 4.2 Z" fill="#ffffff" />
        </svg>
      ),
      bg: 'bg-amber-50 hover:bg-amber-100/70 border-amber-200',
    },
  ];

  const quickSavedDestinations = [
    {
      name: 'Vidhana Soudha',
      area: 'Central Bengaluru',
      lat: 12.9797,
      lng: 77.5907,
      icon: '🏛️',
    },
    {
      name: 'MG Road Metro Station',
      area: 'CBD, Bengaluru',
      lat: 12.9756,
      lng: 77.6066,
      icon: '🚇',
    },
    {
      name: 'Whitefield ITPL Tech Park',
      area: 'East Tech Hub',
      lat: 12.9866,
      lng: 77.7382,
      icon: '💼',
    },
    {
      name: 'Kempegowda Int. Airport',
      area: 'Devanahalli (BLR)',
      lat: 13.1986,
      lng: 77.7066,
      icon: '✈️',
    },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-64px)] pb-24 bg-slate-50 text-gray-900 flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-4 pt-4 sm:pt-6 space-y-4 sm:space-y-5">
        
        {/* 1. TOP HEADER: CURRENT LOCATION & GREETING */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-xs">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-emerald-200">
              <MapPin className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider block">
                  Current Location
                </span>
                {pickupLocation?.isLive && (
                  <span className="px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                    Live GPS
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-black text-gray-950 truncate mt-0.5">
                {pickupLocation?.name || 'Bengaluru, Karnataka'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRefreshGPS}
            disabled={isDetectingGPS}
            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-all active:scale-95 flex-shrink-0"
            title="Refresh GPS Location"
          >
            <RefreshCw className={`w-4 h-4 ${isDetectingGPS ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>

        {/* Ongoing Active Ride Floating Alert */}
        {activeRideBanner && (
          <div
            onClick={activeRideBanner.onTrack}
            className="rounded-2xl bg-slate-900 border-2 border-emerald-400 p-3 sm:p-4 text-white shadow-xl flex items-center justify-between cursor-pointer hover:bg-slate-850 active:scale-98 transition-all animate-pulse"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black flex-shrink-0">
                <Navigation className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-white">Ride in Progress</span>
                  <span className="text-[10px] bg-emerald-400/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 font-mono">
                    PIN: {activeRideBanner.otpPin}
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 font-medium mt-0.5">
                  {activeRideBanner.service?.name || 'Driver'} is on the way • Tap to view Live Map
                </p>
              </div>
            </div>
            <div className="flex items-center text-xs font-black text-emerald-400 space-x-1 flex-shrink-0">
              <span>Track</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
        )}

        {/* 2. PROMO BANNER: PAY 25% LESS */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-400 via-[#FFCC00] to-yellow-400 p-3.5 sm:p-4 text-slate-950 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-black text-lg shadow-sm flex-shrink-0">
              ⚡
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black leading-tight">
                Save 25% on your daily commutes
              </h3>
              <p className="text-[11px] font-bold text-slate-800 mt-0.5">
                Valid on Bikes, Autos & Cabs • Code: <span className="underline font-black">DRIVE25</span>
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-900 flex-shrink-0" />
        </div>

        {/* 3. PROMINENT "WHERE TO?" SEARCH BAR (Clicking opens Location Search Screen) */}
        <div
          onClick={onOpenSearch}
          className="bg-white rounded-2xl border-2 border-amber-300 hover:border-amber-400 p-3.5 sm:p-4 shadow-md flex items-center justify-between cursor-pointer transition-all active:scale-98 group"
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black flex-shrink-0 shadow-xs">
              <Search className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <span className="text-sm sm:text-base font-black text-gray-950 block">
                Where are you heading?
              </span>
              <span className="text-[11px] text-gray-500 font-medium block truncate">
                Search pickup, destination landmark or metro station
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-amber-100 text-gray-600 group-hover:text-gray-950 flex items-center justify-center transition-colors flex-shrink-0">
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* 4. PRIMARY SERVICE OPTIONS (Ride, Auto, Cab, Parcel, Porter) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs sm:text-sm font-black text-gray-950 uppercase tracking-wider">
              Explore Mobility Services
            </h2>
            <span className="text-[11px] text-amber-800 font-extrabold">Instant Booking</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {services.map((s) => (
              <div
                key={s.id}
                onClick={() => onSelectService(s.id)}
                className={`rounded-2xl border p-3 flex flex-col justify-between cursor-pointer transition-all duration-150 active:scale-97 shadow-xs hover:shadow-sm ${s.bg}`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-11 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center shadow-xs">
                    {s.iconSvg}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${s.badgeBg}`}>
                    {s.badge}
                  </span>
                </div>

                <div className="mt-3">
                  <h4 className="text-sm font-black text-gray-950 leading-tight">
                    {s.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 font-semibold truncate mt-0.5">
                    {s.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. SAVED / POPULAR PLACES SHORTCUTS */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 shadow-xs">
          <h3 className="text-xs font-black text-gray-950 uppercase tracking-wider">
            Popular Destinations in City
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickSavedDestinations.map((dest, idx) => (
              <div
                key={idx}
                onClick={() => onSelectQuickDestination(dest)}
                className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-colors"
              >
                <span className="text-lg flex-shrink-0">{dest.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-gray-950 truncate">
                    {dest.name}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium truncate">
                    {dest.area}
                  </p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* 6. DRIVEPULSE SAFETY & ASSURANCE STRIP */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 flex items-center space-x-3 text-emerald-950">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-extrabold text-emerald-900 leading-tight">
              Safety Guaranteed on Every Ride
            </h4>
            <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
              Verified pilots • Live GPS tracking • 24/7 Safety SOS & insurance
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomeScreen;
