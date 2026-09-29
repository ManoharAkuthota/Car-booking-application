import React, { useState, useEffect, useMemo } from 'react';
import { carApi, bookingApi } from '../api/client';
import { DEFAULT_PRESET_LOCATIONS, reverseGeocode } from '../api/locationService';
import LocationSearchInput from '../components/LocationSearchInput';
import BookingModal from '../components/BookingModal';
import ActiveTripCard from '../components/ActiveTripCard';
import DigitalReceiptModal from '../components/DigitalReceiptModal';
import MapView from '../components/MapView';
import {
  Car, Shield, MapPin, Navigation, Clock, ShieldCheck,
  HardHat, Package, IndianRupee, ArrowRight, ArrowUpDown, CheckCircle2,
  ChevronRight, Star, AlertCircle, PhoneCall, Check, Info, ShieldAlert,
  Sparkles, RefreshCw, X, Crosshair, Users, Zap
} from 'lucide-react';

// 5 Dedicated Rapido & Uber Service Tiers (Clean Iconic Symbols)
const RAPIDO_SERVICES = [
  {
    id: 'BIKE',
    category: 'BIKE',
    name: 'Bike',
    symbol: '🏍️',
    tag: 'Fastest',
    tagClass: 'bg-amber-100 text-amber-900 border-amber-300',
    symbolBg: 'bg-amber-100 border-amber-300 text-amber-950',
    activeClass: 'border-amber-400 bg-amber-50/70 ring-2 ring-amber-400/50 shadow-md',
    subtitle: 'Beat city traffic • Sanitized helmet provided',
    seats: '1 Person',
    eta: '2 mins away',
    baseFare: 25,
    perKm: 7.5,
    discountPercent: 15,
    rating: '4.9',
  },
  {
    id: 'AUTO',
    category: 'AUTO',
    name: 'Auto',
    symbol: '🛺',
    tag: 'Popular',
    tagClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    symbolBg: 'bg-emerald-100 border-emerald-300 text-emerald-950',
    activeClass: 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/50 shadow-md',
    subtitle: 'Doorstep pickup • Upfront meter • Rain proof',
    seats: '3 Seats',
    eta: '3 mins away',
    baseFare: 35,
    perKm: 11,
    discountPercent: 10,
    rating: '4.8',
  },
  {
    id: 'CAB_ECONOMY',
    category: 'SEDAN',
    name: 'Cab Economy',
    symbol: '🚗',
    tag: 'Affordable AC',
    tagClass: 'bg-blue-100 text-blue-900 border-blue-300',
    symbolBg: 'bg-blue-100 border-blue-300 text-blue-950',
    activeClass: 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/50 shadow-md',
    subtitle: 'Comfy AC hatchback • Pocket friendly daily ride',
    seats: '4 Seats',
    eta: '4 mins away',
    baseFare: 65,
    perKm: 15,
    discountPercent: 12,
    rating: '4.9',
  },
  {
    id: 'CAB_PREMIUM',
    category: 'SUV',
    name: 'Cab Premium',
    symbol: '✨🚗',
    tag: 'Top Comfort',
    tagClass: 'bg-purple-100 text-purple-900 border-purple-300',
    symbolBg: 'bg-purple-100 border-purple-300 text-purple-950',
    activeClass: 'border-purple-500 bg-purple-50/70 ring-2 ring-purple-500/50 shadow-md',
    subtitle: 'Spacious sedan • Top rated pilots • Extra legroom',
    seats: '4-6 Seats',
    eta: '5 mins away',
    baseFare: 110,
    perKm: 21,
    discountPercent: 10,
    rating: '4.95',
  },
  {
    id: 'TROLLEY_PORTER',
    category: 'TROLLEY_PORTER',
    name: 'Trolley / Porter',
    symbol: '🛻',
    tag: 'Cargo & Shifting',
    tagClass: 'bg-orange-100 text-orange-900 border-orange-300',
    symbolBg: 'bg-orange-100 border-orange-300 text-orange-950',
    activeClass: 'border-orange-500 bg-orange-50/70 ring-2 ring-orange-500/50 shadow-md',
    subtitle: 'Luggage, packages & commercial goods up to 750kg',
    seats: 'Max 750 kg',
    eta: '5 mins away',
    baseFare: 150,
    perKm: 25,
    discountPercent: 10,
    rating: '4.9',
  },
];

