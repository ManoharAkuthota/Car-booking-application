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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-brand-600 to-emerald-700 text-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-brand-400">
              <Car className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight leading-tight">DrivePulse Receipt</h2>
              <p className="text-[11px] font-semibold text-slate-900">Official Electronic Fare Invoice</p>
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
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Booking Reference</p>
              <p className="text-lg font-mono font-black text-white">{booking.bookingCode}</p>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>PAID & COMPLETED</span>
            </div>
          </div>

          {/* Ride Specs */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 space-y-1">
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Vehicle</p>
              <p className="font-bold text-white">{booking.car?.make} {booking.car?.model}</p>
              <p className="font-mono text-slate-400 text-[11px]">{booking.car?.licensePlate}</p>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 space-y-1">
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Driver Partner</p>
              <p className="font-bold text-white">{booking.driver?.fullName || 'Assigned Driver'}</p>
              <p className="text-slate-400 text-[11px]">★ 4.9 Verified Pilot</p>
            </div>
          </div>

          {/* Route Details */}
          <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-brand-500 mt-1 flex-shrink-0" />
              <p className="text-slate-300"><span className="text-slate-400">From: </span>{booking.pickupAddress}</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 flex-shrink-0" />
              <p className="text-slate-300"><span className="text-slate-400">To: </span>{booking.dropoffAddress}</p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Distance: {booking.distanceKm} km</span>
              <span>Payment: {booking.paymentMethod}</span>
            </div>
          </div>

          {/* Itemized Fare Table */}
          <div className="space-y-2 text-xs">
            <h4 className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Fare Breakdown</h4>
            <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-300">
              <span>Base Fare</span>
              <span className="font-mono font-semibold">₹{booking.baseFare}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-300">
              <span>Distance Rate ({booking.distanceKm} km)</span>
              <span className="font-mono font-semibold">₹{booking.distanceFare}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-300">
              <span>Taxes & Tolls (5% GST)</span>
              <span className="font-mono font-semibold">₹{booking.taxFare}</span>
            </div>
            <div className="flex justify-between pt-2 text-sm font-extrabold text-white">
              <span>Total Amount Paid</span>
              <span className="text-brand-400 text-lg font-mono">₹{booking.totalFare}</span>
            </div>
          </div>

          {/* Rate Driver Section */}
          <div className="pt-2 border-t border-slate-800 print:hidden">
            {reviewSubmitted ? (
              <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs text-center font-bold">
                ✓ Thank you for rating your driver {rating} stars!
              </div>
            ) : (
              <form onSubmit={handleRatingSubmit} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Rate your driver:</span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setRating(s)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`w-5 h-5 transition-colors ${
                            s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Leave a driver compliment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="flex-1 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                  >
                    Submit
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalReceiptModal;
