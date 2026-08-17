// Small procedural WebAudio SFX engine — no external audio files needed.
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    try {
      this.muted = localStorage.getItem('penaltyking_muted') === '1';
    } catch { /* ignore */ }
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  toggleMute() {
    this.muted = !this.muted;
    try {
      localStorage.setItem('penaltyking_muted', this.muted ? '1' : '0');
    } catch { /* ignore */ }
    return this.muted;
  }

  _tone(freq, duration, type = 'sine', gainStart = 0.2, when = 0) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + when);
    gain.gain.setValueAtTime(gainStart, ctx.currentTime + when);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + when + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + when);
    osc.stop(ctx.currentTime + when + duration);
  }

  _noise(duration, gainStart = 0.15, filterFreq = 1200) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainStart, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  }

  click() { this._tone(720, 0.06, 'square', 0.08); }
  select() { this._tone(520, 0.08, 'sine', 0.12); }
  kick() { this._tone(160, 0.18, 'triangle', 0.3); this._noise(0.08, 0.1, 2000); }
  whoosh() { this._noise(0.35, 0.06, 600); }
  goal() {
    this._tone(523, 0.15, 'sine', 0.25, 0);
    this._tone(659, 0.15, 'sine', 0.25, 0.1);
    this._tone(784, 0.3, 'sine', 0.3, 0.2);
    this._noise(0.6, 0.12, 1800);
  }
  save() { this._tone(180, 0.12, 'sawtooth', 0.25); this._noise(0.15, 0.15, 900); }
  post() { this._tone(1000, 0.2, 'square', 0.2); this._tone(1400, 0.15, 'square', 0.12, 0.05); }
  miss() { this._tone(200, 0.3, 'sawtooth', 0.15); }
  whistle() { this._tone(1800, 0.35, 'sine', 0.18); }
  crowdRoar() { this._noise(1.1, 0.18, 500); }
  crowdGroan() { this._noise(0.8, 0.12, 300); }
  levelUp() {
    this._tone(440, 0.12, 'sine', 0.2, 0);
    this._tone(554, 0.12, 'sine', 0.2, 0.1);
    this._tone(659, 0.2, 'sine', 0.25, 0.2);
  }
  trophy() {
    [523, 659, 784, 1046].forEach((f, i) => this._tone(f, 0.25, 'sine', 0.22, i * 0.12));
  }
}

export const audio = new AudioEngine();
