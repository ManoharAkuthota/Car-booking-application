import React, { useState, useEffect, useMemo, useRef } from 'react';
import { carApi, bookingApi } from '../api/client';
import { DEFAULT_PRESET_LOCATIONS, reverseGeocode } from '../api/locationService';
import LocationSearchInput from '../components/LocationSearchInput';
import MapView from '../components/MapView';
import DigitalReceiptModal from '../components/DigitalReceiptModal';
import {
  MapPin, Navigation, Clock, ShieldCheck, ChevronRight, Star,
  AlertCircle, PhoneCall, Check, Info, ShieldAlert, Sparkles,
  RefreshCw, X, Crosshair, Users, Zap, ArrowUpDown, Calendar,
  CreditCard, Tag, FileText, ChevronDown, CheckCircle2, ArrowRight,
  Shield, Phone, KeyRound, Loader2, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

// 5 Dedicated Rapido Services Enhanced from Reference Images
const RAPIDO_SERVICES = [
  {
    id: 'BIKE',
    category: 'BIKE',
    name: 'Bike',
    symbolSvg: (
      <svg viewBox="0 0 48 48" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="34" r="5.5" fill="#18181b" stroke="#71717a" strokeWidth="1.2" />
        <circle cx="12" cy="34" r="2.2" fill="#e2e8f0" />
        <circle cx="36" cy="34" r="5.5" fill="#18181b" stroke="#71717a" strokeWidth="1.2" />
        <circle cx="36" cy="34" r="2.2" fill="#e2e8f0" />
        <path d="M 12 34 L 18 24 L 27 24 L 32 30 L 36 34" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 17 25 C 19 18, 25 18, 29 23 L 34 29 C 36 31, 30 36, 25 35 L 18 35 Z" fill="#facc15" stroke="#09090b" strokeWidth="1.2" />
        <path d="M 18 24 L 14 13 L 11 14" stroke="#09090b" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="14" cy="13" rx="2" ry="1.5" fill="#ffffff" stroke="#09090b" strokeWidth="0.8" />
        <path d="M 18 19 C 16 16, 12 16, 13 22 Z" fill="#facc15" stroke="#09090b" strokeWidth="1" />
        <path d="M 22 22 C 24 20, 31 21, 32 24 L 23 24 Z" fill="#18181b" />
        <circle cx="34" cy="14" r="5.5" fill="#facc15" stroke="#09090b" strokeWidth="1" />
        <path d="M 33 8.7 C 33.5 8.5, 34.5 8.5, 35 8.7 L 35 19.3 C 34.5 19.5, 33.5 19.5, 33 19.3 Z" fill="#ffffff" />
        <path d="M 30.5 13 Q 34 11 37.5 13" stroke="#09090b" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    tag: 'Fastest',
    subtitle: 'Beat city traffic • Sanitized helmet provided',
    seats: '1 Person',
    eta: '5 mins',
    defaultFare: 86,
    baseFare: 25,
    perKm: 7.5,
  },
  {
    id: 'AUTO',
    category: 'AUTO',
    name: 'Auto',
    symbolSvg: (
      <svg viewBox="0 0 48 48" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="34" r="5.5" fill="#18181b" stroke="#52525b" strokeWidth="1.2" />
        <circle cx="11" cy="34" r="2.2" fill="#e2e8f0" />
        <circle cx="37" cy="34" r="5.5" fill="#18181b" stroke="#52525b" strokeWidth="1.2" />
        <circle cx="37" cy="34" r="2.2" fill="#e2e8f0" />
        <path d="M 8 26 C 8 22, 12 20, 16 20 L 35 20 C 39 20, 41 23, 41 28 L 41 33 C 41 35, 36 35, 34 35 L 14 35 C 10 35, 8 32, 8 26 Z" fill="#18181b" stroke="#09090b" strokeWidth="1.2" />
        <path d="M 8 26 L 11 16 C 12 14, 15 13, 17 13 L 23 13 L 23 20 L 8 20 Z" fill="#93c5fd" fillOpacity="0.45" stroke="#09090b" strokeWidth="1" />
        <line x1="12" y1="17" x2="20" y2="15" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M 12 13 C 14 9, 37 9, 41 13 L 41 20 L 12 20 Z" fill="#facc15" stroke="#09090b" strokeWidth="1.2" />
        <rect x="23" y="17" width="14" height="13" rx="2" fill="#fef08a" fillOpacity="0.3" stroke="#ca8a04" strokeWidth="0.8" />
        <rect x="30" y="24" width="7" height="6" rx="1" fill="#eab308" />
      </svg>
    ),
    tag: 'Popular',
    subtitle: 'Hassle-free Auto rides • Upfront meter',
    seats: '3 Seats',
    eta: '1 mins',
    defaultFare: 156,
    baseFare: 40,
    perKm: 11,
  },
  {
    id: 'CAR',
    category: 'SEDAN',
    name: 'Car',
    symbolSvg: (
      <svg viewBox="0 0 48 48" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="34" r="5" fill="#18181b" stroke="#52525b" strokeWidth="1.2" />
        <circle cx="11" cy="34" r="2" fill="#cbd5e1" />
        <circle cx="37" cy="34" r="5" fill="#18181b" stroke="#52525b" strokeWidth="1.2" />
        <circle cx="37" cy="34" r="2" fill="#cbd5e1" />
        <path d="M 4 28 C 4 26, 7 24, 11 24 L 14 18 C 16 14, 32 14, 34 18 L 38 24 C 42 24, 44 26, 44 29 L 43 33 C 43 35, 40 35, 37 35 L 11 35 C 7 35, 4 33, 4 28 Z" fill="#ffffff" stroke="#09090b" strokeWidth="1.2" />
        <path d="M 15 23 L 17 17 C 18 15, 24 15, 25 15 L 25 23 Z" fill="#0f172a" />
        <path d="M 27 15 C 28 15, 32 15, 33 17 L 35 23 L 27 23 Z" fill="#0f172a" />
        <line x1="18" y1="18" x2="23" y2="16" stroke="#93c5fd" strokeWidth="1" strokeLinecap="round" />
        <rect x="22" y="11.5" width="7" height="3.5" rx="1.5" fill="#f59e0b" stroke="#09090b" strokeWidth="0.8" />
      </svg>
    ),
    tag: 'Comfort AC',
    subtitle: 'Comfy AC daily rides • Pocket friendly',
    seats: '4 Seats',
    eta: '1 mins',
    defaultFare: 225,
    baseFare: 70,
    perKm: 15,
  },
  {
    id: 'AUTO_PLUS',
    category: 'SUV',
    name: 'Auto Plus',
    symbolSvg: (
      <svg viewBox="0 0 48 48" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="34" r="5.5" fill="#18181b" stroke="#ca8a04" strokeWidth="1.5" />
        <circle cx="11" cy="34" r="2.2" fill="#facc15" />
        <circle cx="37" cy="34" r="5.5" fill="#18181b" stroke="#ca8a04" strokeWidth="1.5" />
        <circle cx="37" cy="34" r="2.2" fill="#facc15" />
        <path d="M 8 26 C 8 22, 12 20, 16 20 L 35 20 C 39 20, 41 23, 41 28 L 41 33 C 41 35, 36 35, 34 35 L 14 35 C 10 35, 8 32, 8 26 Z" fill="#eab308" stroke="#09090b" strokeWidth="1.2" />
        <path d="M 12 13 C 14 9, 37 9, 41 13 L 41 20 L 12 20 Z" fill="#1d4ed8" stroke="#09090b" strokeWidth="1.2" />
        <path d="M 8 26 L 11 16 C 12 14, 15 13, 17 13 L 23 13 L 23 20 L 8 20 Z" fill="#93c5fd" fillOpacity="0.5" stroke="#09090b" strokeWidth="1" />
        <circle cx="36" cy="11" r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
        <path d="M 36 8 L 37 10 L 39 10 L 37.5 11.5 L 38 13.5 L 36 12.2 L 34 13.5 L 34.5 11.5 L 33 10 L 35 10 Z" fill="#ffffff" />
      </svg>
    ),
    tag: 'Top Rated',
    subtitle: 'Extra clean auto • Top rated captains',
    seats: '3 Seats',
    eta: '1 mins',
    defaultFare: 193,
    baseFare: 55,
    perKm: 13,
  },
  {
    id: 'TROLLEY_PORTER',
    category: 'TROLLEY_PORTER',
    name: 'Porter Cargo',
    symbolSvg: (
      <svg viewBox="0 0 48 48" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="34" r="5" fill="#18181b" stroke="#71717a" strokeWidth="1.2" />
        <circle cx="12" cy="34" r="2" fill="#cbd5e1" />
        <circle cx="36" cy="34" r="5" fill="#18181b" stroke="#71717a" strokeWidth="1.2" />
        <circle cx="36" cy="34" r="2" fill="#cbd5e1" />
        <path d="M 6 32 L 6 22 C 6 18, 9 15, 13 15 L 18 15 L 21 22 L 21 32 Z" fill="#2563eb" stroke="#09090b" strokeWidth="1.2" />
        <path d="M 9 22 L 13 16 L 18 16 L 18 22 Z" fill="#93c5fd" fillOpacity="0.6" stroke="#09090b" strokeWidth="0.8" />
        <rect x="21" y="20" width="22" height="12" rx="1.5" fill="#94a3b8" stroke="#334155" strokeWidth="1.2" />
        <rect x="23" y="13" width="9" height="9" rx="1" fill="#d97706" stroke="#78350f" strokeWidth="0.8" />
        <rect x="32" y="15" width="8" height="7" rx="1" fill="#b45309" stroke="#78350f" strokeWidth="0.8" />
        <line x1="21" y1="24" x2="43" y2="24" stroke="#facc15" strokeWidth="1.2" strokeDasharray="3 1" />
      </svg>
    ),
    tag: 'Logistics',
    subtitle: 'Mini-truck for boxes, goods up to 750kg',
    seats: 'Max 750 kg',
    eta: '5 mins',
    defaultFare: 250,
    baseFare: 140,
    perKm: 22,
  },
];

const CustomerExplore = ({ onNavigateToTrips, onNavigateToArrivalSim }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Ongoing Booking (from backend or live simulation)
  const [activeBooking, setActiveBooking] = useState(null);
  const [receiptBooking, setReceiptBooking] = useState(null);
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  // Selected Rapido service tier (default to Bike as in screenshot Image 1)
  const [selectedServiceId, setSelectedServiceId] = useState('BIKE');

  // Dynamic Locations State (Default: Vidhana Soudha -> Swami Vivekananda Road as in Image 1)
  const [pickupLocation, setPickupLocation] = useState(DEFAULT_PRESET_LOCATIONS[0]);
  const [dropoffLocation, setDropoffLocation] = useState(DEFAULT_PRESET_LOCATIONS[1]);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [addressPickerMode, setAddressPickerMode] = useState('pickup'); // 'pickup' | 'dropoff'

  // Booking lifecycle state for animation
  const [bookingState, setBookingState] = useState('IDLE'); // 'IDLE' | 'SEARCHING' | 'ACCEPTED' | 'DRIVER_ARRIVING' | 'IN_PROGRESS'
  const [assignedDriver, setAssignedDriver] = useState(null);
  const [otpPin, setOtpPin] = useState('5824');

  // Automatically request browser live geolocation on mount if available
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const resolved = await reverseGeocode(lat, lng);
            setPickupLocation({ ...resolved, isLive: true });
          } catch (e) {}
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  const pickupCoord = useMemo(() => [pickupLocation.lat, pickupLocation.lng], [pickupLocation]);
  const dropoffCoord = useMemo(() => [dropoffLocation.lat, dropoffLocation.lng], [dropoffLocation]);

  // Route distance estimation in km
  const estDistanceKm = useMemo(() => {
    const d = Math.sqrt(
      Math.pow((dropoffLocation.lat - pickupLocation.lat) * 111, 2) +
      Math.pow((dropoffLocation.lng - pickupLocation.lng) * 111, 2)
    ) * 1.28;
    return Math.round(d * 10) / 10 || 6.2;
  }, [pickupLocation, dropoffLocation]);

  const estDurationMins = Math.round(estDistanceKm * 2.3) || 15;

  // Swap pickup and dropoff
  const handleSwapLocations = (e) => {
    e.stopPropagation();
    const temp = pickupLocation;
    setPickupLocation(dropoffLocation);
    setDropoffLocation(temp);
  };

  // Re-detect GPS
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
            });
          } finally {
            setIsDetectingGPS(false);
          }
        },
        () => {
          setIsDetectingGPS(false);
        },
        { enableHighAccuracy: true, timeout: 7000 }
      );
    }
  };

  // When user taps anywhere on map
  const handleMapClick = async (clickedLat, clickedLng) => {
    try {
      const resolved = await reverseGeocode(clickedLat, clickedLng);
      if (addressPickerMode === 'pickup') {
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
      if (addressPickerMode === 'pickup') {
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

      const ongoing = bookingsRes.data.find(
        (b) => b.status === 'REQUESTED' || b.status === 'ACCEPTED' || b.status === 'DRIVER_ARRIVING' || b.status === 'IN_PROGRESS'
      );
      if (ongoing) {
        setActiveBooking(ongoing);
        setBookingState(ongoing.status);
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
    return Math.round(total) || service.defaultFare;
  };

  // Instant 1-Tap Booking Trigger (Rapido Style)
  const handleBookNow = async () => {
    const matchedCar = cars.find((c) => c.category === selectedService.category) || cars[0] || {
      id: 1,
      make: 'Honda',
      model: 'Activa 6G (Rapido Bike)',
      licensePlate: 'KA-01-EK-4921',
      category: 'BIKE',
    };

    const fare = calculateServiceFare(selectedService);
    const driverProfiles = {
      BIKE: {
        name: 'Rajesh Kumar',
        rating: '4.92',
        trips: '1,420 trips',
        vehicle: 'Honda Activa 6G • KA 01 EK 4921',
        phone: '+91 98450 12345',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
      },
      AUTO: {
        name: 'Suresh Gowda',
        rating: '4.88',
        trips: '2,890 trips',
        vehicle: 'Bajaj RE Compact • KA 04 B 8820',
        phone: '+91 98860 99881',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120',
      },
      SEDAN: {
        name: 'Vikramaditya Rao',
        rating: '4.95',
        trips: '980 trips',
        vehicle: 'Maruti Suzuki Dzire • KA 05 MN 3012',
        phone: '+91 99001 54321',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      },
      SUV: {
        name: 'Anand Murthy',
        rating: '4.91',
        trips: '1,120 trips',
        vehicle: 'Auto Plus CNG • KA 03 AB 4455',
        phone: '+91 98455 77889',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120',
      },
      TROLLEY_PORTER: {
        name: 'Manjunath Swamy',
        rating: '4.82',
        trips: '640 trips',
        vehicle: 'Tata Ace Gold 750kg • KA 01 TR 7500',
        phone: '+91 97400 88210',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120',
      },
    };

    const assigned = driverProfiles[selectedService.category] || driverProfiles.BIKE;
    setAssignedDriver(assigned);

    // 1. SEARCHING Animation (1.5 seconds)
    setBookingState('SEARCHING');

    try {
      const res = await bookingApi.createBooking({
        carId: matchedCar.id,
        pickupAddress: pickupLocation.name,
        dropoffAddress: dropoffLocation.name,
        pickupLat: pickupCoord[0],
        pickupLng: pickupCoord[1],
        dropoffLat: dropoffCoord[0],
        dropoffLng: dropoffCoord[1],
        distanceKm: estDistanceKm,
        totalFare: fare,
        paymentMethod: 'CASH',
        specialInstructions: 'Rapido Live Ride',
      });
      setActiveBooking(res.data);
      if (res.data.otp) setOtpPin(res.data.otp);
    } catch (err) {
      // Local fallback in case backend is offline
      setActiveBooking({
        id: Date.now(),
        bookingCode: `RAP-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'ACCEPTED',
        pickupAddress: pickupLocation.name,
        dropoffAddress: dropoffLocation.name,
        pickupLat: pickupCoord[0],
        pickupLng: pickupCoord[1],
        dropoffLat: dropoffCoord[0],
        dropoffLng: dropoffCoord[1],
        distanceKm: estDistanceKm,
        totalFare: fare,
        car: matchedCar,
        otp: '5824',
      });
    }

    // 2. Transition to ACCEPTED (Captain en route to pickup)
    setTimeout(() => {
      setBookingState('ACCEPTED');
    }, 1500);
  };

  // Driver Arrived
  const handleDriverArrived = () => {
    setBookingState('DRIVER_ARRIVING');
  };

  // Start Trip (Move Pickup -> Dropoff)
  const handleStartTrip = () => {
    setBookingState('IN_PROGRESS');
  };

  // Complete Trip
  const handleCompleteTrip = () => {
    setBookingState('COMPLETED');
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    setReceiptBooking(activeBooking || {
      bookingCode: `RAP-${Math.floor(1000 + Math.random() * 9000)}`,
      pickupAddress: pickupLocation.name,
      dropoffAddress: dropoffLocation.name,
      totalFare: calculateServiceFare(selectedService),
      distanceKm: estDistanceKm,
      paymentMethod: 'CASH',
      createdAt: new Date().toISOString(),
    });
  };

  // Cancel Booking
  const handleCancelBooking = async () => {
    if (!window.confirm("Are you sure you want to cancel this ride?")) return;
    try {
      if (activeBooking?.id) {
        await bookingApi.cancelBooking(activeBooking.id);
      }
    } catch (e) {}
    setActiveBooking(null);
    setBookingState('IDLE');
    setAssignedDriver(null);
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-64px)] bg-white text-gray-900 flex flex-col overflow-hidden">
      
      {/* ========================================================================= */}
      {/* 1. FLOATING TOP ADDRESS SEARCH PILLS (Exactly Matching Screenshot Image 1)  */}
      {/* ========================================================================= */}
      <div className="absolute top-3 left-3 right-3 sm:left-4 sm:right-4 max-w-xl mx-auto z-[1000] pointer-events-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/90 p-2 sm:p-2.5 backdrop-blur-md flex flex-col space-y-2">
          
          {/* Pickup Row */}
          <div
            onClick={() => {
              setAddressPickerMode('pickup');
              setShowAddressPicker(true);
            }}
            className="flex items-center space-x-2.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block leading-none">
                  Your Pick Up
                </span>
                {pickupLocation.isLive && (
                  <span className="inline-flex items-center px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                    Live GPS
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-gray-950 truncate block mt-0.5">
                {pickupLocation.name}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>

          <div className="relative h-px bg-gray-100 ml-6 mr-2 flex items-center justify-end">
            <button
              type="button"
              onClick={handleSwapLocations}
              className="absolute right-0 p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 shadow-xs"
              title="Swap Locations"
            >
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>

          {/* Dropoff Row */}
          <div
            onClick={() => {
              setAddressPickerMode('dropoff');
              setShowAddressPicker(true);
            }}
            className="flex items-center space-x-2.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="w-3 h-3 rounded-full bg-rose-500 border-2 border-white shadow-xs flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider block leading-none">
                Your Drop Off
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-gray-950 truncate block mt-0.5">
                {dropoffLocation.name}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REAL GOOGLE MAPS LEAFLET VIEW (With Top-Down Vector Fleet on Streets)  */}
      {/* ========================================================================= */}
      <div className="relative w-full flex-1 min-h-[50vh] sm:min-h-[55vh] z-0">
        <MapView
          pickup={pickupCoord}
          dropoff={dropoffCoord}
          category={selectedService.category}
          isLiveTrip={bookingState !== 'IDLE'}
          tripStatus={bookingState === 'IDLE' ? null : bookingState}
          className="w-full h-full min-h-[380px] sm:min-h-[520px]"
          onLocateMe={handleDetectLiveLocation}
          onMapClick={handleMapClick}
          pickupAddress={pickupLocation.name}
          dropoffAddress={dropoffLocation.name}
          onDriverArrived={handleDriverArrived}
          onTripCompleted={handleCompleteTrip}
        />

        {/* Floating Blue GPS Crosshair Target Button (Matching Image 1 & Image 3) */}
        <button
          type="button"
          onClick={handleDetectLiveLocation}
          disabled={isDetectingGPS}
          className="absolute bottom-4 right-4 z-[1000] w-11 h-11 rounded-full bg-white shadow-xl border border-gray-200 flex items-center justify-center text-blue-600 hover:scale-105 active:scale-95 transition-all pointer-events-auto"
          title="Center My Live GPS Location"
        >
          <Crosshair className={`w-5 h-5 text-blue-600 ${isDetectingGPS ? 'animate-spin' : ''}`} />
        </button>

        {/* Live Radar Pulse Indicator when Searching */}
        {bookingState === 'SEARCHING' && (
          <div className="absolute top-28 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-amber-300 flex items-center space-x-2 text-xs font-black text-amber-900 pointer-events-none animate-bounce">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
            <span>Finding nearby {selectedService.name} captains...</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. RAPIDO BOTTOM SHEET (Matching Image 1 & 2)                             */}
      {/* ========================================================================= */}
      <div className="w-full max-w-xl mx-auto bg-white rounded-t-3xl shadow-2xl border-t border-gray-200 z-10 flex flex-col divide-y divide-gray-100">
        
        {/* --- VIEW A: EXPLORE & SERVICE SELECTION (Image 1 & 2) --- */}
        {bookingState === 'IDLE' && (
          <div className="p-4 sm:p-5 space-y-3">
            
            {/* Service Options List */}
            <div className="space-y-2">
              {RAPIDO_SERVICES.map((s) => {
                const isSelected = selectedServiceId === s.id;
                const fare = calculateServiceFare(s);

                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedServiceId(s.id)}
                    className={`rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all duration-150 border ${
                      isSelected
                        ? 'bg-[#FFF9E6] border-[#FFCC00] ring-2 ring-[#FFCC00]/40 shadow-xs'
                        : 'bg-white border-transparent hover:bg-gray-50'
                    }`}
                  >
                    {/* Left: Yellow Circular Icon & Details */}
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#FFDE00] flex items-center justify-center text-gray-950 flex-shrink-0 shadow-xs">
                        {s.symbolSvg}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-extrabold text-gray-950">
                            {s.name}
                          </h3>
                          <span className="text-xs text-gray-500 font-semibold">
                            {s.eta}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {s.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Right: Price & Info */}
                    <div className="flex items-center space-x-1.5 pl-2 flex-shrink-0">
                      <span className="text-base font-black text-gray-950 font-mono">
                        ₹{fare}
                      </span>
                      <Info className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Apply Coupon Code Strip (Matching Image 1) */}
            <div
              onClick={() => alert("Coupon applied: 25% discount unlocked!")}
              className="flex items-center justify-between py-2 px-1 text-xs text-gray-700 hover:text-gray-950 cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span className="font-bold">Apply Coupon Code</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Cash / Payment Strip (Matching Image 1) */}
            <div className="flex items-center justify-between py-2 px-1 text-xs border-t border-gray-100 pt-2">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                  ₹
                </div>
                <div className="min-w-0">
                  <span className="font-extrabold text-gray-900 block leading-tight">Cash</span>
                  <span className="text-[10px] text-gray-500 block truncate">You can pay via cash or UPI for your ride</span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>

            {/* Pay 25% Less Gold Promo Strip (Matching Image 1) */}
            <div className="rounded-xl bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-200 p-2 px-3 flex items-center justify-between text-xs text-amber-950 font-bold border border-amber-300 shadow-xs">
              <div className="flex items-center space-x-2">
                <span className="text-base">🏷️</span>
                <span>Pay <strong className="font-black text-amber-900">25% less</strong> on next ride. Know more</span>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-800" />
            </div>

            {/* Bottom Actions: [ Later ] and [ Book Bike / Auto / Car ] */}
            <div className="flex items-center space-x-3 pt-1">
              <button
                type="button"
                onClick={() => alert("Scheduled ride option: select time")}
                className="w-13 h-13 rounded-2xl bg-white border border-gray-300 flex flex-col items-center justify-center text-gray-800 shadow-sm active:scale-95 transition-all flex-shrink-0"
              >
                <Calendar className="w-5 h-5 text-gray-700" />
                <span className="text-[10px] font-bold mt-0.5">Later</span>
              </button>

              <button
                type="button"
                onClick={handleBookNow}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#FFCC00] hover:bg-[#FFD633] text-gray-950 font-black text-base shadow-md active:scale-98 transition-all flex items-center justify-center space-x-2"
              >
                <span>Book {selectedService.name}</span>
              </button>
            </div>

          </div>
        )}

        {/* --- VIEW B: ACTIVE TRIP & DRIVER ARRIVAL COCKPIT (Rapido Live Ride) --- */}
        {bookingState !== 'IDLE' && (
          <div className="p-4 sm:p-5 space-y-4">
            
            {/* Status Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-sm font-extrabold text-gray-950">
                  {bookingState === 'SEARCHING' && 'Connecting to nearby captains...'}
                  {bookingState === 'ACCEPTED' && 'Captain is arriving at pickup location'}
                  {bookingState === 'DRIVER_ARRIVING' && 'Captain has arrived at your pickup!'}
                  {bookingState === 'IN_PROGRESS' && 'Trip in progress to destination'}
                </h3>
              </div>

              {/* Start PIN (OTP) */}
              <div className="bg-amber-50 border border-amber-300 px-3 py-1 rounded-xl text-right">
                <span className="text-[9px] uppercase font-bold text-amber-800 block">Start PIN</span>
                <span className="text-base font-black text-amber-950 font-mono tracking-widest">{otpPin}</span>
              </div>
            </div>

            {/* Assigned Driver Profile Card */}
            {assignedDriver && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img
                      src={assignedDriver.avatar}
                      alt={assignedDriver.name}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-300 shadow-sm"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-[9px] text-white font-black">
                      ✓
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-extrabold text-gray-950 truncate">
                      {assignedDriver.name}
                    </h4>
                    <p className="text-xs text-gray-500 font-medium truncate">
                      {assignedDriver.vehicle}
                    </p>
                    <div className="flex items-center space-x-1.5 text-xs text-amber-600 font-bold mt-0.5">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span>{assignedDriver.rating}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-500 text-[11px]">{assignedDriver.trips}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pl-2">
                  <button
                    type="button"
                    onClick={() => alert(`Calling Captain ${assignedDriver.name} at ${assignedDriver.phone}`)}
                    className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-sm active:scale-95"
                    title="Call Captain"
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              </div>
            )}

            {/* Lifecycle Testing Controls */}
            <div className="flex items-center space-x-2 pt-1">
              {bookingState === 'ACCEPTED' && (
                <button
                  type="button"
                  onClick={handleDriverArrived}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-98"
                >
                  Simulate Captain Arrived
                </button>
              )}

              {bookingState === 'DRIVER_ARRIVING' && (
                <button
                  type="button"
                  onClick={handleStartTrip}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-[#FFCC00] text-gray-950 font-black text-xs shadow-md transition-all active:scale-98"
                >
                  Start Trip (Verify PIN)
                </button>
              )}

              {bookingState === 'IN_PROGRESS' && (
                <button
                  type="button"
                  onClick={handleCompleteTrip}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-98"
                >
                  Complete Trip & Receipt
                </button>
              )}

              <button
                type="button"
                onClick={handleCancelBooking}
                className="py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-rose-700 font-bold text-xs transition-all active:scale-98"
              >
                Cancel
              </button>
            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 4. ADDRESS SEARCH & SELECTION MODAL / DRAWER                              */}
      {/* ========================================================================= */}
      {showAddressPicker && (
        <div className="fixed inset-0 z-[2000] bg-black/40 backdrop-blur-xs flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4">
          <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-extrabold text-gray-950 flex items-center space-x-2">
                <span>{addressPickerMode === 'pickup' ? '🟢 Choose Pickup Location' : '🔴 Choose Drop-off Destination'}</span>
              </h3>
              <button
                onClick={() => setShowAddressPicker(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <LocationSearchInput
              value={addressPickerMode === 'pickup' ? pickupLocation : dropoffLocation}
              onChange={(val) => {
                if (addressPickerMode === 'pickup') {
                  setPickupLocation((prev) => ({ ...prev, name: val }));
                } else {
                  setDropoffLocation((prev) => ({ ...prev, name: val }));
                }
              }}
              onSelect={(item) => {
                if (addressPickerMode === 'pickup') {
                  setPickupLocation(item);
                } else {
                  setDropoffLocation(item);
                }
                setShowAddressPicker(false);
              }}
              placeholder={addressPickerMode === 'pickup' ? "Enter pickup landmark in Bengaluru" : "Where are you heading?"}
              isPickup={addressPickerMode === 'pickup'}
              onUseCurrentLocation={handleDetectLiveLocation}
              isDetectingGPS={isDetectingGPS}
            />

            {/* Quick Chips */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Popular Locations:</span>
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_PRESET_LOCATIONS.map((loc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (addressPickerMode === 'pickup') {
                        setPickupLocation(loc);
                      } else {
                        setDropoffLocation(loc);
                      }
                      setShowAddressPicker(false);
                    }}
                    className="p-2 rounded-xl border border-gray-200 text-left hover:border-amber-300 hover:bg-amber-50/50 transition-all text-xs"
                  >
                    <div className="font-extrabold text-gray-900 truncate">{loc.name}</div>
                    <div className="text-[10px] text-gray-500 truncate">{loc.area}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddressPicker(false)}
              className="w-full py-3 rounded-xl bg-gray-900 text-white font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {receiptBooking && (
        <DigitalReceiptModal
          booking={receiptBooking}
          onClose={() => {
            setReceiptBooking(null);
            setBookingState('IDLE');
            setActiveBooking(null);
          }}
        />
      )}

    </div>
  );
};

export default CustomerExplore;
