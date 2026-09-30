import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Car, Shield, User, Navigation, LogOut } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Main Header Bar */}
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer flex-shrink-0"
            onClick={() => {
              if (user?.role === 'ROLE_CUSTOMER') setActiveTab('explore');
              else if (user?.role === 'ROLE_DRIVER') setActiveTab('driver-cockpit');
              else if (user?.role === 'ROLE_ADMIN') setActiveTab('admin-stats');
            }}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-amber-400 flex items-center justify-center shadow-md shadow-brand-500/20 text-slate-950 font-black text-sm sm:text-base">
              ⚡
            </div>
            <div className="flex items-center">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-gray-950">
                Drive<span className="text-brand-600">Pulse</span>
              </span>
              <span className="ml-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                {user?.role === 'ROLE_CUSTOMER' ? 'Rider' : user?.role === 'ROLE_DRIVER' ? 'Pilot' : 'Ops'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden sm:flex items-center space-x-1 sm:space-x-2">
            {user?.role === 'ROLE_CUSTOMER' && (
              <>
                <button
                  onClick={() => setActiveTab('explore')}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'explore'
                      ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-xs'
                      : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                  }`}
                >
                  Book Rides
                </button>
                <button
                  onClick={() => setActiveTab('arrival-sim')}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 ${
                    activeTab === 'arrival-sim'
                      ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-xs'
                      : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                  }`}
                >
                  <span>⚡ Arrival Animation</span>
                </button>
                <button
                  onClick={() => setActiveTab('my-trips')}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'my-trips'
                      ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-xs'
                      : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
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
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'driver-cockpit'
                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-xs'
                      : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                  }`}
                >
                  Driver Cockpit
                </button>
                <button
                  onClick={() => setActiveTab('driver-trips')}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'driver-trips'
                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-xs'
                      : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                  }`}
                >
                  Trip Earnings
                </button>
              </>
            )}

            {user?.role === 'ROLE_ADMIN' && (
              <>
                <button
                  onClick={() => setActiveTab('admin-stats')}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'admin-stats'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-xs'
                      : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                  }`}
                >
                  Command Center
                </button>
                <button
                  onClick={() => setActiveTab('admin-fleet')}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'admin-fleet'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-xs'
                      : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                  }`}
                >
                  Fleet
                </button>
                <button
                  onClick={() => setActiveTab('admin-trips')}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'admin-trips'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-xs'
                      : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                  }`}
                >
                  All Trips
                </button>
              </>
            )}
          </nav>

          {/* User Profile Pill & Sign Out - ALWAYS VISIBLE, NEVER CUT OFF */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {user ? (
              <div className="flex items-center space-x-1.5 sm:space-x-2 pl-2 border-l border-gray-200">
                <img
                  src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                  alt={user.fullName}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 object-cover shadow-xs flex-shrink-0"
                />
                <div className="hidden sm:block text-left text-xs">
                  <p className="font-extrabold text-gray-900 leading-tight truncate max-w-[110px]">
                    {user.fullName}
                  </p>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                    {user.role === 'ROLE_CUSTOMER' ? 'Passenger' : user.role === 'ROLE_DRIVER' ? 'Pilot' : 'Admin'}
                  </p>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors shadow-xs active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5 flex-shrink-0 text-rose-600" />
                  <span className="text-[11px] font-extrabold tracking-wide">Logout</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Mobile Navigation Sub-Bar (Clean Pill Switcher, Zero Horizontal Overflow) */}
        {user?.role === 'ROLE_CUSTOMER' && (
          <div className="sm:hidden flex items-center justify-between pb-2 pt-1 border-t border-gray-100 text-[11px] font-bold">
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex-1 py-1.5 mx-0.5 rounded-lg text-center transition-all ${
                activeTab === 'explore'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'text-gray-600 bg-gray-100'
              }`}
            >
              Book Rides
            </button>
            <button
              onClick={() => setActiveTab('arrival-sim')}
              className={`flex-1 py-1.5 mx-0.5 rounded-lg text-center transition-all ${
                activeTab === 'arrival-sim'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'text-gray-600 bg-gray-100'
              }`}
            >
              ⚡ Animation
            </button>
            <button
              onClick={() => setActiveTab('my-trips')}
              className={`flex-1 py-1.5 mx-0.5 rounded-lg text-center transition-all ${
                activeTab === 'my-trips'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'text-gray-600 bg-gray-100'
              }`}
            >
              My Rides
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
