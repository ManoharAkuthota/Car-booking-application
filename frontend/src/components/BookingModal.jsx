import React, { useState, useEffect } from 'react';
import { bookingApi } from '../api/client';
import MapView from './MapView';
import { X, MapPin, Navigation, CreditCard, Clock, IndianRupee, ShieldCheck, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
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
  const [estimate, setEstimate] = useState(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const pickupCoord = [PRESET_LOCATIONS[pickupIndex].lat, PRESET_LOCATIONS[pickupIndex].lng];
  const dropoffCoord = [PRESET_LOCATIONS[dropoffIndex].lat, PRESET_LOCATIONS[dropoffIndex].lng];

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
        specialInstructions: specialInstructions,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold">
              Ride
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Book {car.make} {car.model}</h2>
              <p className="text-xs text-slate-400 font-mono">{car.category} • {car.licensePlate}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          {/* Left Column: Route & Fare Estimation */}
          <div className="lg:col-span-7 space-y-4">
            {/* Interactive Map Preview */}
            <MapView
              pickup={pickupCoord}
              dropoff={dropoffCoord}
              className="h-[220px]"
            />

            {/* Location Selectors */}
            <div className="space-y-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
              {/* Pickup Point */}
              <div>
                <label className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                  <span>Pickup Location</span>
                </label>
                <select
                  value={pickupIndex}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setPickupIndex(idx);
                    setCustomPickup(PRESET_LOCATIONS[idx].name);
                  }}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
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
                <label className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Destination Drop-off</span>
                </label>
                <select
                  value={dropoffIndex}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setDropoffIndex(idx);
                    setCustomDropoff(PRESET_LOCATIONS[idx].name);
                  }}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  {PRESET_LOCATIONS.map((loc, idx) => (
                    <option key={idx} value={idx} disabled={idx === pickupIndex}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">
                Driver Notes / Special Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Please wait near Gate 2, luggage included"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Right Column: Fare Breakdown & Payment */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            {/* Fare Summary Box */}
            <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Trip Fare Breakdown</span>
                {loadingEstimate && <Loader2 className="w-3.5 h-3.5 text-brand-400 animate-spin" />}
              </h3>

              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
                <span className="text-slate-400 flex items-center">
                  <Navigation className="w-3 h-3 mr-1 text-slate-500" />
                  Estimated Distance
                </span>
                <span className="font-semibold text-white">{estimate?.distanceKm || '--'} km</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
                <span className="text-slate-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1 text-slate-500" />
                  Estimated Duration
                </span>
                <span className="font-semibold text-white">{estimate?.estimatedDurationMins || '--'} mins</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-400">Base Fare</span>
                <span className="font-mono text-slate-200">₹{estimate?.baseFare || car.baseFare}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-400">Distance Fare ({estimate?.distanceKm} km × ₹{car.pricePerKm})</span>
                <span className="font-mono text-slate-200">₹{estimate?.distanceFare || '--'}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Taxes & Platform Fee (5%)</span>
                <span className="font-mono text-slate-200">₹{estimate?.taxFare || '--'}</span>
              </div>

              <div className="pt-2 flex items-baseline justify-between">
                <div>
                  <span className="text-sm font-extrabold text-white">Total Amount</span>
                  <p className="text-[10px] text-brand-400">Guaranteed fixed rate</p>
                </div>
                <span className="text-2xl font-black text-brand-400 font-mono">
                  ₹{estimate?.totalFare || '--'}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 block">
                Select Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'UPI', label: 'UPI / GPay / PhonePe', icon: Sparkles },
                  { id: 'CREDIT_CARD', label: 'Credit / Debit Card', icon: CreditCard },
                  { id: 'WALLET', label: 'DrivePulse Wallet', icon: ShieldCheck },
                  { id: 'CASH', label: 'Cash on Arrival', icon: IndianRupee },
                ].map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      type="button"
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all text-xs ${
                        isSelected
                          ? 'bg-brand-500/10 border-brand-500 text-white font-bold ring-1 ring-brand-500'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-brand-400' : 'text-slate-500'}`} />
                      <span className="truncate">{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Confirm CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleBooking}
                disabled={submitting || loadingEstimate}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-brand-500/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming with Driver...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Booking (₹{estimate?.totalFare || '--'})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
