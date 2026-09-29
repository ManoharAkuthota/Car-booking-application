import React, { useState, useEffect } from 'react';
import { carApi, bookingApi } from '../api/client';
import CarCard from '../components/CarCard';
import BookingModal from '../components/BookingModal';
import ActiveTripCard from '../components/ActiveTripCard';
import DigitalReceiptModal from '../components/DigitalReceiptModal';
import MapView from '../components/MapView';
import {
  Search, Zap, Crown, Compass, Car, Sparkles, Filter, AlertCircle,
  RefreshCw, Smartphone, Monitor, MapPin, Navigation, Clock, ShieldCheck,
  HardHat, Package, IndianRupee, ArrowRight, CheckCircle2, ChevronRight,
  Sliders, Star
} from 'lucide-react';

const CATEGORIES = [
  { id: 'ALL', label: 'All Fleet', emoji: '🌟' },
  { id: 'BIKE', label: 'Bike Taxi', emoji: '🏍️', tag: 'Rapido Style' },
  { id: 'AUTO', label: 'Auto Rickshaw', emoji: '🛺', tag: 'Metered' },
  { id: 'SEDAN', label: 'Cabs & Sedans', emoji: '🚗', tag: 'Uber Style' },
  { id: 'TROLLEY_PORTER', label: 'Trolley / Porter', emoji: '🛻', tag: 'Tata Ace 750kg' },
  { id: 'ELECTRIC', label: 'Electric EV', emoji: '⚡', tag: 'Eco Green' },
  { id: 'SUV', label: 'Family SUV', emoji: '🚙', tag: '6 Seater' },
  { id: 'LUXURY', label: 'Luxury Chauffeur', emoji: '👑', tag: 'Premium' },
];

const PRESET_LOCATIONS = [
  { name: 'Indiranagar 100ft Rd', lat: 12.9784, lng: 77.6408 },
  { name: 'Kempegowda Airport (BLR)', lat: 13.1986, lng: 77.7066 },
  { name: 'MG Road Metro', lat: 12.9756, lng: 77.6066 },
  { name: 'Electronic City Phase 1', lat: 12.8452, lng: 77.6602 },
  { name: 'Whitefield IT Park', lat: 12.9866, lng: 77.7382 },
  { name: 'Koramangala 5th Block', lat: 12.9352, lng: 77.6245 },
];

