import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User, Mail, Phone, Shield, CreditCard, Wallet, MapPin, Settings,
  LogOut, ChevronRight, Star, Award, HelpCircle, FileText, CheckCircle2,
  ArrowLeft, Car, Bell, ChevronDown, Smartphone, ShieldCheck, Heart,
  AlertTriangle
} from 'lucide-react';

const AccountScreen = ({ onBack, onNavigateToTrips }) => {
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [walletBalance, setWalletBalance] = useState(450.00);
  const [pinSecurityEnabled, setPinSecurityEnabled] = useState(true);
  const [notificationToast, setNotificationToast] = useState(null);

  const showToast = (msg) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 2500);
  };

  const handleAddMoney = () => {
    setWalletBalance((prev) => prev + 500);
    showToast("₹500 added to DrivePulse Wallet via UPI!");
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] pb-24 bg-slate-50 text-gray-900">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[3000] bg-gray-950 text-white px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center space-x-2 border border-gray-800 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{notificationToast}</span>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pt-4 sm:pt-6 space-y-4">
        
        {/* 1. TOP HEADER WITH BACK BUTTON */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 rounded-2xl bg-white border border-gray-200 text-gray-800 flex items-center justify-center shadow-xs hover:bg-gray-100 active:scale-95 transition-all"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-gray-950 tracking-tight">
                Account & Profile
              </h1>
              <p className="text-[11px] text-gray-500 font-semibold">
                Manage your credentials, payments & safety
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-xs font-black">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>4.95 Rating</span>
          </div>
        </div>

        {/* 2. PROFILE CARD */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="relative flex-shrink-0">
            <img
              src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt={user?.fullName || "User"}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-400 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-black">
              ✓
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-black text-gray-950 truncate">
                {user?.fullName || "DrivePulse Rider"}
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-black uppercase tracking-wider">
                Verified
              </span>
            </div>

            <p className="text-xs text-gray-500 font-medium truncate mt-0.5 flex items-center space-x-1">
              <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span>{user?.email || "rider@drivepulse.com"}</span>
            </p>

            <p className="text-xs text-gray-500 font-medium truncate mt-0.5 flex items-center space-x-1">
              <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span>+91 98450 12345</span>
            </p>
          </div>
        </div>

        {/* 3. DRIVEPULSE WALLET CARD */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-4 sm:p-5 text-white shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-gray-300 font-semibold uppercase tracking-wider">
                  DrivePulse Cash & Wallet
                </p>
                <p className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">
                  ₹{walletBalance.toFixed(2)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddMoney}
              className="px-3.5 py-2 rounded-xl bg-[#FFCC00] hover:bg-[#FFD633] text-gray-950 font-black text-xs shadow-md active:scale-95 transition-all"
            >
              + Add ₹500
            </button>
          </div>

          <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-xs text-gray-300">
            <span className="flex items-center space-x-1">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              <span>Default: UPI / Cash on Trip</span>
            </span>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
              25% OFF APPLIED
            </span>
          </div>
        </div>

        {/* 4. SAFETY & SOS HUB */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider">
                Safety & Security Hub
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Active Protection
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div
              onClick={() => showToast("24/7 Emergency response team connected")}
              className="p-3 rounded-2xl bg-rose-50/80 border border-rose-200 hover:bg-rose-100/80 cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  SOS
                </div>
                <div>
                  <h4 className="text-xs font-black text-rose-950">24/7 SOS Button</h4>
                  <p className="text-[10px] text-rose-700 font-medium">Instant police & ambulance alert</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-400 flex-shrink-0" />
            </div>

            <div
              onClick={() => {
                setPinSecurityEnabled(!pinSecurityEnabled);
                showToast(`Ride PIN verification ${!pinSecurityEnabled ? 'Enabled' : 'Disabled'}`);
              }}
              className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 hover:bg-amber-100/80 cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs">
                  PIN
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-950">Start PIN Security</h4>
                  <p className="text-[10px] text-amber-800 font-medium">
                    {pinSecurityEnabled ? 'Always required before ride' : 'Disabled'}
                  </p>
                </div>
              </div>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${
                pinSecurityEnabled ? 'bg-amber-500 text-slate-950' : 'bg-gray-200 text-gray-500'
              }`}>
                {pinSecurityEnabled ? '✓' : '×'}
              </span>
            </div>
          </div>
        </div>

        {/* 5. SAVED ADDRESSES */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider">
            Saved Places
          </h3>

          <div className="divide-y divide-gray-100">
            <div
              onClick={() => showToast("Home address set: Indiranagar 100ft Rd")}
              className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-gray-50 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
                  🏠
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900">Home</h4>
                  <p className="text-[10px] text-gray-500">Indiranagar 100ft Rd, Bengaluru</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            <div
              onClick={() => showToast("Work address set: Whitefield ITPL Tech Park")}
              className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-gray-50 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
                  🏢
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900">Work / Office</h4>
                  <p className="text-[10px] text-gray-500">ITPL Tech Park, Whitefield, Bengaluru</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* 6. APP PREFERENCES & SUPPORT */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-sm space-y-2">
          <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider mb-2">
            Support & Preferences
          </h3>

          <div
            onClick={() => {
              if (onNavigateToTrips) onNavigateToTrips();
            }}
            className="p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-gray-800">Your Ride Receipts & Invoices</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          <div
            onClick={() => showToast("DrivePulse Support Hotline: 1800-420-9999 (24/7 Toll-Free)")}
            className="p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center space-x-3">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-gray-800">Help & Customer Support</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          <div
            onClick={() => showToast("DrivePulse App Version: v2.4.0 (Latest Release)")}
            className="p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Smartphone className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-gray-800">App Version & Legal Info</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">v2.4.0</span>
          </div>
        </div>

        {/* 7. SIGN OUT BUTTON */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-sm border border-rose-200 shadow-xs flex items-center justify-center space-x-2 transition-all active:scale-98"
          >
            <LogOut className="w-4 h-4 stroke-[2.5]" />
            <span>Sign Out from DrivePulse</span>
          </button>
        </div>

      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[4000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-gray-200 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-base font-black text-gray-950">
                Sign Out of DrivePulse?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                You will need to sign in again to book rides and track live captains.
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs active:scale-95 transition-all"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={logout}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md active:scale-95 transition-all"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountScreen;
