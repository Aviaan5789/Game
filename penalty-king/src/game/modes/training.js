import { registerScreen, goto } from '../router.js';
import { state, save } from '../core/state.js';
import { addXp } from '../core/player.js';
import { runPenaltyAttempt } from '../flow.js';
import { toast, showAchievementPopup } from '../ui/components.js';
import { checkAchievements } from '../data/achievements.js';
import { audio } from '../audio.js';
import { DIFFICULTIES } from '../core/constants.js';

function fireAchievements() {
  checkAchievements(state).forEach((a, i) => setTimeout(() => showAchievementPopup(a), i * 900));
}

const POINTS = { GOAL: 10, POST: 3, CROSSBAR: 3, SAVE: 0, MISS: 0 };

function render(app) {
  let score = 0;
  let attempts = 0;
  let streak = 0;
  let stopped = false;
  const p = state.player;

  function renderHeader() {
    return `
      <div class="training-header">
        <button class="btn ghost back-btn" id="back-menu">&#8592; Menu</button>
        <div class="training-tally">SCORE <b>${score}</b> &middot; Best <b>${p.stats.trainingBest}</b></div>
        <div class="training-streak">Streak x${streak}</div>
      </div>`;
  }

  async function nextAttempt() {
    if (stopped) return;
    attempts++;
    const outcome = await runPenaltyAttempt({
      mount: app,
      headerHTML: renderHeader(),
      attrs: p.attrs,
      shotTypes: ['normal', 'low', 'high', 'panenka'],
      pressure: 0.1,
      difficultyKey: p.difficulty,
      keeperLabel: 'Training Keeper',
    });

    if (outcome.result === 'GOAL') {
      streak++;
      score += POINTS.GOAL + Math.min(streak - 1, 5) * 2;
      if (outcome.shotType === 'panenka') {
        p.stats.panenkaGoals++;
        toast('Panenka! Ice cold. \u{1F3A9}', { type: 'good' });
      }
    } else {
      streak = 0;
      score += POINTS[outcome.result] || 0;
    }
    p.stats.trainingBest = Math.max(p.stats.trainingBest, score);
    save();
    fireAchievements();

    if (stopped) { showSummary(); return; }
    const controls = app.querySelector('.pk-stage') || app;
    const btnWrap = document.createElement('div');
    btnWrap.className = 'training-continue-wrap';
    btnWrap.innerHTML = `
      <button class="btn primary" id="train-next">NEXT KICK</button>
      <button class="btn secondary" id="train-stop">END SESSION</button>`;
    app.appendChild(btnWrap);
    app.querySelector('#train-next').addEventListener('click', () => { audio.click(); btnWrap.remove(); nextAttempt(); });
    app.querySelector('#train-stop').addEventListener('click', () => { audio.click(); stopped = true; showSummary(); });
  }

  function showSummary() {
    const gained = addXp(p, Math.min(120, attempts * 4));
    save();
    fireAchievements();
    app.innerHTML = `
      <div class="screen training-summary">
        <div class="ss-title">TRAINING COMPLETE</div>
        <div class="ss-grid">
          <div class="ss-item"><span>Attempts</span><b>${attempts}</b></div>
          <div class="ss-item"><span>Score</span><b>${score}</b></div>
          <div class="ss-item"><span>Best Ever</span><b>${p.stats.trainingBest}</b></div>
        </div>
        ${gained > 0 ? `<div class="mr-xp">+${gained} Attribute Point!</div>` : ''}
        <div class="sf-actions">
          <button class="btn primary" id="train-again">TRAIN AGAIN</button>
          <button class="btn secondary" id="train-menu">MAIN MENU</button>
        </div>
      </div>`;
    app.querySelector('#train-again').addEventListener('click', () => { audio.click(); goto('training'); });
    app.querySelector('#train-menu').addEventListener('click', () => { audio.click(); goto('mainMenu'); });
  }

  app.innerHTML = `<div class="screen training-screen"></div>`;
  nextAttempt();

  // back-menu handler is re-bound each header render inside runPenaltyAttempt's mount overwrite,
  // so attach via delegation on app instead.
  app.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'back-menu') { audio.click(); stopped = true; goto('mainMenu'); }
  });
}

registerScreen('training', render);
