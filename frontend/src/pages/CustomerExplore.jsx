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
  Sliders, Star, User, PhoneCall, Check, Info, ShieldAlert
} from 'lucide-react';

const CATEGORIES = [
  { id: 'ALL', label: 'All Fleet', emoji: '🌟' },
  { id: 'BIKE', label: 'Bike Taxi', emoji: '🏍️', tag: 'Rapido' },
  { id: 'AUTO', label: 'Auto Rickshaw', emoji: '🛺', tag: '3-Seater' },
  { id: 'SEDAN', label: 'Cabs & Sedans', emoji: '🚗', tag: 'Uber Go' },
  { id: 'TROLLEY_PORTER', label: 'Trolley / Porter', emoji: '🛻', tag: 'Tata Ace 750kg' },
  { id: 'ELECTRIC', label: 'Electric EV', emoji: '⚡', tag: 'Eco Green' },
  { id: 'SUV', label: 'Family SUV', emoji: '🚙', tag: '6 Seater' },
  { id: 'LUXURY', label: 'Luxury Chauffeur', emoji: '👑', tag: 'Premier' },
];

const PRESET_LOCATIONS = [
  { name: 'Indiranagar 100ft Rd', area: 'Central Bengaluru', lat: 12.9784, lng: 77.6408 },
  { name: 'Kempegowda Airport (BLR)', area: 'Devanahalli', lat: 13.1986, lng: 77.7066 },
  { name: 'MG Road Metro Station', area: 'CBD', lat: 12.9756, lng: 77.6066 },
  { name: 'Electronic City Phase 1', area: 'South Tech Hub', lat: 12.8452, lng: 77.6602 },
  { name: 'Whitefield IT Park', area: 'East Tech Hub', lat: 12.9866, lng: 77.7382 },
  { name: 'Koramangala 5th Block', area: 'Startup Hub', lat: 12.9352, lng: 77.6245 },
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

  // Selected vehicle for instant booking in cockpit
  const [highlightedCarId, setHighlightedCarId] = useState(null);

  // Dual UX Layout: 'desktop' or 'mobile'
  const [viewMode, setViewMode] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < 1024 ? 'mobile' : 'desktop';
  });

  // Mobile App active tab
  const [mobileTab, setMobileTab] = useState('rides');

  // Route selector
  const [pickupIndex, setPickupIndex] = useState(0);
  const [dropoffIndex, setDropoffIndex] = useState(1);

  const pickupLocation = PRESET_LOCATIONS[pickupIndex];
  const dropoffLocation = PRESET_LOCATIONS[dropoffIndex];
  const pickupCoord = [pickupLocation.lat, pickupLocation.lng];
  const dropoffCoord = [dropoffLocation.lat, dropoffLocation.lng];

  // Route distance estimation
  const estDistanceKm = Math.round(
    (Math.sqrt(
      Math.pow((dropoffLocation.lat - pickupLocation.lat) * 111, 2) +
      Math.pow((dropoffLocation.lng - pickupLocation.lng) * 111, 2)
    ) * 1.25) * 10
  ) / 10 || 14.5;
  const estDurationMins = Math.round(estDistanceKm * 2.3);

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

      if (carsRes.data.length > 0 && !highlightedCarId) {
        setHighlightedCarId(carsRes.data[0].id);
      }

      // Check if user has an active ongoing ride
      const ongoing = bookingsRes.data.find(
        (b) => b.status === 'REQUESTED' || b.status === 'ACCEPTED' || b.status === 'DRIVER_ARRIVING' || b.status === 'IN_PROGRESS'
      );
      if (ongoing) {
        setActiveBooking(ongoing);
      }
    } catch (err) {
      console.error("Failed to load fleet:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedSeats]);

  const handleBookingSuccess = (newBooking) => {
    setSelectedCarForBooking(null);
    setActiveBooking(newBooking);
    loadData();
  };

  const selectedVehicle = cars.find((c) => c.id === highlightedCarId) || cars[0] || null;

  // Calculate fare for selected vehicle
  const calculateFare = (car) => {
    if (!car) return 0;
    const base = car.baseFare || 25;
    const dist = estDistanceKm * car.pricePerKm;
    const tax = (base + dist) * 0.05;
    return Math.round(base + dist + tax);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Professional Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan flex items-center justify-center text-slate-950 font-black shadow-lg shadow-brand-500/20 text-lg">
            ⚡
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-extrabold text-white tracking-tight">DrivePulse On-Demand Mobility</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>TiDB Cloud Connected</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-Modal Platform: Bike Taxi (Rapido) • Auto Rickshaw • Cabs (Uber) • Tata Ace Porter
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs w-full md:w-auto justify-center">
          <button
            onClick={() => setViewMode('desktop')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
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
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
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

      {/* Active Trip Telemetry Banner (If ride ongoing) */}
      {activeBooking && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold tracking-wider text-brand-400 uppercase flex items-center space-x-2">
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
      {/* 💻 VIEW 1: LAPTOP / DESKTOP COCKPIT (UBER & RAPIDO SPLIT-SCREEN LAYOUT)  */}
      {/* ========================================================================= */}
      {viewMode === 'desktop' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Booking Panel & Multi-Modal Tier Selector */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-4">
            {/* Route Selector Box (Uber Style) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Where are you heading?</span>
                <span className="text-[11px] text-brand-400 font-mono">
                  {estDistanceKm} km • ~{estDurationMins} mins
                </span>
              </h2>

              {/* Connected Pickup & Dropoff Inputs */}
              <div className="relative pl-6 space-y-3">
                {/* Connecting Line */}
                <div className="absolute left-2.5 top-3.5 bottom-3.5 w-0.5 bg-gradient-to-b from-brand-500 via-slate-600 to-rose-500" />

                {/* Pickup Point */}
                <div className="relative">
                  <div className="absolute -left-6 top-2.5 w-3 h-3 rounded-full bg-brand-500 ring-4 ring-brand-500/20" />
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Pickup Location</label>
                  <select
                    value={pickupIndex}
                    onChange={(e) => setPickupIndex(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-brand-500"
                  >
                    {PRESET_LOCATIONS.map((loc, idx) => (
                      <option key={idx} value={idx} disabled={idx === dropoffIndex}>
                        {loc.name} ({loc.area})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination Dropoff */}
                <div className="relative">
                  <div className="absolute -left-6 top-2.5 w-3 h-3 rounded-sm bg-rose-500 ring-4 ring-rose-500/20" />
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Destination Drop-off</label>
                  <select
                    value={dropoffIndex}
                    onChange={(e) => setDropoffIndex(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-rose-500"
                  >
                    {PRESET_LOCATIONS.map((loc, idx) => (
                      <option key={idx} value={idx} disabled={idx === pickupIndex}>
                        {loc.name} ({loc.area})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-Modal Category Filter Horizontal Scroll */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                          isSelected
                            ? 'bg-brand-500 text-slate-950 border-brand-500 shadow-lg shadow-brand-500/20'
                            : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Ride Options List (Uber / Rapido Style Cards) */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-24 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
                  ))}
                </div>
              ) : cars.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
                  <Car className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 font-semibold">No vehicles found in this category.</p>
                  <button
                    onClick={() => setSelectedCategory('ALL')}
                    className="text-xs text-brand-400 font-bold underline"
                  >
                    View All Fleet
                  </button>
                </div>
              ) : (
                cars.map((car) => {
                  const isSelected = (selectedVehicle?.id === car.id);
                  const fare = calculateFare(car);

                  let emoji = '🚗';
                  let badgeText = 'Cab';
                  let badgeColor = 'text-brand-400 bg-brand-500/10 border-brand-500/30';
                  let specText = `${car.seats} Seats • AC`;

                  if (car.category === 'BIKE') {
                    emoji = '🏍️';
                    badgeText = 'Rapido Bike';
                    badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
                    specText = '1 Rider • Sanitized Helmet';
                  } else if (car.category === 'AUTO') {
                    emoji = '🛺';
                    badgeText = 'Auto';
                    badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
                    specText = '3 Seats • Metered Upfront';
                  } else if (car.category === 'TROLLEY_PORTER') {
                    emoji = '🛻';
                    badgeText = 'Porter';
                    badgeColor = 'text-purple-400 bg-purple-500/10 border-purple-500/30';
                    specText = `Max ${car.maxWeightKg || 750} kg • Cargo`;
                  } else if (car.category === 'ELECTRIC') {
                    emoji = '⚡';
                    badgeText = 'Uber Green';
                    badgeColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
                    specText = '4 Seats • Zero Emission';
                  }

                  return (
                    <div
                      key={car.id}
                      onClick={() => setHighlightedCarId(car.id)}
                      className={`group relative rounded-2xl p-3.5 border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-slate-900 border-brand-500 ring-2 ring-brand-500/30 shadow-xl shadow-brand-500/10'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        {/* Vehicle Image or Category Icon */}
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800">
                          <img
                            src={car.imageUrl}
                            alt={car.model}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400";
                            }}
                          />
                          <div className="absolute top-0.5 left-0.5 text-xs">
                            {emoji}
                          </div>
                        </div>

                        {/* Title, Category & Specs */}
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-bold text-white truncate">
                              {car.make} {car.model}
                            </h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider ${badgeColor}`}>
                              {badgeText}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                            <span className="text-brand-400 font-semibold flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              2 mins
                            </span>
                            <span>•</span>
                            <span className="truncate">{specText}</span>
                          </div>

                          <div className="flex items-center space-x-1 text-[11px] text-amber-400 mt-1">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span className="font-semibold">{car.rating || 4.9}</span>
                            <span className="text-slate-500 font-mono">({car.totalTrips || 120}+ trips)</span>
                          </div>
                        </div>
                      </div>

                      {/* Upfront Guaranteed Fare & Quick Select Button */}
                      <div className="text-right flex-shrink-0 pl-3">
                        <div className="text-lg font-black text-white font-mono leading-none">
                          ₹{fare}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">
                          ₹{car.pricePerKm}/km
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCarForBooking(car);
                          }}
                          className={`mt-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                            isSelected
                              ? 'bg-brand-500 text-slate-950 font-extrabold hover:bg-brand-400'
                              : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Selected Vehicle Instant Confirmation Sticky Card */}
            {selectedVehicle && (
              <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-brand-500/40 rounded-2xl p-4 shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-400">Guaranteed Upfront Rate</p>
                  <p className="text-lg font-black text-white">
                    ₹{calculateFare(selectedVehicle)}
                    <span className="text-xs text-slate-400 font-normal ml-2">All inclusive</span>
                  </p>
                </div>

                <button
                  onClick={() => setSelectedCarForBooking(selectedVehicle)}
                  className="py-3 px-6 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-slate-950 font-black text-xs shadow-lg shadow-brand-500/25 active:scale-95 transition-all flex items-center space-x-2"
                >
                  <span>Confirm {selectedVehicle.category === 'TROLLEY_PORTER' ? 'Porter' : selectedVehicle.category === 'BIKE' ? 'Bike Taxi' : 'Ride'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Full-Height Interactive Leaflet Telemetry Map */}
          <div className="lg:col-span-6 xl:col-span-7 sticky top-20 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl overflow-hidden relative">
              {/* Map Header Status */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-ping" />
                  <span className="font-bold text-white uppercase tracking-wider">Live City Telemetry</span>
                  <span className="text-slate-400 font-mono">• Bengaluru Fleet Hub</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-300">
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">10 Verified Pilots Online</span>
                </div>
              </div>

              {/* Leaflet Map Preview */}
              <MapView
                pickup={pickupCoord}
                dropoff={dropoffCoord}
                category={selectedVehicle?.category || 'SEDAN'}
                className="h-[520px] rounded-2xl"
              />

              {/* Safety & Features HUD Footer */}
              <div className="grid grid-cols-3 gap-3 pt-3 mt-3 border-t border-slate-800 text-center text-xs">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <HardHat className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <span className="font-bold text-white text-[11px] block">Rapido Helmet</span>
                  <span className="text-[10px] text-slate-400">Sanitized for safety</span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <ShieldCheck className="w-4 h-4 text-brand-400 mx-auto mb-1" />
                  <span className="font-bold text-white text-[11px] block">Verified Drivers</span>
                  <span className="text-[10px] text-slate-400">Commercial licensed</span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <Package className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                  <span className="font-bold text-white text-[11px] block">750kg Porter</span>
                  <span className="text-[10px] text-slate-400">Heavy cargo loader</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📱 VIEW 2: AUTHENTIC MOBILE APP EXPERIENCE (RAPIDO & UBER NATIVE)        */}
      {/* ========================================================================= */}
      {viewMode === 'mobile' && (
        <div className="w-full max-w-md mx-auto bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col min-h-[720px] relative">
          {/* Mobile Top Floating Search Card */}
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md space-y-3 z-20">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-white flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                <span>DrivePulse Mobile</span>
              </span>
              <span className="text-[10px] font-mono text-brand-400 font-bold">~{estDurationMins} mins</span>
            </div>

            {/* Pickup & Drop location pills */}
            <div className="space-y-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-500 flex-shrink-0" />
                <span className="font-semibold text-white truncate">{pickupLocation.name}</span>
              </div>
              <div className="w-full h-px bg-slate-800" />
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-rose-500 flex-shrink-0" />
                <span className="font-semibold text-white truncate">{dropoffLocation.name}</span>
              </div>
            </div>

            {/* Category horizontal pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.slice(0, 5).map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-brand-500 text-slate-950 border-brand-500 font-extrabold shadow-md shadow-brand-500/20'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Map View */}
          <div className="h-64 w-full relative">
            <MapView
              pickup={pickupCoord}
              dropoff={dropoffCoord}
              category={selectedVehicle?.category || 'SEDAN'}
              className="h-full w-full rounded-none border-0"
            />
          </div>

          {/* Draggable Bottom Sheet with Rides List */}
          <div className="flex-1 bg-slate-900 border-t border-slate-800 p-4 space-y-3 flex flex-col justify-between">
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto" />

            <div className="space-y-2 overflow-y-auto max-h-[220px]">
              {cars.map((car) => {
                const isSelected = (selectedVehicle?.id === car.id);
                const fare = calculateFare(car);

                let icon = '🚗';
                let tag = 'Cab';
                if (car.category === 'BIKE') { icon = '🏍️'; tag = 'Bike'; }
                else if (car.category === 'AUTO') { icon = '🛺'; tag = 'Auto'; }
                else if (car.category === 'TROLLEY_PORTER') { icon = '🛻'; tag = 'Porter'; }

                return (
                  <div
                    key={car.id}
                    onClick={() => setHighlightedCarId(car.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-950 border-brand-500 ring-1 ring-brand-500'
                        : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{icon}</div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-white">{car.make} {car.model}</span>
                          <span className="text-[10px] font-mono text-brand-400 font-bold">2 min</span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {car.category === 'BIKE' ? '1 Rider • Helmet' : car.category === 'AUTO' ? '3 Seats • Metered' : car.category === 'TROLLEY_PORTER' ? `Max ${car.maxWeightKg || 750} kg` : `${car.seats} Seats • AC`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-white font-mono">₹{fare}</div>
                      <div className="text-[9px] text-slate-500 line-through">₹{Math.round(fare * 1.15)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sticky Action Button */}
            <button
              onClick={() => {
                if (selectedVehicle) setSelectedCarForBooking(selectedVehicle);
              }}
              disabled={!selectedVehicle}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-slate-950 font-black text-sm shadow-xl shadow-brand-500/25 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <span>Book {selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : 'Ride'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Native Mobile App Bar */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-around text-slate-400 text-[10px]">
              <button
                onClick={() => setMobileTab('rides')}
                className={`flex flex-col items-center space-y-0.5 ${mobileTab === 'rides' ? 'text-brand-400 font-bold' : ''}`}
              >
                <Car className="w-4 h-4" />
                <span>Rides</span>
              </button>
              <button
                onClick={() => {
                  setMobileTab('trolley');
                  setSelectedCategory('TROLLEY_PORTER');
                }}
                className={`flex flex-col items-center space-y-0.5 ${mobileTab === 'trolley' ? 'text-brand-400 font-bold' : ''}`}
              >
                <Package className="w-4 h-4" />
                <span>Porter</span>
              </button>
              <button
                onClick={() => setMobileTab('activity')}
                className={`flex flex-col items-center space-y-0.5 ${mobileTab === 'activity' ? 'text-brand-400 font-bold' : ''}`}
              >
                <Clock className="w-4 h-4" />
                <span>Activity</span>
              </button>
              <button
                onClick={() => setMobileTab('safety')}
                className={`flex flex-col items-center space-y-0.5 ${mobileTab === 'safety' ? 'text-brand-400 font-bold' : ''}`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Safety</span>
              </button>
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
