import React, { useState, useEffect, useMemo, useRef } from 'react';
import { carApi, bookingApi } from '../api/client';
import { DEFAULT_PRESET_LOCATIONS, reverseGeocode } from '../api/locationService';
import LocationSearchInput from '../components/LocationSearchInput';
import MapView from '../components/MapView';
import DigitalReceiptModal from '../components/DigitalReceiptModal';
import HomeScreen from '../components/home/HomeScreen';
import LocationSearchScreen from '../components/ride/LocationSearchScreen';
import {
  MapPin, Navigation, Clock, ShieldCheck, ChevronRight, Star,
  AlertCircle, PhoneCall, Check, Info, ShieldAlert, Sparkles,
  RefreshCw, X, Crosshair, Users, Zap, ArrowUpDown, Calendar,
  CreditCard, Tag, FileText, ChevronDown, CheckCircle2, ArrowRight,
  Shield, Phone, KeyRound, Loader2, Award, ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

// 5 Dedicated Rapido Services Enhanced from Reference Images
// 5 Dedicated Rapido Services Enhanced from Reference Images (Crisp High-Contrast Vector Models)
const RAPIDO_SERVICES = [
  {
    id: 'BIKE',
    category: 'BIKE',
    name: 'Bike',
    symbolSvg: (
      <svg viewBox="0 0 54 36" width="38" height="26" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    tag: 'Fastest',
    subtitle: 'Beat city traffic • Helmet provided',
    seats: '1 Person',
    eta: '2 mins',
    defaultFare: 45,
    baseFare: 25,
    perKm: 7.5,
  },
  {
    id: 'AUTO',
    category: 'AUTO',
    name: 'Auto',
    symbolSvg: (
      <svg viewBox="0 0 54 36" width="38" height="26" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    tag: 'Popular',
    subtitle: 'Hassle-free Auto • Upfront meter',
    seats: '3 Seats',
    eta: '3 mins',
    defaultFare: 75,
    baseFare: 35,
    perKm: 11,
  },
  {
    id: 'CAR',
    category: 'SEDAN',
    name: 'Car',
    symbolSvg: (
      <svg viewBox="0 0 56 34" width="40" height="25" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    tag: 'Comfort AC',
    subtitle: 'Comfy AC daily rides • Pocket friendly',
    seats: '4 Seats',
    eta: '4 mins',
    defaultFare: 110,
    baseFare: 60,
    perKm: 14,
  },
  {
    id: 'AUTO_PLUS',
    category: 'SUV',
    name: 'Auto Plus',
    symbolSvg: (
      <svg viewBox="0 0 54 36" width="38" height="26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="27" r="6" fill="#18181b" stroke="#ca8a04" strokeWidth="1.5" />
        <circle cx="11" cy="27" r="2.5" fill="#facc15" />
        <circle cx="43" cy="27" r="6" fill="#18181b" stroke="#ca8a04" strokeWidth="1.5" />
        <circle cx="43" cy="27" r="2.5" fill="#facc15" />
        <path d="M 7 20 C 7 17, 11 15, 15 15 L 39 15 C 44 15, 47 18, 47 23 L 47 26 C 47 28, 43 28, 41 28 L 13 28 C 9 28, 7 25, 7 20 Z" fill="#eab308" stroke="#09090b" strokeWidth="1.2" />
        <path d="M 11 6 C 14 3, 41 3, 46 6 L 47 15 L 11 15 Z" fill="#1d4ed8" stroke="#09090b" strokeWidth="1.2" />
        <path d="M 7 20 L 11 9 C 12 7, 15 6, 17 6 L 24 6 L 24 15 L 7 15 Z" fill="#93c5fd" fillOpacity="0.5" stroke="#09090b" strokeWidth="1" />
        <circle cx="41" cy="5" r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
        <path d="M 41 2.5 L 42 4.2 L 43.8 4.2 L 42.4 5.3 L 42.9 7 L 41 5.9 L 39.1 7 L 39.6 5.3 L 38.2 4.2 L 40 4.2 Z" fill="#ffffff" />
      </svg>
    ),
    tag: 'Top Rated',
    subtitle: 'Extra clean auto • Top rated captains',
    seats: '3 Seats',
    eta: '3 mins',
    defaultFare: 95,
    baseFare: 45,
    perKm: 12,
  },
  {
    id: 'TROLLEY_PORTER',
    category: 'TROLLEY_PORTER',
    name: 'Porter Cargo',
    symbolSvg: (
      <svg viewBox="0 0 56 36" width="40" height="26" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    tag: 'Logistics',
    subtitle: 'Mini-truck for boxes, goods up to 750kg',
    seats: 'Max 750 kg',
    eta: '6 mins',
    defaultFare: 210,
    baseFare: 120,
    perKm: 20,
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

  // Multi-step navigation flow: 'HOME' | 'SEARCH' | 'MAP_TIERS'
  const [flowStep, setFlowStep] = useState('HOME');

  // Booking lifecycle state for animation
  const [bookingState, setBookingState] = useState('IDLE'); // 'IDLE' | 'SEARCHING' | 'ACCEPTED' | 'DRIVER_ARRIVING' | 'IN_PROGRESS'
  const [assignedDriver, setAssignedDriver] = useState(null);
  const [otpPin, setOtpPin] = useState('5824');

  // Helper to ensure dropoff is in the same city vicinity (~3.5km) as pickup
  const autoPairVicinityDropoff = async (pickupLat, pickupLng, currentDropoff) => {
    const rawDist = Math.sqrt(
      Math.pow((currentDropoff.lat - pickupLat) * 111, 2) +
      Math.pow((currentDropoff.lng - pickupLng) * 111, 2)
    );
    // If dropoff is in another city/state (> 25 km), auto-pair a local destination in the user's city
    if (rawDist > 25) {
      const localDropLat = pickupLat + 0.024;
      const localDropLng = pickupLng + 0.020;
      try {
        const dropResolved = await reverseGeocode(localDropLat, localDropLng);
        setDropoffLocation({
          name: dropResolved.name || 'City Center Station',
          area: dropResolved.area || 'Nearby Destination (~3.5 km)',
          lat: localDropLat,
          lng: localDropLng,
        });
      } catch {
        setDropoffLocation({
          name: 'City Commercial Hub',
          area: 'Nearby Landmark (~3.5 km)',
          lat: localDropLat,
          lng: localDropLng,
        });
      }
    }
  };

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
            await autoPairVicinityDropoff(lat, lng, dropoffLocation);
          } catch (e) {}
        },
        () => {},
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  const pickupCoord = useMemo(() => [pickupLocation.lat, pickupLocation.lng], [pickupLocation]);
  const dropoffCoord = useMemo(() => [dropoffLocation.lat, dropoffLocation.lng], [dropoffLocation]);

  // Route distance estimation in km (Realistic intra-city clamping: 1.5 km to 35 km)
  const estDistanceKm = useMemo(() => {
    const rawDist = Math.sqrt(
      Math.pow((dropoffLocation.lat - pickupLocation.lat) * 111, 2) +
      Math.pow((dropoffLocation.lng - pickupLocation.lng) * 111, 2)
    ) * 1.28;
    const clamped = Math.min(35, Math.max(1.8, Math.round(rawDist * 10) / 10));
    return clamped || 5.2;
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
            setPickupLocation({ ...resolved, isLive: true });
            await autoPairVicinityDropoff(lat, lng, dropoffLocation);
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
        setFlowStep('MAP_TIERS');
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
    setFlowStep('HOME');
    setAssignedDriver(null);
  };

  // Step 1: NATIVE HOME SCREEN (Ride, Auto, Cab, Parcel, Porter Services Launcher)
  if (flowStep === 'HOME' && bookingState === 'IDLE') {
    return (
      <HomeScreen
        pickupLocation={pickupLocation}
        onOpenSearch={() => setFlowStep('SEARCH')}
        onSelectService={(serviceId) => {
          setSelectedServiceId(serviceId);
          setFlowStep('SEARCH');
        }}
        onSelectQuickDestination={(dest) => {
          setDropoffLocation(dest);
          setFlowStep('MAP_TIERS');
        }}
        onRefreshGPS={handleDetectLiveLocation}
        isDetectingGPS={isDetectingGPS}
      />
    );
  }

  // Step 2: DEDICATED LOCATION SEARCH SCREEN (Pickup & Drop-off selection with popular destinations)
  if (flowStep === 'SEARCH' && bookingState === 'IDLE') {
    return (
      <LocationSearchScreen
        pickupLocation={pickupLocation}
        dropoffLocation={dropoffLocation}
        onUpdatePickup={setPickupLocation}
        onUpdateDropoff={setDropoffLocation}
        onSwapLocations={handleSwapLocations}
        onDetectLiveGPS={handleDetectLiveLocation}
        isDetectingGPS={isDetectingGPS}
        selectedServiceName={selectedService.name}
        onBack={() => setFlowStep('HOME')}
        onProceedToRides={() => setFlowStep('MAP_TIERS')}
      />
    );
  }

  // Step 3 & 4: MAP & RIDE TIERS / ACTIVE TRIP VIEW (Nearest cruising vehicles, upfront fares, arrival animation)
  return (
    <div className="relative w-full h-[calc(100dvh-5.5rem)] sm:h-[calc(100dvh-4rem)] overflow-hidden flex flex-col bg-slate-100">
      
      {/* ========================================================================= */}
      {/* 1. FLOATING TOP ADDRESS SEARCH PILLS (With Back Button to Return to Search) */}
      {/* ========================================================================= */}
      <div className="absolute top-2.5 left-2.5 right-2.5 sm:left-4 sm:right-auto sm:w-[420px] z-[1000] pointer-events-auto">
        <div className="bg-white/95 rounded-2xl shadow-xl border border-gray-200/90 p-2 sm:p-2.5 backdrop-blur-md flex flex-col space-y-1.5">
          
          {/* Top navigation row with Back button */}
          <div className="flex items-center justify-between pb-1 border-b border-gray-100">
            <button
              type="button"
              onClick={() => {
                if (bookingState === 'IDLE') {
                  setFlowStep('SEARCH');
                } else {
                  handleCancelBooking();
                }
              }}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-black active:scale-95 transition-all shadow-xs"
              title="Edit Route / Back"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{bookingState === 'IDLE' ? 'Edit Route' : 'Back'}</span>
            </button>

            <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
              {selectedService.name} • ~{estDistanceKm} km
            </span>
          </div>

          {/* Pickup Row */}
          <div
            onClick={() => setFlowStep('SEARCH')}
            className="flex items-center space-x-2.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block leading-none">
                  Your Pick Up
                </span>
                {pickupLocation.isLive && (
                  <span className="inline-flex items-center px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
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
            onClick={() => setFlowStep('SEARCH')}
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
      {/* 2. REAL VECTOR MAP (Fills 100% Screen Under Floating Sheets - Native App)  */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <MapView
          pickup={pickupCoord}
          dropoff={dropoffCoord}
          category={selectedService.category}
          isLiveTrip={bookingState !== 'IDLE'}
          tripStatus={bookingState === 'IDLE' ? null : bookingState}
          className="w-full h-full rounded-none border-0 shadow-none"
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
          className="absolute bottom-[50vh] sm:bottom-6 right-3 sm:right-6 z-[1000] w-11 h-11 rounded-full bg-white shadow-xl border border-gray-200 flex items-center justify-center text-blue-600 hover:scale-105 active:scale-95 transition-all pointer-events-auto"
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
      {/* 3. PINNED BOTTOM SHEET (Matching Image 1 & 2 - No Page Scrolling)          */}
      {/* ========================================================================= */}
      <div className="absolute bottom-0 left-0 right-0 sm:left-4 sm:bottom-4 sm:right-auto sm:w-[430px] z-[1000] max-h-[49vh] sm:max-h-[64vh] overflow-hidden flex flex-col bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-200 divide-y divide-gray-100">
        
        {/* Mobile Drag Pill */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto my-1.5 sm:hidden flex-shrink-0" />

        {/* --- VIEW A: EXPLORE & SERVICE SELECTION (Image 1 & 2) --- */}
        {bookingState === 'IDLE' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            
            {/* Scrollable Services List (Internal list scrolls smoothly, page stays fixed!) */}
            <div className="flex-1 overflow-y-auto px-3.5 py-1.5 space-y-1.5 min-h-0">
              {RAPIDO_SERVICES.map((s) => {
                const isSelected = selectedServiceId === s.id;
                const fare = calculateServiceFare(s);

                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedServiceId(s.id)}
                    className={`rounded-2xl p-2.5 flex items-center justify-between cursor-pointer transition-all duration-150 border ${
                      isSelected
                        ? 'bg-[#FFF9E6] border-[#FFCC00] ring-2 ring-[#FFCC00]/50 shadow-xs'
                        : 'bg-white border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    {/* Left: Crisp Vector Model in Clean Container */}
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-12 h-11 rounded-xl bg-slate-100 border border-slate-200/90 flex items-center justify-center flex-shrink-0 shadow-xs">
                        {s.symbolSvg}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-black text-gray-950">
                            {s.name}
                          </h3>
                          <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md">
                            {s.eta}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {s.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Right: Upfront Price */}
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

            {/* Pinned Bottom Actions Bar - ALWAYS 100% VISIBLE ON SCREEN WITHOUT SCROLLING */}
            <div className="p-3 bg-white border-t border-gray-100 flex-shrink-0 space-y-2">
              
              {/* Promo & Cash Strips */}
              <div className="flex items-center justify-between text-xs px-1">
                <div
                  onClick={() => alert("Coupon applied: 25% discount unlocked!")}
                  className="flex items-center space-x-1.5 text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Apply Coupon</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-600 font-semibold">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black">₹</span>
                  <span>Cash / UPI</span>
                </div>
              </div>

              {/* Big Action Buttons */}
              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={() => alert("Scheduled ride option: select time")}
                  className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center text-gray-700 shadow-xs active:scale-95 transition-all flex-shrink-0"
                  title="Ride Later"
                >
                  <Calendar className="w-4 h-4 text-gray-700" />
                  <span className="text-[9px] font-bold mt-0.5">Later</span>
                </button>

                <button
                  type="button"
                  onClick={handleBookNow}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#FFCC00] hover:bg-[#FFD633] text-gray-950 font-black text-sm sm:text-base shadow-md active:scale-98 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Book {selectedService.name} • ₹{calculateServiceFare(selectedService)}</span>
                </button>
              </div>

            </div>

          </div>
        )}

        {/* --- VIEW B: ACTIVE TRIP & DRIVER ARRIVAL COCKPIT (Rapido Live Ride) --- */}
        {bookingState !== 'IDLE' && (
          <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto max-h-[49vh] sm:max-h-[64vh]">
            
            {/* Status Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-xs sm:text-sm font-extrabold text-gray-950 truncate max-w-[200px] sm:max-w-none">
                  {bookingState === 'SEARCHING' && 'Connecting to nearby captains...'}
                  {bookingState === 'ACCEPTED' && 'Captain arriving at pickup'}
                  {bookingState === 'DRIVER_ARRIVING' && 'Captain arrived at pickup!'}
                  {bookingState === 'IN_PROGRESS' && 'Trip in progress to destination'}
                </h3>
              </div>

              {/* Start PIN (OTP) */}
              <div className="bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-xl text-right flex-shrink-0">
                <span className="text-[8px] uppercase font-bold text-amber-800 block">Start PIN</span>
                <span className="text-sm sm:text-base font-black text-amber-950 font-mono tracking-widest">{otpPin}</span>
              </div>
            </div>

            {/* Assigned Driver Profile Card */}
            {assignedDriver && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img
                      src={assignedDriver.avatar}
                      alt={assignedDriver.name}
                      className="w-11 h-11 rounded-xl object-cover border border-gray-300 shadow-sm"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-[9px] text-white font-black">
                      ✓
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-extrabold text-gray-950 truncate">
                      {assignedDriver.name}
                    </h4>
                    <p className="text-[11px] text-gray-500 font-medium truncate">
                      {assignedDriver.vehicle}
                    </p>
                    <div className="flex items-center space-x-1.5 text-xs text-amber-600 font-bold mt-0.5">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span>{assignedDriver.rating}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-500 text-[10px]">{assignedDriver.trips}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pl-2">
                  <button
                    type="button"
                    onClick={() => alert(`Calling Captain ${assignedDriver.name} at ${assignedDriver.phone}`)}
                    className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-sm active:scale-95"
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
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-98"
                >
                  Simulate Captain Arrived
                </button>
              )}

              {bookingState === 'DRIVER_ARRIVING' && (
                <button
                  type="button"
                  onClick={handleStartTrip}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-[#FFCC00] text-gray-950 font-black text-xs shadow-md transition-all active:scale-98"
                >
                  Start Trip (Verify PIN)
                </button>
              )}

              {bookingState === 'IN_PROGRESS' && (
                <button
                  type="button"
                  onClick={handleCompleteTrip}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-98"
                >
                  Complete Trip & Receipt
                </button>
              )}

              <button
                type="button"
                onClick={handleCancelBooking}
                className="py-2.5 px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-rose-700 font-bold text-xs transition-all active:scale-98"
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
            setFlowStep('HOME');
          }}
        />
      )}

    </div>
  );
};

export default CustomerExplore;
