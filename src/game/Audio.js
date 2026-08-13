// Lightweight procedural sound effects using the WebAudio API - no external
// audio assets required.
export class GameAudio {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('turbo-dodge-muted') === '1';
    this.engineNode = null;
    this.engineGain = null;
  }

  ensureCtx() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctx();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  setMuted(muted) {
    this.muted = muted;
    localStorage.setItem('turbo-dodge-muted', muted ? '1' : '0');
    if (this.engineGain) this.engineGain.gain.value = muted ? 0 : this._engineTargetGain || 0;
  }

  startEngine() {
    if (this.muted) return;
    const ctx = this.ensureCtx();
    if (this.engineNode) return;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    const gain = ctx.createGain();
    gain.gain.value = 0.0;
    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.frequency.value = 60;
    osc.start();
    this.engineNode = osc;
    this.engineFilter = filter;
    this.engineGain = gain;
  }

  updateEngine(speedRatio) {
    if (!this.engineNode) return;
    const target = this.muted ? 0 : 0.05 + speedRatio * 0.05;
    this._engineTargetGain = target;
    this.engineGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.08);
    this.engineNode.frequency.setTargetAtTime(55 + speedRatio * 140, this.ctx.currentTime, 0.08);
    this.engineFilter.frequency.setTargetAtTime(300 + speedRatio * 900, this.ctx.currentTime, 0.08);
  }

  stopEngine() {
    if (!this.engineNode) return;
    try {
      this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      this.engineNode.stop(this.ctx.currentTime + 0.3);
    } catch (e) {}
    this.engineNode = null;
    this.engineGain = null;
  }

  _tone(freq, duration, type = 'sine', gainValue = 0.2, delay = 0) {
    if (this.muted) return;
    const ctx = this.ensureCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = 0;
    osc.connect(gain).connect(ctx.destination);
    const t0 = ctx.currentTime + delay;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(gainValue, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }

  laneSwitch() {
    this._tone(520, 0.08, 'triangle', 0.12);
  }

  crash() {
    if (this.muted) return;
    const ctx = this.ensureCtx();
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    const gain = ctx.createGain();
    gain.gain.value = 0.5;
    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start();
    this._tone(90, 0.5, 'square', 0.25);
  }

  levelUp() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => this._tone(f, 0.35, 'triangle', 0.18, i * 0.09));
  }

  countdownBeep(final = false) {
    this._tone(final ? 880 : 440, final ? 0.3 : 0.15, 'sine', 0.2);
  }
}
