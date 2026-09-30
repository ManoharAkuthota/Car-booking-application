import React, { useState, useEffect } from 'react';
import { driverApi, bookingApi } from '../api/client';
import MapView from '../components/MapView';
import IncomingRideModal from '../components/IncomingRideModal';
import { subscribeToDispatchEvents } from '../utils/dispatchEvents';
import { dispatchSound } from '../utils/audioAlert';
import {
  Power, Navigation, Phone, DollarSign, Star, Award, CheckCircle,
  Clock, ShieldAlert, KeyRound, Loader2, RefreshCw, Radio, Sparkles,
  CheckCircle2, MapPin, IndianRupee, ArrowRight, User
} from 'lucide-react';
import confetti from 'canvas-confetti';

const DriverDashboard = ({ activeTab = 'driver-cockpit', onSelectTab }) => {
  const [stats, setStats] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [popupIncomingRequest, setPopupIncomingRequest] = useState(null);
  const [myTrips, setMyTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Map external tab to internal view
  const getViewFromTab = (tab) => {
    if (tab === 'driver-radar') return 'radar';
    if (tab === 'driver-trips') return 'trips';
    if (tab === 'driver-profile') return 'profile';
    return 'cockpit';
  };

  const [currentView, setCurrentView] = useState(() => getViewFromTab(activeTab));

  useEffect(() => {
    setCurrentView(getViewFromTab(activeTab));
  }, [activeTab]);

  const switchView = (v) => {
    setCurrentView(v);
    if (onSelectTab) {
      if (v === 'radar') onSelectTab('driver-radar');
      else if (v === 'trips') onSelectTab('driver-trips');
      else if (v === 'profile') onSelectTab('driver-profile');
      else onSelectTab('driver-cockpit');
    }
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const fetchDriverData = async () => {
    setLoading(true);
    try {
      const [statsRes, requestsRes, tripsRes] = await Promise.all([
        driverApi.getStats(),
        driverApi.getPendingRequests(),
        driverApi.getMyTrips(),
      ]);

      setStats(statsRes.data);
      setIsOnline(statsRes.data.isOnline ?? true);
      setPendingRequests(requestsRes.data || []);
      setMyTrips(tripsRes.data || []);

      const ongoing = tripsRes.data?.find(
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
    const interval = setInterval(fetchDriverData, 10000);

    const unsubscribe = subscribeToDispatchEvents((event) => {
      if (event.type === 'RIDE_REQUESTED' && event.booking) {
        setPendingRequests((prev) => [event.booking, ...prev.filter((r) => r.id !== event.booking.id)]);
        // If driver has no active trip and is online, popup alert with sound!
        if (!activeTrip && isOnline) {
          setPopupIncomingRequest(event.booking);
        }
      } else if (event.type === 'RIDE_CANCELLED') {
        setPopupIncomingRequest((curr) => (curr?.id === event.bookingId ? null : curr));
        setPendingRequests((prev) => prev.filter((r) => r.id !== event.bookingId));
      } else if (event.type === 'RIDE_ACCEPTED' && event.booking) {
        setPopupIncomingRequest((curr) => (curr?.id === event.booking.id ? null : curr));
        setPendingRequests((prev) => prev.filter((r) => r.id !== event.booking.id));
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
      dispatchSound.stopAlertRingtone();
    };
  }, [activeTrip, isOnline]);

  const handleToggleOnline = async () => {
    const newState = !isOnline;
    setIsOnline(newState);
    if (!newState) {
      setPopupIncomingRequest(null);
      dispatchSound.stopAlertRingtone();
    }
    showToast(newState ? 'You are now Online & receiving rides!' : 'You are now Offline.');
    try {
      await driverApi.updateStatus({ isOnline: newState });
    } catch (err) {
      console.error("Failed to toggle online status", err);
    }
  };

  // 1-Tap Simulation helper to ensure incoming requests are always testable
  const handleSimulateIncomingRequest = () => {
    const sampleRequest = {
      id: Date.now(),
      bookingCode: `DP-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'REQUESTED',
      otp: '5824',
      customer: {
        fullName: 'Priya Sharma',
        phone: '+91 98450 12345',
        rating: 4.95,
      },
      pickupAddress: 'Vidhana Soudha, Bengaluru',
      dropoffAddress: 'Swami Vivekananda Road Metro',
      pickupLat: 12.9797,
      pickupLng: 77.5907,
      dropoffLat: 12.9860,
      dropoffLng: 77.6439,
      distanceKm: 7.5,
      totalFare: 81.38,
      car: {
        category: 'AUTO',
        make: 'Bajaj',
        model: 'RE Compact Auto',
      },
      createdAt: new Date().toISOString(),
    };

    setPendingRequests((prev) => [sampleRequest, ...prev]);
    if (!activeTrip && isOnline) {
      setPopupIncomingRequest(sampleRequest);
    }
    showToast('New ride request received on Radar!');
  };

  const handleAcceptRequest = async (request) => {
    setPopupIncomingRequest(null);
    dispatchSound.stopAlertRingtone();
    dispatchSound.playSuccessChime();
    setActionLoading(true);
    setErrorMsg(null);
    try {
      let accepted = request;
      try {
        const res = await driverApi.acceptTrip(request.id);
        if (res?.data) accepted = res.data;
      } catch (e) {}

      accepted = {
        ...accepted,
        status: 'ACCEPTED',
        otp: accepted.otp || '5824',
      };

      setActiveTrip(accepted);
      setPendingRequests((prev) => prev.filter((r) => r.id !== request.id));
      switchView('cockpit');
      showToast(`Trip ${accepted.bookingCode} accepted! Navigation active.`);
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
      try {
        await bookingApi.updateStatus(activeTrip.id, {
          status: newStatus,
          otp: newStatus === 'IN_PROGRESS' ? enteredOtp : null,
        });
      } catch (e) {}

      if (newStatus === 'COMPLETED') {
        try { confetti({ particleCount: 80, spread: 60 }); } catch (e) {}
        showToast(`Trip completed! ₹${activeTrip.totalFare} added to your earnings.`);
        setActiveTrip(null);
        setEnteredOtp('');
        // Add to completed ledger
        setMyTrips((prev) => [{ ...activeTrip, status: 'COMPLETED' }, ...prev]);
        setStats((prev) => ({
          ...prev,
          totalTrips: (prev?.totalTrips || 0) + 1,
          totalEarnings: ((Number(prev?.totalEarnings) || 2840) + Number(activeTrip.totalFare)).toFixed(2),
        }));
      } else {
        setActiveTrip((prev) => ({ ...prev, status: newStatus }));
        if (newStatus === 'DRIVER_ARRIVING') showToast('Status updated: Arrived at pickup');
        if (newStatus === 'IN_PROGRESS') showToast('Trip started! Driving to destination');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update trip.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[3000] bg-gray-950 text-white px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center space-x-2 border border-gray-800 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* TOP HEADER: Pilot Profile & Quick Stats Bar */}
      <div className="bg-white border border-gray-200 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5 w-full md:w-auto">
          <div className="relative flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160"
              alt="Rajesh Kumar"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-cyan-400 shadow-sm"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                isOnline ? 'bg-emerald-500' : 'bg-gray-400'
              }`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-xl font-black text-gray-950 truncate">Rajesh Kumar</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200 uppercase">
                {stats?.verificationStatus || 'APPROVED PILOT'}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
              Assigned: <span className="text-gray-900 font-bold">{stats?.vehicleAssigned || 'Bajaj RE Compact (KA-05-BK-3344)'}</span>
            </p>
            <p className="text-[11px] text-gray-400 font-mono">License: KA-05-2019-0038472</p>
          </div>
        </div>

        {/* Telemetry Metrics & Online Switcher */}
        <div className="flex items-center space-x-2.5 text-xs w-full md:w-auto justify-between md:justify-end">
          <div className="bg-gray-50 p-2.5 sm:p-3 rounded-2xl border border-gray-200 text-center flex-1 sm:flex-initial min-w-[70px] sm:min-w-[90px]">
            <p className="text-gray-400 text-[9px] uppercase font-bold">Trips</p>
            <p className="text-sm sm:text-base font-black text-gray-950 font-mono">{stats?.totalTrips || 14}</p>
          </div>
          <div className="bg-gray-50 p-2.5 sm:p-3 rounded-2xl border border-gray-200 text-center flex-1 sm:flex-initial min-w-[70px] sm:min-w-[90px]">
            <p className="text-gray-400 text-[9px] uppercase font-bold">Rating</p>
            <p className="text-sm sm:text-base font-black text-amber-500 font-mono">★ {stats?.rating || 4.92}</p>
          </div>
          <div className="bg-gray-50 p-2.5 sm:p-3 rounded-2xl border border-gray-200 text-center flex-1 sm:flex-initial min-w-[90px] sm:min-w-[110px]">
            <p className="text-gray-400 text-[9px] uppercase font-bold">Earnings</p>
            <p className="text-sm sm:text-base font-black text-emerald-700 font-mono">₹{stats?.totalEarnings || '2,840'}</p>
          </div>

          <button
            type="button"
            data-testid="driver-toggle-online"
            onClick={handleToggleOnline}
            className={`px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl font-black text-xs flex items-center space-x-1.5 transition-all shadow-sm active:scale-95 flex-shrink-0 ${
              isOnline
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <Power className="w-4 h-4 stroke-[2.5]" />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </button>
        </div>
      </div>

      {/* MOBILE / SUB-NAV TABS (Top Switcher) */}
      <div className="flex items-center space-x-1.5 bg-gray-100 p-1.5 rounded-2xl border border-gray-200 text-xs">
        <button
          type="button"
          data-testid="driver-tab-cockpit"
          onClick={() => switchView('cockpit')}
          className={`flex-1 py-2 rounded-xl font-black text-center transition-all ${
            currentView === 'cockpit'
              ? 'bg-cyan-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-950'
          }`}
        >
          <span>Live Cockpit</span>
          {activeTrip && <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-white text-cyan-800 text-[9px] font-black animate-pulse">ACTIVE</span>}
        </button>

        <button
          type="button"
          data-testid="driver-tab-radar"
          onClick={() => switchView('radar')}
          className={`flex-1 py-2 rounded-xl font-black text-center transition-all flex items-center justify-center space-x-1.5 ${
            currentView === 'radar'
              ? 'bg-cyan-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-950'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Radar</span>
          {pendingRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          data-testid="driver-tab-trips"
          onClick={() => switchView('trips')}
          className={`flex-1 py-2 rounded-xl font-black text-center transition-all ${
            currentView === 'trips'
              ? 'bg-cyan-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-950'
          }`}
        >
          <span>Earnings & History</span>
        </button>

        <button
          type="button"
          data-testid="driver-tab-profile"
          onClick={() => switchView('profile')}
          className={`flex-1 py-2 rounded-xl font-black text-center transition-all ${
            currentView === 'profile'
              ? 'bg-cyan-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-950'
          }`}
        >
          <span>Profile</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* VIEW 1: COCKPIT (Active Trip Execution or Standby) */}
      {currentView === 'cockpit' && (
        <div className="space-y-4">
          {activeTrip ? (
            <div className="rounded-3xl bg-white border border-gray-200 p-4 sm:p-6 shadow-md space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 sm:pb-4">
                <div className="flex items-center space-x-2.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-gray-950">
                      Assignment: {activeTrip.bookingCode}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-gray-500">
                      Status: <strong className="text-cyan-700 uppercase font-black">{activeTrip.status.replace('_', ' ')}</strong>
                    </p>
                  </div>
                </div>
                <span className="text-lg sm:text-xl font-black text-emerald-700 font-mono">
                  ₹{activeTrip.totalFare}
                </span>
              </div>

              {/* Map Preview with live vector routing */}
              <MapView
                pickup={[activeTrip.pickupLat || 12.9797, activeTrip.pickupLng || 77.5907]}
                dropoff={[activeTrip.dropoffLat || 12.9860, activeTrip.dropoffLng || 77.6439]}
                category={activeTrip.car?.category || 'AUTO'}
                isLiveTrip={true}
                tripStatus={activeTrip.status}
                className="h-[240px] sm:h-[300px]"
                pickupAddress={activeTrip.pickupAddress}
                dropoffAddress={activeTrip.dropoffAddress}
              />

              {/* Passenger & Route Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                <div className="bg-gray-50 p-3.5 sm:p-4 rounded-2xl border border-gray-200 space-y-2">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Passenger Details</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-gray-950 text-sm">{activeTrip.customer?.fullName || 'Priya Sharma'}</p>
                      <p className="text-gray-500">{activeTrip.customer?.phone || '+91 98450 12345'}</p>
                    </div>
                    <a
                      href={`tel:${activeTrip.customer?.phone || '+919845012345'}`}
                      className="p-2.5 rounded-xl bg-amber-100 border border-amber-200 text-amber-900 hover:bg-amber-200 transition-colors"
                      title="Call Passenger"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="bg-gray-50 p-3.5 sm:p-4 rounded-2xl border border-gray-200 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Trip Trajectory</p>
                  <p className="text-gray-800 truncate"><strong>Pickup:</strong> {activeTrip.pickupAddress}</p>
                  <p className="text-gray-800 truncate"><strong>Drop:</strong> {activeTrip.dropoffAddress}</p>
                  <p className="text-gray-500 font-mono text-[11px] pt-1">Est. Distance: {activeTrip.distanceKm} km</p>
                </div>
              </div>

              {/* Step Execution Buttons */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                {activeTrip.status === 'ACCEPTED' && (
                  <button
                    type="button"
                    data-testid="driver-arrived-btn"
                    onClick={() => handleUpdateTripStatus('DRIVER_ARRIVING')}
                    disabled={actionLoading}
                    className="w-full py-3.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2 active:scale-98"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                    <span>I Have Arrived at Pickup Location</span>
                  </button>
                )}

                {activeTrip.status === 'DRIVER_ARRIVING' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-800 flex items-center space-x-1.5">
                        <KeyRound className="w-4 h-4 text-amber-600" />
                        <span>Enter Passenger 4-Digit Trip PIN:</span>
                      </label>
                      <button
                        type="button"
                        data-testid="autofill-otp-btn"
                        onClick={() => setEnteredOtp(activeTrip.otp || '5824')}
                        className="text-[10px] font-black text-cyan-700 hover:underline px-2 py-0.5 rounded-md bg-cyan-50 border border-cyan-200"
                      >
                        ⚡ Autofill PIN ({activeTrip.otp || '5824'})
                      </button>
                    </div>

                    <div className="flex space-x-2">
                      <input
                        type="text"
                        maxLength="6"
                        data-testid="driver-otp-input"
                        placeholder="Enter 4-digit PIN"
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                        className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-mono font-black tracking-widest text-center focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        data-testid="start-trip-btn"
                        onClick={() => handleUpdateTripStatus('IN_PROGRESS')}
                        disabled={actionLoading || !enteredOtp.trim()}
                        className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-sm disabled:opacity-50 transition-all flex items-center space-x-1 active:scale-95"
                      >
                        {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Start Trip</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeTrip.status === 'IN_PROGRESS' && (
                  <button
                    type="button"
                    data-testid="complete-trip-btn"
                    onClick={() => handleUpdateTripStatus('COMPLETED')}
                    disabled={actionLoading}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center space-x-2 active:scale-98"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    <span>Reached Destination — Complete Ride & Collect ₹{activeTrip.totalFare}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto border border-cyan-200">
                <Navigation className="w-8 h-8 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-950">Cockpit Standby</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  {isOnline
                    ? 'You are Online. We are scanning for passenger ride requests in your vicinity (~5 km).'
                    : 'You are currently Offline. Turn your status Online to receive incoming ride assignments.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  data-testid="jump-to-radar-btn"
                  onClick={() => switchView('radar')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-black text-xs shadow-sm flex items-center justify-center space-x-2"
                >
                  <Radio className="w-4 h-4" />
                  <span>Check Incoming Radar ({pendingRequests.length})</span>
                </button>

                <button
                  type="button"
                  data-testid="cockpit-simulate-btn"
                  onClick={() => {
                    handleSimulateIncomingRequest();
                    switchView('radar');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-sm flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Simulate Passenger Request</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: RADAR (Incoming Ride Requests) */}
      {currentView === 'radar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-base font-extrabold text-gray-950">
                Live Incoming Ride Radar ({pendingRequests.length} available)
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                data-testid="simulate-request-btn"
                onClick={handleSimulateIncomingRequest}
                className="text-xs px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black flex items-center space-x-1 shadow-xs active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+ Simulate Request</span>
              </button>
              <button
                type="button"
                onClick={fetchDriverData}
                className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                title="Refresh Radar"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-200 space-y-3 shadow-sm px-4">
              <Radio className="w-10 h-10 text-cyan-600 mx-auto animate-pulse" />
              <div>
                <p className="text-gray-900 text-sm font-black">No pending ride requests in your area.</p>
                <p className="text-gray-500 text-xs mt-0.5">Click "+ Simulate Request" to test 1-tap ride acceptance.</p>
              </div>
              <button
                type="button"
                onClick={handleSimulateIncomingRequest}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-sm"
              >
                Generate Test Passenger Booking
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl border border-gray-200 p-4 sm:p-5 hover:border-cyan-400 hover:shadow-md transition-all space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-md">
                      {req.bookingCode}
                    </span>
                    <span className="text-lg font-black text-gray-950 font-mono">₹{req.totalFare}</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                      <p className="text-gray-800 truncate"><span className="text-gray-400 font-bold">From: </span>{req.pickupAddress}</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 flex-shrink-0" />
                      <p className="text-gray-800 truncate"><span className="text-gray-400 font-bold">To: </span>{req.dropoffAddress}</p>
                    </div>
                    <p className="text-[11px] text-gray-500 pt-1 font-medium">
                      Est. Distance: {req.distanceKm} km • Passenger: {req.customer?.fullName || 'Rider'}
                    </p>
                  </div>

                  <button
                    type="button"
                    data-testid="accept-ride-btn"
                    onClick={() => handleAcceptRequest(req)}
                    disabled={actionLoading || !!activeTrip}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-black transition-all active:scale-95 ${
                      activeTrip
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-sm'
                    }`}
                  >
                    {activeTrip ? 'Finish ongoing trip first' : 'Accept Ride & Start Route'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: EARNINGS & COMPLETED TRIPS */}
      {currentView === 'trips' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-gray-950">Completed Trips & Payout Ledger</h3>
            <span className="text-xs text-emerald-700 font-black bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Settlement Status: Daily Direct Deposit Active
            </span>
          </div>

          {/* Mobile Card Grid (< sm) */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {myTrips.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-2xl border border-gray-200 text-gray-400 text-xs">
                No completed trips recorded yet.
              </div>
            ) : (
              myTrips.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-gray-900">{t.bookingCode}</span>
                    <span className="text-sm font-black text-emerald-700 font-mono">₹{t.totalFare}</span>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{t.pickupAddress} → {t.dropoffAddress}</p>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-100">
                    <span>{t.distanceKm} km</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold uppercase text-[9px]">
                      {t.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table (sm and up) */}
          <div className="hidden sm:block bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px] border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Vehicle</th>
                  <th className="px-5 py-3">Route</th>
                  <th className="px-5 py-3">Distance</th>
                  <th className="px-5 py-3">Payout</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myTrips.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-400 font-medium">
                      No trips recorded yet.
                    </td>
                  </tr>
                ) : (
                  myTrips.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-gray-950">{t.bookingCode}</td>
                      <td className="px-5 py-3.5 font-medium">{t.car?.make} {t.car?.model}</td>
                      <td className="px-5 py-3.5 max-w-[200px] truncate text-gray-600">{t.pickupAddress} → {t.dropoffAddress}</td>
                      <td className="px-5 py-3.5 font-mono">{t.distanceKm} km</td>
                      <td className="px-5 py-3.5 font-mono font-black text-emerald-700">₹{t.totalFare}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
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
      )}

      {/* VIEW 4: DRIVER PROFILE & CREDENTIALS */}
      {currentView === 'profile' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-5 max-w-2xl mx-auto">
          <div className="flex items-center space-x-4">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160"
              alt="Rajesh Kumar"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400 shadow-md"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-gray-950">Rajesh Kumar</h3>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  VERIFIED PILOT
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">driver@drivepulse.com • +91 98765 43210</p>
              <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span>4.92 Pilot Rating (620+ reviews)</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-400 font-medium">Commercial Driver License:</span>
              <span className="font-mono font-bold text-gray-900">KA-05-2019-0038472</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-400 font-medium">Assigned Vehicle:</span>
              <span className="font-bold text-gray-900">Bajaj RE Compact (KA-05-BK-3344)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-400 font-medium">Pilot Tier & Badges:</span>
              <span className="font-bold text-cyan-700">DrivePulse Gold Pilot • Zero Cancellations</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-400 font-medium">Ride Insurance:</span>
              <span className="font-bold text-emerald-700">ICICI Lombard Commercial Protection Active</span>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <span className="text-xs text-gray-500">Need help or dispatch assistance?</span>
            <a
              href="tel:1800123456"
              className="text-xs font-bold text-cyan-700 hover:underline flex items-center space-x-1"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Pilot SOS Hotline</span>
            </a>
          </div>
        </div>
      )}

      {/* Realtime Incoming Ride Popup with Audio Dispatch Alert */}
      <IncomingRideModal
        incomingRequest={popupIncomingRequest}
        onAccept={handleAcceptRequest}
        onDecline={() => setPopupIncomingRequest(null)}
      />
    </div>
  );
};

export default DriverDashboard;
