import React, { useState, useEffect } from 'react';
import { bookingApi } from '../api/client';
import MapView from './MapView';
import { X, MapPin, Navigation, CreditCard, Clock, IndianRupee, ShieldCheck, CheckCircle2, Loader2, Sparkles, Package, HardHat, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const PRESET_LOCATIONS = [
  { name: 'Indiranagar 100ft Rd', lat: 12.9784, lng: 77.6408 },
  { name: 'Kempegowda Airport (BLR)', lat: 13.1986, lng: 77.7066 },
  { name: 'MG Road Metro', lat: 12.9756, lng: 77.6066 },
  { name: 'Electronic City Phase 1', lat: 12.8452, lng: 77.6602 },
  { name: 'Whitefield IT Park', lat: 12.9866, lng: 77.7382 },
  { name: 'Koramangala 5th Block', lat: 12.9352, lng: 77.6245 },
];

const BookingModal = ({ car, onClose, onBookingSuccess }) => {
  const [pickupIndex, setPickupIndex] = useState(0);
  const [dropoffIndex, setDropoffIndex] = useState(1);
  const [customPickup, setCustomPickup] = useState(PRESET_LOCATIONS[0].name);
  const [customDropoff, setCustomDropoff] = useState(PRESET_LOCATIONS[1].name);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [cargoType, setCargoType] = useState('Boxes & Cartons');
  const [helperNeeded, setHelperNeeded] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const pickupCoord = [PRESET_LOCATIONS[pickupIndex].lat, PRESET_LOCATIONS[pickupIndex].lng];
  const dropoffCoord = [PRESET_LOCATIONS[dropoffIndex].lat, PRESET_LOCATIONS[dropoffIndex].lng];

  const getCategoryMeta = () => {
    switch (car.category) {
      case 'BIKE':
        return { emoji: '🏍️', label: 'Rapido Bike Taxi', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'AUTO':
        return { emoji: '🛺', label: 'Auto Rickshaw', badgeColor: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'TROLLEY_PORTER':
        return { emoji: '🛻', label: 'Porter / Goods Cargo', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' };
      default:
        return { emoji: '🚗', label: 'Uber Style Cab', badgeColor: 'bg-brand-100 text-brand-800 border-brand-200' };
    }
  };

  const meta = getCategoryMeta();

  // Fetch fare estimate whenever pickup, dropoff, or car changes
  useEffect(() => {
    const fetchEstimate = async () => {
      setLoadingEstimate(true);
      setError(null);
      try {
        const res = await bookingApi.estimateFare({
          carId: car.id,
          pickupLat: pickupCoord[0],
          pickupLng: pickupCoord[1],
          dropoffLat: dropoffCoord[0],
          dropoffLng: dropoffCoord[1],
        });
        setEstimate(res.data);
      } catch (err) {
        console.error("Failed to estimate fare:", err);
      } finally {
        setLoadingEstimate(false);
      }
    };

    fetchEstimate();
  }, [car.id, pickupIndex, dropoffIndex]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const instructions = car.category === 'TROLLEY_PORTER'
        ? `[Cargo: ${cargoType}${helperNeeded ? ' + Helper' : ''}] ${specialInstructions}`.trim()
        : specialInstructions;

      const res = await bookingApi.createBooking({
        carId: car.id,
        pickupAddress: customPickup,
        dropoffAddress: customDropoff,
        pickupLat: pickupCoord[0],
        pickupLng: pickupCoord[1],
        dropoffLat: dropoffCoord[0],
        dropoffLng: dropoffCoord[1],
        distanceKm: estimate?.distanceKm,
        estimatedDurationMins: estimate?.estimatedDurationMins,
        paymentMethod: paymentMethod,
        specialInstructions: instructions,
      });

      // Celebration effect
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      onBookingSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-xl shadow-sm">
              {meta.emoji}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold text-gray-950">Book {car.make} {car.model}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badgeColor}`}>
                  {meta.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-mono font-medium">{car.licensePlate} • ₹{car.pricePerKm}/km</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Multi-modal Highlight Banner */}
        <div className="mx-6 mt-4 px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center space-x-3 text-xs">
          {car.category === 'BIKE' && (
            <div className="flex items-center space-x-2 text-amber-800">
              <HardHat className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span><strong>Rapido Safety Guarantee:</strong> Sanitized passenger helmet provided. 1 rider max for instant traffic skipping.</span>
            </div>
          )}
          {car.category === 'AUTO' && (
            <div className="flex items-center space-x-2 text-amber-900">
              <Sparkles className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span><strong>Upfront Meter Fare:</strong> Up to 3 passengers. Reliable, door-to-door auto rickshaw ride.</span>
            </div>
          )}
          {car.category === 'TROLLEY_PORTER' && (
            <div className="flex items-center space-x-2 text-purple-800">
              <Package className="w-4 h-4 flex-shrink-0 text-purple-600" />
              <span><strong>Logistics & Shifting:</strong> Max payload capacity <strong>{car.maxWeightKg || 750} kg</strong>. Commercial goods transport.</span>
            </div>
          )}
          {car.category !== 'BIKE' && car.category !== 'AUTO' && car.category !== 'TROLLEY_PORTER' && (
            <div className="flex items-center space-x-2 text-emerald-800">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span><strong>Uber Style Cab:</strong> Air-conditioned, verified pilot, transparent meter with live Google Maps tracking.</span>
            </div>
          )}
        </div>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          {/* Left Column: Route & Location */}
          <div className="lg:col-span-7 space-y-4">
            <MapView
              pickup={pickupCoord}
              dropoff={dropoffCoord}
              category={car.category}
              className="h-[200px]"
            />

            {/* Location Selectors */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
              {/* Pickup Point */}
              <div>
                <label className="text-xs font-bold text-gray-700 flex items-center space-x-1.5 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span>Pickup Location</span>
                </label>
                <select
                  value={pickupIndex}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setPickupIndex(idx);
                    setCustomPickup(PRESET_LOCATIONS[idx].name);
                  }}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-brand-500"
                >
                  {PRESET_LOCATIONS.map((loc, idx) => (
                    <option key={idx} value={idx} disabled={idx === dropoffIndex}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Point */}
              <div>
                <label className="text-xs font-bold text-gray-700 flex items-center space-x-1.5 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <span>Destination Drop-off</span>
                </label>
                <select
                  value={dropoffIndex}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setDropoffIndex(idx);
                    setCustomDropoff(PRESET_LOCATIONS[idx].name);
                  }}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-rose-500"
                >
                  {PRESET_LOCATIONS.map((loc, idx) => (
                    <option key={idx} value={idx} disabled={idx === pickupIndex}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Porter Cargo Details (if Trolley) */}
            {car.category === 'TROLLEY_PORTER' && (
              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-purple-900 flex items-center space-x-1.5">
                    <Package className="w-3.5 h-3.5 text-purple-600" />
                    <span>Type of Goods / Cargo</span>
                  </label>
                  <span className="text-[10px] text-purple-700 font-bold">Max {car.maxWeightKg || 750} kg</span>
                </div>
                <select
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  className="w-full bg-white border border-purple-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-purple-500"
                >
                  <option value="Furniture & Shifting">Furniture & Home Shifting</option>
                  <option value="Boxes & Cartons">Commercial Boxes & Cartons</option>
                  <option value="Electrical Appliances">Electrical & Electronic Appliances</option>
                  <option value="Hardware & Machinery">Hardware & Machine Parts</option>
                  <option value="General Merchandise">General Merchandise</option>
                </select>

                <label className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer pt-1 font-semibold">
                  <input
                    type="checkbox"
                    checked={helperNeeded}
                    onChange={(e) => setHelperNeeded(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>Need Driver / Helper Assistance for Loading (+₹100)</span>
                </label>
              </div>
            )}

            {/* Special Instructions */}
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1 block">
                Driver Notes / Special Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder={car.category === 'TROLLEY_PORTER' ? "e.g. Please bring rope, ground floor pickup" : "e.g. Please wait near Gate 2"}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Right Column: Fare Breakdown & Payment */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            {/* Fare Summary Box */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-3 shadow-inner">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
                <span>Trip Fare Breakdown</span>
                {loadingEstimate && <Loader2 className="w-3.5 h-3.5 text-brand-600 animate-spin" />}
              </h3>

              <div className="flex items-center justify-between text-xs py-1 border-b border-gray-200">
                <span className="text-gray-500 flex items-center">
                  <Navigation className="w-3 h-3 mr-1 text-gray-400" />
                  Estimated Distance
                </span>
                <span className="font-bold text-gray-900">{estimate?.distanceKm || '--'} km</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-gray-200">
                <span className="text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1 text-gray-400" />
                  Estimated Duration
                </span>
                <span className="font-bold text-gray-900">{estimate?.estimatedDurationMins || '--'} mins</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-gray-500">Base Fare</span>
                <span className="font-mono font-bold text-gray-900">₹{estimate?.baseFare || car.baseFare}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-gray-500">Distance Fare ({estimate?.distanceKm} km × ₹{car.pricePerKm})</span>
                <span className="font-mono font-bold text-gray-900">₹{estimate?.distanceFare || '--'}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-gray-200">
                <span className="text-gray-500">Taxes & Platform Fee (5%)</span>
                <span className="font-mono font-bold text-gray-900">₹{estimate?.taxAndServiceFee || '--'}</span>
              </div>

              {helperNeeded && car.category === 'TROLLEY_PORTER' && (
                <div className="flex items-center justify-between text-xs py-1 text-purple-700 font-bold border-b border-gray-200">
                  <span>Helper Assistance</span>
                  <span className="font-mono">₹100</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-sm font-extrabold text-gray-950">Guaranteed Upfront Total</span>
                  <p className="text-[10px] text-gray-500 font-medium">All inclusive, no hidden charges</p>
                </div>
                <div className="text-2xl font-black text-gray-950 font-mono">
                  ₹{estimate ? (Number(estimate.totalFare) + (helperNeeded ? 100 : 0)).toFixed(2) : '--'}
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {['UPI', 'CASH', 'CARD'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      paymentMethod === m
                        ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {m === 'UPI' ? '⚡ UPI / GPay' : m === 'CASH' ? '💵 Cash' : '💳 Card'}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Booking Action */}
            <button
              type="button"
              onClick={handleBooking}
              disabled={submitting || loadingEstimate}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-brand-500 hover:from-amber-500 hover:to-brand-600 text-slate-950 font-black text-sm shadow-md active:scale-98 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Matching Nearest Pilot...</span>
                </>
              ) : (
                <>
                  <span>Confirm & Book {car.make} {car.model}</span>
                  <CheckCircle2 className="w-5 h-5 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
