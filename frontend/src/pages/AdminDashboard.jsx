import React, { useState, useEffect } from 'react';
import { adminApi, carApi } from '../api/client';
import { Shield, DollarSign, Car, Users, Plus, Check, X, Trash2, Edit3, Navigation, Loader2, Sparkles, Filter } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [cars, setCars] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, fleet, drivers, trips
  const [loading, setLoading] = useState(true);
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [submittingCar, setSubmittingCar] = useState(false);
  const [carError, setCarError] = useState(null);

  // New Car form state
  const [newCar, setNewCar] = useState({
    make: '',
    model: '',
    year: 2024,
    licensePlate: '',
    category: 'SEDAN',
    seats: 5,
    maxWeightKg: 750,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    pricePerKm: 25,
    baseFare: 100,
    hourlyRate: 300,
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800',
    features: 'AC, Airbags, Bluetooth, Power Steering',
  });

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, carsRes, driversRes, tripsRes] = await Promise.all([
        adminApi.getStats(),
        carApi.getAll({}),
        adminApi.getDrivers(),
        adminApi.getAllTrips(),
      ]);

      setStats(statsRes.data);
      setCars(carsRes.data);
      setDrivers(driversRes.data);
      setTrips(tripsRes.data);
    } catch (err) {
      console.error("Admin data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleAddCar = async (e) => {
    e.preventDefault();
    setSubmittingCar(true);
    setCarError(null);
    try {
      await carApi.create({
        ...newCar,
        pricePerKm: Number(newCar.pricePerKm),
        baseFare: Number(newCar.baseFare),
        hourlyRate: Number(newCar.hourlyRate),
        year: Number(newCar.year),
        seats: Number(newCar.seats),
        maxWeightKg: newCar.category === 'TROLLEY_PORTER' ? Number(newCar.maxWeightKg) : null,
      });
      setShowAddCarModal(false);
      setNewCar({
        make: '',
        model: '',
        year: 2024,
        licensePlate: '',
        category: 'SEDAN',
        seats: 5,
        maxWeightKg: 750,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        pricePerKm: 25,
        baseFare: 100,
        hourlyRate: 300,
        imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800',
        features: 'AC, Airbags, Bluetooth, Power Steering',
      });
      await loadAdminData();
    } catch (err) {
      setCarError(err.response?.data?.message || 'Failed to add vehicle.');
    } finally {
      setSubmittingCar(false);
    }
  };

  const handleDeleteCar = async (id) => {
    if (!window.confirm("Are you sure you want to remove this car from the fleet?")) return;
    try {
      await carApi.delete(id);
      await loadAdminData();
    } catch (err) {
      alert("Failed to delete car.");
    }
  };

  const handleToggleCarStatus = async (car) => {
    const nextStatus = car.status === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE';
    try {
      await carApi.update(car.id, {
        ...car,
        status: nextStatus,
      });
      await loadAdminData();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleVerifyDriver = async (driverProfileId, status) => {
    try {
      await adminApi.verifyDriver(driverProfileId, status);
      await loadAdminData();
    } catch (err) {
      alert("Failed to update driver status.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Platform Governance & Fleet</h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs">
          {[
            { id: 'overview', label: 'Telemetry & KPIs' },
            { id: 'fleet', label: `Fleet (${cars.length})` },
            { id: 'drivers', label: `Drivers (${drivers.length})` },
            { id: 'trips', label: `All Trips (${trips.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI METRICS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Gross Platform Revenue</p>
          <p className="text-2xl sm:text-3xl font-black text-brand-400 font-mono">
            ₹{stats?.totalRevenue?.toFixed(2) || '0.00'}
          </p>
          <span className="text-[11px] text-brand-500 font-semibold flex items-center">
            ↑ 100% Guaranteed settlements
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Bookings</p>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono">
            {stats?.totalBookings || 0}
          </p>
          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <span>{stats?.activeTrips || 0} Active</span>
            <span>•</span>
            <span className="text-emerald-400">{stats?.completedTrips || 0} Completed</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Fleet Utilization</p>
          <p className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
            {stats?.availableCars || 0} / {stats?.totalCars || 0}
          </p>
          <span className="text-[11px] text-cyan-400 font-semibold">
            {stats?.totalCars ? Math.round(((stats.totalCars - stats.availableCars) / stats.totalCars) * 100) : 0}% Active Deployment
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Driver Partners</p>
          <p className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">
            {stats?.onlineDrivers || 0} Online
          </p>
          <span className="text-[11px] text-slate-400">
            {stats?.totalDrivers || 0} Registered Pilots
          </span>
        </div>
      </div>

      {/* FLEET MANAGEMENT TAB */}
      {(activeTab === 'fleet' || activeTab === 'overview') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Vehicle Fleet Management</h3>
            <button
              onClick={() => setShowAddCarModal(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle to Fleet</span>
            </button>
          </div>

          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Vehicle</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">License Plate</th>
                  <th className="px-5 py-3">Base & Rate</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {cars.map((car) => (
                  <tr key={car.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-3">
                        <img
                          src={car.imageUrl}
                          alt={car.model}
                          className="w-12 h-10 rounded-lg object-cover border border-slate-800"
                        />
                        <div>
                          <p className="font-bold text-white">{car.make} {car.model}</p>
                          <p className="text-[10px] text-slate-400">{car.year} • {car.seats} Seats</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-200">{car.category}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-300">{car.licensePlate}</td>
                    <td className="px-5 py-3.5 font-mono">
                      ₹{car.pricePerKm}/km <span className="text-slate-500 text-[10px]">(Base ₹{car.baseFare})</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        car.status === 'AVAILABLE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : car.status === 'BOOKED'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {car.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleToggleCarStatus(car)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold transition-colors"
                      >
                        {car.status === 'AVAILABLE' ? 'Set Maintenance' : 'Set Available'}
                      </button>
                      <button
                        onClick={() => handleDeleteCar(car.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete vehicle"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DRIVER PARTNER VERIFICATIONS */}
      {(activeTab === 'drivers' || activeTab === 'overview') && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Driver Verification Portal</h3>
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Driver Name</th>
                  <th className="px-5 py-3">License Number</th>
                  <th className="px-5 py-3">Vehicle Assigned</th>
                  <th className="px-5 py-3">Experience</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {drivers.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-white">{d.user?.fullName}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-400">{d.licenseNumber}</td>
                    <td className="px-5 py-3.5">{d.vehicleAssigned}</td>
                    <td className="px-5 py-3.5">{d.experienceYears} Years</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        d.verificationStatus === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : d.verificationStatus === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {d.verificationStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleVerifyDriver(d.id, 'APPROVED')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold text-[10px] border border-emerald-500/30 transition-all"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleVerifyDriver(d.id, 'REJECTED')}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white font-bold text-[10px] border border-rose-500/30 transition-all"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ALL TRIPS LIVE MONITOR */}
      {(activeTab === 'trips' || activeTab === 'overview') && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Live Platform Trips Monitor</h3>
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Passenger</th>
                  <th className="px-5 py-3">Driver</th>
                  <th className="px-5 py-3">Route</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {trips.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-white">{t.bookingCode}</td>
                    <td className="px-5 py-3.5 font-medium">{t.customer?.fullName}</td>
                    <td className="px-5 py-3.5 text-slate-400">{t.driver?.fullName || 'Unassigned'}</td>
                    <td className="px-5 py-3.5 max-w-[220px] truncate text-slate-400">
                      {t.pickupAddress} → {t.dropoffAddress}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-brand-400">₹{t.totalFare}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        t.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : t.status === 'CANCELLED'
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-amber-500/10 text-amber-400 animate-pulse'
                      }`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD CAR MODAL */}
      {showAddCarModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Add New Fleet Vehicle</h3>
              <button onClick={() => setShowAddCarModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {carError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {carError}
              </div>
            )}

            <form onSubmit={handleAddCar} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 mb-1 block">Make</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Audi, Hyundai, Tesla"
                    value={newCar.make}
                    onChange={(e) => setNewCar({ ...newCar, make: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 mb-1 block">Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A6 Matrix, Ioniq 5"
                    value={newCar.model}
                    onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-400 mb-1 block">Category</label>
                  <select
                    value={newCar.category}
                    onChange={(e) => setNewCar({ ...newCar, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="BIKE">🏍️ BIKE (Rapido)</option>
                    <option value="AUTO">🛺 AUTO (Rickshaw)</option>
                    <option value="TROLLEY_PORTER">🛻 TROLLEY / PORTER</option>
                    <option value="SEDAN">🚗 SEDAN</option>
                    <option value="SUV">🚙 SUV</option>
                    <option value="LUXURY">✨ LUXURY</option>
                    <option value="ELECTRIC">⚡ ELECTRIC</option>
                    <option value="HATCHBACK">🚗 HATCHBACK</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 mb-1 block">Year</label>
                  <input
                    type="number"
                    value={newCar.year}
                    onChange={(e) => setNewCar({ ...newCar, year: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 mb-1 block">License Plate</label>
                  <input
                    type="text"
                    required
                    placeholder="KA-05-AA-1234"
                    value={newCar.licensePlate}
                    onChange={(e) => setNewCar({ ...newCar, licensePlate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {newCar.category === 'TROLLEY_PORTER' && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <label className="text-purple-300 mb-1 block font-semibold">Max Payload Capacity (kg)</label>
                  <input
                    type="number"
                    value={newCar.maxWeightKg}
                    onChange={(e) => setNewCar({ ...newCar, maxWeightKg: e.target.value })}
                    className="w-full bg-slate-950 border border-purple-500/40 rounded-xl px-3 py-2 text-white"
                    placeholder="e.g. 750"
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-400 mb-1 block">Rate / km (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newCar.pricePerKm}
                    onChange={(e) => setNewCar({ ...newCar, pricePerKm: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 mb-1 block">Base Fare (₹)</label>
                  <input
                    type="number"
                    value={newCar.baseFare}
                    onChange={(e) => setNewCar({ ...newCar, baseFare: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 mb-1 block">Seats</label>
                  <input
                    type="number"
                    value={newCar.seats}
                    onChange={(e) => setNewCar({ ...newCar, seats: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">Vehicle Photo URL</label>
                <input
                  type="text"
                  value={newCar.imageUrl}
                  onChange={(e) => setNewCar({ ...newCar, imageUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">Key Features (comma-separated)</label>
                <input
                  type="text"
                  value={newCar.features}
                  onChange={(e) => setNewCar({ ...newCar, features: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCarModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCar}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center space-x-2"
                >
                  {submittingCar && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Add to Fleet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
