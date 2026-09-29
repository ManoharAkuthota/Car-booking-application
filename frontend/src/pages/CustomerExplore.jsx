import React, { useState, useEffect } from 'react';
import { carApi, bookingApi } from '../api/client';
import CarCard from '../components/CarCard';
import BookingModal from '../components/BookingModal';
import ActiveTripCard from '../components/ActiveTripCard';
import DigitalReceiptModal from '../components/DigitalReceiptModal';
import { Search, Zap, Crown, Compass, Car, Sparkles, Filter, AlertCircle, RefreshCw } from 'lucide-react';

const CATEGORIES = [
  { id: 'ALL', label: 'All Vehicles', icon: Car },
  { id: 'ELECTRIC', label: 'Electric EV', icon: Zap },
  { id: 'LUXURY', label: 'Luxury & Chauffeur', icon: Crown },
  { id: 'SUV', label: 'Family SUV', icon: Compass },
  { id: 'SEDAN', label: 'Executive Sedan', icon: Sparkles },
  { id: 'HATCHBACK', label: 'Compact City', icon: Car },
];

const CustomerExplore = () => {
  const [cars, setCars] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeats, setSelectedSeats] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState(null);
  const [selectedCarForBooking, setSelectedCarForBooking] = useState(null);
  const [receiptBooking, setReceiptBooking] = useState(null);

  // Load cars and check for active booking
  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedSeats) params.seats = Number(selectedSeats);

      const [carsRes, bookingsRes] = await Promise.all([
        carApi.getAll(params),
        bookingApi.getMyBookings(),
      ]);

      setCars(carsRes.data);

      // Check if user has an active unfinished ride
      const ongoing = bookingsRes.data.find(
        (b) => b.status === 'REQUESTED' || b.status === 'ACCEPTED' || b.status === 'DRIVER_ARRIVING' || b.status === 'IN_PROGRESS'
      );
      if (ongoing) {
        setActiveBooking(ongoing);
      }
    } catch (err) {
      console.error("Failed to load cars:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedSeats]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleBookingSuccess = (newBooking) => {
    setSelectedCarForBooking(null);
    setActiveBooking(newBooking);
    loadData();
  };

  return (
    <div className="space-y-8">
      {/* Active Trip Banner if user has ongoing ride */}
      {activeBooking && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-wider text-brand-400 uppercase flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-ping" />
              <span>Live Ongoing Trip Telemetry</span>
            </h2>
            <button
              onClick={() => setActiveBooking(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Minimize
            </button>
          </div>
          <ActiveTripCard
            booking={activeBooking}
            onStatusChanged={(updated) => {
              setActiveBooking(updated);
              if (updated.status === 'COMPLETED') {
                setReceiptBooking(updated);
              }
              loadData();
            }}
            onViewReceipt={(b) => setReceiptBooking(b)}
          />
        </section>
      )}

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-800 p-8 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Cab Booking & Hourly Car Rental</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Premium Rides at Your <span className="bg-gradient-to-r from-brand-400 to-accent-cyan bg-clip-text text-transparent">Fingertips</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            Choose from high-performance electric sedans, executive luxury chauffeurs, or reliable city hatchbacks with guaranteed transparent fares and verified pilots.
          </p>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by make or model (e.g. Tesla, BMW, Creta)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="py-3 px-6 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-brand-500/20 transition-all active:scale-95"
            >
              Search Cars
            </button>
          </form>
        </div>

        {/* Ambient background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute right-20 bottom-0 w-80 h-80 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Category Filter Pills & Seating Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Horizontal Scroll */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-brand-500 text-slate-950 border-brand-500 shadow-lg shadow-brand-500/20'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right side controls: Seating & Refresh */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <select
            value={selectedSeats}
            onChange={(e) => setSelectedSeats(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
          >
            <option value="">Any Seating</option>
            <option value="4">4+ Seats</option>
            <option value="5">5+ Seats</option>
          </select>

          <button
            onClick={loadData}
            title="Refresh Fleet"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Car Grid */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-bold text-white">
            Available Fleet <span className="text-slate-500 font-mono text-xs">({cars.length} vehicles)</span>
          </h2>
          <span className="text-xs text-slate-400">All prices include commercial insurance & fuel</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
            <Car className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm font-medium">No vehicles found matching your criteria.</p>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
                setSelectedSeats('');
              }}
              className="text-xs text-brand-400 font-semibold underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                onSelect={(selected) => setSelectedCarForBooking(selected)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedCarForBooking && (
        <BookingModal
          car={selectedCarForBooking}
          onClose={() => setSelectedCarForBooking(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* Receipt Modal */}
      {receiptBooking && (
        <DigitalReceiptModal
          booking={receiptBooking}
          onClose={() => setReceiptBooking(null)}
        />
      )}
    </div>
  );
};

export default CustomerExplore;
