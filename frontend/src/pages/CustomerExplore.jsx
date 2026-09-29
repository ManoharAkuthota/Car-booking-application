import React, { useState, useEffect } from 'react';
import { carApi, bookingApi } from '../api/client';
import BookingModal from '../components/BookingModal';
import ActiveTripCard from '../components/ActiveTripCard';
import DigitalReceiptModal from '../components/DigitalReceiptModal';
import MapView from '../components/MapView';
import {
  Car, Shield, Smartphone, Monitor, MapPin, Navigation, Clock, ShieldCheck,
  HardHat, Package, IndianRupee, ArrowRight, ArrowUpDown, CheckCircle2,
  ChevronRight, Star, AlertCircle, PhoneCall, Check, Info, ShieldAlert,
  Sparkles, RefreshCw, X, Crosshair
} from 'lucide-react';

const CATEGORIES = [
  { id: 'ALL', label: 'All Fleet', emoji: '🌟', badge: 'All' },
  { id: 'BIKE', label: 'Bike Taxi', emoji: '🏍️', badge: 'Rapido' },
  { id: 'AUTO', label: 'Auto', emoji: '🛺', badge: '3-Seater' },
  { id: 'SEDAN', label: 'Cabs', emoji: '🚗', badge: 'Uber Go' },
  { id: 'TROLLEY_PORTER', label: 'Porter Cargo', emoji: '🛻', badge: 'Tata Ace' },
  { id: 'ELECTRIC', label: 'Electric EV', emoji: '⚡', badge: 'Eco' },
  { id: 'SUV', label: 'SUV', emoji: '🚙', badge: '6 Seater' },
  { id: 'LUXURY', label: 'Luxury', emoji: '👑', badge: 'Premier' },
];

const DEFAULT_LOCATIONS = [
  { name: 'Indiranagar 100ft Rd', area: 'Central Bengaluru', lat: 12.9784, lng: 77.6408 },
  { name: 'Kempegowda Airport (BLR)', area: 'Devanahalli', lat: 13.1986, lng: 77.7066 },
  { name: 'MG Road Metro Station', area: 'CBD', lat: 12.9756, lng: 77.6066 },
  { name: 'Electronic City Phase 1', area: 'South Tech Hub', lat: 12.8452, lng: 77.6602 },
  { name: 'Whitefield IT Park', area: 'East Tech Hub', lat: 12.9866, lng: 77.7382 },
  { name: 'Koramangala 5th Block', area: 'Startup Hub', lat: 12.9352, lng: 77.6245 },
  { name: 'HSR Layout Sector 1', area: 'South-East', lat: 12.9116, lng: 77.6389 },
  { name: 'Jayanagar 4th Block', area: 'South Bengaluru', lat: 12.9299, lng: 77.5834 },
];

