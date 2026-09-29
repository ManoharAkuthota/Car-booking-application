import React, { useState, useEffect } from 'react';
import { driverApi, bookingApi } from '../api/client';
import MapView from '../components/MapView';
import { Power, Navigation, Phone, DollarSign, Star, Award, CheckCircle, Clock, ShieldAlert, KeyRound, Loader2, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

const DriverDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchDriverData = async () => {
    setLoading(true);
    try {
      const [statsRes, requestsRes, tripsRes] = await Promise.all([
        driverApi.getStats(),
        driverApi.getPendingRequests(),
        driverApi.getMyTrips(),
      ]);

      setStats(statsRes.data);
      setIsOnline(statsRes.data.isOnline);
      setPendingRequests(requestsRes.data);
      setMyTrips(tripsRes.data);

      // Check if driver has an ongoing assigned trip
      const ongoing = tripsRes.data.find(
        (t) => t.status === 'ACCEPTED' || t.status === 'DRIVER_ARRIVING' || t.status === 'IN_PROGRESS'
      );
      setActiveTrip(ongoing || null);
    } catch (err) {
      console.error("Failed to load driver data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverData();
    const interval = setInterval(fetchDriverData, 10000); // 10s auto-refresh for incoming rides
    return () => clearInterval(interval);
  }, []);

  const handleToggleOnline = async () => {
    const newState = !isOnline;
    setIsOnline(newState);
    try {
      await driverApi.updateStatus({ isOnline: newState });
    } catch (err) {
      console.error("Failed to toggle online status", err);
    }
  };

  const handleAcceptRequest = async (bookingId) => {
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const res = await driverApi.acceptTrip(bookingId);
      setActiveTrip(res.data);
      await fetchDriverData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not accept trip.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTripStatus = async (newStatus) => {
    if (!activeTrip) return;
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const res = await bookingApi.updateStatus(activeTrip.id, {
        status: newStatus,
        otp: newStatus === 'IN_PROGRESS' ? enteredOtp.trim() : null,
      });

      if (newStatus === 'COMPLETED') {
        try {
          confetti({ particleCount: 80, spread: 60 });
        } catch (e) {}
        setActiveTrip(null);
        setEnteredOtp('');
      } else {
        setActiveTrip(res.data);
      }
      await fetchDriverData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update trip status.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Driver Cockpit Telemetry Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
              alt="Driver"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500/40"
            />
            <span
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-slate-950 ${
                isOnline ? 'bg-brand-500 animate-pulse' : 'bg-slate-600'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">Rajesh Kumar</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 font-bold border border-brand-500/30 uppercase">
                {stats?.verificationStatus || 'APPROVED'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Assigned: <span className="text-white font-semibold">{stats?.vehicleAssigned || 'Tesla Model 3'}</span>
            </p>
            <p className="text-[11px] text-slate-500 font-mono">License: {stats?.licenseNumber}</p>
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="flex items-center space-x-4 text-xs w-full md:w-auto justify-between md:justify-end">
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-center min-w-[90px]">
            <p className="text-slate-400 text-[10px] uppercase font-semibold">Trips Done</p>
            <p className="text-base font-extrabold text-white font-mono">{stats?.totalTrips || 0}</p>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-center min-w-[90px]">
            <p className="text-slate-400 text-[10px] uppercase font-semibold">Rating</p>
            <p className="text-base font-extrabold text-amber-400 font-mono">★ {stats?.rating || 4.9}</p>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-center min-w-[110px]">
            <p className="text-slate-400 text-[10px] uppercase font-semibold">Total Earnings</p>
            <p className="text-base font-extrabold text-brand-400 font-mono">₹{stats?.totalEarnings || '0.00'}</p>
          </div>

          {/* Online/Offline Toggle Button */}
          <button
            onClick={handleToggleOnline}
            className={`px-4 py-3 rounded-2xl font-bold text-xs flex items-center space-x-2 transition-all shadow-lg ${
              isOnline
                ? 'bg-brand-500 text-slate-950 shadow-brand-500/20 hover:bg-brand-400'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isOnline ? 'Go Offline' : 'Go Online'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {errorMsg}
        </div>
      )}

      {/* ACTIVE TRIP EXECUTION COCKPIT (If driver is currently on a trip) */}
      {activeTrip && (
        <div className="rounded-3xl glass-panel border border-accent-cyan/40 p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <span className="w-3 h-3 rounded-full bg-accent-cyan animate-ping" />
              <div>
                <h3 className="text-lg font-black text-white">Active Assignment: {activeTrip.bookingCode}</h3>
                <p className="text-xs text-slate-400">Current Phase: <strong className="text-accent-cyan uppercase">{activeTrip.status.replace('_', ' ')}</strong></p>
              </div>
            </div>
            <span className="text-xl font-black text-brand-400 font-mono">₹{activeTrip.totalFare}</span>
          </div>

          {/* Map Preview */}
          <MapView
            pickup={[activeTrip.pickupLat || 12.9716, activeTrip.pickupLng || 77.5946]}
            dropoff={[activeTrip.dropoffLat || 13.0358, activeTrip.dropoffLng || 77.5970]}
            isLiveTrip={true}
            className="h-[220px]"
          />

          {/* Trip Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
              <p className="text-[10px] uppercase font-bold text-slate-400">Passenger</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-sm">{activeTrip.customer?.fullName}</p>
                  <p className="text-slate-400">{activeTrip.customer?.phone || '+91 98765 43210'}</p>
                </div>
                <a
                  href={`tel:${activeTrip.customer?.phone || '+919876543210'}`}
                  className="p-2.5 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan hover:text-slate-950 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400">Route</p>
              <p className="text-slate-200"><strong>Pickup:</strong> {activeTrip.pickupAddress}</p>
              <p className="text-slate-200"><strong>Drop:</strong> {activeTrip.dropoffAddress}</p>
              <p className="text-slate-400 font-mono text-[11px] pt-1">Distance: {activeTrip.distanceKm} km</p>
            </div>
          </div>

          {/* Step Execution Buttons */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            {activeTrip.status === 'ACCEPTED' && (
              <button
                onClick={() => handleUpdateTripStatus('DRIVER_ARRIVING')}
                disabled={actionLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-accent-cyan hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                <span>I Have Arrived at Pickup Location</span>
              </button>
            )}

            {activeTrip.status === 'DRIVER_ARRIVING' && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-amber-300 flex items-center space-x-1.5">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Enter Passenger 4-Digit Trip PIN to Start Ride:</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="Enter 4-digit OTP"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono tracking-widest text-center focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={() => handleUpdateTripStatus('IN_PROGRESS')}
                    disabled={actionLoading || !enteredOtp.trim()}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center space-x-1"
                  >
                    {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Start Trip</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">Ask the rider for their 4-digit code shown on their screen.</p>
              </div>
            )}

            {activeTrip.status === 'IN_PROGRESS' && (
              <button
                onClick={() => handleUpdateTripStatus('COMPLETED')}
                disabled={actionLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center space-x-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                <span>Reached Destination — Complete Ride & Collect ₹{activeTrip.totalFare}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* INCOMING RIDE REQUESTS RADAR */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-brand-500 animate-ping" />
            <h3 className="text-base font-bold text-white">
              Live Incoming Ride Radar ({pendingRequests.length} available)
            </h3>
          </div>
          <button
            onClick={fetchDriverData}
            className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-3xl border border-slate-800 space-y-2">
            <Navigation className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-xs font-semibold">No pending ride requests in your area right now.</p>
            <p className="text-slate-500 text-[11px]">Keep your status online — new requests will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="glass-card rounded-2xl border border-slate-800 p-5 hover:border-brand-500/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-brand-400">{req.bookingCode}</span>
                  <span className="text-lg font-black text-white font-mono">₹{req.totalFare}</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="text-slate-300 truncate">
                    <span className="text-slate-500">From: </span>{req.pickupAddress}
                  </p>
                  <p className="text-slate-300 truncate">
                    <span className="text-slate-500">To: </span>{req.dropoffAddress}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Est. Distance: {req.distanceKm} km • Passenger: {req.customer?.fullName}
                  </p>
                </div>

                <button
                  onClick={() => handleAcceptRequest(req.id)}
                  disabled={actionLoading || !!activeTrip}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                    activeTrip
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-slate-950 shadow-md shadow-brand-500/20'
                  }`}
                >
                  {activeTrip ? 'Finish current trip first' : 'Accept Ride & Start Route'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DRIVER TRIP HISTORY */}
      <div>
        <h3 className="text-base font-bold text-white mb-4">Completed Trips & Payout Ledger</h3>
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Vehicle</th>
                <th className="px-5 py-3">Route</th>
                <th className="px-5 py-3">Distance</th>
                <th className="px-5 py-3">Payout</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {myTrips.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">
                    No trips recorded yet.
                  </td>
                </tr>
              ) : (
                myTrips.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-white">{t.bookingCode}</td>
                    <td className="px-5 py-3.5">{t.car?.make} {t.car?.model}</td>
                    <td className="px-5 py-3.5 max-w-[200px] truncate text-slate-400">{t.pickupAddress} → {t.dropoffAddress}</td>
                    <td className="px-5 py-3.5 font-mono">{t.distanceKm} km</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-brand-400">₹{t.totalFare}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        t.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
