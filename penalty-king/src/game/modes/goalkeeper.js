import { registerScreen, goto } from '../router.js';
import { state, save } from '../core/state.js';
import { addGkXp, allocateGkAttribute, computeGkRating, clampAttr } from '../core/player.js';
import { generateAiShot, resolveGoalkeeperSave, clamp01 } from '../core/engine.js';
import { createDiveReactionPrompt } from '../core/penaltyInput.js';
import { PenaltyScene } from '../scene.js';
import { STAR_PLAYERS } from '../data/players.js';
import { attrBar, toast, showAchievementPopup, resultBanner, pressureMeta } from '../ui/components.js';
import { checkAchievements } from '../data/achievements.js';
import { audio } from '../audio.js';
import { DIFFICULTIES } from '../core/constants.js';

const SHIFT_LENGTH = 5;

function fireAchievements() {
  checkAchievements(state).forEach((a, i) => setTimeout(() => showAchievementPopup(a), i * 900));
}

function windowMsFor(difficultyKey) {
  return { easy: 1400, normal: 1050, hard: 800, legendary: 600 }[difficultyKey] || 1050;
}

function gkStrength01(p, reactionMs, windowMs) {
  const base = computeGkRating(p.gkAttrs) / 99;
  if (reactionMs == null) return 0.05;
  const speedFactor = clamp01((windowMs - reactionMs) / windowMs);
  const anticipationBoost = p.gkAttrs.anticipation / 99;
  return clamp01(base * 0.55 + speedFactor * 0.3 + anticipationBoost * 0.25);
}

function renderSetup(app) {
  const p = state.player;
  app.innerHTML = `
    <div class="screen goalkeeper-setup">
      <div class="hub-topbar">
        <button class="btn ghost back-btn" id="back-menu">&#8592; Menu</button>
        <div class="hub-title">GOALKEEPER</div>
        <div class="diff-pill">${DIFFICULTIES[p.difficulty].label}</div>
      </div>
      <div class="gk-panel">
        <div class="gk-rating">GK Rating: <b>${p.gkRating}</b></div>
        ${attrBar('Reflexes', p.gkAttrs.reflexes)}
        ${attrBar('Positioning', p.gkAttrs.positioning)}
        ${attrBar('Reach', p.gkAttrs.reach)}
        ${attrBar('Anticipation', p.gkAttrs.anticipation)}
        ${p.gkPoints > 0 ? `<div class="gk-points-note">${p.gkPoints} GK attribute point(s) available — spend them below.</div>` : ''}
        <div class="gk-improve-grid">
          ${['reflexes', 'positioning', 'reach', 'anticipation'].map((k) => `<button class="btn small" data-key="${k}" ${p.gkPoints <= 0 ? 'disabled' : ''}>+3 ${k}</button>`).join('')}
        </div>
        <div class="setup-sub">Face a shift of ${SHIFT_LENGTH} penalties. Choose a side fast — reflexes and anticipation matter most.</div>
        <button class="btn primary big" id="start-shift">START SHIFT</button>
      </div>
    </div>`;
  app.querySelector('#back-menu').addEventListener('click', () => { audio.click(); goto('mainMenu'); });
  app.querySelectorAll('.gk-improve-grid button').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (allocateGkAttribute(p, btn.dataset.key)) { audio.levelUp(); save(); renderSetup(app); }
    });
  });
  app.querySelector('#start-shift').addEventListener('click', () => { audio.click(); runShift(app); });
}

function pickAttacker(difficultyKey) {
  const useStar = Math.random() < 0.35;
  if (useStar) {
    const star = STAR_PLAYERS[Math.floor(Math.random() * STAR_PLAYERS.length)];
    return { name: star.name, isStar: true, strength01: (star.accuracy * 0.5 + star.composure * 0.3 + star.technique * 0.2) / 99 };
  }
  const diffBoost = { easy: 0.35, normal: 0.5, hard: 0.62, legendary: 0.75 }[difficultyKey] || 0.5;
  return { name: 'Opposition Striker', isStar: false, strength01: clamp01(diffBoost + (Math.random() - 0.5) * 0.15) };
}