const CustomerExplore = ({ onNavigateToTrips }) => {
  const [cars, setCars] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState(null);
  const [selectedCarForBooking, setSelectedCarForBooking] = useState(null);
  const [receiptBooking, setReceiptBooking] = useState(null);
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  // Selected vehicle for instant booking in cockpit
  const [highlightedCarId, setHighlightedCarId] = useState(null);

  // Layout mode switcher for desktop testing: 'auto' (device responsive) or 'mockup' (simulate mobile bezel on desktop)
  const [deviceMode, setDeviceMode] = useState('auto');

  // Mobile App active bottom tab
  const [mobileTab, setMobileTab] = useState('rides');

  // Preset & Live Locations
  const [locations, setLocations] = useState(DEFAULT_LOCATIONS);
  const [pickupIndex, setPickupIndex] = useState(0);
  const [dropoffIndex, setDropoffIndex] = useState(1);
  const [userLiveLocationName, setUserLiveLocationName] = useState(null);

  // Automatically request browser live geolocation on mount (Rapido & Uber style)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const liveLoc = {
            name: '📍 My Current Location (Live GPS)',
            area: 'Real-time GPS',
            lat: lat,
            lng: lng,
            isLive: true,
          };
          setUserLiveLocationName('📍 Current Location (GPS)');
          setLocations((prev) => [liveLoc, ...prev.filter((l) => !l.isLive)]);
          setPickupIndex(0);
        },
        (error) => {
          console.log("GPS Location notice: using standard Bengaluru telemetry default.", error.message);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  const pickupLocation = locations[pickupIndex] || locations[0] || DEFAULT_LOCATIONS[0];
  const dropoffLocation = locations[dropoffIndex] || locations[1] || DEFAULT_LOCATIONS[1];
  const pickupCoord = [pickupLocation.lat, pickupLocation.lng];
  const dropoffCoord = [dropoffLocation.lat, dropoffLocation.lng];

  // Route distance estimation in km
  const estDistanceKm = Math.round(
    (Math.sqrt(
      Math.pow((dropoffLocation.lat - pickupLocation.lat) * 111, 2) +
      Math.pow((dropoffLocation.lng - pickupLocation.lng) * 111, 2)
    ) * 1.25) * 10
  ) / 10 || 14.5;
  const estDurationMins = Math.round(estDistanceKm * 2.3) || 30;

  // Swap pickup and dropoff
  const handleSwapLocations = () => {
    const temp = pickupIndex;
    setPickupIndex(dropoffIndex);
    setDropoffIndex(temp);
  };

  // Re-trigger live location detection
  const handleDetectLiveLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const liveLoc = {
            name: '📍 My Current Location (Live GPS)',
            area: 'Real-time GPS',
            lat: lat,
            lng: lng,
            isLive: true,
          };
          setLocations((prev) => [liveLoc, ...prev.filter((l) => !l.isLive)]);
          setPickupIndex(0);
        },
        (err) => alert("Could not fetch GPS: " + err.message)
      );
    }
  };

  // Load cars and check for active booking
  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'ALL') params.category = selectedCategory;

      const [carsRes, bookingsRes] = await Promise.all([
        carApi.getAll(params),
        bookingApi.getMyBookings(),
      ]);

      setCars(carsRes.data);

      if (carsRes.data.length > 0) {
        const exists = carsRes.data.some((c) => c.id === highlightedCarId);
        if (!exists) {
          setHighlightedCarId(carsRes.data[0].id);
        }
      }

      // Check if user has an active ongoing ride
      const ongoing = bookingsRes.data.find(
        (b) => b.status === 'REQUESTED' || b.status === 'ACCEPTED' || b.status === 'DRIVER_ARRIVING' || b.status === 'IN_PROGRESS'
      );
      if (ongoing) {
        setActiveBooking(ongoing);
      }
    } catch (err) {
      console.error("Failed to load fleet data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const handleBookingSuccess = (newBooking) => {
    setSelectedCarForBooking(null);
    setActiveBooking(newBooking);
    loadData();
  };

  const selectedVehicle = cars.find((c) => c.id === highlightedCarId) || cars[0] || null;

  // Calculate upfront fare for selected vehicle
  const calculateFare = (car) => {
    if (!car) return 0;
    const base = car.baseFare || 25;
    const dist = estDistanceKm * car.pricePerKm;
    const tax = (base + dist) * 0.05;
    return Math.round(base + dist + tax);
  };

  // Helper for vehicle category visual representation in White Theme
  const getVehicleVisuals = (car) => {
    let emoji = '🚗';
    let badgeText = 'Cab';
    let badgeColor = 'text-brand-700 bg-brand-50 border-brand-200';
    let specText = `${car.seats} Seats • AC`;

    if (car.category === 'BIKE') {
      emoji = '🏍️';
      badgeText = 'Rapido Bike';
      badgeColor = 'text-amber-800 bg-amber-50 border-amber-300';
      specText = '1 Rider • Sanitized Helmet';
    } else if (car.category === 'AUTO') {
      emoji = '🛺';
      badgeText = 'Auto';
      badgeColor = 'text-amber-900 bg-amber-100 border-amber-300';
      specText = '3 Seats • Metered Upfront';
    } else if (car.category === 'TROLLEY_PORTER') {
      emoji = '🛻';
      badgeText = 'Porter';
      badgeColor = 'text-purple-700 bg-purple-50 border-purple-200';
      specText = `Max ${car.maxWeightKg || 750} kg • Cargo`;
    } else if (car.category === 'ELECTRIC') {
      emoji = '⚡';
      badgeText = 'Uber Green';
      badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
      specText = '4 Seats • Zero Emission';
    }

    return { emoji, badgeText, badgeColor, specText };
  };

  return (
    <div className="w-full">
      {/* Active Trip Telemetry Banner (If ride ongoing) */}
      {activeBooking && (
        <section className="mb-6 space-y-3 px-4 lg:px-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold tracking-wider text-brand-700 uppercase flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-ping" />
              <span>Live Ongoing Trip Telemetry</span>
            </h2>
            <button
              onClick={() => setActiveBooking(null)}
              className="text-xs text-gray-500 hover:text-gray-800 font-semibold"
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

      {/* Desktop Top Bar (Hidden on mobile screens) - Clean White Theme */}
      <div className="hidden lg:flex items-center justify-between bg-white border border-gray-200 rounded-2xl p-4 shadow-sm mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-brand-500/20 text-lg">
            ⚡
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-extrabold text-gray-950 tracking-tight">DrivePulse On-Demand Mobility</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Google Maps Telemetry Active</span>
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Multi-Modal Booking: Rapido Bike Taxi • Auto Rickshaw • Uber Cabs • Porter Cargo
            </p>
          </div>
        </div>

        {/* View Mode Toggle for Desktop testing */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-bold text-gray-600">
          <button
            onClick={() => setDeviceMode('auto')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              deviceMode === 'auto'
                ? 'bg-white text-gray-950 shadow-sm'
                : 'hover:text-gray-950'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Laptop Cockpit</span>
          </button>
          <button
            onClick={() => setDeviceMode('mockup')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              deviceMode === 'mockup'
                ? 'bg-white text-gray-950 shadow-sm'
                : 'hover:text-gray-950'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Device Simulation</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📱 1. CLEAN WHITE MOBILE APP VIEW (Active on mobile viewports OR simulation) */}
      {/* ========================================================================= */}
      <div className={`${deviceMode === 'mockup' ? 'block' : 'lg:hidden'} w-full`}>
        <div className={`${deviceMode === 'mockup' ? 'max-w-md mx-auto rounded-3xl border border-gray-200 shadow-2xl my-4' : 'min-h-[calc(100vh-64px)]'} bg-white flex flex-col relative overflow-hidden`}>
          
          {/* Top Floating Search Card & Modalities Header (Clean White Style) */}
          <div className="p-3 bg-white border-b border-gray-200 shadow-sm space-y-2.5 z-20">
            {/* Brand & ETA Status */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-gray-950 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="tracking-tight">Drive<span className="text-brand-600">Pulse</span> Mobility</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {estDistanceKm} km • ~{estDurationMins}m
              </span>
            </div>

            {/* Pickup & Destination Interactive Card with Swap Button */}
            <div className="relative bg-gray-50 p-2.5 rounded-2xl border border-gray-200 text-xs shadow-inner">
              {/* Pickup Row */}
              <div className="flex items-center space-x-2.5 pr-8">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-emerald-500/20 flex-shrink-0" />
                <select
                  value={pickupIndex}
                  onChange={(e) => setPickupIndex(Number(e.target.value))}
                  className="bg-transparent text-gray-900 font-bold w-full focus:outline-none truncate text-xs cursor-pointer"
                >
                  {locations.map((loc, idx) => (
                    <option key={idx} value={idx} disabled={idx === dropoffIndex} className="bg-white text-gray-900">
                      {loc.name} {loc.area ? `(${loc.area})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gray-200 my-2" />

              {/* Destination Dropoff Row */}
              <div className="flex items-center space-x-2.5 pr-8">
                <div className="w-2.5 h-2.5 rounded-sm bg-rose-600 ring-4 ring-rose-500/20 flex-shrink-0" />
                <select
                  value={dropoffIndex}
                  onChange={(e) => setDropoffIndex(Number(e.target.value))}
                  className="bg-transparent text-gray-900 font-bold w-full focus:outline-none truncate text-xs cursor-pointer"
                >
                  {locations.map((loc, idx) => (
                    <option key={idx} value={idx} disabled={idx === pickupIndex} className="bg-white text-gray-900">
                      {loc.name} {loc.area ? `(${loc.area})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Route Swap Icon Button */}
              <button
                type="button"
                onClick={handleSwapLocations}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-brand-600 hover:bg-gray-100 active:scale-90 transition-all shadow-sm"
                title="Swap pickup and dropoff"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Horizontal Modalities Filter Strip (Rapido & Uber style) */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-400 font-extrabold shadow-sm scale-[1.02]'
                        : 'bg-gray-100 text-gray-600 border-gray-200 hover:text-gray-950 hover:bg-gray-200'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.badge || cat.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full-Bleed Google Map Container with Moving Nearby Fleet */}
          <div className="w-full h-64 sm:h-72 relative flex-shrink-0">
            <MapView
              pickup={pickupCoord}
              dropoff={dropoffCoord}
              category={selectedVehicle?.category || 'SEDAN'}
              className="h-full w-full rounded-none border-0"
              onLocateMe={handleDetectLiveLocation}
            />
          </div>

          {/* Authentic Uber & Rapido Bottom Drawer (Zero overflow clipping, clean white theme) */}
          <div className="flex-1 bg-white border-t border-gray-200 flex flex-col justify-between shadow-xl">
            {/* Sheet Handle */}
            <div className="py-2 flex items-center justify-center">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Sub-header info */}
            <div className="px-4 pb-2 flex items-center justify-between text-[11px] text-gray-500 font-bold border-b border-gray-100">
              <span className="flex items-center space-x-1 text-emerald-700">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant 2-min pickup nearby</span>
              </span>
              <span className="text-gray-400 font-mono">Guaranteed upfront rate</span>
            </div>

            {/* Vehicle Options List */}
            <div className="p-3 space-y-2 overflow-y-auto max-h-[240px] sm:max-h-[280px]">
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-16 rounded-2xl bg-gray-100 animate-pulse border border-gray-200" />
                  ))}
                </div>
              ) : cars.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500">
                  <p>No vehicles in this category right now.</p>
                  <button onClick={() => setSelectedCategory('ALL')} className="text-brand-600 font-bold underline mt-1">
                    Show All Fleet
                  </button>
                </div>
              ) : (
                cars.map((car) => {
                  const isSelected = (selectedVehicle?.id === car.id);
                  const fare = calculateFare(car);
                  const { emoji, badgeText, badgeColor, specText } = getVehicleVisuals(car);

                  return (
                    <div
                      key={car.id}
                      onClick={() => setHighlightedCarId(car.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-50/60 border-amber-400 ring-2 ring-amber-400/40 shadow-sm'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {/* Vehicle Image or Category Thumbnail */}
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                          <img
                            src={car.imageUrl}
                            alt={car.model}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400";
                            }}
                          />
                          <div className="absolute top-0 left-0 bg-white/90 px-1 rounded-br text-[10px] shadow-sm">
                            {emoji}
                          </div>
                        </div>

                        {/* Vehicle Details */}
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-extrabold text-gray-900 truncate">{car.make} {car.model}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border ${badgeColor}`}>
                              {badgeText}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 truncate mt-0.5 font-medium">
                            {specText}
                          </p>
                          <div className="flex items-center space-x-1 text-[10px] text-amber-600 font-semibold">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            <span>{car.rating || 4.9}</span>
                            <span className="text-gray-400 font-mono font-normal">• 2 min</span>
                          </div>
                        </div>
                      </div>

                      {/* Upfront Fare */}
                      <div className="text-right flex-shrink-0 pl-2">
                        <div className="text-sm font-black text-gray-950 font-mono leading-none">₹{fare}</div>
                        <div className="text-[10px] text-gray-400 line-through mt-1">₹{Math.round(fare * 1.15)}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Sticky Native Action Booking Button (Anchored above safe area, zero clipping) */}
            <div className="sticky bottom-0 p-3 bg-white/95 border-t border-gray-200 backdrop-blur-md z-30 shadow-lg">
              <button
                onClick={() => {
                  if (selectedVehicle) setSelectedCarForBooking(selectedVehicle);
                }}
                disabled={!selectedVehicle}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-brand-500 hover:from-amber-500 hover:to-brand-600 text-slate-950 font-black text-sm shadow-md active:scale-98 transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {selectedVehicle ? getVehicleVisuals(selectedVehicle).emoji : '🚗'}
                  </span>
                  <span>Book {selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : 'Ride'}</span>
                </div>
                <div className="flex items-center space-x-2 font-mono text-base font-extrabold">
                  <span>₹{selectedVehicle ? calculateFare(selectedVehicle) : '--'}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              {/* Native Bottom Navigation Tabs */}
              <div className="pt-2.5 mt-2 border-t border-gray-100 flex items-center justify-around text-gray-500 text-[10px] font-bold">
                <button
                  onClick={() => {
                    setMobileTab('rides');
                    setSelectedCategory('ALL');
                  }}
                  className={`flex flex-col items-center space-y-0.5 ${mobileTab === 'rides' ? 'text-brand-600 font-extrabold' : 'hover:text-gray-900'}`}
                >
                  <Car className="w-4 h-4" />
                  <span>Rides</span>
                </button>
                <button
                  onClick={() => {
                    setMobileTab('porter');
                    setSelectedCategory('TROLLEY_PORTER');
                  }}
                  className={`flex flex-col items-center space-y-0.5 ${mobileTab === 'porter' ? 'text-brand-600 font-extrabold' : 'hover:text-gray-900'}`}
                >
                  <Package className="w-4 h-4" />
                  <span>Porter</span>
                </button>
                <button
                  onClick={() => {
                    setMobileTab('activity');
                    if (onNavigateToTrips) onNavigateToTrips();
                  }}
                  className={`flex flex-col items-center space-y-0.5 ${mobileTab === 'activity' ? 'text-brand-600 font-extrabold' : 'hover:text-gray-900'}`}
                >
                  <Clock className="w-4 h-4" />
                  <span>My Trips</span>
                </button>
                <button
                  onClick={() => {
                    setMobileTab('safety');
                    setShowSafetyModal(true);
                  }}
                  className={`flex flex-col items-center space-y-0.5 ${mobileTab === 'safety' ? 'text-brand-600 font-extrabold' : 'hover:text-gray-900'}`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Safety</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 💻 2. LAPTOP / DESKTOP COCKPIT (Clean White Theme on screens >= 1024px)     */}
      {/* ========================================================================= */}
      <div className={`${deviceMode === 'auto' ? 'hidden lg:grid' : 'hidden'} grid-cols-12 gap-6 items-start`}>
        {/* LEFT COLUMN: Booking Panel & Multi-Modal Tier Selector */}
        <div className="col-span-12 xl:col-span-5 lg:col-span-6 space-y-4">
          {/* Route Selector Box (Uber Style Clean White) */}
          <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-gray-950 flex items-center justify-between">
              <span>Where are you heading?</span>
              <span className="text-xs text-emerald-700 font-mono font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {estDistanceKm} km • ~{estDurationMins} mins
              </span>
            </h2>

            {/* Connected Pickup & Dropoff Inputs with Route Swap */}
            <div className="relative pl-6 space-y-3">
              {/* Connecting Line */}
              <div className="absolute left-2.5 top-3.5 bottom-3.5 w-0.5 bg-gradient-to-b from-emerald-600 via-gray-300 to-rose-600" />

              {/* Pickup Point */}
              <div className="relative">
                <div className="absolute -left-6 top-2.5 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-emerald-500/20" />
                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Pickup Location</label>
                <select
                  value={pickupIndex}
                  onChange={(e) => setPickupIndex(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-brand-500 focus:bg-white"
                >
                  {locations.map((loc, idx) => (
                    <option key={idx} value={idx} disabled={idx === dropoffIndex}>
                      {loc.name} {loc.area ? `(${loc.area})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Dropoff */}
              <div className="relative">
                <div className="absolute -left-6 top-2.5 w-3 h-3 rounded-sm bg-rose-600 ring-4 ring-rose-500/20" />
                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Destination Drop-off</label>
                <select
                  value={dropoffIndex}
                  onChange={(e) => setDropoffIndex(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-rose-500 focus:bg-white"
                >
                  {locations.map((loc, idx) => (
                    <option key={idx} value={idx} disabled={idx === pickupIndex}>
                      {loc.name} {loc.area ? `(${loc.area})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button & Live Location Button */}
              <div className="pt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleDetectLiveLocation}
                  className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Use Live GPS</span>
                </button>
                <button
                  type="button"
                  onClick={handleSwapLocations}
                  className="flex items-center space-x-1.5 text-[11px] font-bold text-brand-600 hover:text-brand-700"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Reverse Route</span>
                </button>
              </div>
            </div>

            {/* Multi-Modal Category Filter Horizontal Scroll */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:text-gray-950 hover:bg-gray-100'
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

          {/* Ride Options List (Clean White Cards) */}
          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-24 rounded-2xl bg-gray-100 animate-pulse border border-gray-200" />
                ))}
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 space-y-2">
                <Car className="w-10 h-10 text-gray-400 mx-auto" />
                <p className="text-xs text-gray-500 font-semibold">No vehicles found in this category.</p>
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className="text-xs text-brand-600 font-bold underline"
                >
                  View All Fleet
                </button>
              </div>
            ) : (
              cars.map((car) => {
                const isSelected = (selectedVehicle?.id === car.id);
                const fare = calculateFare(car);
                const { emoji, badgeText, badgeColor, specText } = getVehicleVisuals(car);

                return (
                  <div
                    key={car.id}
                    onClick={() => setHighlightedCarId(car.id)}
                    className={`group relative rounded-2xl p-3.5 border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-50/60 border-amber-400 ring-2 ring-amber-400/40 shadow-md'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      {/* Vehicle Image */}
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                        <img
                          src={car.imageUrl}
                          alt={car.model}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400";
                          }}
                        />
                        <div className="absolute top-0.5 left-0.5 bg-white/90 px-1 rounded-br text-xs shadow-sm">
                          {emoji}
                        </div>
                      </div>

                      {/* Title, Category & Specs */}
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-extrabold text-gray-950 truncate">
                            {car.make} {car.model}
                          </h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider ${badgeColor}`}>
                            {badgeText}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-0.5">
                          <span className="text-emerald-700 font-bold flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-emerald-600" />
                            2 mins
                          </span>
                          <span>•</span>
                          <span className="truncate font-medium">{specText}</span>
                        </div>

                        <div className="flex items-center space-x-1 text-[11px] text-amber-600 font-bold mt-1">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{car.rating || 4.9}</span>
                          <span className="text-gray-400 font-mono font-normal">({car.totalTrips || 120}+ trips)</span>
                        </div>
                      </div>
                    </div>

                    {/* Upfront Guaranteed Fare & Quick Select Button */}
                    <div className="text-right flex-shrink-0 pl-3">
                      <div className="text-lg font-black text-gray-950 font-mono leading-none">
                        ₹{fare}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-1">
                        ₹{car.pricePerKm}/km
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCarForBooking(car);
                        }}
                        className={`mt-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 font-black hover:bg-amber-500'
                            : 'bg-gray-100 text-gray-700 hover:text-gray-950 hover:bg-gray-200'
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
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-md flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Guaranteed Upfront Rate</p>
                <p className="text-lg font-black text-gray-950">
                  ₹{calculateFare(selectedVehicle)}
                  <span className="text-xs text-gray-500 font-normal ml-2">All inclusive</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedCarForBooking(selectedVehicle)}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-brand-500 hover:from-amber-500 hover:to-brand-600 text-slate-950 font-black text-xs shadow-md active:scale-98 transition-all flex items-center space-x-2"
              >
                <span>Confirm {selectedVehicle.category === 'TROLLEY_PORTER' ? 'Porter' : selectedVehicle.category === 'BIKE' ? 'Bike Taxi' : 'Ride'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Full-Height Interactive Google Maps Cockpit */}
        <div className="col-span-12 xl:col-span-7 lg:col-span-6 sticky top-20 space-y-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-4 shadow-md overflow-hidden relative">
            {/* Map Header Status */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3 text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-extrabold text-gray-950 uppercase tracking-wider">Google Maps Live City Telemetry</span>
                <span className="text-gray-500 font-mono">• Bengaluru Hub</span>
              </div>
              <div className="flex items-center space-x-2 text-[11px] font-mono text-gray-600">
                <span className="px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 font-bold">6 Nearby Patrol Pilots Active</span>
              </div>
            </div>

            {/* Google Maps Leaflet Preview */}
            <MapView
              pickup={pickupCoord}
              dropoff={dropoffCoord}
              category={selectedVehicle?.category || 'SEDAN'}
              className="h-[520px] rounded-2xl"
              onLocateMe={handleDetectLiveLocation}
            />

            {/* Safety & Features HUD Footer */}
            <div className="grid grid-cols-3 gap-3 pt-3 mt-3 border-t border-gray-100 text-center text-xs">
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <HardHat className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                <span className="font-extrabold text-gray-900 text-[11px] block">Rapido Helmet</span>
                <span className="text-[10px] text-gray-500">Sanitized for safety</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <ShieldCheck className="w-4 h-4 text-brand-600 mx-auto mb-1" />
                <span className="font-extrabold text-gray-900 text-[11px] block">Verified Drivers</span>
                <span className="text-[10px] text-gray-500">Commercial licensed</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <Package className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                <span className="font-extrabold text-gray-900 text-[11px] block">750kg Porter</span>
                <span className="text-[10px] text-gray-500">Heavy cargo loader</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Safety & 24/7 SOS Information Modal (White Theme) */}
      {showSafetyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center space-x-2 text-brand-600">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="font-extrabold text-gray-950 text-base">DrivePulse Safety Shield</h3>
              </div>
              <button onClick={() => setShowSafetyModal(false)} className="text-gray-400 hover:text-gray-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700">
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex items-start space-x-3">
                <span className="text-xl">🪖</span>
                <div>
                  <h4 className="font-bold text-gray-950">Sanitized Helmet Guarantee</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Every Rapido bike ride pilot carries a clean, sanitized helmet and hygienic cap for riders.</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex items-start space-x-3">
                <span className="text-xl">🛡️</span>
                <div>
                  <h4 className="font-bold text-gray-950">Commercial Insurance Included</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">All rides and cargo delivery trips include comprehensive accidental and transit insurance.</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex items-start space-x-3">
                <span className="text-xl">🚨</span>
                <div>
                  <h4 className="font-bold text-gray-950">24/7 SOS Emergency Response</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Direct 1-tap connection to law enforcement and our 24/7 dedicated safety operations dispatch.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSafetyModal(false)}
              className="w-full py-3 rounded-xl bg-brand-500 text-slate-950 font-black text-xs shadow-md"
            >
              Understood
            </button>
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
