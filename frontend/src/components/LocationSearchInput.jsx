import React, { useState, useEffect, useRef } from 'react';
import { searchLocations } from '../api/locationService';
import { MapPin, Search, X, Loader2, Navigation, Crosshair, Building2, Plane, Train } from 'lucide-react';

const LocationSearchInput = ({
  value,
  onChange,
  onSelect,
  placeholder = "Enter pickup location",
  isPickup = true,
  onUseCurrentLocation = null,
  isDetectingGPS = false,
}) => {
  const [query, setQuery] = useState(value?.name || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  // Sync external value changes
  useEffect(() => {
    if (value?.name) {
      setQuery(value.name);
    }
  }, [value]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchLocations(query);
        setSuggestions(results);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    setQuery(item.name);
    setIsOpen(false);
    onSelect(item);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
  };

  const getLocationIcon = (type) => {
    if (type === 'airport') return <Plane className="w-4 h-4 text-sky-600" />;
    if (type === 'metro' || type === 'transit') return <Train className="w-4 h-4 text-emerald-600" />;
    if (type === 'tech_park') return <Building2 className="w-4 h-4 text-indigo-600" />;
    return <MapPin className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative flex items-center">
        {/* Leading Pin Icon */}
        <div className="absolute left-3 flex items-center justify-center pointer-events-none">
          {isPickup ? (
            <div className="w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-emerald-500/20" />
          ) : (
            <div className="w-3 h-3 rounded-sm bg-rose-600 ring-4 ring-rose-500/20" />
          )}
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={query}
          onFocus={() => {
            setIsOpen(true);
            if (suggestions.length === 0) {
              searchLocations(query).then(setSuggestions);
            }
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-9 pr-16 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-gray-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-inner"
        />

        {/* Right Action Icons (Clear / GPS / Loader) */}
        <div className="absolute right-2 flex items-center space-x-1">
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}

          {query && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
              title="Clear"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {isPickup && onUseCurrentLocation && (
            <button
              type="button"
              onClick={onUseCurrentLocation}
              disabled={isDetectingGPS}
              className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
              title="Detect Present Location (GPS)"
            >
              <Crosshair className={`w-4 h-4 ${isDetectingGPS ? 'animate-spin text-emerald-500' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-gray-100 max-h-60 overflow-y-auto">
          {/* Quick Option: Current GPS Location (For Pickup) */}
          {isPickup && onUseCurrentLocation && (
            <button
              type="button"
              onClick={() => {
                onUseCurrentLocation();
                setIsOpen(false);
              }}
              className="w-full px-3.5 py-2.5 flex items-center space-x-3 hover:bg-emerald-50/70 text-left transition-colors bg-emerald-50/30"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                <Crosshair className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black text-emerald-800 block">
                  Use Present Location (GPS)
                </span>
                <span className="text-[10px] text-emerald-600 truncate block">
                  Accurate real-time sensor positioning
                </span>
              </div>
            </button>
          )}

          {/* Dynamic Suggestion Items */}
          {suggestions.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full px-3.5 py-2.5 flex items-center space-x-3 hover:bg-gray-50 text-left transition-colors group"
            >
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors">
                {getLocationIcon(item.type)}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-gray-900 block truncate group-hover:text-amber-800">
                  {item.name}
                </span>
                <span className="text-[10px] text-gray-500 block truncate">
                  {item.area}
                </span>
              </div>
            </button>
          ))}

          {suggestions.length === 0 && !loading && (
            <div className="px-4 py-3 text-center text-xs text-gray-500">
              No matching locations found. Try typing a street or landmark name.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSearchInput;
