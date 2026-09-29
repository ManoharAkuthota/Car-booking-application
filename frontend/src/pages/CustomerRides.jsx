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
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats in Clean White Theme */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight">Ride History & Receipts</h1>
          <p className="text-xs text-gray-500 font-medium">View past invoices, travel summaries, and active trips.</p>
        </div>

        {/* Stats Pill Box */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-white border border-gray-200 p-3 rounded-2xl shadow-sm">
            <p className="text-gray-400 text-[10px] uppercase font-bold">Total Completed</p>
            <p className="text-lg font-black text-gray-950 font-mono">
              {bookings.filter((b) => b.status === 'COMPLETED').length}
            </p>
          </div>
          <div className="bg-white border border-gray-200 p-3 rounded-2xl shadow-sm">
            <p className="text-gray-400 text-[10px] uppercase font-bold">Distance Covered</p>
            <p className="text-lg font-black text-emerald-700 font-mono">
              {totalDistance.toFixed(1)} km
            </p>
          </div>
          <div className="bg-white border border-gray-200 p-3 rounded-2xl shadow-sm">
            <p className="text-gray-400 text-[10px] uppercase font-bold">Total Spent</p>
            <p className="text-lg font-black text-amber-600 font-mono">
              ₹{totalSpent.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200 pb-3 text-xs">
        {['ALL', 'ONGOING', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              filter === tab
                ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                : 'text-gray-600 hover:text-gray-950 bg-white border border-gray-200'
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
            <div key={n} className="h-32 bg-gray-100 rounded-2xl animate-pulse border border-gray-200" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 space-y-2 shadow-sm">
          <Navigation className="w-10 h-10 text-gray-400 mx-auto" />
          <p className="text-sm text-gray-600 font-bold">No rides found under this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
            >
              {/* Left Info */}
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl flex-shrink-0 shadow-xs">
                  {b.car?.category === 'BIKE' ? '🏍️' : b.car?.category === 'AUTO' ? '🛺' : b.car?.category === 'TROLLEY_PORTER' ? '🛻' : '🚗'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-black text-gray-950">{b.bookingCode}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getStatusBadge(b.status)}`}>
                      {b.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-gray-900">
                    {b.car?.make} {b.car?.model} ({b.car?.licensePlate})
                  </h3>
                  <div className="flex items-center space-x-2 text-[11px] text-gray-500 font-medium">
                    <span>From: <strong className="text-gray-800">{b.pickupAddress}</strong></span>
                    <span>→</span>
                    <span>To: <strong className="text-gray-800">{b.dropoffAddress}</strong></span>
                  </div>
                </div>
              </div>

              {/* Right Fare & Action */}
              <div className="flex md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 border-gray-100 pt-3 md:pt-0">
                <div className="text-left md:text-right">
                  <span className="text-lg font-black text-gray-950 font-mono">₹{b.totalFare}</span>
                  <p className="text-[11px] text-gray-400 font-medium">{b.distanceKm} km • {b.paymentMethod}</p>
                </div>

                <div className="mt-2">
                  {b.status === 'COMPLETED' ? (
                    <button
                      onClick={() => setSelectedReceipt(b)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Invoice Receipt</span>
                    </button>
                  ) : b.status !== 'CANCELLED' ? (
                    <button
                      onClick={() => onSelectActiveTrip && onSelectActiveTrip(b)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black shadow-sm transition-all"
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
