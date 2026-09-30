import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import CustomerExplore from './pages/CustomerExplore';
import CustomerRides from './pages/CustomerRides';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RideBooking from './pages/RideBooking';
import { Loader2, Car, Shield } from 'lucide-react';

const MainLayout = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('explore');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-600 shadow-md">
          <Car className="w-7 h-7 animate-bounce stroke-[2.5]" />
        </div>
        <div className="flex items-center space-x-2 text-gray-500 text-xs font-semibold">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
          <span>Connecting to DrivePulse Secure Mobility Network...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, render Login Page
  if (!user) {
    return <LoginPage />;
  }

  const isExploreMode = user?.role === 'ROLE_CUSTOMER' && activeTab === 'explore';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-brand-500 selection:text-slate-950">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className={`flex-1 w-full mx-auto ${
        isExploreMode
          ? 'p-0 w-full overflow-hidden'
          : activeTab === 'arrival-sim'
            ? 'p-0 sm:py-4 max-w-7xl px-2 sm:px-6'
            : 'max-w-7xl px-4 sm:px-6 lg:px-8 py-8'
      }`}>
        {/* Render view strictly according to user role and selected navigation */}
        {user?.role === 'ROLE_CUSTOMER' && (
          <>
            {activeTab === 'my-trips' ? (
              <CustomerRides onSelectActiveTrip={() => setActiveTab('explore')} />
            ) : activeTab === 'arrival-sim' ? (
              <RideBooking onBackToExplore={() => setActiveTab('explore')} />
            ) : (
              <CustomerExplore
                onNavigateToTrips={() => setActiveTab('my-trips')}
                onNavigateToArrivalSim={() => setActiveTab('arrival-sim')}
              />
            )}
          </>
        )}

        {user?.role === 'ROLE_DRIVER' && (
          <DriverDashboard />
        )}

        {user?.role === 'ROLE_ADMIN' && (
          <AdminDashboard />
        )}
      </main>

      {/* Professional Commercial White Footer */}
      <footer className={`${isExploreMode ? 'hidden' : 'block'} border-t border-gray-200 bg-white py-5 text-xs text-gray-500`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-gray-900 text-sm tracking-tight">Drive<span className="text-brand-600">Pulse</span></span>
            <span>• On-Demand Multi-Modal Mobility Platform</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-gray-600 font-medium">
            <span className="flex items-center text-emerald-600 font-bold">
              <Shield className="w-3.5 h-3.5 mr-1" /> Commercial Ride Insurance
            </span>
            <span>•</span>
            <span className="flex items-center text-brand-600 font-bold">
              <Car className="w-3.5 h-3.5 mr-1" /> Verified Drivers & Pilots
            </span>
            <span>•</span>
            <span>24/7 Safety & SOS Response</span>
          </div>

          <div className="text-[11px] text-gray-400 font-medium">
            © 2026 DrivePulse Mobility Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
