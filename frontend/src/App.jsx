import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import CustomerExplore from './pages/CustomerExplore';
import CustomerRides from './pages/CustomerRides';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Loader2, Car, Shield, Database, Cpu } from 'lucide-react';

const MainLayout = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('explore');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
          <Car className="w-7 h-7 animate-bounce stroke-[2.5]" />
        </div>
        <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
          <span>Connecting to DrivePulse Secure Mobility Network...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-slate-950">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Render view according to user role and selected navigation */}
        {user?.role === 'ROLE_CUSTOMER' && (
          <>
            {activeTab === 'my-trips' ? (
              <CustomerRides onSelectActiveTrip={() => setActiveTab('explore')} />
            ) : (
              <CustomerExplore />
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

      {/* Professional Commercial Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white text-sm tracking-tight">Drive<span className="text-brand-500">Pulse</span></span>
            <span>• On-Demand Multi-Modal Mobility Platform</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <span className="flex items-center text-emerald-400 font-medium">
              <Shield className="w-3.5 h-3.5 mr-1" /> Commercial Ride Insurance
            </span>
            <span>•</span>
            <span className="flex items-center text-brand-400 font-medium">
              <Car className="w-3.5 h-3.5 mr-1" /> Verified Drivers
            </span>
            <span>•</span>
            <span>24/7 Safety & SOS Response</span>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
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
