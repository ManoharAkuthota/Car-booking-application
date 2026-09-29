import React from 'react';
import { Star, Users, Zap, ShieldCheck, Fuel, ArrowRight, Package, HardHat } from 'lucide-react';

const getVehicleIcon = (category) => {
  switch (category) {
    case 'BIKE': return '🏍️';
    case 'AUTO': return '🛺';
    case 'TROLLEY_PORTER': return '🛻';
    case 'ELECTRIC': return '⚡';
    default: return '🚗';
  }
};

const getCategoryColor = (category) => {
  switch (category) {
    case 'BIKE':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'AUTO':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'TROLLEY_PORTER':
      return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    case 'ELECTRIC':
      return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
    case 'LUXURY':
      return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
    case 'SUV':
      return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
    default:
      return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  }
};

const CarCard = ({ car, onSelect }) => {
  const featureList = car.features ? car.features.split(',').slice(0, 3) : [];
  const vehicleEmoji = getVehicleIcon(car.category);

  return (
    <div className="group relative rounded-2xl glass-card overflow-hidden border border-slate-800 hover:border-brand-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/10 flex flex-col justify-between">
      {/* Vehicle Image with Category & Rating Tag */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
        <img
          src={car.imageUrl}
          alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Category Pill with Emoji */}
        <div className="absolute top-3 left-3 flex items-center space-x-1.5">
          <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border backdrop-blur-md ${getCategoryColor(car.category)}`}>
            <span>{vehicleEmoji}</span>
            <span>{car.category === 'TROLLEY_PORTER' ? 'TROLLEY' : car.category}</span>
          </span>
        </div>

        {/* Rating Pill */}
        <div className="absolute top-3 right-3 flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold glass text-amber-300 border border-slate-700">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{car.rating || 4.9}</span>
          <span className="text-slate-400 text-[10px]">({car.totalTrips || 0})</span>
        </div>

        {/* Status Pill if booked */}
        {car.status !== 'AVAILABLE' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
            <span className="px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
              Currently On Trip
            </span>
          </div>
        )}
      </div>

      {/* Vehicle Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors truncate pr-2">
              {car.make} {car.model}
            </h3>
            <span className="text-xs text-slate-400 font-mono flex-shrink-0">{car.year}</span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{car.licensePlate}</p>

          {/* Quick Specs */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300">
            {car.category === 'TROLLEY_PORTER' ? (
              <div className="flex items-center space-x-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800 col-span-2">
                <Package className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span className="font-semibold text-purple-300 truncate">Max {car.maxWeightKg || 750} kg Payload</span>
              </div>
            ) : car.category === 'BIKE' ? (
              <div className="flex items-center space-x-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <HardHat className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>1 Rider</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{car.seats} Seats</span>
              </div>
            )}

            <div className="flex items-center space-x-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <Fuel className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{car.fuelType?.split(' ')[0] || 'Petrol'}</span>
            </div>

            {car.category !== 'TROLLEY_PORTER' && (
              <div className="flex items-center space-x-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                <span>Verified</span>
              </div>
            )}
          </div>

          {/* Features Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {featureList.map((feature, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60 truncate max-w-full">
                {feature.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3.5 border-t border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-extrabold text-white">₹{car.pricePerKm}</span>
              <span className="text-xs text-slate-400 font-medium">/ km</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Base: <span className="font-semibold text-slate-300">₹{car.baseFare}</span>
            </div>
          </div>

          <button
            onClick={() => onSelect(car)}
            disabled={car.status !== 'AVAILABLE'}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              car.status === 'AVAILABLE'
                ? 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-slate-950 shadow-md shadow-brand-500/20 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>{car.category === 'TROLLEY_PORTER' ? 'Book Porter' : 'Book Ride'}</span>
            {car.status === 'AVAILABLE' && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
