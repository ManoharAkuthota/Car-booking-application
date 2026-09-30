import React from 'react';
import {
  X, ArrowLeft, MapPin, Navigation, Clock, ShieldCheck, Car,
  User, IndianRupee, CreditCard, Star, CheckCircle2, Lock,
  Phone, Mail, Sparkles, AlertCircle, FileText
} from 'lucide-react';

const RideDetailsModal = ({ trip, driver, onClose, onBack }) => {
  if (!trip) return null;

  const car = trip.car || {};
  const passenger = trip.passenger || {};
  const pricing = trip.pricing || {
    baseFare: 25.0,
    distanceFare: 52.5,
    platformFee: 7.5,
    taxes: 3.88,
    discount: 7.5,
    totalFare: trip.totalFare || 81.38,
  };
  const review = trip.passengerReview;

  return (
    <div
      data-testid="ride-details-modal"
      className="fixed inset-0 z-[2600] flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-950 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                type="button"
                data-testid="back-to-driver-modal"
                onClick={onBack}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center space-x-1 text-xs font-bold"
                title="Back to Driver History"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Driver History</span>
              </button>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm sm:text-base font-black text-white">
                  {trip.bookingCode}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {trip.status || 'COMPLETED'}
                </span>
              </div>
              <p className="text-[11px] text-purple-200 font-medium mt-0.5">
                Comprehensive Platform Ride Telemetry & Audit
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="close-ride-details-modal"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close Ride Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/50">
          {/* 1. Route & Travel Telemetry */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                Route & Transit Metrics
              </span>
              <span className="text-xs text-gray-500 font-medium">{trip.createdAt}</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                  <div className="w-0.5 h-8 bg-gray-200 my-1" />
                  <div className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-100" />
                </div>
                <div className="flex-1 space-y-2.5 min-w-0">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Pickup Landmark</p>
                    <p className="text-xs font-bold text-gray-900 leading-tight">
                      {trip.pickupAddress}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Destination Landmark</p>
                    <p className="text-xs font-bold text-gray-900 leading-tight">
                      {trip.dropAddress}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center">
                <div className="bg-purple-50/60 p-2 rounded-xl">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Distance</p>
                  <p className="text-sm font-black text-purple-700 font-mono">{trip.distanceKm} km</p>
                </div>
                <div className="bg-purple-50/60 p-2 rounded-xl">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Duration</p>
                  <p className="text-sm font-black text-purple-700 font-mono">{trip.durationMins} mins</p>
                </div>
                <div className="bg-purple-50/60 p-2 rounded-xl">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Trip OTP PIN</p>
                  <p className="text-sm font-black text-purple-700 font-mono tracking-widest">{trip.otp || '5824'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Passenger & Pilot Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Passenger Info */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                Passenger Profile
              </span>
              <div className="flex items-center space-x-3 pt-1">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-gray-950 truncate">
                    {passenger.fullName || 'Priya Sharma'}
                  </p>
                  <p className="text-[11px] text-gray-500 font-mono">{passenger.phoneNumber || '+91 98450 12345'}</p>
                  <div className="flex items-center space-x-1 text-[10px] text-amber-600 font-bold mt-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{passenger.rating || 4.95} Passenger Rating</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pilot & Vehicle Assigned */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                Assigned Pilot & Vehicle
              </span>
              <div className="flex items-center space-x-3 pt-1">
                <img
                  src={car.imageUrl || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800'}
                  alt={car.model || 'Vehicle'}
                  className="w-12 h-10 rounded-xl object-cover border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-gray-950 truncate">
                    {car.make} {car.model}
                  </p>
                  <p className="text-[10px] text-purple-700 font-mono font-bold">{car.licensePlate || 'KA-05-BK-3344'}</p>
                  <p className="text-[10px] text-gray-500 font-medium">Pilot: {driver?.user?.fullName || 'Rajesh Kumar'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Comprehensive Itemized Financial & Fare Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                Financial Breakdown & Settlement
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                {trip.paymentStatus || 'SETTLED'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Base Upfront Fare</span>
                <span className="font-mono font-bold">₹{Number(pricing.baseFare).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Distance Rate ({trip.distanceKm} km)</span>
                <span className="font-mono font-bold">₹{Number(pricing.distanceFare).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Platform Service Commission (10%)</span>
                <span className="font-mono font-bold">₹{Number(pricing.platformFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST & Transport Cess (5%)</span>
                <span className="font-mono font-bold">₹{Number(pricing.taxes).toFixed(2)}</span>
              </div>
              {pricing.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Promotional Coupon Discount</span>
                  <span className="font-mono">-₹{Number(pricing.discount).toFixed(2)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-sm font-black text-gray-950">
                <span>Total Settled Amount</span>
                <span className="text-base text-purple-700 font-mono">
                  ₹{Number(pricing.totalFare).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-1.5">
                <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                <span>Payment Mode: <strong>{trip.paymentMethod || 'UPI / PhonePe'}</strong></span>
              </div>
              <span className="text-emerald-600 font-bold flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Direct Bank Deposit
              </span>
            </div>
          </div>

          {/* 4. Customer Review for This Specific Ride */}
          {review && (
            <div className="bg-amber-50/60 rounded-2xl border border-amber-200 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
                  Passenger Feedback on This Trip
                </span>
                <div className="flex items-center space-x-0.5 text-amber-600 font-black text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                  <span>{review.rating}.0 / 5.0</span>
                </div>
              </div>
              <p className="text-xs text-gray-800 italic leading-relaxed font-medium">
                "{review.comment}"
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 bg-white p-3 sm:p-4 flex items-center justify-between">
          <span className="text-[11px] text-gray-400 font-mono">
            Booking ID: #{trip.id}
          </span>
          <div className="flex items-center space-x-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-3.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors"
              >
                ← Back to History
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideDetailsModal;
