import { PenaltyScene } from './scene.js';
import { createDirectionGrid, createPowerMeter } from './core/penaltyInput.js';
import { resolvePlayerShot, SHOT_PROFILES } from './core/engine.js';
import { resultBanner, pressureMeta } from './ui/components.js';
import { audio } from './audio.js';

const SHOT_TYPE_META = {
  normal: { label: 'Placed Shot', icon: '\u{1F3AF}' },
  low: { label: 'Low Driven', icon: '\u{1F53B}' },
  high: { label: 'Power High', icon: '\u{1F53A}' },
  panenka: { label: 'Panenka', icon: '\u{1F3A9}' },
};

/**
 * Runs one full interactive penalty attempt inside `mount`.
 * Returns a Promise resolving with { result, quality, zone, shotType }.
 */
export function runPenaltyAttempt({
  mount, headerHTML = '', attrs, shotTypes = ['normal'], pressure = 0,
  difficultyKey = 'normal', weakFoot = false, keeperLabel = 'Opposition Keeper',
}) {
  return new Promise((resolve) => {
    mount.innerHTML = `
      <div class="pk-stage">
        ${headerHTML}
        <div class="pitch-wrap"><canvas class="pitch-canvas"></canvas>
          <div class="keeper-tag">${keeperLabel}</div>
        </div>
        <div class="stage-controls" id="stage-controls"></div>
      </div>`;
    const canvas = mount.querySelector('.pitch-canvas');
    const controls = mount.querySelector('#stage-controls');
    const scene = new PenaltyScene(canvas);
    const onResize = () => scene.resize();
    window.addEventListener('resize', onResize);

    let shotType = shotTypes[0];

    function goDirection() {
      controls.innerHTML = '';
      const dirWrap = document.createElement('div');
      controls.appendChild(dirWrap);
      const grid = createDirectionGrid(dirWrap, {
        label: `Aim your shot ${weakFoot ? '(WEAK FOOT!)' : ''}`,
        onSelect: (zone) => {
          grid.disableAll();
          audio.select();
          setTimeout(() => goPower(zone), 250);
        },
      });
    }

    function goPower(zone) {
      controls.innerHTML = '';
      const profile = SHOT_PROFILES[shotType] || SHOT_PROFILES.normal;
      const speedMs = difficultyKey === 'legendary' ? 620 : difficultyKey === 'hard' ? 780 : difficultyKey === 'easy' ? 1150 : 950;
      createPowerMeter(controls, {
        speedMs,
        sweetCenter: profile.center,
        sweetWidth: profile.width,
        onStop: (power) => finish(zone, power),
      });
    }

    async function finish(zone, power) {
      controls.innerHTML = '';
      audio.kick();
      const outcome = resolvePlayerShot({ attrs, zone, power, shotType, pressure, difficultyKey, weakFoot });
      await scene.playSequence({ zoneId: zone.id, keeperSide: outcome.keeperSide, result: outcome.result, shotType }, {
        onPhase: (phase) => { if (phase === 'strike') audio.whoosh(); },
      });
      const banner = resultBanner(outcome.result);
      if (outcome.result === 'GOAL') audio.goal();
      else if (outcome.result === 'SAVE') audio.save();
      else if (outcome.result === 'POST' || outcome.result === 'CROSSBAR') audio.post();
      else audio.miss();
      controls.innerHTML = `<div class="result-banner ${banner.cls}">${banner.text}</div>`;
      window.removeEventListener('resize', onResize);
      setTimeout(() => resolve({ ...outcome, zone, shotType }), 900);
    }

    if (shotTypes.length > 1) {
      controls.innerHTML = '';
      const wrap = document.createElement('div');
      wrap.className = 'shot-type-picker';
      wrap.innerHTML = `<div class="dir-label">Choose shot type</div><div class="shot-type-grid"></div>`;
      controls.appendChild(wrap);
      const grid = wrap.querySelector('.shot-type-grid');
      shotTypes.forEach((st) => {
        const meta = SHOT_TYPE_META[st];
        const btn = document.createElement('button');
        btn.className = 'btn shot-type-btn';
        btn.innerHTML = `${meta.icon} ${meta.label}`;
        btn.addEventListener('click', () => { shotType = st; audio.select(); goDirection(); });
        grid.appendChild(btn);
      });
    } else {
      goDirection();
    }
  });
}

export function pressureBannerHTML(pressure, situationText) {
  const meta = pressureMeta(pressure);
  return `
    <div class="pressure-banner" style="--pcolor:${meta.color}">
      <div class="pressure-tag">${meta.label}</div>
      <div class="situation-text">${situationText}</div>
    </div>`;
}
