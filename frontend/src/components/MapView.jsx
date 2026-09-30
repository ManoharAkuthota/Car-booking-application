import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Layers, Crosshair, Navigation, Compass, ShieldCheck } from 'lucide-react';
import {
  fetchRoadRoute,
  generateRoadRoute,
  calculateBearing,
  getVehicleVisuals,
  samplePolylineWithLaneOffset,
  lerpAngle,
  getPolylineMetrics,
} from '../api/routeService';

// Raw Top-Down Vehicle SVGs (Directly enhanced from reference images)

// 1. Auto Rickshaw: Modeled on reference images with yellow canopy, windshield wiper & star emblem
export const getAutoRickshawRawSvg = () => `
  <svg viewBox="0 0 48 70" width="32" height="46" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="autoCanopy" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#eab308" />
        <stop offset="35%" stop-color="#fde047" />
        <stop offset="70%" stop-color="#facc15" />
        <stop offset="100%" stop-color="#ca8a04" />
      </linearGradient>
      <linearGradient id="autoGlass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1e293b" />
        <stop offset="50%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
    </defs>

    <!-- Front Wheel & Mudguard -->
    <rect x="21" y="2" width="6" height="13" rx="3" fill="#18181b" />
    <rect x="22.5" y="4" width="3" height="9" rx="1.5" fill="#71717a" />
    <path d="M 18 9 L 30 9" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" />

    <!-- Outer Auto Body Silhouette (Wide cabin, tapered nose) -->
    <path d="M 14 16 C 18 10, 30 10, 34 16 L 42 30 C 45 42, 45 54, 43 63 C 41 65, 7 65, 5 63 C 3 54, 3 42, 6 30 Z" fill="#ca8a04" stroke="#09090b" stroke-width="1.8" />
    
    <!-- Black Front Windshield & Cowl -->
    <path d="M 14 16 C 18 13, 30 13, 34 16 L 37 25 C 36 26, 12 26, 11 25 Z" fill="url(#autoGlass)" stroke="#0f172a" stroke-width="1.2" />
    <!-- Glass Reflection Glare -->
    <line x1="17" y1="18" x2="31" y2="21" stroke="#93c5fd" stroke-width="1.8" stroke-linecap="round" opacity="0.85" />
    <!-- Windshield wiper -->
    <line x1="24" y1="24" x2="28" y2="18" stroke="#cbd5e1" stroke-width="1.2" stroke-linecap="round" />

    <!-- Side Chrome/Black Mirrors -->
    <rect x="3" y="20" width="5" height="3" rx="1.5" fill="#18181b" stroke="#71717a" stroke-width="0.8" />
    <rect x="40" y="20" width="5" height="3" rx="1.5" fill="#18181b" stroke="#71717a" stroke-width="0.8" />

    <!-- Signature Rapido Bright Yellow Canopy Roof -->
    <rect x="8" y="25" width="32" height="35" rx="7" fill="url(#autoCanopy)" stroke="#18181b" stroke-width="1.8" />
    <!-- Roof Bevel Accent Lines -->
    <line x1="12" y1="27" x2="12" y2="58" stroke="#fef08a" stroke-width="1.2" stroke-linecap="round" opacity="0.7" />
    <line x1="36" y1="27" x2="36" y2="58" stroke="#a16207" stroke-width="1.2" stroke-linecap="round" opacity="0.6" />

    <!-- Signature White Star on Roof (Exact match to Rapido Image 3) -->
    <g transform="translate(24, 42)">
      <circle cx="0" cy="0" r="8" fill="#eab308" fill-opacity="0.5" />
      <path d="M 0 -6 L 1.8 -1.9 L 6 -1.9 L 2.6 0.7 L 3.8 5 L 0 2.4 L -3.8 5 L -2.6 0.7 L -6 -1.9 L -1.8 -1.9 Z" fill="#ffffff" />
    </g>

    <!-- Rear Cabin Opening & Passenger Seat -->
    <rect x="10" y="60" width="28" height="3" rx="1.5" fill="#18181b" />

    <!-- Dual Red LED Taillights -->
    <rect x="8" y="62" width="7" height="3" rx="1.2" fill="#ef4444" stroke="#7f1d1d" stroke-width="0.6" />
    <rect x="33" y="62" width="7" height="3" rx="1.2" fill="#ef4444" stroke="#7f1d1d" stroke-width="0.6" />
    <rect x="9.5" y="62.5" width="4" height="1.5" rx="0.6" fill="#fca5a5" />
    <rect x="34.5" y="62.5" width="4" height="1.5" rx="0.6" fill="#fca5a5" />
  </svg>
`;

