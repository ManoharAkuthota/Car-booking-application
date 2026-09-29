import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Car, Shield, User, Navigation, LogOut, Sparkles } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout, quickSwitchRole } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('explore')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-cyan flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Car className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Drive<span className="text-brand-500">Pulse</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                Enterprise
              </span>
            </div>
          </div>

          {/* Navigation Links based on role */}
          <nav className="hidden md:flex items-center space-x-1">
            {user?.role === 'ROLE_CUSTOMER' && (
              <>
                <button
                  onClick={() => setActiveTab('explore')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'explore'
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Book Rides & Cargo
                </button>
                <button
                  onClick={() => setActiveTab('my-trips')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'my-trips'
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  My Rides
                </button>
              </>
            )}

            {user?.role === 'ROLE_DRIVER' && (
              <>
                <button
                  onClick={() => setActiveTab('driver-cockpit')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'driver-cockpit'
                      ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Driver Cockpit
                </button>
                <button
                  onClick={() => setActiveTab('driver-trips')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'driver-trips'
                      ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Trip History & Earnings
                </button>
              </>
            )}

            {user?.role === 'ROLE_ADMIN' && (
              <>
                <button
                  onClick={() => setActiveTab('admin-stats')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'admin-stats'
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Command Center
                </button>
                <button
                  onClick={() => setActiveTab('admin-fleet')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'admin-fleet'
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Fleet Management
                </button>
                <button
                  onClick={() => setActiveTab('admin-trips')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'admin-trips'
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  All Trips Monitor
                </button>
              </>
            )}
          </nav>

          {/* Quick Demo Role Switcher + User Profile */}
          <div className="flex items-center space-x-2">
            {/* Commercial Portal Switcher */}
            <div className="flex items-center bg-slate-900/90 p-0.5 sm:p-1 rounded-xl border border-slate-800 text-[11px] sm:text-xs">
              <span className="hidden md:inline-flex px-2 text-slate-500 font-semibold items-center">
                Portal:
              </span>
              <button
                onClick={() => {
                  quickSwitchRole('ROLE_CUSTOMER');
                  setActiveTab('explore');
                }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  user?.role === 'ROLE_CUSTOMER'
                    ? 'bg-brand-500 text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Rider
              </button>
              <button
                onClick={() => {
                  quickSwitchRole('ROLE_DRIVER');
                  setActiveTab('driver-cockpit');
                }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  user?.role === 'ROLE_DRIVER'
                    ? 'bg-accent-cyan text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Driver
              </button>
              <button
                onClick={() => {
                  quickSwitchRole('ROLE_ADMIN');
                  setActiveTab('admin-stats');
                }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  user?.role === 'ROLE_ADMIN'
                    ? 'bg-purple-500 text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Operations
              </button>
            </div>

            {/* User Profile Pill */}
            {user && (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <img
                  src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full border border-brand-500/40 object-cover"
                />
                <div className="hidden sm:block text-left text-xs">
                  <p className="font-semibold text-white leading-tight truncate max-w-[120px]">
                    {user.fullName}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {user.role === 'ROLE_CUSTOMER' ? 'Verified Passenger' : user.role === 'ROLE_DRIVER' ? 'Certified Pilot' : 'Operations Lead'}
                  </p>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
