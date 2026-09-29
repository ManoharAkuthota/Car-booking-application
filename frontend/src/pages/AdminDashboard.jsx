import React, { useState, useEffect } from 'react';
import { adminApi, carApi } from '../api/client';
import { Shield, DollarSign, Car, Users, Plus, Check, X, Trash2, Edit3, Navigation, Loader2, Sparkles, Filter } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [cars, setCars] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [submittingCar, setSubmittingCar] = useState(false);
  const [carError, setCarError] = useState(null);

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
      alert("Failed to delete vehicle.");
    }
  };

  const handleToggleCarStatus = async (car) => {
    const nextStatus = car.status === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE';
    try {
      await carApi.updateStatus(car.id, nextStatus);
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
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">Platform Governance & Fleet</h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1.5 bg-gray-100 p-1.5 rounded-2xl border border-gray-200 text-xs">
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
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-950'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI METRICS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-2 shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Gross Platform Revenue</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
            ₹{stats?.totalRevenue?.toFixed(2) || '0.00'}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center">
            ↑ 100% Guaranteed settlements
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-2 shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Bookings</p>
          <p className="text-2xl sm:text-3xl font-black text-gray-950 font-mono">
            {stats?.totalBookings || 0}
          </p>
          <div className="flex items-center space-x-2 text-[11px] text-gray-500 font-medium">
            <span>{stats?.activeTrips || 0} Active</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">{stats?.completedTrips || 0} Completed</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-2 shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Fleet Utilization</p>
          <p className="text-2xl sm:text-3xl font-black text-cyan-700 font-mono">
            {stats?.availableCars || 0} / {stats?.totalCars || 0}
          </p>
          <span className="text-[11px] text-cyan-700 font-bold">
            {stats?.totalCars ? Math.round(((stats.totalCars - stats.availableCars) / stats.totalCars) * 100) : 0}% Active Deployment
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-2 shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Driver Partners</p>
          <p className="text-2xl sm:text-3xl font-black text-purple-700 font-mono">
            {stats?.onlineDrivers || 0} Online
          </p>
          <span className="text-[11px] text-gray-500 font-medium">
            {stats?.totalDrivers || 0} Registered Pilots
          </span>
        </div>
      </div>

      {/* FLEET MANAGEMENT TAB */}
      {(activeTab === 'fleet' || activeTab === 'overview') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-950">Vehicle Fleet Management</h3>
            <button
              onClick={() => setShowAddCarModal(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle to Fleet</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px] border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3">Vehicle</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">License Plate</th>
                  <th className="px-5 py-3">Base & Rate</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cars.map((car) => (
                  <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-3">
                        <img
                          src={car.imageUrl}
                          alt={car.model}
                          className="w-12 h-10 rounded-lg object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-extrabold text-gray-950">{car.make} {car.model}</p>
                          <p className="text-[10px] text-gray-500 font-medium">{car.year} • {car.seats} Seats</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-gray-800">{car.category}</td>
                    <td className="px-5 py-3.5 font-mono text-gray-600">{car.licensePlate}</td>
                    <td className="px-5 py-3.5 font-mono">
                      ₹{car.pricePerKm}/km <span className="text-gray-400 text-[10px]">(Base ₹{car.baseFare})</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        car.status === 'AVAILABLE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : car.status === 'BOOKED'
                          ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {car.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleToggleCarStatus(car)}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-[10px] font-bold transition-colors"
                      >
                        {car.status === 'AVAILABLE' ? 'Set Maintenance' : 'Set Available'}
                      </button>
                      <button
                        onClick={() => handleDeleteCar(car.id)}
                        className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
          <h3 className="text-lg font-bold text-gray-950">Driver Verification Portal</h3>
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px] border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3">Driver Name</th>
                  <th className="px-5 py-3">License Number</th>
                  <th className="px-5 py-3">Vehicle Assigned</th>
                  <th className="px-5 py-3">Experience</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {drivers.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-gray-950">{d.user?.fullName}</td>
                    <td className="px-5 py-3.5 font-mono text-gray-500">{d.licenseNumber}</td>
                    <td className="px-5 py-3.5">{d.vehicleAssigned}</td>
                    <td className="px-5 py-3.5">{d.experienceYears} Years</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        d.verificationStatus === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : d.verificationStatus === 'PENDING'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {d.verificationStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleVerifyDriver(d.id, 'APPROVED')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px] border border-emerald-200 transition-all"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleVerifyDriver(d.id, 'REJECTED')}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[10px] border border-rose-200 transition-all"
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
          <h3 className="text-lg font-bold text-gray-950">Live Platform Trips Monitor</h3>
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px] border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Passenger</th>
                  <th className="px-5 py-3">Driver</th>
                  <th className="px-5 py-3">Route</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {trips.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-gray-950">{t.bookingCode}</td>
                    <td className="px-5 py-3.5 font-medium">{t.customer?.fullName}</td>
                    <td className="px-5 py-3.5 text-gray-500">{t.driver?.fullName || 'Unassigned'}</td>
                    <td className="px-5 py-3.5 max-w-[220px] truncate text-gray-600">
                      {t.pickupAddress} → {t.dropoffAddress}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-black text-emerald-700">₹{t.totalFare}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        t.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : t.status === 'CANCELLED'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-800 animate-pulse'
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-lg font-bold text-gray-950">Add New Fleet Vehicle</h3>
              <button onClick={() => setShowAddCarModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {carError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {carError}
              </div>
            )}

            <form onSubmit={handleAddCar} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 mb-1 block font-bold">Make</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Audi, Hyundai, Tesla"
                    value={newCar.make}
                    onChange={(e) => setNewCar({ ...newCar, make: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-gray-600 mb-1 block font-bold">Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A6 Matrix, Ioniq 5"
                    value={newCar.model}
                    onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-600 mb-1 block font-bold">Category</label>
                  <select
                    value={newCar.category}
                    onChange={(e) => setNewCar({ ...newCar, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-purple-500"
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
                  <label className="text-gray-600 mb-1 block font-bold">Seats</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newCar.seats}
                    onChange={(e) => setNewCar({ ...newCar, seats: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900"
                  />
                </div>

                <div>
                  <label className="text-gray-600 mb-1 block font-bold">License Plate</label>
                  <input
                    type="text"
                    required
                    placeholder="KA-01-EQ-9999"
                    value={newCar.licensePlate}
                    onChange={(e) => setNewCar({ ...newCar, licensePlate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-600 mb-1 block font-bold">Base Fare (₹)</label>
                  <input
                    type="number"
                    value={newCar.baseFare}
                    onChange={(e) => setNewCar({ ...newCar, baseFare: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-gray-600 mb-1 block font-bold">Price / km (₹)</label>
                  <input
                    type="number"
                    value={newCar.pricePerKm}
                    onChange={(e) => setNewCar({ ...newCar, pricePerKm: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-gray-600 mb-1 block font-bold">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    value={newCar.hourlyRate}
                    onChange={(e) => setNewCar({ ...newCar, hourlyRate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-600 mb-1 block font-bold">Image URL</label>
                <input
                  type="url"
                  value={newCar.imageUrl}
                  onChange={(e) => setNewCar({ ...newCar, imageUrl: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddCarModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCar}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  {submittingCar ? 'Adding...' : 'Save Vehicle'}
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