async function runShift(app) {
  const p = state.player;
  let saves = 0;
  let faced = 0;
  const log = [];

  for (let i = 0; i < SHIFT_LENGTH; i++) {
    const attacker = pickAttacker(p.difficulty);
    const pressure = 0.3 + (i / SHIFT_LENGTH) * 0.5;
    const shot = generateAiShot({ attackStrength01: attacker.strength01, difficultyKey: p.difficulty, pressure });

    app.innerHTML = `
      <div class="screen goalkeeper-play">
        <div class="gk-topbar">
          <div class="gk-shift-progress">Save ${i + 1} / ${SHIFT_LENGTH}</div>
          <div class="gk-tally">${saves} SAVES</div>
        </div>
        <div class="pressure-banner" style="--pcolor:${pressureMeta(pressure).color}">
          <div class="pressure-tag">${pressureMeta(pressure).label}</div>
          <div class="situation-text">${attacker.isStar ? `Facing ${attacker.name}!` : `${attacker.name} steps up.`}</div>
        </div>
        <div class="pitch-wrap"><canvas class="pitch-canvas"></canvas></div>
        <div class="stage-controls" id="gk-controls"></div>
      </div>`;
    const canvas = app.querySelector('.pitch-canvas');
    const controls = app.querySelector('#gk-controls');
    const scene = new PenaltyScene(canvas);

    await scene._animate(650, (t) => {
      scene.drawBackground();
      scene.drawGoal();
      scene.drawKeeper('center', 0, false);
      scene.drawBall(scene.spot.x, scene.spot.y, 9);
      scene.drawStriker(t);
    });

    const windowMs = windowMsFor(p.difficulty);
    const reaction = await new Promise((res) => {
      createDiveReactionPrompt(controls, { windowMs, onResolve: res });
    });
    controls.innerHTML = '';
    audio.kick();

    const strength01 = gkStrength01(p, reaction.side ? reaction.reactionMs : null, windowMs);
    const commitSide = reaction.side || 'center';
    const result = resolveGoalkeeperSave({ shot, commitSide, gkStrength01: strength01 });

    await scene.playSequence({ zoneId: shot.zone.id, keeperSide: commitSide, result, shotType: 'normal' });
    const banner = resultBanner(result === 'GOAL' ? 'GOAL' : result === 'SAVE' ? 'SAVE' : result);
    const saved = result === 'SAVE' || result === 'POST' || result === 'CROSSBAR' || result === 'MISS';
    controls.innerHTML = `<div class="result-banner ${saved ? 'result-save' : 'result-goal'}">${saved ? 'SAVED!' : 'GOAL CONCEDED'}</div>`;
    if (result === 'SAVE') { audio.save(); audio.crowdRoar(); saves++; } else if (result === 'GOAL') { audio.goal(); audio.crowdGroan(); } else audio.post();

    faced++;
    log.push(saved);
    await new Promise((res) => setTimeout(res, 1100));
  }

  p.stats.gkFaced += faced;
  p.stats.gkSaves += saves;
  const xp = saves * 20 + faced * 8;
  const gained = addGkXp(p, xp);
  save();
  fireAchievements();

  app.innerHTML = `
    <div class="screen gk-summary">
      <div class="ss-title">SHIFT COMPLETE</div>
      <div class="ss-grid">
        <div class="ss-item"><span>Saves</span><b>${saves} / ${faced}</b></div>
        <div class="ss-item"><span>GK Rating</span><b>${p.gkRating}</b></div>
        <div class="ss-item"><span>GK Points</span><b>${p.gkPoints}</b></div>
      </div>
      ${gained > 0 ? `<div class="mr-xp">+${gained} GK Attribute Point!</div>` : ''}
      <div class="sf-actions">
        <button class="btn primary" id="gk-again">ANOTHER SHIFT</button>
        <button class="btn secondary" id="gk-menu">MAIN MENU</button>
      </div>
    </div>`;
  app.querySelector('#gk-again').addEventListener('click', () => { audio.click(); goto('goalkeeperSetup'); });
  app.querySelector('#gk-menu').addEventListener('click', () => { audio.click(); goto('mainMenu'); });
}

registerScreen('goalkeeperSetup', renderSetup);