const CustomerExplore = ({ onNavigateToTrips }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState(null);

  // Selected Rapido service tier (default to Bike)
  const [selectedServiceId, setSelectedServiceId] = useState('BIKE');

  // Booking and modal states
  const [selectedCarForBooking, setSelectedCarForBooking] = useState(null);
  const [selectedServiceForModal, setSelectedServiceForModal] = useState(null);
  const [receiptBooking, setReceiptBooking] = useState(null);
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  // Dynamic Locations State (Pickup and Dropoff)
  const [pickupLocation, setPickupLocation] = useState(DEFAULT_PRESET_LOCATIONS[0]);
  const [dropoffLocation, setDropoffLocation] = useState(DEFAULT_PRESET_LOCATIONS[1]);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [mapTargetMode, setMapTargetMode] = useState('dropoff');

  // Mobile active tab
  const [mobileTab, setMobileTab] = useState('rides');

  // Automatically request browser live geolocation on mount & reverse-geocode to real street/area
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsDetectingGPS(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const resolved = await reverseGeocode(lat, lng);
            setPickupLocation(resolved);
          } catch (e) {
            setPickupLocation({
              name: '📍 My Current Location (GPS)',
              area: 'Detected via device GPS',
              lat: lat,
              lng: lng,
              isLive: true,
            });
          } finally {
            setIsDetectingGPS(false);
          }
        },
        (error) => {
          console.log("GPS Location notice: using standard Bengaluru telemetry default.", error.message);
          setIsDetectingGPS(false);
        },
        { enableHighAccuracy: true, timeout: 7000 }
      );
    }
  }, []);

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
    const temp = pickupLocation;
    setPickupLocation(dropoffLocation);
    setDropoffLocation(temp);
  };

  // Re-trigger live location detection via GPS
  const handleDetectLiveLocation = () => {
    if ('geolocation' in navigator) {
      setIsDetectingGPS(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const resolved = await reverseGeocode(lat, lng);
            setPickupLocation(resolved);
          } catch (e) {
            setPickupLocation({
              name: '📍 My Current Location (GPS)',
              area: 'Detected via device GPS',
              lat: lat,
              lng: lng,
              isLive: true,
            });
          } finally {
            setIsDetectingGPS(false);
          }
        },
        (err) => {
          alert("Could not fetch GPS: " + err.message);
          setIsDetectingGPS(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  // When user clicks anywhere directly on the Google Map to reposition pin
  const handleMapClick = async (clickedLat, clickedLng) => {
    try {
      const resolved = await reverseGeocode(clickedLat, clickedLng);
      if (mapTargetMode === 'pickup') {
        setPickupLocation(resolved);
      } else {
        setDropoffLocation(resolved);
      }
    } catch (e) {
      const fallbackLoc = {
        name: `📍 Pin at ${clickedLat.toFixed(4)}, ${clickedLng.toFixed(4)}`,
        area: 'Selected on Map',
        lat: clickedLat,
        lng: clickedLng,
      };
      if (mapTargetMode === 'pickup') {
        setPickupLocation(fallbackLoc);
      } else {
        setDropoffLocation(fallbackLoc);
      }
    }
  };

  // Load cars and check for active ongoing booking
  const loadData = async () => {
    setLoading(true);
    try {
      const [carsRes, bookingsRes] = await Promise.all([
        carApi.getAll(),
        bookingApi.getMyBookings(),
      ]);

      setCars(carsRes.data || []);

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
  }, []);

  const handleBookingSuccess = (newBooking) => {
    setSelectedCarForBooking(null);
    setSelectedServiceForModal(null);
    setActiveBooking(newBooking);
    loadData();
  };

  // Currently selected Rapido service tier
  const selectedService = useMemo(() => {
    return RAPIDO_SERVICES.find((s) => s.id === selectedServiceId) || RAPIDO_SERVICES[0];
  }, [selectedServiceId]);

  // Calculate upfront fare for a service tier based on route distance
  const calculateServiceFare = (service) => {
    const matched = cars.find((c) => c.category === service.category);
    const base = matched?.baseFare || service.baseFare;
    const perKm = matched?.pricePerKm || service.perKm;
    const dist = estDistanceKm * perKm;
    const total = (base + dist) * 1.05; // 5% tax
    return Math.round(total);
  };

  // Handler to initiate booking for a service tier
  const handleSelectAndBook = (service) => {
    const matched = cars.find((c) => c.category === service.category) || cars[0];
    if (matched) {
      setSelectedServiceForModal(service);
      setSelectedCarForBooking(matched);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-gray-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">

        {/* Active Ongoing Trip Banner (If user has a live ride in progress) */}
        {activeBooking && (
          <section className="mb-6 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold tracking-wider text-brand-700 uppercase flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-ping" />
                <span>Live Ongoing Trip</span>
              </h2>
              <button
                onClick={() => setActiveBooking(null)}
                className="text-xs text-gray-500 hover:text-gray-800 font-semibold"
              >
                Dismiss
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

        {/* Clean Top Bar Header */}
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-5 py-3.5 shadow-sm mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-400/20 text-lg">
              ⚡
            </div>
            <div>
              <h1 className="text-base font-extrabold text-gray-950 tracking-tight">
                Drive<span className="text-brand-600">Pulse</span> Mobility
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Select your service • View live nearby drivers on the map
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Google Maps</span>
            </span>
          </div>
        </div>

        {/* MAIN RESPONSIVE TWO-COLUMN COCKPIT (Left: Booking Flow, Right: Live Map) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Route Inputs + Rapido Service Tiers List                     */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-4">
            
            {/* 1. Route Input Card */}
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Pickup & Destination
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {estDistanceKm} km • ~{estDurationMins}m
                </span>
              </div>

              {/* Connected Search Inputs with Swap Button */}
              <div className="relative bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-2.5">
                {/* Pickup Input */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                    Pickup Location
                  </label>
                  <LocationSearchInput
                    value={pickupLocation}
                    onChange={(val) => setPickupLocation((prev) => ({ ...prev, name: val }))}
                    onSelect={(item) => setPickupLocation(item)}
                    placeholder="Enter pickup address or landmark"
                    isPickup={true}
                    onUseCurrentLocation={handleDetectLiveLocation}
                    isDetectingGPS={isDetectingGPS}
                  />
                </div>

                {/* Connecting Line with Swap Button */}
                <div className="flex items-center justify-between px-1">
                  <div className="h-4 w-0.5 bg-gray-300 ml-4.5" />
                  <button
                    type="button"
                    onClick={handleSwapLocations}
                    className="p-1.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-brand-600 shadow-sm flex items-center space-x-1.5 text-xs font-bold transition-all"
                    title="Swap Pickup and Drop-off"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span>Swap</span>
                  </button>
                </div>

                {/* Drop-off Input */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                    Destination Drop-off
                  </label>
                  <LocationSearchInput
                    value={dropoffLocation}
                    onChange={(val) => setDropoffLocation((prev) => ({ ...prev, name: val }))}
                    onSelect={(item) => setDropoffLocation(item)}
                    placeholder="Where are you heading?"
                    isPickup={false}
                  />
                </div>

                {/* Quick Chips */}
                <div className="pt-2 flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
                  <span className="text-[10px] text-gray-400 font-bold uppercase mr-1">Quick:</span>
                  {[
                    { label: '✈️ Airport', loc: DEFAULT_PRESET_LOCATIONS[1] },
                    { label: '🏢 ITPL Tech Park', loc: DEFAULT_PRESET_LOCATIONS[5] },
                    { label: '🚇 MG Road', loc: DEFAULT_PRESET_LOCATIONS[2] },
                    { label: '🛍️ Koramangala', loc: DEFAULT_PRESET_LOCATIONS[3] },
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setDropoffLocation(chip.loc)}
                      className="px-2.5 py-1 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:text-brand-600 hover:border-brand-300 whitespace-nowrap shadow-xs"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile-only Map Preview (shows right below inputs on mobile, hidden on lg desktop) */}
            <div className="lg:hidden space-y-2">
              <div className="w-full h-72 rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                <MapView
                  pickup={pickupCoord}
                  dropoff={dropoffCoord}
                  category={selectedService.category}
                  className="h-full w-full rounded-2xl"
                  onLocateMe={handleDetectLiveLocation}
                  onMapClick={handleMapClick}
                  pickupAddress={pickupLocation.name}
                  dropoffAddress={dropoffLocation.name}
                />
              </div>

              {/* Map Target Toggle */}
              <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                <span>Tap map to set:</span>
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => setMapTargetMode('pickup')}
                    className={`px-2.5 py-0.5 rounded-lg font-bold text-xs transition-all ${
                      mapTargetMode === 'pickup' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    📍 Pickup
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapTargetMode('dropoff')}
                    className={`px-2.5 py-0.5 rounded-lg font-bold text-xs transition-all ${
                      mapTargetMode === 'dropoff' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    🏁 Drop-off
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Rapido Service Tiers List (Clean Symbols, Upfront Fares) */}
            <div className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <span>Select Service</span>
                  <span className="text-gray-400 font-normal">• Showing live nearby pilots</span>
                </span>
                <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {selectedService.name} Active
                </span>
              </div>

              {/* Service Cards */}
              <div className="space-y-2.5">
                {RAPIDO_SERVICES.map((service) => {
                  const isSelected = selectedServiceId === service.id;
                  const fare = calculateServiceFare(service);
                  const originalFare = Math.round(fare * (1 + service.discountPercent / 100));

                  return (
                    <div
                      key={service.id}
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`group rounded-2xl p-3.5 border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? service.activeClass
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {/* Left: Vehicle Symbol & Details */}
                      <div className="flex items-center space-x-3.5 min-w-0">
                        {/* Clean Iconic Vehicle Symbol Badge */}
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-sm border ${service.symbolBg}`}>
                          {service.symbol}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-extrabold text-gray-950 truncate">
                              {service.name}
                            </h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${service.tagClass}`}>
                              {service.tag}
                            </span>
                            <span className="text-xs text-gray-400 font-semibold">• {service.seats}</span>
                          </div>

                          <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                            {service.subtitle}
                          </p>

                          <div className="flex items-center space-x-2 text-[11px] text-emerald-700 font-bold mt-1">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1 text-emerald-600" />
                              {service.eta}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-amber-600 flex items-center">
                              <Star className="w-3 h-3 fill-amber-500 mr-0.5" />
                              {service.rating}
                            </span>
                            {isSelected && (
                              <span className="text-emerald-800 bg-emerald-100 text-[10px] px-1.5 py-0.2 rounded font-bold ml-1 flex items-center space-x-0.5">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Showing Drivers</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Upfront Guaranteed Fare */}
                      <div className="text-right flex-shrink-0 pl-3">
                        <div className="text-base sm:text-lg font-black text-gray-950 font-mono leading-none">
                          ₹{fare}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono line-through mt-1">
                          ₹{originalFare}
                        </div>
                        <div className="text-[9px] font-bold text-emerald-700 uppercase tracking-wide mt-0.5">
                          Save {service.discountPercent}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Direct Booking CTA Button (In column flow for Desktop) */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSelectAndBook(selectedService)}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-400 to-brand-500 hover:from-amber-500 hover:to-brand-600 text-slate-950 font-black text-sm shadow-md active:scale-98 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{selectedService.symbol}</span>
                    <span>Book {selectedService.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono text-base font-extrabold">
                    <span>₹{calculateServiceFare(selectedService)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: Desktop Full-Height Google Maps with Selected Drivers       */}
          {/* ========================================================================= */}
          <div className="hidden lg:block lg:col-span-6 xl:col-span-7 sticky top-4 space-y-3">
            <div className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm overflow-hidden relative">
              {/* Map Header Status */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-extrabold text-gray-950 uppercase tracking-wider">
                    Google Maps Live Fleet Telemetry
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[11px]">
                  <span className="text-gray-500">Tap map to pin:</span>
                  <button
                    type="button"
                    onClick={() => setMapTargetMode('pickup')}
                    className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                      mapTargetMode === 'pickup' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    📍 Pickup
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapTargetMode('dropoff')}
                    className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                      mapTargetMode === 'dropoff' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    🏁 Drop-off
                  </button>
                </div>
              </div>

              {/* Google Maps Leaflet View (Showing ONLY nearby drivers of the selected service) */}
              <MapView
                pickup={pickupCoord}
                dropoff={dropoffCoord}
                category={selectedService.category}
                className="h-[520px] rounded-2xl"
                onLocateMe={handleDetectLiveLocation}
                onMapClick={handleMapClick}
                pickupAddress={pickupLocation.name}
                dropoffAddress={dropoffLocation.name}
              />

              {/* Safety & Features HUD Footer */}
              <div className="grid grid-cols-3 gap-3 pt-3 mt-3 border-t border-gray-100 text-center text-xs">
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                  <HardHat className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                  <span className="font-extrabold text-gray-900 text-[11px] block">Sanitized Helmet</span>
                  <span className="text-[10px] text-gray-500">Provided for bike rides</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                  <ShieldCheck className="w-4 h-4 text-brand-600 mx-auto mb-1" />
                  <span className="font-extrabold text-gray-900 text-[11px] block">Verified Pilots</span>
                  <span className="text-[10px] text-gray-500">Commercial licensed</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                  <Package className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                  <span className="font-extrabold text-gray-900 text-[11px] block">Cargo & Porter</span>
                  <span className="text-[10px] text-gray-500">Up to 750kg payload</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Sticky Bottom Bar for Mobile View */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 border-t border-gray-200 backdrop-blur-md z-40 shadow-2xl">
        <button
          onClick={() => handleSelectAndBook(selectedService)}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-brand-500 hover:from-amber-500 hover:to-brand-600 text-slate-950 font-black text-sm shadow-md active:scale-98 transition-all flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <span className="text-xl">{selectedService.symbol}</span>
            <span>Book {selectedService.name}</span>
          </div>
          <div className="flex items-center space-x-2 font-mono text-base font-extrabold">
            <span>₹{calculateServiceFare(selectedService)}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        {/* Native Mobile Bottom Navigation Tabs */}
        <div className="pt-2 mt-1.5 border-t border-gray-100 flex items-center justify-around text-gray-500 text-[10px] font-bold">
          <button
            onClick={() => {
              setMobileTab('rides');
              setSelectedServiceId('BIKE');
            }}
            className={`flex flex-col items-center space-y-0.5 ${mobileTab === 'rides' ? 'text-brand-600 font-extrabold' : 'hover:text-gray-950'}`}
          >
            <Car className="w-4 h-4" />
            <span>Rides</span>
          </button>
          <button
            onClick={() => {
              setMobileTab('porter');
              setSelectedServiceId('TROLLEY_PORTER');
            }}
            className={`flex flex-col items-center space-y-0.5 ${mobileTab === 'porter' ? 'text-brand-600 font-extrabold' : 'hover:text-gray-950'}`}
          >
            <Package className="w-4 h-4" />
            <span>Porter</span>
          </button>
          <button
            onClick={() => {
              setMobileTab('activity');
              if (onNavigateToTrips) onNavigateToTrips();
            }}
            className={`flex flex-col items-center space-y-0.5 ${mobileTab === 'activity' ? 'text-brand-600 font-extrabold' : 'hover:text-gray-950'}`}
          >
            <Clock className="w-4 h-4" />
            <span>My Trips</span>
          </button>
          <button
            onClick={() => {
              setMobileTab('safety');
              setShowSafetyModal(true);
            }}
            className={`flex flex-col items-center space-y-0.5 ${mobileTab === 'safety' ? 'text-brand-600 font-extrabold' : 'hover:text-gray-950'}`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Safety</span>
          </button>
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

      {/* Booking Modal with Dynamic Route & Service Metadata */}
      {selectedCarForBooking && (
        <BookingModal
          car={selectedCarForBooking}
          serviceMeta={selectedServiceForModal || selectedService}
          initialPickup={pickupLocation}
          initialDropoff={dropoffLocation}
          onClose={() => {
            setSelectedCarForBooking(null);
            setSelectedServiceForModal(null);
          }}
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
