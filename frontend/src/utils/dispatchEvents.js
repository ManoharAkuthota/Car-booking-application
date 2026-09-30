// Dynamic Cross-Role & Cross-Tab Realtime Event Bus
// Synchronizes Rider requests and Driver acceptances instantaneously

const CHANNEL_NAME = 'drivepulse_dispatch_bus';

let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  // BroadcastChannel unavailable fallback
}

export const emitDispatchEvent = (eventData) => {
  const payload = {
    ...eventData,
    timestamp: Date.now(),
  };

  // 1. Same-window CustomEvent dispatch
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('drivepulse_event', { detail: payload }));
  }

  // 2. Cross-tab BroadcastChannel
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(payload);
    } catch (e) {}
  }

  // 3. LocalStorage fallback for older multi-window setups
  try {
    localStorage.setItem('drivepulse_last_dispatch_event', JSON.stringify(payload));
  } catch (e) {}
};

export const subscribeToDispatchEvents = (callback) => {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e) => {
    if (e.detail) callback(e.detail);
  };

  const handleBroadcastMessage = (e) => {
    if (e.data) callback(e.data);
  };

  const handleStorageChange = (e) => {
    if (e.key === 'drivepulse_last_dispatch_event' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        callback(parsed);
      } catch (err) {}
    }
  };

  window.addEventListener('drivepulse_event', handleCustomEvent);

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcastMessage);
  }

  window.addEventListener('storage', handleStorageChange);

  return () => {
    window.removeEventListener('drivepulse_event', handleCustomEvent);
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcastMessage);
    }
    window.removeEventListener('storage', handleStorageChange);
  };
};
