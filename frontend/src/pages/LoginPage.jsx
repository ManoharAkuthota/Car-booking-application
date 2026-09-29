import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Car, Shield, Lock, Mail, User, ArrowRight, Loader2,
  Sparkles, CheckCircle2, Phone, AlertCircle
} from 'lucide-react';

const LoginPage = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('ROLE_CUSTOMER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const res = await register({
          email,
          password,
          fullName,
          phone: phone || '+91 98765 43210',
          role,
        });
        if (!res.success) setError(res.message);
      } else {
        const res = await login(email, password);
        if (!res.success) setError(res.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    setError(null);
    try {
      const res = await login(demoEmail, demoPassword);
      if (!res.success) setError(res.message);
    } catch (err) {
      setError('Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-400 text-slate-950 font-black shadow-lg shadow-brand-500/20 mb-3 text-2xl">
          ⚡
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Drive<span className="text-brand-600">Pulse</span>
        </h2>
        <p className="mt-1 text-sm font-medium text-gray-500">
          On-demand Bike Taxi (Rapido), Auto, Cabs (Uber) & Porter Cargo
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-gray-200/60 rounded-3xl border border-gray-200 sm:px-10 space-y-6">
          
          {/* Sign In vs Sign Up Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-2xl text-xs font-bold text-gray-600">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
                !isRegister
                  ? 'bg-white text-gray-950 shadow-sm font-extrabold'
                  : 'hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
                isRegister
                  ? 'bg-white text-gray-950 shadow-sm font-extrabold'
                  : 'hover:text-gray-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Mobile Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Email Address or Phone
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-slate-950 font-black text-sm shadow-lg shadow-brand-500/20 active:scale-98 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{isRegister ? 'Create Account' : 'Sign In to DrivePulse'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Preset Cards */}
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">
              Quick 1-Tap Demo Access
            </p>

            <div className="grid grid-cols-1 gap-2">
              {/* Passenger / Rider */}
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('customer@drivepulse.com', 'password123')}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-brand-500/60 hover:shadow-md transition-all text-left flex items-center justify-between group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold">
                    👤
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block group-hover:text-brand-600">
                      Rider / Passenger
                    </span>
                    <span className="text-[10px] text-gray-500">Priya Sharma • Book rides & cargo</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-brand-600" />
              </button>

              {/* Pilot / Driver */}
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('driver@drivepulse.com', 'password123')}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-cyan-500/60 hover:shadow-md transition-all text-left flex items-center justify-between group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center text-sm font-bold">
                    🚖
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block group-hover:text-cyan-600">
                      Certified Pilot / Driver
                    </span>
                    <span className="text-[10px] text-gray-500">Rajesh Kumar • Accept trips & earn</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-cyan-600" />
              </button>

              {/* Admin / Operations */}
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin@drivepulse.com', 'admin123')}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-purple-500/60 hover:shadow-md transition-all text-left flex items-center justify-between group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold">
                    🛡️
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block group-hover:text-purple-600">
                      Operations Admin
                    </span>
                    <span className="text-[10px] text-gray-500">Fleet telemetry & command center</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600" />
              </button>
            </div>
          </div>

          {/* Commercial Trust Badges */}
          <div className="pt-2 flex items-center justify-around text-[10px] text-gray-500 border-t border-gray-100">
            <span className="flex items-center">
              <Shield className="w-3.5 h-3.5 text-brand-600 mr-1" />
              Insured Rides
            </span>
            <span>•</span>
            <span>Verified Pilots</span>
            <span>•</span>
            <span>24/7 SOS Safety</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