// 2. Bike: Modeled on reference image 2 (top-down rider) & image 5 (yellow helmet with white racing stripe)
export const getBikeRawSvg = () => `
  <svg viewBox="0 0 40 72" width="26" height="46" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bikeHelmet" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fef08a" />
        <stop offset="40%" stop-color="#facc15" />
        <stop offset="100%" stop-color="#eab308" />
      </linearGradient>
      <linearGradient id="scooterBody" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#eab308" />
        <stop offset="50%" stop-color="#fde047" />
        <stop offset="100%" stop-color="#ca8a04" />
      </linearGradient>
    </defs>

    <!-- Front Wheel with Disc & Tire Tread -->
    <rect x="17" y="2" width="6" height="16" rx="3" fill="#18181b" />
    <rect x="18.5" y="4" width="3" height="11" rx="1.5" fill="#71717a" />
    
    <!-- Front Mudguard & Headlamp -->
    <path d="M 14 11 C 14 7, 26 7, 26 11 L 25 18 L 15 18 Z" fill="url(#scooterBody)" stroke="#a16207" stroke-width="0.8" />
    <ellipse cx="20" cy="9" rx="3.5" ry="2" fill="#ffffff" />

    <!-- Chrome Handlebars with Grips & Round Mirrors (Image 2 style) -->
    <path d="M 5 21 L 35 21" stroke="#334155" stroke-width="3" stroke-linecap="round" />
    <!-- Rubber grips -->
    <rect x="3" y="19.5" width="5" height="3" rx="1.5" fill="#0f172a" />
    <rect x="32" y="19.5" width="5" height="3" rx="1.5" fill="#0f172a" />
    <!-- Chrome stem mirrors -->
    <circle cx="3" cy="18" r="2.2" fill="#e2e8f0" stroke="#0f172a" stroke-width="0.8" />
    <circle cx="37" cy="18" r="2.2" fill="#e2e8f0" stroke="#0f172a" stroke-width="0.8" />

    <!-- Scooter Floorboard / Cowl -->
    <path d="M 13 22 L 27 22 L 28 35 L 12 35 Z" fill="url(#scooterBody)" />

    <!-- Rider Shoulders & Arms (Reaching to handlebars as in Image 2) -->
    <path d="M 6 22 L 13 32 L 27 32 L 34 22" stroke="#1e293b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
    <!-- Rider Torso -->
    <ellipse cx="20" cy="36" rx="10" ry="7.5" fill="#0f172a" />

    <!-- Signature Rapido Helmet with White Racing Stripe (Image 5 exact match!) -->
    <circle cx="20" cy="30" r="8" fill="url(#bikeHelmet)" stroke="#18181b" stroke-width="1.2" />
    <!-- White Racing Stripe in Center -->
    <path d="M 18.5 22.2 C 18.5 22.2, 19.5 22, 20 22 C 20.5 22, 21.5 22.2, 21.5 22.2 L 21.5 37.8 C 21.5 37.8, 20.5 38, 20 38 C 19.5 38, 18.5 37.8, 18.5 37.8 Z" fill="#ffffff" />
    <!-- Glossy Visor Slit -->
    <path d="M 15 27 Q 20 24 25 27" stroke="#09090b" stroke-width="2.8" stroke-linecap="round" />
    <!-- Specular visor highlight -->
    <ellipse cx="20" cy="27" rx="3.5" ry="0.8" fill="#93c5fd" opacity="0.8" />

    <!-- Leather Seat (Textured Black) -->
    <path d="M 14 41 C 14 39, 26 39, 26 41 L 25 54 L 15 54 Z" fill="#18181b" rx="2" />
    <line x1="16" y1="47" x2="24" y2="47" stroke="#3f3f46" stroke-width="1" />

    <!-- Rear Rack & Taillight -->
    <rect x="16" y="53" width="8" height="5" rx="1.5" fill="#334155" />
    <!-- Rear Wheel -->
    <rect x="17" y="55" width="6" height="15" rx="3" fill="#18181b" />
    <!-- Bright Red Taillight -->
    <rect x="16.5" y="54" width="7" height="3" rx="1.5" fill="#ef4444" />
    <rect x="18" y="54.5" width="4" height="1.5" rx="0.75" fill="#fca5a5" />
  </svg>
`;

// 3. Cab: Modeled directly on reference image 1 (Yellow Taxi & Modern Sedan)
export const getCabRawSvg = () => `
  <svg viewBox="0 0 42 76" width="28" height="50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="carBody" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#f8fafc" />
        <stop offset="50%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#e2e8f0" />
      </linearGradient>
      <linearGradient id="carGlass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="50%" stop-color="#1e293b" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
    </defs>

    <!-- Aerodynamic Sedan Body (Image 1 style) -->
    <rect x="5" y="6" width="32" height="64" rx="11" fill="url(#carBody)" stroke="#18181b" stroke-width="2" />
    
    <!-- Front Bumper & Headlights (Amber/Yellow LED projector) -->
    <path d="M 8 13 C 12 8, 30 8, 34 13" stroke="#cbd5e1" stroke-width="1.8" />
    <rect x="7" y="7" width="6" height="3.5" rx="1.5" fill="#fef08a" stroke="#ca8a04" stroke-width="0.8" />
    <rect x="29" y="7" width="6" height="3.5" rx="1.5" fill="#fef08a" stroke="#ca8a04" stroke-width="0.8" />

    <!-- Front Curved Windshield with Glass Specular Glare -->
    <path d="M 8 20 C 13 18, 29 18, 34 20 L 32 30 L 10 30 Z" fill="url(#carGlass)" />
    <line x1="12" y1="22" x2="30" y2="28" stroke="#93c5fd" stroke-width="2" stroke-linecap="round" opacity="0.75" />

    <!-- Side Mirrors with Reflective Glass -->
    <rect x="1" y="21" width="4" height="5" rx="2" fill="#18181b" />
    <rect x="2" y="22" width="2" height="3" rx="1" fill="#93c5fd" />
    <rect x="37" y="21" width="4" height="5" rx="2" fill="#18181b" />
    <rect x="38" y="22" width="2" height="3" rx="1" fill="#93c5fd" />

    <!-- Roof with Taxi Bar Sign (Image 1 Yellow Taxi style) -->
    <rect x="10" y="30" width="22" height="23" rx="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1" />
    <!-- Amber/Yellow Illuminated TAXI bar sign -->
    <rect x="15" y="38" width="12" height="5" rx="2.5" fill="#f59e0b" stroke="#18181b" stroke-width="1.2" />
    <rect x="17" y="39.5" width="8" height="2" rx="1" fill="#fef08a" />

    <!-- Rear Window with Defroster Lines -->
    <path d="M 10 53 L 32 53 L 34 61 C 29 63, 13 63, 8 61 Z" fill="url(#carGlass)" />
    <line x1="12" y1="57" x2="30" y2="57" stroke="#334155" stroke-width="1" />

    <!-- Rear Trunk & LED Taillights -->
    <rect x="7" y="67" width="7" height="3" rx="1.2" fill="#ef4444" stroke="#7f1d1d" stroke-width="0.8" />
    <rect x="28" y="67" width="7" height="3" rx="1.2" fill="#ef4444" stroke="#7f1d1d" stroke-width="0.8" />
    <rect x="8.5" y="67.5" width="4" height="1.5" rx="0.75" fill="#fca5a5" />
    <rect x="29.5" y="67.5" width="4" height="1.5" rx="0.75" fill="#fca5a5" />
  </svg>
`;

