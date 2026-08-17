import { ZONES } from './constants.js';

// Renders the 7-zone shot-direction picker. Returns a controller with
// .disable()/.reset() so callers can lock it once a zone is chosen.
export function createDirectionGrid(container, { onSelect, label = 'Choose your shot' } = {}) {
  container.innerHTML = `
    <div class="dir-label">${label}</div>
    <div class="dir-grid" role="group" aria-label="Shot direction"></div>
  `;
  const grid = container.querySelector('.dir-grid');
  const cellMap = new Map();
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const zone = ZONES.find((z) => z.row === row && z.col === col);
      const cell = document.createElement('button');
      if (!zone) {
        cell.className = 'dir-cell dir-empty';
        cell.disabled = true;
        cell.tabIndex = -1;
      } else {
        cell.className = 'dir-cell';
        cell.type = 'button';
        cell.dataset.zone = zone.id;
        cell.setAttribute('aria-label', zone.label);
        cell.innerHTML = `<span>${zone.label}</span>`;
        cell.addEventListener('click', () => {
          if (cell.disabled) return;
          grid.querySelectorAll('.dir-cell').forEach((c) => c.classList.remove('selected'));
          cell.classList.add('selected');
          onSelect?.(zone);
        });
        cellMap.set(zone.id, cell);
      }
      grid.appendChild(cell);
    }
  }
  return {
    disableAll() {
      cellMap.forEach((c) => { c.disabled = true; });
    },
    highlight(zoneId, cls) {
      cellMap.get(zoneId)?.classList.add(cls);
    },
    reset() {
      cellMap.forEach((c) => { c.disabled = false; c.classList.remove('selected', 'result-good', 'result-bad'); });
    },
  };
}

// Renders a tap-to-stop power meter. speedMs is time for one full 0->100->0
// sweep; faster = harder to time. Calling controller.stop() manually
// (e.g. from a keyboard/touch handler) locks the value and fires onStop.
export function createPowerMeter(container, { speedMs = 950, onStop, sweetCenter = 76, sweetWidth = 24 } = {}) {
  container.innerHTML = `
    <div class="power-label">Hold power, tap to strike</div>
    <div class="power-track">
      <div class="power-sweet" style="left:${Math.max(0, sweetCenter - sweetWidth / 2)}%;width:${sweetWidth}%"></div>
      <div class="power-fill" id="power-fill"></div>
      <div class="power-marker" id="power-marker"></div>
    </div>
    <button class="btn primary power-btn" id="power-stop">STRIKE!</button>
  `;
  const marker = container.querySelector('#power-marker');
  const fill = container.querySelector('#power-fill');
  const btn = container.querySelector('#power-stop');
  let start = performance.now();
  let raf = null;
  let stopped = false;

  function frame(now) {
    if (stopped) return;
    const t = ((now - start) % speedMs) / speedMs;
    const value = t < 0.5 ? t * 2 * 100 : (1 - t) * 2 * 100;
    marker.style.left = `${value}%`;
    fill.style.width = `${value}%`;
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  function stop() {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    const value = parseFloat(marker.style.left) || 0;
    btn.disabled = true;
    onStop?.(value);
  }
  btn.addEventListener('click', stop);

  return {
    stop,
    cancel() {
      stopped = true;
      cancelAnimationFrame(raf);
    },
  };
}

// Fast three-way dive picker for Goalkeeper Mode: a shrinking timer ring
// and left/center/right buttons. Resolves with { side, reactionMs } or
// { side: null } if the player didn't react in time.
export function createDiveReactionPrompt(container, { windowMs = 850, onResolve } = {}) {
  container.innerHTML = `
    <div class="dive-label">DIVE!</div>
    <div class="dive-timer"><div class="dive-timer-fill" id="dive-timer-fill"></div></div>
    <div class="dive-buttons">
      <button class="btn dive-btn" data-side="left">&#8592; LEFT</button>
      <button class="btn dive-btn" data-side="center">STAY</button>
      <button class="btn dive-btn" data-side="right">RIGHT &#8594;</button>
    </div>
  `;
  const start = performance.now();
  const fillEl = container.querySelector('#dive-timer-fill');
  let done = false;
  let raf = null;

  function frame(now) {
    if (done) return;
    const remaining = Math.max(0, 1 - (now - start) / windowMs);
    fillEl.style.width = `${remaining * 100}%`;
    if (remaining <= 0) {
      finish(null);
      return;
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  function finish(side) {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    const reactionMs = performance.now() - start;
    container.querySelectorAll('.dive-btn').forEach((b) => { b.disabled = true; });
    onResolve?.({ side, reactionMs, windowMs });
  }

  container.querySelectorAll('.dive-btn').forEach((b) => {
    b.addEventListener('click', () => finish(b.dataset.side));
  });

  return { cancel() { done = true; cancelAnimationFrame(raf); } };
}
