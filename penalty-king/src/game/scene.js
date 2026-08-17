import { ZONES } from './core/constants.js';

const ZONE_POS = {}; // filled in resize() as fractions of goal box
for (const z of ZONES) {
  const xFrac = z.col === 0 ? 0.12 : z.col === 1 ? 0.5 : 0.88;
  const yFrac = z.row === 0 ? 0.08 : z.row === 1 ? 0.52 : 0.92;
  ZONE_POS[z.id] = { xFrac, yFrac };
}

export class PenaltyScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.confettiParticles = [];
    this.resize();
    this._raf = null;
    this._crowdPhase = 0;
    this.idleLoop();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const w = Math.max(280, rect.width);
    const h = Math.max(220, Math.min(rect.height, w * 0.66));
    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.W = w;
    this.H = h;
    this.goal = { x: w * 0.15, y: h * 0.1, w: w * 0.7, h: h * 0.38 };
    this.spot = { x: w * 0.5, y: h * 0.88 };
  }

  idleLoop() {
    const step = () => {
      this._crowdPhase += 0.01;
      this.drawStatic({ keeperSide: 'center', ballAt: 0, runner: 0 });
      this._raf = requestAnimationFrame(step);
    };
    cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(step);
  }

  stopLoop() {
    cancelAnimationFrame(this._raf);
  }

  drawBackground() {
    const { ctx, W, H } = this;
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#0a1f14');
    sky.addColorStop(1, '#0e2a1c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // crowd band
    const crowdH = H * 0.14;
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, W, crowdH);
    for (let i = 0; i < 60; i++) {
      const x = (i / 60) * W + Math.sin(this._crowdPhase * 3 + i) * 2;
      const y = (i % 3) * (crowdH / 3) + 4 + Math.sin(this._crowdPhase * 5 + i * 1.7) * 2;
      ctx.fillStyle = i % 4 === 0 ? '#22c55e' : i % 3 === 0 ? '#f8fafc' : '#374151';
      ctx.beginPath();
      ctx.arc(x, y + 6, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // pitch
    const pitchTop = crowdH;
    const pitchGrad = ctx.createLinearGradient(0, pitchTop, 0, H);
    pitchGrad.addColorStop(0, '#15803d');
    pitchGrad.addColorStop(1, '#0f5c30');
    ctx.fillStyle = pitchGrad;
    ctx.fillRect(0, pitchTop, W, H - pitchTop);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i < 8; i++) {
      if (i % 2 === 0) ctx.fillRect(0, pitchTop + (i / 8) * (H - pitchTop), W, (H - pitchTop) / 8);
    }

    // penalty arc
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(this.spot.x, this.spot.y - 10, W * 0.16, H * 0.05, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawGoal() {
    const { ctx, goal } = this;
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(goal.x, goal.y + goal.h);
    ctx.lineTo(goal.x, goal.y);
    ctx.lineTo(goal.x + goal.w, goal.y);
    ctx.lineTo(goal.x + goal.w, goal.y + goal.h);
    ctx.stroke();

    // net
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 1;
    const cols = 12;
    const rows = 7;
    for (let i = 1; i < cols; i++) {
      const x = goal.x + (i / cols) * goal.w;
      ctx.beginPath();
      ctx.moveTo(x, goal.y);
      ctx.lineTo(x, goal.y + goal.h);
      ctx.stroke();
    }
    for (let i = 1; i < rows; i++) {
      const y = goal.y + (i / rows) * goal.h;
      ctx.beginPath();
      ctx.moveTo(goal.x, y);
      ctx.lineTo(goal.x + goal.w, y);
      ctx.stroke();
    }
  }

  drawKeeper(commitSide, diveProgress = 0, dived = false, action = 'idle') {
    const { ctx, goal } = this;
    const cx = goal.x + goal.w / 2;
    const cy = goal.y + goal.h * 0.72;
    let offsetX = 0;
    let lean = 0;
    if (dived) {
      const target = commitSide === 'left' ? -goal.w * 0.34 : commitSide === 'right' ? goal.w * 0.34 : 0;
      offsetX = target * diveProgress;
      lean = (commitSide === 'left' ? -1 : commitSide === 'right' ? 1 : 0) * diveProgress * 0.9;
    }
    ctx.save();
    ctx.translate(cx + offsetX, cy);
    ctx.rotate(lean * 0.9);
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    // body
    ctx.beginPath();
    ctx.roundRect(-9, -6, 18, 28, 6);
    ctx.fill();
    ctx.stroke();
    // arms
    ctx.beginPath();
    ctx.roundRect(-26, -4, 18, 8, 4);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(8, -4, 18, 8, 4);
    ctx.fill();
    ctx.stroke();
    // head
    ctx.beginPath();
    ctx.fillStyle = '#fde68a';
    ctx.arc(0, -14, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  drawStriker(runProgress) {
    const { ctx, spot } = this;
    const y = spot.y + 32 - runProgress * 40;
    const x = spot.x - 26 + runProgress * 26;
    ctx.save();
    ctx.translate(x, y);
    const legSwing = Math.sin(runProgress * Math.PI * 5) * 8;
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(legSwing * 0.4, 16);
    ctx.moveTo(0, 0);
    ctx.lineTo(-legSwing * 0.4, 16);
    ctx.stroke();
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.roundRect(-6, -18, 12, 20, 4);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = '#fde68a';
    ctx.arc(0, -24, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawBall(x, y, r = 8, spin = 0) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(spin);
    ctx.beginPath();
    ctx.fillStyle = '#f8fafc';
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#1f2937';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  ballTargetFor(zoneId) {
    const { goal } = this;
    const p = ZONE_POS[zoneId] || ZONE_POS.C;
    return { x: goal.x + p.xFrac * goal.w, y: goal.y + p.yFrac * goal.h };
  }

  drawStatic({ ballAt = 0, keeperSide = 'center' } = {}) {
    this.drawBackground();
    this.drawGoal();
    this.drawKeeper(keeperSide, 0, false);
    this.drawBall(this.spot.x, this.spot.y, 9);
    this.drawStriker(0);
  }

  spawnConfetti(n = 60) {
    this.confettiParticles = [];
    const colors = ['#facc15', '#22c55e', '#ef4444', '#3b82f6', '#f8fafc', '#a855f7'];
    for (let i = 0; i < n; i++) {
      this.confettiParticles.push({
        x: Math.random() * this.W,
        y: -20 - Math.random() * 100,
        vy: 2 + Math.random() * 3,
        vx: (Math.random() - 0.5) * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 4,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
      });
    }
  }

  drawConfetti() {
    const { ctx, H } = this;
    this.confettiParticles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });
    this.confettiParticles = this.confettiParticles.filter((p) => p.y < H + 30);
  }

  /**
   * Plays the full run-up -> strike -> flight -> dive -> result sequence.
   * shot: { zoneId, keeperSide, result, shotType }
   */
  async playSequence(shot, { onPhase } = {}) {
    this.stopLoop();
    const { zoneId, keeperSide, result, shotType = 'normal' } = shot;
    const target = this.ballTargetFor(zoneId);
    const showConfetti = result === 'GOAL';

    await this._animate(550, (t) => {
      this.drawBackground();
      this.drawGoal();
      this.drawKeeper('center', 0, false);
      this.drawBall(this.spot.x, this.spot.y, 9);
      this.drawStriker(t);
    });
    onPhase?.('strike');

    // flight + dive together
    const flightMs = shotType === 'panenka' ? 900 : 480;
    const diveDelay = shotType === 'panenka' ? 0.55 : 0.18;
    await this._animate(flightMs, (t) => {
      this.drawBackground();
      this.drawGoal();
      const diveT = Math.max(0, Math.min(1, (t - diveDelay) / (1 - diveDelay)));
      const dived = keeperSide !== null && diveT > 0;
      this.drawKeeper(keeperSide || 'center', this._ease(diveT), dived);

      const bx = this.spot.x + (target.x - this.spot.x) * t;
      let by;
      if (shotType === 'panenka') {
        const arc = Math.sin(t * Math.PI) * 60;
        by = this.spot.y + (target.y - this.spot.y) * t - arc;
      } else if (shotType === 'low') {
        by = this.spot.y + (target.y - this.spot.y) * Math.pow(t, 0.85);
      } else {
        const arc = Math.sin(t * Math.PI) * 18;
        by = this.spot.y + (target.y - this.spot.y) * t - arc;
      }
      this.drawBall(bx, by, 9, t * 10);
      this.drawStriker(1);
    });
    onPhase?.('result');

    await this._animate(650, (t) => {
      this.drawBackground();
      this.drawGoal();
      this.drawKeeper(keeperSide || 'center', 1, keeperSide !== null);
      this._drawResultFrame(result, target, t);
      this.drawStriker(1);
      if (showConfetti) {
        if (t < 0.05) this.spawnConfetti(70);
        this.drawConfetti();
      }
    });

    this.idleLoop();
  }

  _drawResultFrame(result, target, t) {
    const { ctx, goal } = this;
    if (result === 'GOAL') {
      const wobble = Math.sin(t * 20) * (1 - t) * 4;
      this.drawBall(target.x + wobble, target.y, 9);
      ctx.fillStyle = `rgba(34,197,94,${0.5 * (1 - t)})`;
      ctx.beginPath();
      ctx.arc(target.x, target.y, 30 + t * 20, 0, Math.PI * 2);
      ctx.fill();
    } else if (result === 'SAVE') {
      const bx = target.x + (target.x > goal.x + goal.w / 2 ? 20 : -20) * t;
      this.drawBall(bx, target.y - 10 * t, 9);
    } else if (result === 'POST') {
      this.drawBall(target.x + (target.x > goal.x + goal.w / 2 ? -1 : 1) * 14 * t, target.y + 10 * t, 9);
      if (t < 0.15) {
        ctx.strokeStyle = '#fde68a';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(target.x, target.y, 16, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (result === 'CROSSBAR') {
      this.drawBall(target.x, goal.y + 14 * t, 9);
    } else {
      const bx = target.x + (target.x > this.W / 2 ? 1 : -1) * 60 * t;
      const by = target.y - 40 * t;
      this.drawBall(bx, by, 9);
    }
  }

  _ease(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  _animate(durationMs, draw) {
    return new Promise((resolve) => {
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / durationMs);
        draw(t);
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
  }
}