// 4. Porter: Modeled directly on reference image 1 (Pickup truck & mini-truck with cargo bed)
export const getPorterRawSvg = () => `
  <svg viewBox="0 0 44 78" width="28" height="52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="truckCabin" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#1d4ed8" />
        <stop offset="50%" stop-color="#3b82f6" />
        <stop offset="100%" stop-color="#1e40af" />
      </linearGradient>
      <linearGradient id="cargoBed" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#94a3b8" />
        <stop offset="100%" stop-color="#64748b" />
      </linearGradient>
    </defs>

    <!-- Front Bumper & Bullbar -->
    <rect x="6" y="3" width="32" height="5" rx="2.5" fill="#18181b" />
    <rect x="8" y="4" width="5" height="2.5" rx="1" fill="#fef08a" />
    <rect x="31" y="4" width="5" height="2.5" rx="1" fill="#fef08a" />

    <!-- Driver Cabin (Curved aerodynamic front) -->
    <path d="M 6 8 C 6 6, 38 6, 38 8 L 38 27 L 6 27 Z" fill="url(#truckCabin)" stroke="#09090b" stroke-width="1.8" />
    <!-- Windshield -->
    <path d="M 9 9 L 35 9 L 34 20 L 10 20 Z" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
    <line x1="12" y1="12" x2="32" y2="16" stroke="#93c5fd" stroke-width="2" stroke-linecap="round" opacity="0.8" />

    <!-- Truck Large Side Mirrors -->
    <rect x="2" y="13" width="4" height="6" rx="2" fill="#18181b" stroke="#64748b" stroke-width="0.8" />
    <rect x="38" y="13" width="4" height="6" rx="2" fill="#18181b" stroke="#64748b" stroke-width="0.8" />

    <!-- Corrugated Cargo Bed (Image 1 style pickup bed) -->
    <rect x="5" y="28" width="34" height="44" rx="4" fill="url(#cargoBed)" stroke="#334155" stroke-width="2" />
    
    <!-- Wooden Cargo Crates & Parcel Boxes Stacked Inside Bed -->
    <rect x="8" y="32" width="13" height="18" rx="2" fill="#d97706" stroke="#78350f" stroke-width="1.2" />
    <line x1="8" y1="32" x2="21" y2="50" stroke="#78350f" stroke-width="1" />
    
    <rect x="23" y="32" width="13" height="18" rx="2" fill="#b45309" stroke="#451a03" stroke-width="1.2" />
    <line x1="23" y1="50" x2="36" y2="32" stroke="#451a03" stroke-width="1" />
    
    <rect x="9" y="52" width="26" height="16" rx="2" fill="#92400e" stroke="#451a03" stroke-width="1.2" />

    <!-- Vibrant Yellow Ratchet Straps (Securing cargo) -->
    <line x1="5" y1="41" x2="39" y2="41" stroke="#facc15" stroke-width="2" stroke-dasharray="4 2" />
    <line x1="5" y1="60" x2="39" y2="60" stroke="#facc15" stroke-width="2" stroke-dasharray="4 2" />

    <!-- Rear Tailgate & Taillights -->
    <rect x="5" y="70" width="7" height="3" rx="1" fill="#ef4444" />
    <rect x="32" y="70" width="7" height="3" rx="1" fill="#ef4444" />
  </svg>
`;

// Exact Rapido Pickup Marker (Green Circle with Ring)
const pickupIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center pointer-events-none">
      <div class="absolute w-10 h-10 rounded-full bg-emerald-500/25 animate-ping"></div>
      <div class="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center ring-4 ring-emerald-500/30">
        <div class="w-2.5 h-2.5 rounded-full bg-white"></div>
      </div>
      <div class="absolute -bottom-2 w-1.5 h-2.5 bg-emerald-800 rounded-b"></div>
    </div>
  `,
  className: 'rapido-pickup-marker',
  iconSize: [32, 42],
  iconAnchor: [16, 38],
});

// Exact Rapido Dropoff Target Marker (Red Bullseye)
const dropoffIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center pointer-events-none">
      <div class="w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-xl flex items-center justify-center ring-4 ring-rose-500/30">
        <div class="w-4 h-4 rounded-full bg-white flex items-center justify-center">
          <div class="w-2 h-2 rounded-full bg-rose-600"></div>
        </div>
      </div>
      <div class="absolute -bottom-2 w-1.5 h-2.5 bg-rose-800 rounded-b"></div>
    </div>
  `,
  className: 'rapido-dropoff-marker',
  iconSize: [32, 42],
  iconAnchor: [16, 38],
});

