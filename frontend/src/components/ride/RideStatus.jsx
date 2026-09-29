import React from 'react';
import { Loader2, CheckCircle2, Navigation, AlertCircle, Sparkles, MapPin, ShieldCheck, Flag } from 'lucide-react';
import { ANIMATION_STATES } from '../../data/rideTypes';

/**
 * RideStatus Component
 * Displays clean commercial status banner synchronized with animation lifecycle.
 */
const RideStatus = ({
  animationState = ANIMATION_STATES.SEARCHING,
  statusText = '',
  vehicleName = 'Bike',
  driverName = 'Rajesh Kumar',
  arrivalTitle = '',
  arrivalSubtitle = '',
}) => {
  const getStatusConfig = () => {
    switch (animationState) {
      case ANIMATION_STATES.SEARCHING:
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin text-amber-600" />,
          title: `Searching nearby ${vehicleName} captains...`,
          subtitle: 'Connecting to real-time live telemetry network',
          badgeBg: 'bg-amber-50 border-amber-200 text-amber-900',
        };
      case ANIMATION_STATES.DRIVER_FOUND:
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          title: `${driverName} accepted your ride`,
          subtitle: 'Assigned verified pilot with top customer rating',
          badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        };
      case ANIMATION_STATES.DRIVER_ACCEPTED:
        return {
          icon: <Navigation className="w-4 h-4 text-blue-600 animate-pulse" />,
          title: 'Captain is preparing vehicle',
          subtitle: 'Checking helmet hygiene & initiating route',
          badgeBg: 'bg-blue-50 border-blue-200 text-blue-900',
        };
      case ANIMATION_STATES.DRIVER_MOVING:
        return {
          icon: <Navigation className="w-4 h-4 text-brand-600 animate-spin" />,
          title: 'Captain on the way to pickup',
          subtitle: 'Cruising via 100ft Road and Residency Avenue',
          badgeBg: 'bg-brand-50 border-brand-200 text-brand-900',
        };
      case ANIMATION_STATES.NEARBY:
        return {
          icon: <MapPin className="w-4 h-4 text-amber-600 animate-bounce" />,
          title: 'Driver is arriving nearby (~300m away)',
          subtitle: 'Please walk to your chosen pickup gate',
          badgeBg: 'bg-amber-50 border-amber-300 text-amber-900',
        };
      case ANIMATION_STATES.ARRIVING:
        return {
          icon: <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />,
          title: 'Arriving at pickup point now...',
          subtitle: 'Look for vehicle headlights at the curb',
          badgeBg: 'bg-purple-50 border-purple-200 text-purple-900',
        };
      case ANIMATION_STATES.ARRIVED:
        return {
          icon: <Flag className="w-4 h-4 text-emerald-600" />,
          title: arrivalTitle || 'Captain has arrived!',
          subtitle: arrivalSubtitle || 'Share your 4-digit PIN before starting ride.',
          badgeBg: 'bg-emerald-100 border-emerald-300 text-emerald-950 font-bold',
        };
      case ANIMATION_STATES.CANCELLED:
        return {
          icon: <AlertCircle className="w-4 h-4 text-rose-600" />,
          title: 'Ride cancelled',
          subtitle: 'No cancellation fee applied within grace window.',
          badgeBg: 'bg-rose-50 border-rose-200 text-rose-900',
        };
      default:
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin text-gray-500" />,
          title: statusText,
          subtitle: 'Telemetry active',
          badgeBg: 'bg-gray-50 border-gray-200 text-gray-800',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`p-3.5 rounded-2xl border flex items-center space-x-3.5 transition-all duration-300 ${config.badgeBg}`}>
      <div className="w-8 h-8 rounded-xl bg-white/90 border border-current/20 flex items-center justify-center flex-shrink-0 shadow-xs">
        {config.icon}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-xs sm:text-sm font-extrabold text-gray-950 truncate">
          {config.title}
        </h4>
        <p className="text-[11px] text-gray-600 font-medium truncate mt-0.5">
          {config.subtitle}
        </p>
      </div>
    </div>
  );
};

export default RideStatus;
