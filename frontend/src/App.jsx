import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import BottomTaskbar from './components/BottomTaskbar';
import LoginPage from './pages/LoginPage';
import CustomerExplore from './pages/CustomerExplore';
import CustomerRides from './pages/CustomerRides';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RideBooking from './pages/RideBooking';
import AccountScreen from './components/account/AccountScreen';
import { Loader2, Car, Shield } from 'lucide-react';

const MainLayout = () => {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  // Automatically select role-appropriate default tab on role switch
  useEffect(() => {
    if (user?.role === 'ROLE_DRIVER') {
      if (!activeTab.startsWith('driver-')) {
        setActiveTab('driver-cockpit');
      }
    } else if (user?.role === 'ROLE_ADMIN') {
      if (!activeTab.startsWith('admin-')) {
        setActiveTab('admin-overview');
      }
    } else if (user?.role === 'ROLE_CUSTOMER') {
      if (activeTab.startsWith('driver-') || activeTab.startsWith('admin-')) {
        setActiveTab('home');
      }
    }
  }, [user?.role]);

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

  const isExploreMode = user?.role === 'ROLE_CUSTOMER' && (activeTab === 'home' || activeTab === 'rides' || activeTab === 'explore');

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
            {activeTab === 'account' ? (
              <AccountScreen
                onBack={() => setActiveTab('home')}
                onNavigateToTrips={() => setActiveTab('my-trips')}
              />
            ) : activeTab === 'my-trips' ? (
              <CustomerRides onSelectActiveTrip={() => setActiveTab('rides')} />
            ) : activeTab === 'arrival-sim' ? (
              <RideBooking onBackToExplore={() => setActiveTab('rides')} />
            ) : (
              <CustomerExplore
                initialStep={activeTab === 'rides' ? 'MAP_TIERS' : 'HOME'}
                onStepChange={(step) => {
                  if (step === 'MAP_TIERS' && activeTab !== 'rides') {
                    setActiveTab('rides');
                  } else if (step === 'HOME' && activeTab !== 'home') {
                    setActiveTab('home');
                  }
                }}
                onNavigateToTrips={() => setActiveTab('my-trips')}
                onNavigateToArrivalSim={() => setActiveTab('arrival-sim')}
                onNavigateToAccount={() => setActiveTab('account')}
              />
            )}
          </>
        )}

        {user?.role === 'ROLE_DRIVER' && (
          <DriverDashboard activeTab={activeTab} onSelectTab={(t) => setActiveTab(t)} />
        )}

        {user?.role === 'ROLE_ADMIN' && (
          <AdminDashboard activeTab={activeTab} onSelectTab={(t) => setActiveTab(t)} />
        )}
      </main>

      {/* Professional Commercial White Footer */}
      <footer className={`${isExploreMode ? 'hidden' : 'block'} border-t border-gray-200 bg-white py-5 text-xs text-gray-500 mb-16 sm:mb-0`}>
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

      {/* Mobile Persistent Taskbar (Native app feel for all roles) */}
      <BottomTaskbar
        currentTab={activeTab === 'explore' ? 'rides' : activeTab}
        onSelectTab={(tabId) => {
          setActiveTab(tabId);
        }}
      />
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
