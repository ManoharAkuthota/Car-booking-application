import React, { useState } from 'react';
import { bookingApi } from '../api/client';
import MapView from './MapView';
import { Navigation, Phone, Shield, CheckCircle2, Clock, KeyRound, AlertCircle, FileText, XCircle, Loader2 } from 'lucide-react';

const STATUS_STEPS = [
  { key: 'REQUESTED', label: 'Requested' },
  { key: 'ACCEPTED', label: 'Driver Assigned' },
  { key: 'DRIVER_ARRIVING', label: 'Driver Arrived' },
  { key: 'IN_PROGRESS', label: 'Trip in Progress' },
  { key: 'COMPLETED', label: 'Completed' },
];

const ActiveTripCard = ({ booking, onStatusChanged, onViewReceipt }) => {
  const [loadingAction, setLoadingAction] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const pickupCoord = [booking.pickupLat || 12.9716, booking.pickupLng || 77.5946];
  const dropoffCoord = [booking.dropoffLat || 13.0358, booking.dropoffLng || 77.5970];

  // Calculate simulated car position based on status
  const getCarPos = () => {
    if (booking.status === 'ACCEPTED') {
      return [pickupCoord[0] + 0.008, pickupCoord[1] - 0.008];
    }
    if (booking.status === 'DRIVER_ARRIVING') {
      return pickupCoord;
    }
    if (booking.status === 'IN_PROGRESS') {
      return [(pickupCoord[0] + dropoffCoord[0]) / 2, (pickupCoord[1] + dropoffCoord[1]) / 2];
    }
    if (booking.status === 'COMPLETED') {
      return dropoffCoord;
    }
    return null;
  };

  const handleStepTransition = async (newStatus) => {
    setLoadingAction(true);
    setErrorMessage(null);
    try {
      const res = await bookingApi.updateStatus(booking.id, {
        status: newStatus,
        otp: newStatus === 'IN_PROGRESS' ? booking.otp : null,
      });
      onStatusChanged(res.data);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Action failed.');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this ride?")) return;
    setLoadingAction(true);
    try {
      const res = await bookingApi.cancelBooking(booking.id);
      onStatusChanged(res.data);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to cancel.');
    } finally {
      setLoadingAction(false);
    }
  };

  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === booking.status);

  return (
    <div className="rounded-3xl glass-panel border border-slate-800 p-6 shadow-2xl relative overflow-hidden space-y-6">
      {/* Top Banner: Booking Code and Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black text-white font-mono">{booking.bookingCode}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 font-bold border border-brand-500/20 uppercase">
                {booking.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {booking.car?.make} {booking.car?.model} • {booking.car?.licensePlate}
            </p>
          </div>
        </div>

        {/* Start OTP Display */}
        {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
          <div className="flex items-center space-x-3 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-2xl">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Start PIN (OTP)</p>
              <p className="text-xl font-black text-amber-400 font-mono tracking-widest leading-none">
                {booking.otp || '----'}
              </p>
            </div>
          </div>
        )}

        {/* View Receipt Button if completed */}
        {booking.status === 'COMPLETED' && (
          <button
            onClick={() => onViewReceipt(booking)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-500 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 hover:bg-brand-400 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>View Receipt & Invoice</span>
          </button>
        )}
      </div>

      {/* Progress Steps Indicator */}
      <div className="grid grid-cols-5 gap-2 pt-2">
        {STATUS_STEPS.map((step, idx) => {
          const isDone = currentStepIdx >= idx;
          const isCurrent = currentStepIdx === idx;
          return (
            <div key={step.key} className="text-center space-y-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  isDone
                    ? 'bg-brand-500 shadow-sm shadow-brand-500/50'
                    : 'bg-slate-800'
                }`}
              />
              <span
                className={`text-[10px] font-semibold block truncate ${
                  isCurrent
                    ? 'text-brand-400 font-bold'
                    : isDone
                    ? 'text-slate-300'
                    : 'text-slate-600'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Live Map Preview with Animated Simulated Car */}
      <MapView
        pickup={pickupCoord}
        dropoff={dropoffCoord}
        carPosition={getCarPos()}
        category={booking.car?.category}
        isLiveTrip={true}
        className="h-[240px]"
      />

      {/* Route & Driver Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Addresses */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="flex items-start space-x-3 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 mt-1 flex-shrink-0" />
            <div>
              <p className="text-slate-400 text-[10px]">Pickup Point</p>
              <p className="font-semibold text-white">{booking.pickupAddress}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 flex-shrink-0" />
            <div>
              <p className="text-slate-400 text-[10px]">Drop-off Destination</p>
              <p className="font-semibold text-white">{booking.dropoffAddress}</p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span>Distance: <strong className="text-white">{booking.distanceKm} km</strong></span>
            <span>Duration: <strong className="text-white">~{booking.estimatedDurationMins} mins</strong></span>
            <span>Fare: <strong className="text-brand-400">₹{booking.totalFare}</strong></span>
          </div>
        </div>

        {/* Assigned Driver Profile */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={booking.driver?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120"}
              alt="Driver"
              className="w-12 h-12 rounded-2xl object-cover border border-brand-500/30"
            />
            <div>
              <h4 className="text-sm font-bold text-white">
                {booking.driver ? booking.driver.fullName : 'Searching nearby driver...'}
              </h4>
              <p className="text-xs text-slate-400">
                {booking.car?.make} {booking.car?.model} ({booking.car?.licensePlate})
              </p>
              <div className="flex items-center space-x-2 mt-1 text-[11px] text-amber-400">
                <span>★ 4.93 Driver Rating</span>
              </div>
            </div>
          </div>

          {booking.driver && (
            <a
              href={`tel:${booking.driver.phone || '+919988776655'}`}
              className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-brand-400 hover:bg-brand-500 hover:text-slate-950 transition-all"
              title="Call Driver"
            >
              <Phone className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {errorMessage}
        </div>
      )}

      {/* Simulator Quick Action Buttons (to test full ride flow effortlessly) */}
      <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-slate-400 font-semibold flex items-center">
          <Clock className="w-3.5 h-3.5 mr-1 text-brand-400" />
          Test Ride Lifecycle:
        </span>

        <div className="flex items-center space-x-2">
          {booking.status === 'REQUESTED' && (
            <button
              onClick={() => handleStepTransition('ACCEPTED')}
              disabled={loadingAction}
              className="px-3 py-1.5 rounded-xl bg-brand-500/20 text-brand-300 border border-brand-500/30 hover:bg-brand-500 hover:text-slate-950 text-xs font-bold transition-all"
            >
              Simulate: Driver Accept
            </button>
          )}

          {booking.status === 'ACCEPTED' && (
            <button
              onClick={() => handleStepTransition('DRIVER_ARRIVING')}
              disabled={loadingAction}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500 hover:text-slate-950 text-xs font-bold transition-all"
            >
              Simulate: Driver Arrived
            </button>
          )}

          {booking.status === 'DRIVER_ARRIVING' && (
            <button
              onClick={() => handleStepTransition('IN_PROGRESS')}
              disabled={loadingAction}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold transition-all"
            >
              Simulate: Verify OTP & Start Ride
            </button>
          )}

          {booking.status === 'IN_PROGRESS' && (
            <button
              onClick={() => handleStepTransition('COMPLETED')}
              disabled={loadingAction}
              className="px-3 py-1.5 rounded-xl bg-brand-500 text-slate-950 hover:bg-brand-400 text-xs font-extrabold shadow-lg shadow-brand-500/20 transition-all"
            >
              Simulate: Complete Trip & Pay
            </button>
          )}

          {/* Cancel button if not completed */}
          {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
            <button
              onClick={handleCancel}
              disabled={loadingAction}
              className="px-3 py-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 text-xs font-semibold transition-all"
            >
              Cancel Ride
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveTripCard;
