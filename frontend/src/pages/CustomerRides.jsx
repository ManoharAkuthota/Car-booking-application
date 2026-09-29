import React, { useState, useEffect } from 'react';
import { bookingApi } from '../api/client';
import DigitalReceiptModal from '../components/DigitalReceiptModal';
import { Navigation, Clock, Calendar, CheckCircle2, XCircle, FileText, ArrowRight, Loader2, IndianRupee } from 'lucide-react';

const CustomerRides = ({ onSelectActiveTrip }) => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getMyBookings();
      setBookings(res.data);
    } catch (err) {
      console.error("Failed to load rides:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    if (filter === 'COMPLETED') return b.status === 'COMPLETED';
    if (filter === 'ONGOING') return b.status !== 'COMPLETED' && b.status !== 'CANCELLED';
    if (filter === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  const totalSpent = bookings
    .filter((b) => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (Number(b.totalFare) || 0), 0);

  const totalDistance = bookings
    .filter((b) => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (Number(b.distanceKm) || 0), 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Ride History & Receipts</h1>
          <p className="text-xs text-slate-400">View past invoices, travel summaries, and active trips.</p>
        </div>

        {/* Stats Pill Box */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
            <p className="text-slate-400 text-[10px] uppercase font-semibold">Total Completed</p>
            <p className="text-lg font-bold text-white font-mono">
              {bookings.filter((b) => b.status === 'COMPLETED').length}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
            <p className="text-slate-400 text-[10px] uppercase font-semibold">Distance Covered</p>
            <p className="text-lg font-bold text-brand-400 font-mono">
              {totalDistance.toFixed(1)} km
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
            <p className="text-slate-400 text-[10px] uppercase font-semibold">Total Spent</p>
            <p className="text-lg font-bold text-accent-cyan font-mono">
              ₹{totalSpent.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 text-xs">
        {['ALL', 'ONGOING', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              filter === tab
                ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-slate-900/60 rounded-2xl animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-2">
          <Navigation className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400 font-semibold">No rides found under this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="glass-card rounded-2xl border border-slate-800 p-5 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Info */}
              <div className="flex items-start space-x-4">
                <img
                  src={b.car?.imageUrl || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=200"}
                  alt={b.car?.model}
                  className="w-20 h-20 rounded-xl object-cover border border-slate-800 flex-shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-white">{b.bookingCode}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getStatusBadge(b.status)}`}>
                      {b.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">
                    {b.car?.make} {b.car?.model} ({b.car?.licensePlate})
                  </h3>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <span>From: <strong>{b.pickupAddress}</strong></span>
                    <span>→</span>
                    <span>To: <strong>{b.dropoffAddress}</strong></span>
                  </div>
                </div>
              </div>

              {/* Right Fare & Action */}
              <div className="flex md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                <div className="text-left md:text-right">
                  <span className="text-lg font-black text-white font-mono">₹{b.totalFare}</span>
                  <p className="text-[11px] text-slate-400">{b.distanceKm} km • {b.paymentMethod}</p>
                </div>

                <div className="mt-2">
                  {b.status === 'COMPLETED' ? (
                    <button
                      onClick={() => setSelectedReceipt(b)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-400 text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Invoice Receipt</span>
                    </button>
                  ) : b.status !== 'CANCELLED' ? (
                    <button
                      onClick={() => onSelectActiveTrip && onSelectActiveTrip(b)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
                    >
                      <span>Track Live</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Receipt Modal */}
      {selectedReceipt && (
        <DigitalReceiptModal
          booking={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};

export default CustomerRides;
