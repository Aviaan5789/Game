import { registerScreen, goto } from '../router.js';
import { state, save } from '../core/state.js';
import { addXp, formatMoney } from '../core/player.js';
import { TOURNAMENT_NATIONS, squadFor } from '../data/nations.js';
import { toast, showAchievementPopup } from '../ui/components.js';
import { runShootout } from '../shootoutEngine.js';
import { checkAchievements } from '../data/achievements.js';
import { audio } from '../audio.js';
import { DIFFICULTIES } from '../core/constants.js';

const ROUNDS = ['Round of 16', 'Quarter-Final', 'Semi-Final', 'Final'];
const STRENGTH_BUMP = [0, 0.04, 0.08, 0.13];

function fireAchievements() {
  checkAchievements(state).forEach((a, i) => setTimeout(() => showAchievementPopup(a), i * 900));
}

function bracketHTML(currentRound) {
  return `
    <div class="bracket-chips">
      ${ROUNDS.map((r, i) => `<div class="bracket-chip ${i < currentRound ? 'done' : ''} ${i === currentRound ? 'current' : ''}">${r}</div>`).join('<div class="bracket-arrow">&#8594;</div>')}
    </div>`;
}

function renderSetup(app) {
  const p = state.player;
  app.innerHTML = `
    <div class="screen tournament-setup">
      <div class="hub-topbar">
        <button class="btn ghost back-btn" id="back-menu">&#8592; Menu</button>
        <div class="hub-title">TOURNAMENT</div>
        <div class="diff-pill">${DIFFICULTIES[p.difficulty].label}</div>
      </div>
      <div class="setup-sub">Choose your nation for the knockout tournament</div>
      <div class="nation-grid">
        ${TOURNAMENT_NATIONS.map((n, i) => `
          <button class="nation-card" data-idx="${i}">
            <div class="nation-flag">${n.flag}</div>
            <div class="nation-name">${n.name}</div>
            ${squadFor(n.name).stars.length ? `<div class="nation-star">\u{2B50} ${squadFor(n.name).stars[0].name}</div>` : ''}
          </button>`).join('')}
      </div>
    </div>`;
  app.querySelector('#back-menu').addEventListener('click', () => { audio.click(); goto('mainMenu'); });
  app.querySelectorAll('.nation-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      const nation = TOURNAMENT_NATIONS[btn.dataset.idx];
      p.tournamentNation = nation.name;
      p.tournamentRound = 0;
      save();
      audio.click();
      runRound(app);
    });
  });
}

function pickOpponentNation(exclude) {
  const pool = TOURNAMENT_NATIONS.filter((n) => n.name !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

async function runRound(app) {
  const p = state.player;
  const round = p.tournamentRound;
  const roundName = ROUNDS[round];
  const myNation = TOURNAMENT_NATIONS.find((n) => n.name === p.tournamentNation);
  const opponent = pickOpponentNation(p.tournamentNation);

  app.innerHTML = `
    <div class="screen tournament-round">
      ${bracketHTML(round)}
      <div class="hub-title center">${roundName}</div>
      <div class="setup-sub center">${myNation.flag} ${myNation.name} vs ${opponent.flag} ${opponent.name}</div>
    </div>`;
  const mount = document.createElement('div');
  mount.className = 'shootout-mount';
  app.appendChild(mount);

  const opponentStrength = Math.min(0.9, opponent.strength / 100 + STRENGTH_BUMP[round]);
  const pressure = 0.5 + round * 0.13;
  const result = await runShootout({
    mount,
    attrs: p.attrs,
    difficultyKey: p.difficulty,
    playerName: `${myNation.flag} ${myNation.name}`,
    oppName: `${opponent.flag} ${opponent.name}`,
    opponentStrength01: opponentStrength,
    pressureBase: pressure,
  });

  result.playerRounds.forEach((scored) => {
    p.stats.penaltiesTaken++;
    if (scored) {
      p.stats.penaltiesScored++;
      p.stats.goals++;
      p.stats.currentStreak++;
      p.stats.bestStreak = Math.max(p.stats.bestStreak, p.stats.currentStreak);
      if (pressure >= 0.6) p.stats.pressureGoals++;
    } else {
      p.stats.penaltiesMissed++;
      p.stats.currentStreak = 0;
    }
  });
  p.stats.matches++;

  if (result.won) {
    const xp = 30 + round * 15;
    const gained = addXp(p, xp);
    if (round === ROUNDS.length - 1) {
      p.stats.trophies.push({ name: `Penalty World Championship (${myNation.name})`, season: p.season, type: 'tournament' });
      p.reputation = Math.min(100, p.reputation + 15);
      p.earnings += 30000;
      p.tournamentRound = null;
      save();
      fireAchievements();
      showChampion(app, myNation, gained);
      return;
    }
    p.tournamentRound = round + 1;
    save();
    fireAchievements();
    showRoundWon(app, roundName, gained);
  } else {
    p.tournamentRound = null;
    save();
    fireAchievements();
    showEliminated(app, roundName);
  }
}

function showRoundWon(app, roundName, gained) {
  const el = document.createElement('div');
  el.className = 'shootout-final-result';
  el.innerHTML = `
    <div class="sf-title good">${roundName} WON!</div>
    ${gained > 0 ? `<div class="mr-xp">+${gained} Attribute Point!</div>` : ''}
    <div class="sf-actions">
      <button class="btn primary" id="next-round">NEXT ROUND</button>
      <button class="btn secondary" id="tourn-menu">MAIN MENU</button>
    </div>`;
  app.appendChild(el);
  audio.trophy();
  app.querySelector('#next-round').addEventListener('click', () => { audio.click(); runRound(app); });
  app.querySelector('#tourn-menu').addEventListener('click', () => { audio.click(); goto('mainMenu'); });
}

function showChampion(app, nation, gained) {
  const el = document.createElement('div');
  el.className = 'shootout-final-result champion';
  el.innerHTML = `
    <div class="sf-title good">\u{1F3C6} WORLD CHAMPIONS! \u{1F3C6}</div>
    <div class="sf-score">${nation.flag} ${nation.name}</div>
    ${gained > 0 ? `<div class="mr-xp">+${gained} Attribute Point!</div>` : ''}
    <div class="sf-earn">+${formatMoney(30000)} prize money</div>
    <div class="sf-actions">
      <button class="btn primary" id="tourn-menu">MAIN MENU</button>
    </div>`;
  app.appendChild(el);
  audio.trophy();
  toast('You are the Penalty World Champion!', { type: 'good' });
  app.querySelector('#tourn-menu').addEventListener('click', () => { audio.click(); goto('mainMenu'); });
}

function showEliminated(app, roundName) {
  const el = document.createElement('div');
  el.className = 'shootout-final-result';
  el.innerHTML = `
    <div class="sf-title bad">ELIMINATED</div>
    <div class="setup-sub center">Your tournament run ends at the ${roundName}.</div>
    <div class="sf-actions">
      <button class="btn primary" id="tourn-again">TRY AGAIN</button>
      <button class="btn secondary" id="tourn-menu">MAIN MENU</button>
    </div>`;
  app.appendChild(el);
  app.querySelector('#tourn-again').addEventListener('click', () => { audio.click(); goto('tournamentSetup'); });
  app.querySelector('#tourn-menu').addEventListener('click', () => { audio.click(); goto('mainMenu'); });
}

registerScreen('tournamentSetup', renderSetup);
