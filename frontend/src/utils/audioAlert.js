// Web Audio API Synthesizer - Universal zero-dependency sound engine
// Works offline across all modern desktop and mobile browsers without MP3/WAV assets

class DispatchSoundEngine {
  constructor() {
    this.ctx = null;
    this.intervalId = null;
    this.isPlaying = false;
    this.isMuted = false;
  }

  init() {
    if (this.isMuted) return;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (err) {
      console.warn('AudioContext init error:', err);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopAlertRingtone();
    }
    return this.isMuted;
  }

  // Double-tone alert chime (Rapido / Uber dispatch style)
  playBeep() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Pulse 1: 880 Hz (A5 tone)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1175, now + 0.12);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Pulse 2: 1320 Hz (High attention alert)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1320, now + 0.14);
      osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.3);
      gain2.gain.setValueAtTime(0.35, now + 0.14);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.14);
      osc2.stop(now + 0.3);
    } catch (e) {
      // Audio playback restrictions fallback
    }
  }

  // Harmonic chord played when ride is accepted
  playSuccessChime() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major Chord (C5, E5, G5, C6)

      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.06;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch (e) {
      // Audio fallback
    }
  }

  // Continuous dispatch alert looping until accepted/declined
  startAlertRingtone() {
    if (this.isMuted || this.isPlaying) return;
    this.isPlaying = true;
    this.playBeep();
    this.intervalId = setInterval(() => {
      if (this.isPlaying && !this.isMuted) {
        this.playBeep();
      }
    }, 1600);
  }

  stopAlertRingtone() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const dispatchSound = new DispatchSoundEngine();