// Unified Rotated Vehicle Marker Generator:
// Clean top-down vehicle sprite with realistic soft ambient ground contact shadow
export const createRotatedVehicleIcon = ({
  category = 'BIKE',
  heading = 0,
  isArrived = false,
  isLive = false,
}) => {
  let rawSvg = '';
  let size = [32, 50];
  let anchor = [16, 25];

  if (category === 'AUTO') {
    rawSvg = getAutoRickshawRawSvg();
    size = [34, 50];
    anchor = [17, 25];
  } else if (category === 'CAB' || category === 'SEDAN' || category === 'SUV') {
    rawSvg = getCabRawSvg();
    size = [30, 54];
    anchor = [15, 27];
  } else if (category === 'TROLLEY_PORTER') {
    rawSvg = getPorterRawSvg();
    size = [32, 56];
    anchor = [16, 28];
  } else {
    // BIKE
    rawSvg = getBikeRawSvg();
    size = [28, 50];
    anchor = [14, 25];
  }

  if (isArrived) {
    return L.divIcon({
      html: `
        <div class="rapido-vehicle-outer" style="position: relative; width: ${size[0]}px; height: ${size[1]}px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 56px; height: 56px; border-radius: 50%; background: radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(16, 185, 129, 0.06) 70%, transparent 100%); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div class="rapido-vehicle-rotator" style="transform: rotate(${heading}deg); transform-origin: center center; width: ${size[0]}px; height: ${size[1]}px; filter: drop-shadow(0 6px 12px rgba(0,0,0,0.48));">
            ${rawSvg}
          </div>
          <div style="position: absolute; top: -16px; left: 50%; transform: translateX(-50%); white-space: nowrap; padding: 2.5px 8px; border-radius: 9999px; background: linear-gradient(135deg, #059669, #047857); color: #ffffff; font-size: 9px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; box-shadow: 0 4px 10px rgba(0,0,0,0.35); border: 1.5px solid #ffffff; z-index: 10;">
            Arrived
          </div>
        </div>
      `,
      className: 'rapido-vehicle-arrived',
      iconSize: size,
      iconAnchor: anchor,
    });
  }

  return L.divIcon({
    html: `
      <div class="rapido-vehicle-outer" style="position: relative; width: ${size[0]}px; height: ${size[1]}px; display: flex; align-items: center; justify-content: center;">
        <div class="rapido-vehicle-rotator" style="width: ${size[0]}px; height: ${size[1]}px; transform: rotate(${heading}deg); transform-origin: center center; filter: drop-shadow(0 5px 8px rgba(0,0,0,0.38)) drop-shadow(0 1px 3px rgba(0,0,0,0.24)); will-change: transform;">
          ${rawSvg}
        </div>
      </div>
    `,
    className: isLive ? 'rapido-vehicle-live' : 'rapido-vehicle-nearby',
    iconSize: size,
    iconAnchor: anchor,
  });
};

// Convenient wrappers for Explore & Live Trip markers
export const getNearbyIcon = (type = 'BIKE', heading = 0) => {
  return createRotatedVehicleIcon({
    category: type,
    heading,
    isArrived: false,
    isLive: false,
  });
};

export const createLiveVehicleIcon = (category = 'BIKE', heading = 0, isArrived = false) => {
  return createRotatedVehicleIcon({
    category,
    heading,
    isArrived,
    isLive: true,
  });
};

// Map click handler component to place pins dynamically
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

// Auto-center and fit bounds component
const AutoFitBounds = ({ boundsPoints, triggerRecenter }) => {
  const map = useMap();

  useEffect(() => {
    if (boundsPoints && boundsPoints.length >= 2) {
      const bounds = L.latLngBounds(boundsPoints);
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 16,
        animate: true,
      });
    } else if (boundsPoints && boundsPoints.length === 1) {
      map.setView(boundsPoints[0], 14, { animate: true });
    }
  }, [map, boundsPoints, triggerRecenter]);

  return null;
};

// Map Tile Providers (Google Maps Roadmap and Satellite)
const MAP_LAYERS = {
  google_roadmap: {
    id: 'google_roadmap',
    name: 'Google Map',
    url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; Google Maps',
    maxZoom: 20,
  },
  google_satellite: {
    id: 'google_satellite',
    name: 'Satellite',
    url: 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; Google Maps Satellite',
    maxZoom: 20,
  },
};

// Generate realistic dynamic street cruising drivers around pickup point
const generateNearbyDrivers = (centerCoord, type) => {
  if (!centerCoord || !centerCoord[0]) return [];
  // 10 realistic street road offsets and street directions around center (matching Rapido Image 3)
  const streetSpots = [
    { offsetLat: 0.0016, offsetLng: 0.0022, heading: 45 },
    { offsetLat: 0.0024, offsetLng: -0.0018, heading: 135 },
    { offsetLat: -0.0018, offsetLng: 0.0025, heading: 90 },
    { offsetLat: 0.0031, offsetLng: 0.0012, heading: 210 },
    { offsetLat: -0.0025, offsetLng: -0.0020, heading: 315 },
    { offsetLat: 0.0012, offsetLng: -0.0028, heading: 60 },
    { offsetLat: -0.0020, offsetLng: 0.0032, heading: 180 },
    { offsetLat: 0.0035, offsetLng: -0.0025, heading: 270 },
    { offsetLat: -0.0010, offsetLng: -0.0015, heading: 120 },
    { offsetLat: 0.0020, offsetLng: 0.0035, heading: 330 },
  ];

  return streetSpots.map((spot, idx) => ({
    id: `${type}-${idx}`,
    type: type,
    baseLat: centerCoord[0] + spot.offsetLat,
    baseLng: centerCoord[1] + spot.offsetLng,
    lat: centerCoord[0] + spot.offsetLat,
    lng: centerCoord[1] + spot.offsetLng,
    heading: spot.heading,
    step: idx * 1.5,
    eta: idx % 2 === 0 ? 1 : idx % 3 === 0 ? 3 : 2,
  }));
};

