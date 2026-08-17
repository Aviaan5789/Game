import { registerScreen, goto } from '../router.js';
import { state, save } from '../core/state.js';
import { addXp, formatMoney } from '../core/player.js';
import { CLUBS } from '../data/clubs.js';
import { clubBadgeHTML, toast, showAchievementPopup } from '../ui/components.js';
import { runShootout } from '../shootoutEngine.js';
import { checkAchievements } from '../data/achievements.js';
import { audio } from '../audio.js';
import { DIFFICULTIES } from '../core/constants.js';

function fireAchievements() {
  checkAchievements(state).forEach((a, i) => setTimeout(() => showAchievementPopup(a), i * 900));
}

function randomOpponents(exclude) {
  const pool = CLUBS.filter((c) => c.name !== exclude && c.tier >= 3);
  return pool.sort(() => Math.random() - 0.5).slice(0, 6);
}

function renderSetup(app) {
  const p = state.player;
  const opponents = randomOpponents(p.club);
  app.innerHTML = `
    <div class="screen shootout-setup">
      <div class="hub-topbar">
        <button class="btn ghost back-btn" id="back-menu">&#8592; Menu</button>
        <div class="hub-title">SHOOTOUT</div>
        <div class="diff-pill">${DIFFICULTIES[p.difficulty].label}</div>
      </div>
      <div class="setup-sub">Cup Final &middot; ${p.club} vs... choose your rival</div>
      <div class="offers-grid">
        ${opponents.map((c, i) => `
          <button class="offer-card" data-idx="${i}">
            ${clubBadgeHTML(c, 56)}
            <div class="offer-name">${c.name}</div>
            <div class="offer-country">${c.country}</div>
          </button>`).join('')}
      </div>
    </div>`;

  app.querySelector('#back-menu').addEventListener('click', () => { audio.click(); goto('mainMenu'); });
  app.querySelectorAll('.offer-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      audio.click();
      startShootout(app, opponents[btn.dataset.idx]);
    });
  });
}

async function startShootout(app, opponentClub) {
  const p = state.player;
  app.innerHTML = `
    <div class="screen shootout-screen">
      <div class="hub-title center">${p.club} vs ${opponentClub.name}</div>
      <div class="setup-sub center">Level after extra time. Down to penalties!</div>
    </div>`;
  const mount = document.createElement('div');
  mount.className = 'shootout-mount';
  app.appendChild(mount);

  const opponentStrength = 0.5 + (opponentClub.tier - 1) * 0.06;
  const result = await runShootout({
    mount,
    attrs: p.attrs,
    difficultyKey: p.difficulty,
    playerName: p.club,
    oppName: opponentClub.name,
    opponentStrength01: Math.min(0.88, opponentStrength),
    pressureBase: 0.55,
  });

  result.playerRounds.forEach((scored) => {
    p.stats.penaltiesTaken++;
    if (scored) {
      p.stats.penaltiesScored++;
      p.stats.goals++;
      p.stats.currentStreak++;
      p.stats.bestStreak = Math.max(p.stats.bestStreak, p.stats.currentStreak);
    } else {
      p.stats.penaltiesMissed++;
      p.stats.currentStreak = 0;
    }
  });
  p.stats.matches++;
  const xp = 40 + (result.won ? 40 : 10);
  const gained = addXp(p, xp);
  if (result.won) {
    p.stats.shootoutWins++;
    p.reputation = Math.min(100, p.reputation + 3);
    p.earnings += 3000;
  } else {
    p.stats.shootoutLosses++;
  }
  save();
  fireAchievements();

  const resultEl = document.createElement('div');
  resultEl.className = 'shootout-final-result';
  resultEl.innerHTML = `
    <div class="sf-title ${result.won ? 'good' : 'bad'}">${result.won ? 'SHOOTOUT WON!' : 'SHOOTOUT LOST'}</div>
    <div class="sf-score">${result.scoreP} - ${result.scoreO}</div>
    ${gained > 0 ? `<div class="mr-xp">+${gained} Attribute Point!</div>` : ''}
    <div class="sf-earn">${result.won ? `+${formatMoney(3000)} bonus` : ''}</div>
    <div class="sf-actions">
      <button class="btn primary" id="sf-again">PLAY AGAIN</button>
      <button class="btn secondary" id="sf-menu">MAIN MENU</button>
    </div>`;
  app.appendChild(resultEl);
  app.querySelector('#sf-again').addEventListener('click', () => { audio.click(); goto('shootoutSetup'); });
  app.querySelector('#sf-menu').addEventListener('click', () => { audio.click(); goto('mainMenu'); });
}

registerScreen('shootoutSetup', renderSetup);
