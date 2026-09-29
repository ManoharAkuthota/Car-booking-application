import React, { useState } from 'react';
import { X, CheckCircle, Printer, Star, Download, ShieldCheck, Car, Calendar, Navigation } from 'lucide-react';

const DigitalReceiptModal = ({ booking, onClose }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    setReviewSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden my-8 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-400 to-brand-500 text-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-amber-400">
              <Car className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight leading-tight">DrivePulse Receipt</h2>
              <p className="text-[11px] font-bold text-slate-900">Official Electronic Fare Invoice</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/10 transition-colors text-slate-950 print:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge & Code */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-500">Booking Reference</p>
              <p className="text-lg font-mono font-black text-gray-950">{booking.bookingCode}</p>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>PAID & COMPLETED</span>
            </div>
          </div>

          {/* Ride Specs */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1">
              <p className="text-gray-500 text-[10px] uppercase font-bold">Vehicle</p>
              <p className="font-extrabold text-gray-900">{booking.car?.make} {booking.car?.model}</p>
              <p className="font-mono text-gray-500 text-[11px]">{booking.car?.licensePlate}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1">
              <p className="text-gray-500 text-[10px] uppercase font-bold">Pilot Partner</p>
              <p className="font-extrabold text-gray-900">{booking.driver?.fullName || 'Assigned Driver'}</p>
              <p className="text-amber-600 font-bold text-[11px]">★ 4.9 Verified Pilot</p>
            </div>
          </div>

          {/* Route Details */}
          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2 text-xs">
            <div className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1 flex-shrink-0" />
              <p className="text-gray-700"><span className="text-gray-400 font-bold">From: </span>{booking.pickupAddress}</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 mt-1 flex-shrink-0" />
              <p className="text-gray-700"><span className="text-gray-400 font-bold">To: </span>{booking.dropoffAddress}</p>
            </div>
            <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500 font-mono">
              <span>Distance: {booking.distanceKm} km</span>
              <span>Payment: {booking.paymentMethod}</span>
            </div>
          </div>

          {/* Itemized Fare Table */}
          <div className="space-y-2 text-xs">
            <h4 className="text-[11px] uppercase font-bold text-gray-500 tracking-wider">Fare Breakdown</h4>
            <div className="flex justify-between py-1 border-b border-gray-100 text-gray-700">
              <span>Base Fare</span>
              <span className="font-mono font-bold">₹{booking.baseFare}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100 text-gray-700">
              <span>Distance Rate ({booking.distanceKm} km)</span>
              <span className="font-mono font-bold">₹{booking.distanceFare}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100 text-gray-700">
              <span>Taxes & Tolls (5% GST)</span>
              <span className="font-mono font-bold">₹{booking.taxFare}</span>
            </div>
            <div className="flex justify-between pt-2 text-sm font-extrabold text-gray-950">
              <span>Total Paid</span>
              <span className="text-lg font-black font-mono text-emerald-700">₹{booking.totalFare}</span>
            </div>
          </div>

          {/* Pilot Rating Section */}
          <div className="pt-4 border-t border-gray-100 print:hidden space-y-3">
            <h4 className="text-xs font-bold text-gray-900 text-center">Rate Your Ride Experience</h4>
            {reviewSubmitted ? (
              <div className="p-3 bg-emerald-50 rounded-xl text-center text-xs text-emerald-700 font-bold">
                ✓ Thank you! Your feedback helps keep DrivePulse reliable and safe.
              </div>
            ) : (
              <form onSubmit={handleRatingSubmit} className="space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'text-amber-500 fill-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Leave an optional comment for the pilot..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Submit Pilot Rating
                </button>
              </form>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center justify-center space-x-2 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition-all shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalReceiptModal;
