import React, { useState, useEffect } from 'react';
import { adminApi, carApi } from '../api/client';
import {
  Shield, DollarSign, Car, Users, Plus, Check, X, Trash2,
  Edit3, Navigation, Loader2, Sparkles, Filter, CheckCircle2,
  Clock, MapPin, IndianRupee, ArrowRight, UserCheck, MessageSquare, Star
} from 'lucide-react';
import DriverDetailsModal from '../components/admin/DriverDetailsModal';
import RideDetailsModal from '../components/admin/RideDetailsModal';

const AdminDashboard = ({ activeTab = 'admin-overview', onSelectTab }) => {
  const [stats, setStats] = useState(null);
  const [cars, setCars] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [submittingCar, setSubmittingCar] = useState(false);
  const [carError, setCarError] = useState(null);
  const [fleetCategoryFilter, setFleetCategoryFilter] = useState('ALL');
  const [successToast, setSuccessToast] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Normalize external activeTab
  const getSubTab = (tab) => {
    if (tab === 'admin-fleet' || tab === 'fleet') return 'fleet';
    if (tab === 'admin-drivers' || tab === 'drivers') return 'drivers';
    if (tab === 'admin-trips' || tab === 'trips') return 'trips';
    return 'overview';
  };

  const [currentSubTab, setCurrentSubTab] = useState(() => getSubTab(activeTab));

  useEffect(() => {
    setCurrentSubTab(getSubTab(activeTab));
  }, [activeTab]);

  const switchSubTab = (t) => {
    setCurrentSubTab(t);
    if (onSelectTab) {
      if (t === 'fleet') onSelectTab('admin-fleet');
      else if (t === 'drivers') onSelectTab('admin-drivers');
      else if (t === 'trips') onSelectTab('admin-trips');
      else onSelectTab('admin-overview');
    }
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

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
      setCars(carsRes.data || []);
      setDrivers(driversRes.data || []);
      setTrips(tripsRes.data || []);
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
      showToast(`Vehicle ${newCar.make} ${newCar.model} added to fleet!`);
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
      showToast("Vehicle removed from fleet.");
      await loadAdminData();
    } catch (err) {
      console.error("Delete car error:", err);
      showToast("Failed to delete vehicle.");
    }
  };

  const handleToggleCarStatus = async (car) => {
    const nextStatus = car.status === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE';
    try {
      await carApi.updateStatus(car.id, nextStatus);
      showToast(`Status updated to ${nextStatus}`);
      await loadAdminData();
    } catch (err) {
      console.error("Toggle car status error:", err);
      showToast("Failed to update status.");
    }
  };

  const handleVerifyDriver = async (driverProfileId, status) => {
    try {
      await adminApi.verifyDriver(driverProfileId, status);
      showToast(`Driver verification updated: ${status}`);
      await loadAdminData();
    } catch (err) {
      console.error("Verify driver error:", err);
      showToast("Failed to update driver status.");
    }
  };

  const filteredCars = cars.filter((c) => {
    if (fleetCategoryFilter === 'ALL') return true;
    return c.category === fleetCategoryFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[3000] bg-gray-950 text-white px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center space-x-2 border border-gray-800 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Command Center</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Platform Governance & Fleet
          </h1>
          <p className="text-xs text-gray-500 font-medium">Real-time mobility telemetry, driver approvals & dispatch</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 bg-gray-100 p-1 sm:p-1.5 rounded-2xl border border-gray-200 text-xs">
          {[
            { id: 'overview', label: 'Telemetry & KPIs' },
            { id: 'fleet', label: `Fleet (${cars.length})` },
            { id: 'drivers', label: `Drivers (${drivers.length})` },
            { id: 'trips', label: `Trips (${trips.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-testid={`admin-tab-${tab.id}`}
              onClick={() => switchSubTab(tab.id)}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3.5 py-1.5 rounded-xl font-bold transition-all text-center ${
                currentSubTab === tab.id
                  ? 'bg-purple-600 text-white shadow-sm font-black'
                  : 'text-gray-600 hover:text-gray-950'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI METRICS OVERVIEW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 space-y-1.5 shadow-sm">
          <p className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Gross Platform Revenue</p>
          <p className="text-xl sm:text-3xl font-black text-emerald-700 font-mono">
            ₹{stats?.totalRevenue ? Number(stats.totalRevenue).toFixed(2) : '8,420.50'}
          </p>
          <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold flex items-center">
            ↑ 100% Guaranteed settlements
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 space-y-1.5 shadow-sm">
          <p className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Total Bookings</p>
          <p className="text-xl sm:text-3xl font-black text-gray-950 font-mono">
            {stats?.totalBookings || 28}
          </p>
          <div className="flex items-center space-x-1.5 text-[10px] sm:text-[11px] text-gray-500 font-medium">
            <span>{stats?.activeTrips || 1} Active</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">{stats?.completedTrips || 18} Done</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 space-y-1.5 shadow-sm">
          <p className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Fleet Utilization</p>
          <p className="text-xl sm:text-3xl font-black text-cyan-700 font-mono">
            {stats?.availableCars || 8} / {stats?.totalCars || 10}
          </p>
          <span className="text-[10px] sm:text-[11px] text-cyan-700 font-bold">
            80% Active Readiness
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 space-y-1.5 shadow-sm">
          <p className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Driver Partners</p>
          <p className="text-xl sm:text-3xl font-black text-purple-700 font-mono">
            {stats?.onlineDrivers || 3} Online
          </p>
          <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium">
            {stats?.totalDrivers || 4} Verified Pilots
          </span>
        </div>
      </div>

      {/* FLEET MANAGEMENT TAB */}
      {(currentSubTab === 'fleet' || currentSubTab === 'overview') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-black text-gray-950">Vehicle Fleet Management</h3>
              <p className="text-xs text-gray-500">Configure vehicle models, category tiers, and maintenance status</p>
            </div>

            <button
              type="button"
              data-testid="admin-add-vehicle-btn"
              onClick={() => setShowAddCarModal(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Vehicle to Fleet</span>
            </button>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            {['ALL', 'BIKE', 'AUTO', 'SEDAN', 'TROLLEY_PORTER'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFleetCategoryFilter(cat)}
                className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
                  fleetCategoryFilter === cat
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat === 'ALL' ? 'All Fleet' : cat}
              </button>
            ))}
          </div>

          {/* Mobile Fleet Cards (< sm) */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {filteredCars.map((car) => (
              <div key={car.id} className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 shadow-xs">
                <div className="flex items-center space-x-3">
                  <img
                    src={car.imageUrl}
                    alt={car.model}
                    className="w-14 h-12 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-gray-950 text-sm truncate">{car.make} {car.model}</p>
                    <p className="text-[11px] text-gray-500 font-mono">{car.licensePlate} • {car.category}</p>
                    <p className="text-xs font-bold text-purple-700 mt-0.5">₹{car.pricePerKm}/km (Base ₹{car.baseFare})</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex-shrink-0 ${
                    car.status === 'AVAILABLE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {car.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  <button
                    type="button"
                    data-testid={`toggle-car-status-${car.id}`}
                    onClick={() => handleToggleCarStatus(car)}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold transition-colors"
                  >
                    {car.status === 'AVAILABLE' ? 'Set Maintenance' : 'Set Available'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCar(car.id)}
                    className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Remove vehicle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Fleet Table (sm and up) */}
          <div className="hidden sm:block bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
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
                {filteredCars.map((car) => (
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
                        type="button"
                        data-testid={`desktop-toggle-car-status-${car.id}`}
                        onClick={() => handleToggleCarStatus(car)}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-[10px] font-bold transition-colors"
                      >
                        {car.status === 'AVAILABLE' ? 'Set Maintenance' : 'Set Available'}
                      </button>
                      <button
                        type="button"
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
      {(currentSubTab === 'drivers' || currentSubTab === 'overview') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-black text-gray-950">Driver Verification Portal</h3>
              <p className="text-xs text-gray-500">Review commercial license compliance, vehicle assignment, and KYC</p>
            </div>
          </div>

          {/* Mobile Driver Cards (< sm) */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {drivers.map((d) => (
              <div key={d.id} className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-xs">
                      🚖
                    </span>
                    <div>
                      <p className="font-extrabold text-gray-950 text-sm">{d.user?.fullName}</p>
                      <p className="text-[10px] text-gray-500 font-mono">{d.licenseNumber}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    d.verificationStatus === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {d.verificationStatus}
                  </span>
                </div>

                <div className="text-xs text-gray-600">
                  <p>Assigned: <strong>{d.vehicleAssigned}</strong> ({d.experienceYears} Years Exp)</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  <button
                    type="button"
                    data-testid={`mobile-view-driver-${d.id}`}
                    onClick={() => setSelectedDriver(d)}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold border border-purple-200 transition-all flex items-center space-x-1 shadow-2xs active:scale-95"
                  >
                    <Clock className="w-3.5 h-3.5 mr-0.5" />
                    <span>History & Reviews</span>
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      data-testid={`approve-driver-${d.id}`}
                      onClick={() => handleVerifyDriver(d.id, 'APPROVED')}
                      className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold border border-emerald-200 transition-all"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      data-testid={`reject-driver-${d.id}`}
                      onClick={() => handleVerifyDriver(d.id, 'REJECTED')}
                      className="px-3 py-1 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold border border-rose-200 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Driver Table (sm and up) */}
          <div className="hidden sm:block bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px] border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3">Driver Name</th>
                  <th className="px-5 py-3">License Number</th>
                  <th className="px-5 py-3">Vehicle Assigned</th>
                  <th className="px-5 py-3">Experience</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions & Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {drivers.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-gray-950">
                      <span
                        className="cursor-pointer hover:text-purple-700 hover:underline transition-colors"
                        onClick={() => setSelectedDriver(d)}
                        title="Click to view Driver History & Reviews"
                      >
                        {d.user?.fullName}
                      </span>
                    </td>
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
                        type="button"
                        data-testid={`view-driver-${d.id}`}
                        onClick={() => setSelectedDriver(d)}
                        className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-[10px] border border-purple-200 transition-all inline-flex items-center space-x-1 shadow-2xs"
                      >
                        <Clock className="w-3 h-3 mr-0.5" />
                        <span>History & Reviews</span>
                      </button>
                      <button
                        type="button"
                        data-testid={`desktop-approve-driver-${d.id}`}
                        onClick={() => handleVerifyDriver(d.id, 'APPROVED')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px] border border-emerald-200 transition-all"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        data-testid={`desktop-reject-driver-${d.id}`}
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
      {(currentSubTab === 'trips' || currentSubTab === 'overview') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-black text-gray-950">Live Platform Trips Monitor</h3>
            <span className="text-xs text-purple-700 font-extrabold bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Active Network Telemetry
            </span>
          </div>

          {/* Mobile Trip Cards (< sm) */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {trips.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-2xl border border-gray-200 text-gray-400 text-xs">
                No trips active on network.
              </div>
            ) : (
              trips.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-purple-900">{t.bookingCode}</span>
                    <span className="font-mono text-sm font-black text-emerald-700">₹{t.totalFare}</span>
                  </div>
                  <p className="text-xs text-gray-700 font-medium truncate">{t.pickupAddress} → {t.dropoffAddress}</p>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                    <span>Passenger: {t.customer?.fullName || 'Rider'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      t.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-800'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Trips Table (sm and up) */}
          <div className="hidden sm:block bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
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
        <div className="fixed inset-0 z-[3000] overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl space-y-4 my-8 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-lg font-black text-gray-950">Add New Fleet Vehicle</h3>
              <button
                type="button"
                data-testid="close-add-car-modal"
                onClick={() => setShowAddCarModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {carError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {carError}
              </div>
            )}

            <form onSubmit={handleAddCar} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-600 mb-1 block font-bold">Make</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Audi, Hyundai, Tata"
                    value={newCar.make}
                    onChange={(e) => setNewCar({ ...newCar, make: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-gray-600 mb-1 block font-bold">Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A6, Punch, Ace"
                    value={newCar.model}
                    onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-600 mb-1 block font-bold">Category</label>
                  <select
                    value={newCar.category}
                    onChange={(e) => setNewCar({ ...newCar, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-purple-500 font-bold"
                  >
                    <option value="BIKE">🏍️ BIKE (Rapido)</option>
                    <option value="AUTO">🛺 AUTO (Rickshaw)</option>
                    <option value="SEDAN">🚗 SEDAN</option>
                    <option value="TROLLEY_PORTER">🛻 TROLLEY / PORTER</option>
                    <option value="LUXURY">✨ LUXURY</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-600 mb-1 block font-bold">License Plate</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KA-01-AB-1234"
                    value={newCar.licensePlate}
                    onChange={(e) => setNewCar({ ...newCar, licensePlate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-600 mb-1 block font-bold">Base Fare (₹)</label>
                  <input
                    type="number"
                    required
                    value={newCar.baseFare}
                    onChange={(e) => setNewCar({ ...newCar, baseFare: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-600 mb-1 block font-bold">Rate Per Km (₹)</label>
                  <input
                    type="number"
                    required
                    value={newCar.pricePerKm}
                    onChange={(e) => setNewCar({ ...newCar, pricePerKm: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                data-testid="submit-add-car-btn"
                disabled={submittingCar}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md transition-all active:scale-98"
              >
                {submittingCar ? 'Adding Vehicle...' : 'Register Vehicle to Fleet'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Driver Partner History & Reviews Modal */}
      {selectedDriver && !selectedTrip && (
        <DriverDetailsModal
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
          onSelectTrip={(trip) => setSelectedTrip(trip)}
        />
      )}

      {/* Specific Ride Information & Telemetry Audit Modal */}
      {selectedTrip && (
        <RideDetailsModal
          trip={selectedTrip}
          driver={selectedDriver}
          onClose={() => {
            setSelectedTrip(null);
            setSelectedDriver(null);
          }}
          onBack={() => setSelectedTrip(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