const MapView = ({
  pickup = [12.9716, 77.5946],
  dropoff = [13.0358, 77.5970],
  category = 'BIKE',
  isLiveTrip = false,
  tripStatus = null, // 'REQUESTED' | 'ACCEPTED' | 'DRIVER_ARRIVING' | 'IN_PROGRESS' | 'COMPLETED'
  className = "h-[340px]",
  onLocateMe = null,
  onMapClick = null,
  pickupAddress = "Pickup Point",
  dropoffAddress = "Destination Drop-off",
  onDriverArrived = null,
  onTripCompleted = null,
}) => {
  const [selectedLayer, setSelectedLayer] = useState('google_roadmap');
  const [recenterCount, setRecenterCount] = useState(0);

  // Normalize category to vehicle type
  const vehicleType = useMemo(() => {
    if (category === 'BIKE') return 'BIKE';
    if (category === 'AUTO') return 'AUTO';
    if (category === 'TROLLEY_PORTER') return 'TROLLEY_PORTER';
    return 'CAB';
  }, [category]);

  const visuals = useMemo(() => getVehicleVisuals(vehicleType), [vehicleType]);

  // Synchronously compute initial road route to guarantee 0ms latency
  const initialTripRoute = useMemo(
    () => generateRoadRoute(pickup, dropoff),
    [pickup?.[0], pickup?.[1], dropoff?.[0], dropoff?.[1]]
  );

  const [tripRoadPoints, setTripRoadPoints] = useState(() => initialTripRoute.points);
  const [tripDistanceKm, setTripDistanceKm] = useState(() => initialTripRoute.distanceKm);

  // Approach Route (Driver -> Pickup when ACCEPTED) dynamically relative to pickup
  const driverStartPos = useMemo(
    () => [pickup[0] + 0.0078, pickup[1] - 0.0068],
    [pickup?.[0], pickup?.[1]]
  );

  const initialApproachRoute = useMemo(
    () => generateRoadRoute(driverStartPos, pickup),
    [driverStartPos, pickup?.[0], pickup?.[1]]
  );

  const [approachRoadPoints, setApproachRoadPoints] = useState(() => initialApproachRoute.points);

  // Refs for high-performance direct Leaflet DOM mutation (60 FPS, Zero React thrashing)
  const liveMarkerRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTelemetryUpdateRef = useRef(0);
  const headingTrackerRef = useRef(0);

  // Live Vehicle Animated Position & Heading (Initializes immediately)
  const [liveVehiclePos, setLiveVehiclePos] = useState(() => {
    if (tripStatus === 'ACCEPTED') return initialApproachRoute.points[0] || driverStartPos;
    if (tripStatus === 'DRIVER_ARRIVING') return pickup;
    if (tripStatus === 'IN_PROGRESS') return initialTripRoute.points[0] || pickup;
    if (tripStatus === 'COMPLETED') return dropoff;
    return pickup;
  });

  const [liveHeading, setLiveHeading] = useState(() => {
    if (initialApproachRoute.points.length >= 2) {
      return calculateBearing(
        initialApproachRoute.points[0][0], initialApproachRoute.points[0][1],
        initialApproachRoute.points[1][0], initialApproachRoute.points[1][1]
      );
    }
    return 45;
  });
  const [liveEtaMins, setLiveEtaMins] = useState(3);
  const [liveRemainingKm, setLiveRemainingKm] = useState(1.2);

  // Non-blocking background route upgrade from OSRM
  useEffect(() => {
    let isCancelled = false;
    const upgradeRoutes = async () => {
      if (!pickup || !dropoff) return;

      const tripRes = await fetchRoadRoute(pickup, dropoff);
      if (!isCancelled && tripRes.points.length > 0) {
        setTripRoadPoints(tripRes.points);
        setTripDistanceKm(tripRes.distanceKm);
      }

      if (isLiveTrip && (tripStatus === 'ACCEPTED' || tripStatus === 'DRIVER_ARRIVING')) {
        const approachRes = await fetchRoadRoute(driverStartPos, pickup);
        if (!isCancelled && approachRes.points.length > 0) {
          setApproachRoadPoints(approachRes.points);
        }
      }
    };

    upgradeRoutes();
    return () => {
      isCancelled = true;
    };
  }, [pickup?.[0], pickup?.[1], dropoff?.[0], dropoff?.[1], isLiveTrip, tripStatus, driverStartPos]);

  // High-performance 60 FPS Direct Leaflet Marker Mutation Engine
  useEffect(() => {
    if (!isLiveTrip) return;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    // Phase 1: ACCEPTED -> Driving along approach road towards Pickup
    if (tripStatus === 'ACCEPTED') {
      const route = approachRoadPoints.length > 0 ? approachRoadPoints : initialApproachRoute.points;
      if (!route || route.length < 2) return;

      const metrics = getPolylineMetrics(route);
      const totalDist = metrics.totalDistance || 1200;
      const durationMs = 12000; // Realistic 12-second approach drive

      const initialH = calculateBearing(route[0][0], route[0][1], route[1][0], route[1][1]);
      headingTrackerRef.current = initialH;
      setLiveVehiclePos(route[0]);
      setLiveHeading(initialH);

      if (liveMarkerRef.current) {
        liveMarkerRef.current.setLatLng(route[0]);
        const el = liveMarkerRef.current.getElement();
        if (el) {
          const rotator = el.querySelector('.rapido-vehicle-rotator');
          if (rotator) rotator.style.transform = `rotate(${initialH}deg)`;
        }
      }

      let startTime = null;

      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const rawProgress = Math.min(1.0, elapsed / durationMs);

        // Sample India left lane (2.5m offset)
        const sampled = samplePolylineWithLaneOffset(route, rawProgress, metrics, 2.5);
        const ahead = samplePolylineWithLaneOffset(route, Math.min(1.0, rawProgress + 0.025), metrics, 2.5);

        if (sampled) {
          headingTrackerRef.current = lerpAngle(headingTrackerRef.current, sampled.heading, 0.28);

          // Realistic motorcycle lean physics when cornering
          let leanCss = '';
          if (vehicleType === 'BIKE' && ahead) {
            const turnDiff = ((ahead.heading - sampled.heading + 540) % 360) - 180;
            const lean = Math.max(-4, Math.min(4, turnDiff * 0.12));
            if (Math.abs(lean) > 0.5) {
              leanCss = ` skewX(${lean.toFixed(1)}deg)`;
            }
          }

          // DIRECT LEAFLET HARDWARE MUTATION (Zero React re-render thrashing!)
          if (liveMarkerRef.current) {
            liveMarkerRef.current.setLatLng([sampled.lat, sampled.lng]);
            const el = liveMarkerRef.current.getElement();
            if (el) {
              const rotator = el.querySelector('.rapido-vehicle-rotator');
              if (rotator) {
                rotator.style.transform = `rotate(${headingTrackerRef.current}deg)${leanCss}`;
              }
            }
          }

          // Throttled Telemetry Update (1 Hz)
          const now = performance.now();
          if (now - lastTelemetryUpdateRef.current >= 900) {
            const remFraction = 1.0 - rawProgress;
            const remKm = Math.round((totalDist / 1000) * remFraction * 10) / 10;
            const eta = Math.max(1, Math.round(remKm * 2.2));
            setLiveRemainingKm(remKm);
            setLiveEtaMins(eta);
            lastTelemetryUpdateRef.current = now;
          }
        }

        if (rawProgress < 1.0) {
          animFrameRef.current = requestAnimationFrame(step);
        } else {
          // Reached Pickup
          if (liveMarkerRef.current) {
            liveMarkerRef.current.setLatLng(pickup);
          }
          setLiveVehiclePos(pickup);
          setLiveRemainingKm(0);
          setLiveEtaMins(0);
          if (onDriverArrived) {
            onDriverArrived();
          }
        }
      };

      animFrameRef.current = requestAnimationFrame(step);
      return () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };
    }

    // Phase 2: DRIVER_ARRIVING -> At Pickup
    if (tripStatus === 'DRIVER_ARRIVING') {
      if (liveMarkerRef.current) {
        liveMarkerRef.current.setLatLng(pickup);
      }
      setLiveVehiclePos(pickup);
      setLiveRemainingKm(0);
      setLiveEtaMins(0);
      return;
    }

    // Phase 3: IN_PROGRESS -> Driving along main road towards Dropoff
    if (tripStatus === 'IN_PROGRESS') {
      const route = tripRoadPoints.length > 0 ? tripRoadPoints : initialTripRoute.points;
      if (!route || route.length < 2) return;

      const metrics = getPolylineMetrics(route);
      const totalDist = metrics.totalDistance || (tripDistanceKm * 1000);
      const durationMs = 18000; // Realistic 18-second main trip drive

      const initialH = calculateBearing(route[0][0], route[0][1], route[1][0], route[1][1]);
      headingTrackerRef.current = initialH;
      setLiveVehiclePos(route[0]);
      setLiveHeading(initialH);

      if (liveMarkerRef.current) {
        liveMarkerRef.current.setLatLng(route[0]);
        const el = liveMarkerRef.current.getElement();
        if (el) {
          const rotator = el.querySelector('.rapido-vehicle-rotator');
          if (rotator) rotator.style.transform = `rotate(${initialH}deg)`;
        }
      }

      let startTime = null;

      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const rawProgress = Math.min(1.0, elapsed / durationMs);

        // Sample India left lane (2.5m offset)
        const sampled = samplePolylineWithLaneOffset(route, rawProgress, metrics, 2.5);
        const ahead = samplePolylineWithLaneOffset(route, Math.min(1.0, rawProgress + 0.025), metrics, 2.5);

        if (sampled) {
          headingTrackerRef.current = lerpAngle(headingTrackerRef.current, sampled.heading, 0.28);

          // Realistic motorcycle lean physics when cornering
          let leanCss = '';
          if (vehicleType === 'BIKE' && ahead) {
            const turnDiff = ((ahead.heading - sampled.heading + 540) % 360) - 180;
            const lean = Math.max(-4, Math.min(4, turnDiff * 0.12));
            if (Math.abs(lean) > 0.5) {
              leanCss = ` skewX(${lean.toFixed(1)}deg)`;
            }
          }

          // DIRECT LEAFLET HARDWARE MUTATION
          if (liveMarkerRef.current) {
            liveMarkerRef.current.setLatLng([sampled.lat, sampled.lng]);
            const el = liveMarkerRef.current.getElement();
            if (el) {
              const rotator = el.querySelector('.rapido-vehicle-rotator');
              if (rotator) {
                rotator.style.transform = `rotate(${headingTrackerRef.current}deg)${leanCss}`;
              }
            }
          }

          // Throttled Telemetry Update (1 Hz)
          const now = performance.now();
          if (now - lastTelemetryUpdateRef.current >= 900) {
            const remFraction = 1.0 - rawProgress;
            const remKm = Math.round(tripDistanceKm * remFraction * 10) / 10;
            const eta = Math.max(1, Math.round(remKm * 2.1));
            setLiveRemainingKm(remKm);
            setLiveEtaMins(eta);
            lastTelemetryUpdateRef.current = now;
          }
        }

        if (rawProgress < 1.0) {
          animFrameRef.current = requestAnimationFrame(step);
        } else {
          // Reached Dropoff
          if (liveMarkerRef.current) {
            liveMarkerRef.current.setLatLng(dropoff);
          }
          setLiveVehiclePos(dropoff);
          setLiveRemainingKm(0);
          setLiveEtaMins(0);
          if (onTripCompleted) {
            onTripCompleted();
          }
        }
      };

      animFrameRef.current = requestAnimationFrame(step);
      return () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };
    }

    // Phase 4: COMPLETED -> At Destination
    if (tripStatus === 'COMPLETED') {
      if (liveMarkerRef.current) {
        liveMarkerRef.current.setLatLng(dropoff);
      }
      setLiveVehiclePos(dropoff);
      setLiveRemainingKm(0);
      setLiveEtaMins(0);
    }
  }, [
    isLiveTrip,
    tripStatus,
    pickup,
    dropoff,
    vehicleType,
    onDriverArrived,
    onTripCompleted,
  ]);

  // Explore Mode: Nearby active patrolling vehicles cruising around Pickup (Smooth 4 Hz update)
  const [nearbyVehicles, setNearbyVehicles] = useState(() =>
    generateNearbyDrivers(pickup, vehicleType)
  );

  useEffect(() => {
    if (pickup && pickup[0]) {
      setNearbyVehicles(generateNearbyDrivers(pickup, vehicleType));
    }
  }, [pickup?.[0], pickup?.[1], vehicleType]);

  useEffect(() => {
    if (isLiveTrip) return;

    const timer = setInterval(() => {
      setNearbyVehicles((prev) =>
        prev.map((v) => {
          const newStep = v.step + 0.12;
          const drift = Math.sin(newStep) * 0.0004;
          const currentHeading = Math.cos(newStep) >= 0 ? v.heading : (v.heading + 180) % 360;
          const rad = (currentHeading * Math.PI) / 180;
          return {
            ...v,
            step: newStep,
            lat: v.baseLat + Math.cos(rad) * drift,
            lng: v.baseLng + Math.sin(rad) * drift,
            heading: currentHeading,
          };
        })
      );
    }, 250);

    return () => {
      clearInterval(timer);
    };
  }, [isLiveTrip]);

  // Determine bounds points for map auto-center (Stable framing - no jitter!)
  const boundsPoints = useMemo(() => {
    if (isLiveTrip) {
      if (tripStatus === 'ACCEPTED') {
        return [driverStartPos, pickup];
      }
      if (tripStatus === 'DRIVER_ARRIVING') {
        return [pickup];
      }
      if (tripStatus === 'IN_PROGRESS') {
        return [pickup, dropoff];
      }
      if (tripStatus === 'COMPLETED') {
        return [dropoff];
      }
    }
    if (pickup && dropoff) return [pickup, dropoff];
    if (pickup) return [pickup];
    return [[12.9716, 77.5946]];
  }, [
    isLiveTrip,
    tripStatus,
    pickup?.[0],
    pickup?.[1],
    dropoff?.[0],
    dropoff?.[1],
    driverStartPos?.[0],
    driverStartPos?.[1],
  ]);

  const currentTileConfig = MAP_LAYERS[selectedLayer] || MAP_LAYERS.google_roadmap;

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-gray-200 shadow-md ${className}`}>
      <MapContainer
        center={pickup || [12.9716, 77.5946]}
        zoom={14}
        scrollWheelZoom={true}
        className="h-full w-full z-0 cursor-crosshair"
      >
        <TileLayer
          key={currentTileConfig.id}
          url={currentTileConfig.url}
          subdomains={currentTileConfig.subdomains}
          attribution={currentTileConfig.attribution}
          maxZoom={currentTileConfig.maxZoom}
        />

        <MapClickHandler onMapClick={onMapClick} />
        <AutoFitBounds boundsPoints={boundsPoints} triggerRecenter={recenterCount} />

        {/* Pickup Pin */}
        {pickup && (
          <Marker position={pickup} icon={pickupIcon}>
            <Popup className="text-gray-900 font-bold text-xs">
              <strong>📍 Pickup: {pickupAddress}</strong>
              <p className="text-[10px] text-gray-500 font-normal">Drivers will meet you here</p>
            </Popup>
          </Marker>
        )}

        {/* Dropoff Pin */}
        {dropoff && (
          <Marker position={dropoff} icon={dropoffIcon}>
            <Popup className="text-gray-900 font-bold text-xs">
              <strong>🏁 Destination: {dropoffAddress}</strong>
            </Popup>
          </Marker>
        )}

        {/* Approach Route Polyline (Driver -> Pickup when ACCEPTED) */}
        {isLiveTrip && tripStatus === 'ACCEPTED' && approachRoadPoints.length > 0 && (
          <>
            <Polyline
              positions={approachRoadPoints}
              color="#0284c7"
              weight={7}
              opacity={0.3}
            />
            <Polyline
              positions={approachRoadPoints}
              color="#0284c7"
              weight={4.5}
              opacity={0.95}
              dashArray="6, 8"
            />
          </>
        )}

        {/* Main Trip Real Road Polyline (Pickup -> Dropoff) */}
        {tripRoadPoints.length > 0 && (
          <>
            <Polyline
              positions={tripRoadPoints}
              color="#1e293b"
              weight={7}
              opacity={0.25}
            />
            <Polyline
              positions={tripRoadPoints}
              color="#334155"
              weight={5.5}
              opacity={0.95}
              dashArray={isLiveTrip && tripStatus !== 'IN_PROGRESS' ? '8, 8' : null}
            />
          </>
        )}

        {/* Explore Mode: ONLY Nearby Drivers of the Selected Category actively moving around Pickup */}
        {!isLiveTrip && pickup && nearbyVehicles.map((v) => (
          <Marker
            key={v.id}
            position={[v.lat, v.lng]}
            icon={getNearbyIcon(v.type, v.heading)}
          >
            <Popup className="text-gray-900 font-bold text-[11px]">
              <div className="space-y-0.5">
                <p className="font-extrabold text-xs text-gray-950 flex items-center space-x-1">
                  <span>{visuals.emoji} Nearby {visuals.label} Pilot</span>
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold">⚡ ~{v.eta} mins to pickup</p>
                <p className="text-[10px] text-gray-500 font-normal">⭐ 4.9 Verified Pilot • Cruising nearby</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Live Trip Mode: Auto-Moving Animated Vehicle with Heading Rotation */}
        {isLiveTrip && liveVehiclePos && (
          <Marker
            ref={liveMarkerRef}
            position={liveVehiclePos}
            icon={createLiveVehicleIcon(
              category,
              liveHeading,
              tripStatus === 'DRIVER_ARRIVING'
            )}
          >
            <Popup className="text-gray-900 font-bold text-xs">
              <div className="space-y-1">
                <p className="font-black text-sm flex items-center space-x-1.5">
                  <span>{visuals.emoji}</span>
                  <span>{visuals.label} Pilot</span>
                </p>
                {tripStatus === 'ACCEPTED' && (
                  <p className="text-xs text-cyan-800 font-bold">
                    🚀 En route to pickup • ~{liveEtaMins}m ({liveRemainingKm} km)
                  </p>
                )}
                {tripStatus === 'DRIVER_ARRIVING' && (
                  <p className="text-xs text-emerald-700 font-bold">
                    📍 Arrived at your pickup point!
                  </p>
                )}
                {tripStatus === 'IN_PROGRESS' && (
                  <p className="text-xs text-emerald-700 font-bold">
                    🟢 Trip in Progress • Destination ETA ~{liveEtaMins}m
                  </p>
                )}
                {tripStatus === 'COMPLETED' && (
                  <p className="text-xs text-brand-700 font-bold">
                    🏁 Destination Reached!
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Top Floating Map Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center space-x-2">
        <div className="bg-white/95 backdrop-blur-md rounded-xl border border-gray-200 p-1 flex items-center space-x-1 shadow-md text-[11px] font-bold text-gray-700">
          <button
            type="button"
            onClick={() => setSelectedLayer('google_roadmap')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              selectedLayer === 'google_roadmap'
                ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                : 'hover:text-gray-950 hover:bg-gray-100'
            }`}
          >
            Map
          </button>
          <button
            type="button"
            onClick={() => setSelectedLayer('google_satellite')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              selectedLayer === 'google_satellite'
                ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                : 'hover:text-gray-950 hover:bg-gray-100'
            }`}
          >
            Satellite
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onLocateMe) onLocateMe();
            setRecenterCount((c) => c + 1);
          }}
          className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 flex items-center justify-center text-emerald-600 hover:text-emerald-700 shadow-md active:scale-90 transition-all"
          title="Detect live GPS location & re-center"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Top-Left Floating Live Status Telemetry Pill */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-gray-200 shadow-md flex items-center space-x-2 text-xs font-extrabold text-gray-950 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        {!isLiveTrip && (
          <span>
            {visuals.emoji} 6 {visuals.label}s near pickup <strong className="text-emerald-700 font-semibold">• ~2-3 mins away</strong>
          </span>
        )}
        {isLiveTrip && tripStatus === 'ACCEPTED' && (
          <span>
            {visuals.emoji} Pilot arriving in <strong className="text-cyan-700">~{liveEtaMins}m</strong> ({liveRemainingKm} km away)
          </span>
        )}
        {isLiveTrip && tripStatus === 'DRIVER_ARRIVING' && (
          <span className="text-emerald-700">
            📍 {visuals.emoji} Pilot arrived at pickup • Ready to board
          </span>
        )}
        {isLiveTrip && tripStatus === 'IN_PROGRESS' && (
          <span>
            {visuals.emoji} En route to destination <strong className="text-emerald-700">• ETA ~{liveEtaMins}m</strong> ({liveRemainingKm} km)
          </span>
        )}
        {isLiveTrip && tripStatus === 'COMPLETED' && (
          <span className="text-brand-700">
            🏁 Trip Completed
          </span>
        )}
      </div>

      {/* Bottom Floating Telemetry Pill */}
      <div className="absolute bottom-3 left-3 z-[1000] px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-mono text-gray-700 flex items-center space-x-2 border border-gray-200 shadow-md pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">
          Live GPS Telemetry Active
        </span>
      </div>
    </div>
  );
};

export default MapView;
