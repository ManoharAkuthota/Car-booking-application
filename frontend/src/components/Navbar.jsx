import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Car, Shield, User, Navigation, LogOut } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer"
            onClick={() => {
              if (user?.role === 'ROLE_CUSTOMER') setActiveTab('explore');
              else if (user?.role === 'ROLE_DRIVER') setActiveTab('driver-cockpit');
              else if (user?.role === 'ROLE_ADMIN') setActiveTab('admin-stats');
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-amber-400 flex items-center justify-center shadow-md shadow-brand-500/20 text-slate-950 font-black text-base">
              ⚡
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-gray-950">
                Drive<span className="text-brand-600">Pulse</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                {user?.role === 'ROLE_CUSTOMER' ? 'Rider' : user?.role === 'ROLE_DRIVER' ? 'Pilot' : 'Operations'}
              </span>
            </div>
          </div>

          {/* Navigation Links strictly based on active user role */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {user?.role === 'ROLE_CUSTOMER' && (
              <>
                <button
                  onClick={() => setActiveTab('explore')}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'explore'
                      ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-sm'
                      : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                  }`}
                >
                  Book Rides
                </button>
                <button
                  onClick={() => setActiveTab('my-trips')}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'my-trips'
                      ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-sm'
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
                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm'
                      : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                  }`}
                >
                  Driver Cockpit
                </button>
                <button
                  onClick={() => setActiveTab('driver-trips')}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'driver-trips'
                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm'
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
                      ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-sm'
                      : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                  }`}
                >
                  Command Center
                </button>
                <button
                  onClick={() => setActiveTab('admin-fleet')}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'admin-fleet'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-sm'
                      : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                  }`}
                >
                  Fleet
                </button>
                <button
                  onClick={() => setActiveTab('admin-trips')}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'admin-trips'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-sm'
                      : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                  }`}
                >
                  All Trips
                </button>
              </>
            )}
          </nav>

          {/* User Profile Pill & Sign Out (No role switcher) */}
          <div className="flex items-center space-x-2.5">
            {user && (
              <div className="flex items-center space-x-2 pl-2 sm:pl-3 border-l border-gray-200">
                <img
                  src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full border border-gray-300 object-cover shadow-sm"
                />
                <div className="hidden sm:block text-left text-xs">
                  <p className="font-extrabold text-gray-900 leading-tight truncate max-w-[120px]">
                    {user.fullName}
                  </p>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                    {user.role === 'ROLE_CUSTOMER' ? 'Passenger' : user.role === 'ROLE_DRIVER' ? 'Certified Pilot' : 'Admin'}
                  </p>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
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
