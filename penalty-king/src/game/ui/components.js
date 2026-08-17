export function initials(name) {
  return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export function clubBadgeHTML(club, size = 44) {
  if (!club) {
    return `<div class="badge" style="width:${size}px;height:${size}px;background:#334155">YA</div>`;
  }
  return `<div class="badge" style="width:${size}px;height:${size}px;background:linear-gradient(145deg, ${club.c1}, ${club.c2});color:${textColorFor(club.c1)};font-size:${size * 0.34}px">${initials(club.name)}</div>`;
}

function textColorFor(hex) {
  if (!hex) return '#0b1e14';
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#0b1e14' : '#f8fafc';
}

export function attrBar(label, value, max = 99) {
  const pct = Math.min(100, (value / max) * 100);
  const color = value >= 85 ? '#22c55e' : value >= 65 ? '#facc15' : value >= 45 ? '#fb923c' : '#ef4444';
  return `
    <div class="attr-row">
      <span class="attr-label">${label}</span>
      <div class="attr-track"><div class="attr-fill" style="width:${pct}%;background:${color}"></div></div>
      <span class="attr-value">${Math.round(value)}</span>
    </div>`;
}

export function playerCardHTML(p) {
  return `
    <div class="player-card">
      <div class="player-card-top">
        <div class="pc-rating">${p.rating}</div>
        <div class="pc-pos">ST</div>
      </div>
      <div class="pc-avatar">⚽</div>
      <div class="pc-name">${p.name}</div>
      <div class="pc-club">${p.club || ''}</div>
      <div class="pc-attrs">
        <div>ACC <b>${p.attrs.accuracy}</b></div>
        <div>PWR <b>${p.attrs.power}</b></div>
        <div>CMP <b>${p.attrs.composure}</b></div>
        <div>TEC <b>${p.attrs.technique}</b></div>
        <div>WF <b>${p.attrs.weakFoot}</b></div>
      </div>
    </div>`;
}

export function starCardHTML(star) {
  return `
    <div class="player-card star">
      <div class="player-card-top">
        <div class="pc-rating">${Math.round((star.accuracy + star.power + star.composure + star.technique) / 4)}</div>
        <div class="pc-pos">${star.badge}</div>
      </div>
      <div class="pc-avatar">⭐</div>
      <div class="pc-name">${star.name}</div>
      <div class="pc-club">${star.nation}</div>
      <div class="pc-attrs">
        <div>ACC <b>${star.accuracy}</b></div>
        <div>PWR <b>${star.power}</b></div>
        <div>CMP <b>${star.composure}</b></div>
        <div>TEC <b>${star.technique}</b></div>
      </div>
    </div>`;
}

let toastTimer = null;
export function toast(msg, opts = {}) {
  let el = document.getElementById('pk-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'pk-toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = `pk-toast show ${opts.type || ''}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), opts.duration || 2600);
}

export function showAchievementPopup(a) {
  const el = document.createElement('div');
  el.className = 'achievement-popup';
  el.innerHTML = `
    <div class="ap-icon">${a.icon}</div>
    <div class="ap-text"><div class="ap-title">Achievement Unlocked</div><div class="ap-name">${a.name}</div></div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 500);
  }, 3400);
}

export function pressureMeta(pressure) {
  if (pressure >= 0.85) return { label: 'MAXIMUM PRESSURE', color: '#ef4444' };
  if (pressure >= 0.6) return { label: 'HIGH PRESSURE', color: '#fb923c' };
  if (pressure >= 0.35) return { label: 'MODERATE PRESSURE', color: '#facc15' };
  return { label: 'LOW PRESSURE', color: '#22c55e' };
}

export function resultBanner(result) {
  const map = {
    GOAL: { text: 'GOAL!!', cls: 'result-goal' },
    SAVE: { text: 'SAVED!', cls: 'result-save' },
    MISS: { text: 'MISS!', cls: 'result-miss' },
    POST: { text: 'OFF THE POST!', cls: 'result-miss' },
    CROSSBAR: { text: 'OFF THE BAR!', cls: 'result-miss' },
  };
  return map[result] || { text: result, cls: '' };
}
