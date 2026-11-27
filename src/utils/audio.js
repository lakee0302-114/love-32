// Web Audio API Sound Generator for Love8 Ultra
// No external assets required - 100% reliable offline & instant

class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.ambientOsc = null;
    this.sirenInterval = null;
    this.sirenOsc = null;
    this.sirenGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Mobile device romantic haptic vibration
  triggerVibration(pattern = [120, 60, 120]) {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  // Realistic double-thump heartbeat sound
  playHeartbeat() {
    this.triggerVibration([100, 50, 120]);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // First thump (lub)
    this.createThump(now, 65, 0.12, 0.4);
    // Second thump (dub)
    this.createThump(now + 0.14, 52, 0.16, 0.3);
  }

  createThump(time, freq, duration, gainVal) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + duration);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  // Sweet romantic chime when sending/receiving love
  playChime() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.18, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.5);
    });
  }

  // Cute kiss / pop sound
  playKissPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.09);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Playful pet action sound
  playPetAction() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [350, 520, 700];

    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.06);

      gain.gain.setValueAtTime(0.15, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.2);
    });
  }

  // Celebration success chime for goals/bucket list
  playSuccess() {
    this.triggerVibration([80, 40, 80, 40, 150]);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880, 1108.73]; // A major arpeggio
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.2, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.65);
    });
  }

  // Playful study nudge alert ("Wada karapan! 📖")
  playNudge() {
    this.triggerVibration([200, 100, 200, 100, 300]);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [587.33, 880, 1174.66, 880, 1174.66].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0.18, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.13);
    });
  }

  // Study Timer Finish Chime
  playTimerDone() {
    this.triggerVibration([150, 80, 150, 80, 300]);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C major
    const now = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.22, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.85);
    });
  }

  // Study Ambient Sound Synthesis (Rain / Library White Noise / Warm Lo-Fi Pulse)
  startAmbient(type = 'rain') {
    this.stopAmbient();
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      if (type === 'rain' || type === 'whitenoise') {
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
        filter.frequency.value = type === 'rain' ? 850 : 1200;

        const gain = this.ctx.createGain();
        gain.gain.value = 0.12;

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        whiteNoise.start();
        this.ambientNode = { source: whiteNoise, gain };
      } else if (type === 'lofi') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 130.81; // C3 warm drone

        gain.gain.value = 0.08;
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        this.ambientNode = { source: osc, gain };
      }
    } catch (e) {
      console.warn('Ambient sound error', e);
    }
  }

  // Remote Siren Alarm (Urgent finder / waking alarm)
  playRemoteSiren() {
    this.stopRemoteSiren();
    this.init();
    if (!this.ctx) return;

    try {
      // Periodic intense haptic vibration
      this.triggerVibration([500, 200, 500, 200, 1000]);

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.35, now);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();

      this.sirenOsc = osc;
      this.sirenGain = gain;

      // Frequency wobble (siren up/down sweep)
      let high = false;
      const wobble = () => {
        if (!this.ctx || !this.sirenOsc) return;
        const curTime = this.ctx.currentTime;
        const targetFreq = high ? 1250 : 650;
        this.sirenOsc.frequency.cancelScheduledValues(curTime);
        this.sirenOsc.frequency.linearRampToValueAtTime(targetFreq, curTime + 0.35);
        high = !high;
        this.triggerVibration([300, 150]);
      };

      wobble();
      this.sirenInterval = setInterval(wobble, 380);
    } catch (e) {
      console.warn('Error playing siren:', e);
    }
  }

  stopRemoteSiren() {
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }
    if (this.sirenOsc) {
      try {
        this.sirenOsc.stop();
        this.sirenOsc.disconnect();
      } catch (e) {}
      this.sirenOsc = null;
    }
    if (this.sirenGain) {
      try {
        this.sirenGain.disconnect();
      } catch (e) {}
      this.sirenGain = null;
    }
  }

  // Futuristic Laser Click Sound (For Remote Pointer)
  playLaserClick() {
    this.triggerVibration([40]);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.08);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  // Strobe Ping / Flash Sound
  playStrobePing() {
    this.triggerVibration([80, 50, 80]);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {}
  }

  // Soft Peaceful Bedtime Chime
  playSleepLullaby() {
    this.triggerVibration([100, 100, 200]);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [392, 440, 523.25, 659.25]; // G4, A4, C5, E5
      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.2);

        gain.gain.setValueAtTime(0.12, now + idx * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.2 + 0.9);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.2);
        osc.stop(now + idx * 0.2 + 0.95);
      });
    } catch (e) {}
  }

  stopAmbient() {
    if (this.ambientNode) {
      try {
        this.ambientNode.source.stop();
        this.ambientNode.source.disconnect();
      } catch (e) {}
      this.ambientNode = null;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) this.stopAmbient();
    return this.isMuted;
  }
}

export const soundManager = new SoundManager();
