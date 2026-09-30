import React from 'react';
import { Home, Navigation, Zap, Clock, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottomTaskbar = ({ currentTab, onSelectTab, onOpenAccountModal }) => {
  const { user } = useAuth();

  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
    },
    {
      id: 'explore',
      label: 'Rides',
      icon: Navigation,
    },
    {
      id: 'arrival-sim',
      label: 'Animation',
      icon: Zap,
      badge: '60 FPS',
    },
    {
      id: 'my-trips',
      label: 'Activity',
      icon: Clock,
    },
    {
      id: 'account',
      label: 'Account',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1200] bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl sm:hidden">
      <div className="flex items-center justify-around h-15 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.id === 'account') {
                  if (onOpenAccountModal) onOpenAccountModal();
                } else {
                  onSelectTab(tab.id);
                }
              }}
              className={`relative flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 select-none active:scale-95 ${
                isActive
                  ? 'text-gray-950 font-black'
                  : 'text-gray-400 hover:text-gray-600 font-semibold'
              }`}
            >
              <div className="relative">
                <div
                  className={`w-9 h-7 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-gray-500'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
                {tab.badge && (
                  <span className="absolute -top-1 -right-3 px-1 py-0.2 text-[7px] font-black uppercase tracking-tighter bg-amber-500 text-slate-950 rounded-full border border-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-black text-gray-950' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTaskbar;
