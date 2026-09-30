import React, { useState } from 'react';
import {
  X, Star, ShieldCheck, Car, Award, Calendar, Clock, MapPin,
  IndianRupee, ChevronRight, MessageSquare, CheckCircle, Navigation,
  User, Check, ThumbsUp, Sparkles, AlertCircle
} from 'lucide-react';

const DriverDetailsModal = ({ driver, onClose, onSelectTrip }) => {
  const [activeSubTab, setActiveSubTab] = useState('history'); // 'history' | 'reviews'

  if (!driver) return null;

  const trips = driver.tripHistory || [];
  const reviews = driver.reviews || [];
  const driverUser = driver.user || {};

  return (
    <div
      data-testid="driver-details-modal"
      className="fixed inset-0 z-[2500] flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-6 relative">
          <button
            type="button"
            data-testid="close-driver-details-modal"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close Driver Details"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start space-x-3.5 sm:space-x-5">
            <div className="relative">
              <img
                src={driverUser.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                alt={driverUser.fullName || 'Driver'}
                className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-white/40 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </div>

            <div className="flex-1 min-w-0 pr-8">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-black truncate">{driverUser.fullName || 'Certified Pilot'}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {driver.verificationStatus || 'APPROVED'}
                </span>
              </div>

              <p className="text-xs text-purple-200 font-medium truncate mt-0.5">
                {driver.vehicleAssigned || 'Royal Enfield Hunter 350'}
              </p>
              <p className="text-[11px] text-gray-300 font-mono mt-0.5">
                License: {driver.licenseNumber || 'KA-05-2019-0038472'} • {driver.experienceYears || 5} Yrs Experience
              </p>

              {/* Quick Metrics Bar */}
              <div className="flex items-center space-x-3 mt-3 text-xs">
                <div className="flex items-center space-x-1 bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-400/30 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>{driver.rating || 4.92} / 5</span>
                </div>
                <div className="bg-white/10 px-2 py-0.5 rounded-lg text-purple-100 font-semibold text-[11px]">
                  {driver.totalTrips || trips.length || 582} Completed Rides
                </div>
                <div className="hidden sm:block bg-white/10 px-2 py-0.5 rounded-lg text-emerald-300 font-semibold text-[11px]">
                  {driver.completionRate || '99.2%'} Reliability
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher: History vs Reviews */}
        <div className="flex border-b border-gray-200 bg-gray-50/80 px-4 pt-2">
          <button
            type="button"
            data-testid="driver-modal-tab-history"
            onClick={() => setActiveSubTab('history')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 py-2.5 px-4 font-bold text-xs border-b-2 transition-all ${
              activeSubTab === 'history'
                ? 'border-purple-600 text-purple-700 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Ride History ({trips.length})</span>
          </button>

          <button
            type="button"
            data-testid="driver-modal-tab-reviews"
            onClick={() => setActiveSubTab('reviews')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 py-2.5 px-4 font-bold text-xs border-b-2 transition-all ${
              activeSubTab === 'reviews'
                ? 'border-purple-600 text-purple-700 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Passenger Reviews ({reviews.length})</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-gray-50/50">
          {activeSubTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500 pb-1">
                <span>Select any ride below to inspect complete telemetries & fare breakdown:</span>
                <span className="font-bold text-purple-700 font-mono">{trips.length} Rides Logged</span>
              </div>

              {trips.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-gray-200 text-gray-400 text-xs">
                  No logged rides found for this driver partner.
                </div>
              ) : (
                trips.map((trip) => (
                  <div
                    key={trip.id || trip.bookingCode}
                    data-testid={`driver-trip-card-${trip.id || trip.bookingCode}`}
                    onClick={() => onSelectTrip && onSelectTrip(trip)}
                    className="group bg-white rounded-2xl border border-gray-200 p-3.5 sm:p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer space-y-2.5 active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-black text-gray-900">
                          {trip.bookingCode}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {trip.status || 'COMPLETED'}
                        </span>
                      </div>
                      <span className="text-[11px] font-black text-emerald-700 font-mono">
                        ₹{trip.pricing?.totalFare || trip.totalFare || 81.38}
                      </span>
                    </div>

                    {/* Route Preview */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-start space-x-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                        <p className="text-gray-700 text-[11px] truncate flex-1 font-medium">
                          {trip.pickupAddress}
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 flex-shrink-0" />
                        <p className="text-gray-700 text-[11px] truncate flex-1 font-medium">
                          {trip.dropAddress}
                        </p>
                      </div>
                    </div>

                    {/* Footer Info & Action */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[10px] text-gray-500">
                      <div className="flex items-center space-x-2 font-medium">
                        <span>{trip.createdAt}</span>
                        <span>•</span>
                        <span>{trip.distanceKm} km</span>
                        <span>•</span>
                        <span>{trip.durationMins} mins</span>
                      </div>
                      <span className="text-purple-600 font-black flex items-center group-hover:translate-x-0.5 transition-transform">
                        View All Ride Info <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeSubTab === 'reviews' && (
            <div className="space-y-3">
              {/* Rating summary bar */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-between shadow-xs">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Overall Passenger Rating</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-black text-gray-950 font-mono">{driver.rating || 4.92}</span>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 font-black border border-purple-200">
                    ⭐ Top 1% Pilot
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium">{reviews.length} Verified Customer Reviews</p>
                </div>
              </div>

              {/* Reviews List */}
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={rev.passengerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={rev.passengerName}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                      <div>
                        <p className="font-extrabold text-xs text-gray-950 flex items-center">
                          {rev.passengerName}
                          <span className="ml-1.5 px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 text-[8px] font-bold">
                            VERIFIED
                          </span>
                        </p>
                        <p className="text-[10px] text-gray-400">{rev.date} • Ride {rev.tripCode}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-0.5 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-xs font-black text-amber-700">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                      <span>{rev.rating}.0</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed font-medium">
                    "{rev.comment}"
                  </p>

                  {rev.tags && rev.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {rev.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-semibold"
                        >
                          ✓ {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 bg-white p-3 sm:p-4 flex items-center justify-between">
          <span className="text-[11px] text-gray-500">
            DrivePulse Driver Audit Ledger • Verified KYC & RC
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverDetailsModal;
