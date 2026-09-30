import React, { useState, useEffect } from 'react';
import {
  Volume2, VolumeX, Navigation, MapPin, CheckCircle2,
  X, Clock, Phone, Sparkles, AlertCircle, ShieldAlert
} from 'lucide-react';
import { dispatchSound } from '../utils/audioAlert';

const IncomingRideModal = ({ incomingRequest, onAccept, onDecline }) => {
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!incomingRequest) return;

    setSecondsLeft(30);
    // Start audible dispatch ringtone alert
    dispatchSound.startAlertRingtone();

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          dispatchSound.stopAlertRingtone();
          if (onDecline) onDecline(incomingRequest);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      dispatchSound.stopAlertRingtone();
    };
  }, [incomingRequest?.id]);

  if (!incomingRequest) return null;

  const handleToggleMute = () => {
    const muted = dispatchSound.toggleMute();
    setIsMuted(muted);
  };

  const handleAccept = () => {
    dispatchSound.stopAlertRingtone();
    dispatchSound.playSuccessChime();
    if (onAccept) onAccept(incomingRequest);
  };

  const handleDecline = () => {
    dispatchSound.stopAlertRingtone();
    if (onDecline) onDecline(incomingRequest);
  };

  const percent = Math.max(0, Math.min(100, (secondsLeft / 30) * 100));

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div
        data-testid="incoming-ride-popup"
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-cyan-400 overflow-hidden transform transition-all animate-bounceShort"
      >
        {/* Top Emergency Dispatch Header */}
        <div className="bg-gradient-to-r from-gray-950 via-slate-900 to-gray-950 text-white px-5 py-3.5 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
            </span>
            <div className="leading-tight">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-black tracking-wider uppercase text-cyan-400">⚡ LIVE DISPATCH ALERT</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {incomingRequest.bookingCode || 'DP-RIDE'}
                </span>
              </div>
              <p className="text-[10px] text-gray-400">Incoming Passenger Booking</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleToggleMute}
              className="p-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
              title={isMuted ? 'Unmute alert sound' : 'Mute alert sound'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />}
            </button>
            <div className="px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black font-mono">
              {secondsLeft}s
            </div>
          </div>
        </div>

        {/* Dynamic Countdown Progress Bar */}
        <div className="w-full h-1.5 bg-gray-100">
          <div
            className={`h-full transition-all duration-1000 ${
              secondsLeft > 10 ? 'bg-cyan-500' : 'bg-rose-500'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Fare & Service Tier Callout */}
          <div className="flex items-center justify-between bg-cyan-50/60 p-3.5 rounded-2xl border border-cyan-100">
            <div>
              <p className="text-[10px] uppercase font-bold text-cyan-700 tracking-wider">Gross Upfront Payout</p>
              <p className="text-2xl font-black text-gray-950 font-mono">
                ₹{Number(incomingRequest.totalFare || 85).toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-full bg-cyan-600 text-white text-[10px] font-extrabold uppercase">
                {incomingRequest.car?.category || 'AUTO'}
              </span>
              <p className="text-[11px] text-gray-500 font-medium mt-1">
                Est. {incomingRequest.distanceKm || 3.5} km route
              </p>
            </div>
          </div>

          {/* Route Pickup & Dropoff */}
          <div className="space-y-2.5 bg-gray-50 p-3.5 rounded-2xl border border-gray-200 text-xs">
            <div className="flex items-start space-x-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mt-0.5 flex-shrink-0 ring-4 ring-emerald-500/20" />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-extrabold text-gray-400 block">Pickup Location</span>
                <p className="font-extrabold text-gray-900 truncate">{incomingRequest.pickupAddress || 'Customer Location'}</p>
                <p className="text-[11px] text-emerald-600 font-medium">~3 mins away from current position</p>
              </div>
            </div>

            <div className="border-t border-gray-200/60 pt-2 flex items-start space-x-2.5">
              <div className="w-3 h-3 rounded-full bg-rose-500 mt-0.5 flex-shrink-0 ring-4 ring-rose-500/20" />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-extrabold text-gray-400 block">Destination</span>
                <p className="font-extrabold text-gray-900 truncate">{incomingRequest.dropoffAddress || 'Dropoff Point'}</p>
              </div>
            </div>
          </div>

          {/* Passenger Information */}
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 font-black flex items-center justify-center text-xs shadow-xs">
                {incomingRequest.customer?.fullName ? incomingRequest.customer.fullName[0] : 'P'}
              </div>
              <div>
                <p className="font-extrabold text-gray-950">{incomingRequest.customer?.fullName || 'Priya Sharma'}</p>
                <p className="text-[11px] text-amber-500 font-bold">★ 4.95 (140+ completed trips)</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-gray-400">Payment: Cash/UPI</span>
          </div>

          {/* High-Impact Action Buttons */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <button
              type="button"
              data-testid="driver-popup-decline-btn"
              onClick={handleDecline}
              className="py-3 px-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all active:scale-95 text-center flex items-center justify-center space-x-1"
            >
              <X className="w-4 h-4 text-gray-500" />
              <span>Decline</span>
            </button>

            <button
              type="button"
              data-testid="driver-popup-accept-btn"
              onClick={handleAccept}
              className="col-span-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center space-x-2 active:scale-95 animate-pulse"
            >
              <Navigation className="w-4 h-4 fill-white" />
              <span>Accept Ride & Start Route</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingRideModal;
