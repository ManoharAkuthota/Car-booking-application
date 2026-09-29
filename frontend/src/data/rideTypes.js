/**
 * Ride Types Data Specification for Realistic Ride-Booking Animation System
 * Contains configurations, speeds, pricing, and driver metadata for:
 * 1. 🏍️ Bike (Rapido Bike Taxi)
 * 2. 🛺 Auto (Auto Rickshaw)
 * 3. 🚗 Cab (DrivePulse Prime Cab)
 * 4. 🛻 Porter (Goods & Cargo Mini-Truck)
 */

export const RIDE_TYPES = {
  bike: {
    id: 'bike',
    name: 'Bike',
    title: 'Rapido Bike',
    subtitle: 'Fastest commute • Beat city traffic',
    symbol: '🏍️',
    tag: 'Fastest',
    tagColor: 'bg-amber-100 text-amber-900 border-amber-300',
    basePrice: 45,
    strikePrice: 55,
    speedMultiplier: 1.0, // Fastest, nimble on city roads
    baseEtaMins: 4,
    baseDistanceKm: 2.4,
    capacity: '1 Person',
    accentColor: '#f59e0b',
    themeColor: 'amber',
    arrivalTitle: 'Your captain has arrived',
    arrivalSubtitle: 'Captain Rajesh is waiting at your pickup location with a sanitized helmet.',
    driver: {
      name: 'Rajesh Kumar',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      rating: 4.92,
      trips: '1,420 trips',
      vehicleModel: 'Honda Activa 6G',
      plateNumber: 'KA 01 EK 4921',
      vehicleColor: 'Matte Grey',
      phone: '+91 98450 12345',
      safetyBadge: 'Sanitized Helmet Verified',
    },
    // Custom SVG route coordinates through city avenues
    routePathD: 'M 140 90 C 180 90, 240 100, 290 140 C 340 180, 360 250, 390 290 C 420 330, 480 340, 520 380 C 560 420, 570 470, 550 510 C 530 550, 470 560, 440 600 C 410 640, 430 700, 460 740',
  },

  auto: {
    id: 'auto',
    name: 'Auto',
    title: 'Rapido Auto',
    subtitle: 'Doorstep pickup • Upfront meter fare',
    symbol: '🛺',
    tag: 'Popular',
    tagColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    basePrice: 80,
    strikePrice: 95,
    speedMultiplier: 0.78, // Medium speed, maneuverable 3-wheeler
    baseEtaMins: 6,
    baseDistanceKm: 2.4,
    capacity: '3 Seats',
    accentColor: '#10b981',
    themeColor: 'emerald',
    arrivalTitle: 'Your auto has arrived',
    arrivalSubtitle: 'Driver Suresh has arrived at your doorstep. No bargaining needed.',
    driver: {
      name: 'Suresh Gowda',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      rating: 4.86,
      trips: '2,890 trips',
      vehicleModel: 'Bajaj RE Compact 4S',
      plateNumber: 'KA 04 B 8820',
      vehicleColor: 'Yellow & Green',
      phone: '+91 98860 99881',
      safetyBadge: 'Metered Upfront Guarantee',
    },
    routePathD: 'M 140 90 C 180 90, 240 100, 290 140 C 340 180, 360 250, 390 290 C 420 330, 480 340, 520 380 C 560 420, 570 470, 550 510 C 530 550, 470 560, 440 600 C 410 640, 430 700, 460 740',
  },

  cab: {
    id: 'cab',
    name: 'Cab',
    title: 'DrivePulse Cab',
    subtitle: 'Air-conditioned comfort • Top rated pilots',
    symbol: '🚗',
    tag: 'Affordable AC',
    tagColor: 'bg-blue-100 text-blue-900 border-blue-300',
    basePrice: 150,
    strikePrice: 175,
    speedMultiplier: 0.88, // Smooth, steady cruiser
    baseEtaMins: 5,
    baseDistanceKm: 2.4,
    capacity: '4 Seats • AC',
    accentColor: '#3b82f6',
    themeColor: 'blue',
    arrivalTitle: 'Your driver has arrived',
    arrivalSubtitle: 'Captain Vikramaditya is waiting outside in a clean AC sedan.',
    driver: {
      name: 'Vikramaditya Rao',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      rating: 4.95,
      trips: '980 trips',
      vehicleModel: 'Maruti Suzuki Dzire AC',
      plateNumber: 'KA 05 MN 3012',
      vehicleColor: 'Pearl White',
      phone: '+91 99001 54321',
      safetyBadge: 'Commercial License & Shield',
    },
    routePathD: 'M 140 90 C 180 90, 240 100, 290 140 C 340 180, 360 250, 390 290 C 420 330, 480 340, 520 380 C 560 420, 570 470, 550 510 C 530 550, 470 560, 440 600 C 410 640, 430 700, 460 740',
  },

  porter: {
    id: 'porter',
    name: 'Porter',
    title: 'Porter Cargo',
    subtitle: 'Mini-truck for logistics, furniture & goods',
    symbol: '🛻',
    tag: 'Cargo & Shifting',
    tagColor: 'bg-purple-100 text-purple-900 border-purple-300',
    basePrice: 220,
    strikePrice: 260,
    speedMultiplier: 0.68, // Sturdy, heavier vehicle
    baseEtaMins: 7,
    baseDistanceKm: 2.4,
    capacity: 'Max 750 kg',
    accentColor: '#8b5cf6',
    themeColor: 'purple',
    arrivalTitle: 'Your Porter has arrived',
    arrivalSubtitle: 'Driver Manjunath is ready at your pickup spot with loading trolley assistance.',
    driver: {
      name: 'Manjunath Swamy',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      rating: 4.82,
      trips: '640 trips',
      vehicleModel: 'Tata Ace Gold (750kg)',
      plateNumber: 'KA 01 TR 7500',
      vehicleColor: 'Royal Blue',
      phone: '+91 97400 88210',
      safetyBadge: 'Heavy Transit Cargo Insurance',
    },
    routePathD: 'M 140 90 C 180 90, 240 100, 290 140 C 340 180, 360 250, 390 290 C 420 330, 480 340, 520 380 C 560 420, 570 470, 550 510 C 530 550, 470 560, 440 600 C 410 640, 430 700, 460 740',
  },
};

export const ANIMATION_STATES = {
  SEARCHING: 'SEARCHING',
  DRIVER_FOUND: 'DRIVER_FOUND',
  DRIVER_ACCEPTED: 'DRIVER_ACCEPTED',
  DRIVER_MOVING: 'DRIVER_MOVING',
  NEARBY: 'NEARBY',
  ARRIVING: 'ARRIVING',
  ARRIVED: 'ARRIVED',
  CANCELLED: 'CANCELLED',
};