const CustomerExplore = () => {
  const [cars, setCars] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeats, setSelectedSeats] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState(null);
  const [selectedCarForBooking, setSelectedCarForBooking] = useState(null);
  const [receiptBooking, setReceiptBooking] = useState(null);

  // Dual UX layout switcher: 'desktop' or 'mobile'
  const [viewMode, setViewMode] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop';
  });

  // Mobile Bottom Sheet active selected vehicle
  const [mobileSelectedVehicleId, setMobileSelectedVehicleId] = useState(null);
  const [mobileActiveTab, setMobileActiveTab] = useState('rides'); // 'rides', 'trolley', 'activity', 'account'

  // Route points for Cockpit Live Map
  const [pickupIndex, setPickupIndex] = useState(0);
  const [dropoffIndex, setDropoffIndex] = useState(1);

  const pickupCoord = [PRESET_LOCATIONS[pickupIndex].lat, PRESET_LOCATIONS[pickupIndex].lng];
  const dropoffCoord = [PRESET_LOCATIONS[dropoffIndex].lat, PRESET_LOCATIONS[dropoffIndex].lng];

  // Load cars and check for active booking
  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedSeats) params.seats = Number(selectedSeats);

      const [carsRes, bookingsRes] = await Promise.all([
        carApi.getAll(params),
        bookingApi.getMyBookings(),
      ]);

      setCars(carsRes.data);

      if (carsRes.data.length > 0 && !mobileSelectedVehicleId) {
        setMobileSelectedVehicleId(carsRes.data[0].id);
      }

      // Check if user has an active unfinished ride
      const ongoing = bookingsRes.data.find(
        (b) => b.status === 'REQUESTED' || b.status === 'ACCEPTED' || b.status === 'DRIVER_ARRIVING' || b.status === 'IN_PROGRESS'
      );
      if (ongoing) {
        setActiveBooking(ongoing);
      }
    } catch (err) {
      console.error("Failed to load cars:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedSeats]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleBookingSuccess = (newBooking) => {
    setSelectedCarForBooking(null);
    setActiveBooking(newBooking);
    loadData();
  };

  // Get currently selected car in mobile bottom sheet
  const selectedMobileCar = cars.find((c) => c.id === mobileSelectedVehicleId) || cars[0] || null;

  return (
    <div className="space-y-6">
      {/* Top Layout Switcher Bar */}
      <div className="glass-panel p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Dual Experience Mode
            </h2>
            <p className="text-[11px] text-slate-400">
              Switch between Desktop Cockpit and Mobile App (Rapido & Uber Native UI)
            </p>
          </div>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('desktop')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewMode === 'desktop'
                ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Laptop Cockpit View</span>
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewMode === 'mobile'
                ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile App View</span>
          </button>
        </div>
      </div>

      {/* Active Trip Banner if user has ongoing ride */}
      {activeBooking && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-wider text-brand-400 uppercase flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-ping" />
              <span>Live Ongoing Trip Telemetry</span>
            </h2>
            <button
              onClick={() => setActiveBooking(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Minimize
            </button>
          </div>
          <ActiveTripCard
            booking={activeBooking}
            onStatusChanged={(updated) => {
              setActiveBooking(updated);
              if (updated.status === 'COMPLETED') {
                setReceiptBooking(updated);
              }
              loadData();
            }}
            onViewReceipt={(b) => setReceiptBooking(b)}
          />
        </section>
      )}

      {/* ========================================================================= */}
      {/* 📱 MOBILE APP VIEW (AUTHENTIC RAPIDO & UBER EXPERIENCE) */}
      {/* ========================================================================= */}
      {viewMode === 'mobile' && (
        <div className="flex justify-center py-2">
          {/* Smartphone Frame Simulation */}
          <div className="relative w-full max-w-[420px] bg-slate-950 rounded-[48px] border-[8px] border-slate-800 shadow-2xl shadow-brand-500/10 overflow-hidden flex flex-col h-[780px]">
            {/* Top Phone Speaker & Dynamic Island */}
            <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-7 pt-3 text-[11px] font-semibold text-white bg-gradient-to-b from-slate-950 via-slate-950/80 to-transparent">
              <span>9:41</span>
              {/* Dynamic Island */}
              <div className="w-24 h-4 bg-black rounded-full border border-slate-800 flex items-center justify-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-brand-500/80" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              </div>
              <div className="flex items-center space-x-1.5 text-[10px]">
                <span>5G</span>
                <span className="w-4 h-2 border border-white rounded-sm flex items-center p-0.5">
                  <span className="w-full h-full bg-emerald-400 rounded-2xs" />
                </span>
              </div>
            </div>

            {/* Mobile Floating Search & Category Header */}
            <div className="absolute top-12 left-3 right-3 z-20 space-y-2">
              {/* Where to Search Bar */}
              <div className="glass-panel p-2.5 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-400" />
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {PRESET_LOCATIONS[pickupIndex].name}
                  </span>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {PRESET_LOCATIONS[dropoffIndex].name}
                  </span>
                </div>
              </div>

              {/* Quick Multi-Modal Category Filter Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'ALL', label: 'All', emoji: '🌟' },
                  { id: 'BIKE', label: 'Bike', emoji: '🏍️' },
                  { id: 'AUTO', label: 'Auto', emoji: '🛺' },
                  { id: 'SEDAN', label: 'Cab', emoji: '🚗' },
                  { id: 'TROLLEY_PORTER', label: 'Trolley', emoji: '🛻' },
                ].map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shadow-lg ${
                        isSelected
                          ? 'bg-brand-500 text-slate-950 border-brand-500 font-extrabold'
                          : 'bg-slate-900/90 text-slate-300 border-slate-700 backdrop-blur-md'
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Background Fullscreen Interactive Map */}
            <div className="flex-1 w-full relative">
              <MapView
                pickup={pickupCoord}
                dropoff={dropoffCoord}
                category={selectedMobileCar?.category || 'SEDAN'}
                className="h-full w-full rounded-none border-0"
              />
            </div>

            {/* Draggable / Expandable Native Bottom Sheet (Rapido / Uber style) */}
            <div className="relative z-20 bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800 rounded-t-3xl shadow-2xl p-4 space-y-3 flex flex-col max-h-[340px]">
              {/* Bottom Sheet Drag Indicator */}
              <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto" />

              {/* Available Fleet Selector in Bottom Sheet */}
              <div className="space-y-2 overflow-y-auto max-h-[160px] pr-1">
                {cars.map((car) => {
                  const isSelected = (selectedMobileCar?.id === car.id);
                  let badge = car.category;
                  let icon = '🚗';
                  let note = `${car.seats} seats`;
                  if (car.category === 'BIKE') {
                    icon = '🏍️';
                    badge = 'Bike Taxi';
                    note = '1 rider • Helmet';
                  } else if (car.category === 'AUTO') {
                    icon = '🛺';
                    badge = 'Auto';
                    note = '3 seats • Upfront fare';
                  } else if (car.category === 'TROLLEY_PORTER') {
                    icon = '🛻';
                    badge = 'Porter Trolley';
                    note = `Max ${car.maxWeightKg || 750} kg`;
                  }

                  const estFare = Math.round(car.baseFare + 12 * car.pricePerKm);

                  return (
                    <div
                      key={car.id}
                      onClick={() => setMobileSelectedVehicleId(car.id)}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-brand-500/10 border-brand-500 ring-1 ring-brand-500'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{icon}</div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-white">{car.make} {car.model}</span>
                            <span className="text-[10px] font-mono text-brand-400 font-bold">2 min away</span>
                          </div>
                          <p className="text-[10px] text-slate-400">{note}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-black text-white font-mono">₹{estFare}</div>
                        <div className="text-[9px] text-slate-500 line-through">₹{Math.round(estFare * 1.15)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Vehicle Safety Highlights */}
              {selectedMobileCar && (
                <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300">
                  {selectedMobileCar.category === 'BIKE' && (
                    <div className="flex items-center space-x-1.5 text-emerald-400">
                      <HardHat className="w-3.5 h-3.5" />
                      <span>Sanitized Helmet Provided • 1 Rider</span>
                    </div>
                  )}
                  {selectedMobileCar.category === 'AUTO' && (
                    <div className="flex items-center space-x-1.5 text-amber-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Guaranteed Meter Fare • Up to 3 Riders</span>
                    </div>
                  )}
                  {selectedMobileCar.category === 'TROLLEY_PORTER' && (
                    <div className="flex items-center space-x-1.5 text-purple-400">
                      <Package className="w-3.5 h-3.5" />
                      <span>Logistics Cargo • Payload {selectedMobileCar.maxWeightKg || 750} kg</span>
                    </div>
                  )}
                  {selectedMobileCar.category !== 'BIKE' && selectedMobileCar.category !== 'AUTO' && selectedMobileCar.category !== 'TROLLEY_PORTER' && (
                    <div className="flex items-center space-x-1.5 text-brand-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Chauffeur • AC Sedan</span>
                    </div>
                  )}

                  <span className="font-mono text-xs text-brand-400 font-bold">
                    ₹{selectedMobileCar.pricePerKm}/km
                  </span>
                </div>
              )}

              {/* Main Booking Action Button */}
              <button
                onClick={() => {
                  if (selectedMobileCar) {
                    setSelectedCarForBooking(selectedMobileCar);
                  }
                }}
                disabled={!selectedMobileCar}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-slate-950 font-black text-sm shadow-xl shadow-brand-500/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
              >
                <span>Book {selectedMobileCar ? `${selectedMobileCar.make} ${selectedMobileCar.model}` : 'Ride'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Native Bottom App Bar */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-around text-slate-400 text-[10px]">
                <button
                  onClick={() => setMobileActiveTab('rides')}
                  className={`flex flex-col items-center space-y-1 ${mobileActiveTab === 'rides' ? 'text-brand-400 font-bold' : ''}`}
                >
                  <Car className="w-4 h-4" />
                  <span>Rides</span>
                </button>
                <button
                  onClick={() => {
                    setMobileActiveTab('trolley');
                    setSelectedCategory('TROLLEY_PORTER');
                  }}
                  className={`flex flex-col items-center space-y-1 ${mobileActiveTab === 'trolley' ? 'text-brand-400 font-bold' : ''}`}
                >
                  <Package className="w-4 h-4" />
                  <span>Trolley/Porter</span>
                </button>
                <button
                  onClick={() => setMobileActiveTab('activity')}
                  className={`flex flex-col items-center space-y-1 ${mobileActiveTab === 'activity' ? 'text-brand-400 font-bold' : ''}`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Activity</span>
                </button>
                <button
                  onClick={() => setMobileActiveTab('account')}
                  className={`flex flex-col items-center space-y-1 ${mobileActiveTab === 'account' ? 'text-brand-400 font-bold' : ''}`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Safety</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 💻 LAPTOP / DESKTOP COCKPIT VIEW (SPLIT-SCREEN INTERACTIVE EXPERIENCE) */}
      {/* ========================================================================= */}
      {viewMode === 'desktop' && (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-800 p-6 sm:p-8 shadow-2xl">
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Multi-Modal Mobility: Bike Taxi, Auto, Cabs & Goods Porter</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Any Ride, Any Load, <span className="bg-gradient-to-r from-brand-400 via-amber-300 to-accent-cyan bg-clip-text text-transparent">Anytime</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Experience Rapido-speed bike taxis, upfront metered auto rickshaws, premium Uber-style sedans, and heavy-payload Tata Ace porters in one unified platform.
              </p>

              {/* Quick Search Bar */}
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 pt-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by vehicle (e.g. Royal Enfield, Bajaj Auto, Tesla, Tata Ace)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 transition-all active:scale-95"
                >
                  Search Fleet
                </button>
              </form>
            </div>

            {/* Ambient background glow */}
            <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute right-20 bottom-0 w-80 h-80 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Category Filter Pills & Seating Filter */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category Horizontal Scroll */}
            <div className="flex items-center space-x-2 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-brand-500 text-slate-950 border-brand-500 shadow-lg shadow-brand-500/20'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                    {cat.tag && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                        isSelected ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {cat.tag}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right side controls: Seating & Refresh */}
            <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
              <select
                value={selectedSeats}
                onChange={(e) => setSelectedSeats(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
              >
                <option value="">Any Seating</option>
                <option value="1">1 Passenger (Bike)</option>
                <option value="3">3 Passengers (Auto)</option>
                <option value="4">4+ Seats (Cabs)</option>
                <option value="6">6+ Seats (SUV)</option>
              </select>

              <button
                onClick={loadData}
                title="Refresh Fleet"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Cockpit Split Layout: Left Controls + Right Live Map */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Fleet Listing */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-baseline justify-between">
                <h2 className="text-base font-bold text-white">
                  Available Fleet <span className="text-slate-500 font-mono text-xs">({cars.length} vehicles)</span>
                </h2>
                <span className="text-xs text-slate-400">Fixed rate • Insurance included</span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="h-64 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
                  ))}
                </div>
              ) : cars.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
                  <Car className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="text-slate-400 text-sm font-medium">No vehicles found matching your criteria.</p>
                  <button
                    onClick={() => {
                      setSelectedCategory('ALL');
                      setSearchQuery('');
                      setSelectedSeats('');
                    }}
                    className="text-xs text-brand-400 font-semibold underline"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cars.map((car) => (
                    <CarCard
                      key={car.id}
                      car={car}
                      onSelect={(selected) => setSelectedCarForBooking(selected)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Sticky Live Map Preview & Quick Cockpit Route Selector */}
            <div className="lg:col-span-5 sticky top-20 space-y-4">
              <div className="glass-panel p-4 rounded-3xl border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                    <Navigation className="w-3.5 h-3.5 text-brand-400" />
                    <span>Live GPS Telemetry & Route Cockpit</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                    Real-time
                  </span>
                </div>

                {/* Route Selector Dropdowns */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Pickup Point</label>
                    <select
                      value={pickupIndex}
                      onChange={(e) => setPickupIndex(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-white truncate focus:outline-none focus:border-brand-500"
                    >
                      {PRESET_LOCATIONS.map((loc, idx) => (
                        <option key={idx} value={idx} disabled={idx === dropoffIndex}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Destination</label>
                    <select
                      value={dropoffIndex}
                      onChange={(e) => setDropoffIndex(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-white truncate focus:outline-none focus:border-rose-500"
                    >
                      {PRESET_LOCATIONS.map((loc, idx) => (
                        <option key={idx} value={idx} disabled={idx === pickupIndex}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Map Component */}
                <MapView
                  pickup={pickupCoord}
                  dropoff={dropoffCoord}
                  className="h-[320px]"
                />

                {/* Platform Guarantees Footer */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[10px] text-center text-slate-400">
                  <div className="bg-slate-900/60 p-2 rounded-xl">
                    <HardHat className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-0.5" />
                    <span>Rapido Helmet</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-xl">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-400 mx-auto mb-0.5" />
                    <span>Verified Pilots</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-xl">
                    <Package className="w-3.5 h-3.5 text-purple-400 mx-auto mb-0.5" />
                    <span>750kg Porter</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedCarForBooking && (
        <BookingModal
          car={selectedCarForBooking}
          onClose={() => setSelectedCarForBooking(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* Receipt Modal */}
      {receiptBooking && (
        <DigitalReceiptModal
          booking={receiptBooking}
          onClose={() => setReceiptBooking(null)}
        />
      )}
    </div>
  );
};

export default CustomerExplore;
