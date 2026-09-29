import { useState, useEffect, useRef, useCallback } from 'react';
import { ANIMATION_STATES, RIDE_TYPES } from '../../data/rideTypes';
import { easeInOutCubic } from './animationUtils';

/**
 * Master Ride Animation Controller Hook
 * Manages the realistic 60 FPS requestAnimationFrame loop, state transitions,
 * dynamic ETA countdown, distance reduction, and vehicle-specific speeds.
 */
export const useRideAnimation = (initialRideType = 'bike', autoStart = false) => {
  const [selectedRideKey, setSelectedRideKey] = useState(initialRideType);
  const [animationState, setAnimationState] = useState(ANIMATION_STATES.SEARCHING);
  const [progress, setProgress] = useState(0); // 0.0 to 1.0 along the SVG path
  const [distanceKm, setDistanceKm] = useState(2.4);
  const [etaMins, setEtaMins] = useState(4);
  const [speedKmh, setSpeedKmh] = useState(0);

  const rideConfig = RIDE_TYPES[selectedRideKey] || RIDE_TYPES.bike;

  // Animation frame and timing references
  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const stateTimerRef = useRef(null);

  // Clean up all timers and animation frames
  const cleanup = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (stateTimerRef.current) {
      clearTimeout(stateTimerRef.current);
      stateTimerRef.current = null;
    }
  }, []);

  // Main 60 FPS motion loop following the route
  const startMovementLoop = useCallback((baseDurationMs) => {
    startTimeRef.current = performance.now();

    const tick = (now) => {
      const elapsed = now - startTimeRef.current;
      const rawT = Math.min(elapsed / baseDurationMs, 1.0);

      // Apply easeInOutCubic for natural acceleration and braking near customer
      const easedT = easeInOutCubic(rawT);
      setProgress(easedT);

      // Calculate dynamic remaining distance
      const remainingDistance = Math.max(0, (1 - easedT) * rideConfig.baseDistanceKm);
      setDistanceKm(Math.round(remainingDistance * 10) / 10);

      // Calculate dynamic ETA synchronized with progress
      const remainingEta = Math.max(0, (1 - easedT) * rideConfig.baseEtaMins);
      setEtaMins(Math.round(remainingEta * 10) / 10);

      // Realistic speed reading (accelerates to ~38 km/h, slows to 0 near stop)
      let curSpeed = 0;
      if (rawT < 0.2) {
        curSpeed = (rawT / 0.2) * 36 * rideConfig.speedMultiplier;
      } else if (rawT < 0.85) {
        curSpeed = 38 * rideConfig.speedMultiplier;
      } else {
        curSpeed = Math.max(0, (1 - (rawT - 0.85) / 0.15) * 36 * rideConfig.speedMultiplier);
      }
      setSpeedKmh(Math.round(curSpeed));

      // State progression checkpoints
      if (easedT >= 1.0) {
        setAnimationState(ANIMATION_STATES.ARRIVED);
        setSpeedKmh(0);
        setDistanceKm(0);
        setEtaMins(0);
        return; // Completed motion
      }

      if (easedT >= 0.92) {
        setAnimationState(ANIMATION_STATES.ARRIVING);
      } else if (easedT >= 0.70) {
        setAnimationState(ANIMATION_STATES.NEARBY);
      } else {
        setAnimationState(ANIMATION_STATES.DRIVER_MOVING);
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, [rideConfig]);

  // Master start sequence
  const startAnimation = useCallback(() => {
    cleanup();
    setProgress(0);
    setDistanceKm(rideConfig.baseDistanceKm);
    setEtaMins(rideConfig.baseEtaMins);
    setSpeedKmh(0);
    setAnimationState(ANIMATION_STATES.SEARCHING);

    // 1. SEARCHING state (1.0s)
    stateTimerRef.current = setTimeout(() => {
      setAnimationState(ANIMATION_STATES.DRIVER_FOUND);

      // 2. DRIVER_FOUND state (0.8s)
      stateTimerRef.current = setTimeout(() => {
        setAnimationState(ANIMATION_STATES.DRIVER_ACCEPTED);

        // 3. DRIVER_ACCEPTED state (1.0s before vehicle departs)
        stateTimerRef.current = setTimeout(() => {
          setAnimationState(ANIMATION_STATES.DRIVER_MOVING);

          // Total travel time inversely proportional to vehicle speedMultiplier
          // Bike (~7.5s), Cab (~8.5s), Auto (~9.5s), Porter (~11.0s)
          const baseDuration = Math.round(7500 / rideConfig.speedMultiplier);
          startMovementLoop(baseDuration);
        }, 1000);
      }, 800);
    }, 1000);
  }, [cleanup, rideConfig, startMovementLoop]);

  // Reset to initial state
  const resetAnimation = useCallback(() => {
    cleanup();
    setProgress(0);
    setDistanceKm(rideConfig.baseDistanceKm);
    setEtaMins(rideConfig.baseEtaMins);
    setSpeedKmh(0);
    setAnimationState(ANIMATION_STATES.SEARCHING);
  }, [cleanup, rideConfig]);

  // Switch vehicle type and automatically restart smooth animation
  const selectRideType = useCallback((typeKey) => {
    if (!RIDE_TYPES[typeKey]) return;
    cleanup();
    setSelectedRideKey(typeKey);
  }, [cleanup]);

  // Replay animation on click
  const replayAnimation = useCallback(() => {
    startAnimation();
  }, [startAnimation]);

  // Cancel ride
  const cancelRide = useCallback(() => {
    cleanup();
    setSpeedKmh(0);
    setAnimationState(ANIMATION_STATES.CANCELLED);
  }, [cleanup]);

  // Auto-start or restart whenever ride type changes
  useEffect(() => {
    startAnimation();
    return cleanup;
  }, [selectedRideKey]);

  // Dynamic user status string
  const getStatusText = useCallback(() => {
    switch (animationState) {
      case ANIMATION_STATES.SEARCHING:
        return `Finding nearby ${rideConfig.name.toLowerCase()} captains...`;
      case ANIMATION_STATES.DRIVER_FOUND:
        return `${rideConfig.driver.name} accepted your request`;
      case ANIMATION_STATES.DRIVER_ACCEPTED:
        return 'Captain is gearing up to leave';
      case ANIMATION_STATES.DRIVER_MOVING:
        return 'Captain is on the way to your pickup';
      case ANIMATION_STATES.NEARBY:
        return `${rideConfig.name} is arriving nearby (almost there)`;
      case ANIMATION_STATES.ARRIVING:
        return 'Arriving at pickup point...';
      case ANIMATION_STATES.ARRIVED:
        return rideConfig.arrivalTitle;
      case ANIMATION_STATES.CANCELLED:
        return 'Ride cancelled';
      default:
        return 'Connecting to driver telemetry...';
    }
  }, [animationState, rideConfig]);

  return {
    rideConfig,
    selectedRideKey,
    selectRideType,
    animationState,
    progress,
    distanceKm,
    etaMins,
    speedKmh,
    statusText: getStatusText(),
    startAnimation,
    replayAnimation,
    resetAnimation,
    cancelRide,
    isArrived: animationState === ANIMATION_STATES.ARRIVED,
    isMoving: animationState === ANIMATION_STATES.DRIVER_MOVING || animationState === ANIMATION_STATES.NEARBY || animationState === ANIMATION_STATES.ARRIVING,
  };
};

export default useRideAnimation;
