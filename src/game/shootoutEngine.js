import { PenaltyScene } from './scene.js';
import { resolvePlayerShot, resolveAiShotVsKeeper } from './core/engine.js';
import { createDirectionGrid, createPowerMeter } from './core/penaltyInput.js';
import { resultBanner } from './ui/components.js';
import { audio } from './audio.js';

function scoreboardHTML({ playerName, oppName, playerRounds, oppRounds, playerScore, oppScore, roundLabel }) {
  const roundIcon = (r) => (r === undefined ? '<span class="rd-pending">•</span>' : r ? '⚽' : '❌');
  const maxRounds = Math.max(playerRounds.length, oppRounds.length, 5);
  let rows = '';
  for (let i = 0; i < maxRounds; i++) {
    rows += `<div class="so-round-row">
      <span class="so-round-idx">${i + 1}</span>
      <span class="so-round-icon">${roundIcon(playerRounds[i])}</span>
      <span class="so-round-icon">${roundIcon(oppRounds[i])}</span>
    </div>`;
  }
  return `
    <div class="shootout-board">
      <div class="so-score">
        <div class="so-team"><div class="so-team-name">${playerName}</div><div class="so-team-score">${playerScore}</div></div>
        <div class="so-vs">${roundLabel}</div>
        <div class="so-team"><div class="so-team-name">${oppName}</div><div class="so-team-score">${oppScore}</div></div>
      </div>
      <div class="so-rounds">${rows}</div>
    </div>`;
}

/**
 * Runs a complete penalty shootout inside `mount`, alternating player kicks
 * (interactive) with AI kicks (auto-resolved + animated). Resolves with a
 * summary object once a winner is decided.
 */
export async function runShootout({
  mount, attrs, difficultyKey = 'normal', playerName = 'You', oppName = 'Opponent',
  opponentStrength01 = 0.55, pressureBase = 0.6, ownKeeperStrength01 = 0.5, playerFirst = true,
}) {
  const playerRounds = [];
  const oppRounds = [];
  let scoreP = 0;
  let scoreO = 0;
  let round = 1;
  let suddenDeath = false;

  function decided() {
    if (!suddenDeath) {
      const remP = 5 - playerRounds.length;
      const remO = 5 - oppRounds.length;
      if (scoreP > scoreO + remO) return true;
      if (scoreO > scoreP + remP) return true;
      if (playerRounds.length >= 5 && oppRounds.length >= 5) {
        suddenDeath = scoreP === scoreO;
        return scoreP !== scoreO;
      }
    } else if (playerRounds.length === oppRounds.length) {
      return scoreP !== scoreO;
    }
    return false;
  }

  function renderBoard(extraHTML = '') {
    mount.innerHTML = `
      ${scoreboardHTML({ playerName, oppName, playerRounds, oppRounds, playerScore: scoreP, oppScore: scoreO, roundLabel: suddenDeath ? 'SUDDEN DEATH' : `ROUND ${round <= 5 ? round : playerRounds.length + 1}` })}
      <div class="pitch-wrap"><canvas class="pitch-canvas"></canvas></div>
      <div class="stage-controls" id="so-controls">${extraHTML}</div>`;
    return { canvas: mount.querySelector('.pitch-canvas'), controls: mount.querySelector('#so-controls') };
  }

  async function playerKick(pressure) {
    const { canvas, controls } = renderBoard();
    const scene = new PenaltyScene(canvas);
    await new Promise((res) => {
      const grid = createDirectionGrid(controls, {
        label: 'Your penalty — choose direction',
        onSelect: (zone) => {
          grid.disableAll();
          audio.select();
          setTimeout(() => {
            controls.innerHTML = '';
            createPowerMeter(controls, {
              speedMs: difficultyKey === 'legendary' ? 620 : difficultyKey === 'hard' ? 780 : difficultyKey === 'easy' ? 1150 : 950,
              onStop: async (power) => {
                controls.innerHTML = '';
                audio.kick();
                const outcome = resolvePlayerShot({ attrs, zone, power, shotType: 'normal', pressure, difficultyKey });
                await scene.playSequence({ zoneId: zone.id, keeperSide: outcome.keeperSide, result: outcome.result, shotType: 'normal' });
                announceResult(outcome.result, scene);
                res(outcome.result === 'GOAL');
              },
            });
          }, 200);
        },
      });
    }).then((scored) => {
      playerRounds.push(scored);
      if (scored) scoreP++;
    });
  }

  async function opponentKick(pressure) {
    const { canvas, controls } = renderBoard(`<div class="opp-kick-tag">${oppName} is stepping up...</div>`);
    const scene = new PenaltyScene(canvas);
    await new Promise((res) => setTimeout(res, 700));
    const outcome = resolveAiShotVsKeeper({ attackStrength01: opponentStrength01, difficultyKey, pressure, ownKeeperStrength01 });
    audio.kick();
    controls.innerHTML = '';
    await scene.playSequence({ zoneId: outcome.zone.id, keeperSide: outcome.keeperSide, result: outcome.result, shotType: 'normal' });
    announceResult(outcome.result, scene, true);
    const scored = outcome.result === 'GOAL';
    oppRounds.push(scored);
    if (scored) scoreO++;
    await new Promise((res) => setTimeout(res, 400));
  }

  function announceResult(result, scene, isOpponent = false) {
    if (result === 'GOAL') { audio.goal(); if (!isOpponent) audio.crowdRoar(); }
    else if (result === 'SAVE') { audio.save(); }
    else if (result === 'POST' || result === 'CROSSBAR') audio.post();
    else audio.miss();
    const banner = resultBanner(result);
    const el = document.createElement('div');
    el.className = `result-banner ${banner.cls}`;
    el.textContent = banner.text;
    mount.querySelector('#so-controls')?.appendChild(el);
  }

  while (!decided()) {
    const pressure = Math.min(0.95, pressureBase + (playerRounds.length >= 5 ? 0.25 : 0));
    if (playerFirst) {
      await playerKick(pressure);
      if (decided()) break;
      await opponentKick(pressure);
    } else {
      await opponentKick(pressure);
      if (decided()) break;
      await playerKick(pressure);
    }
    round++;
    await new Promise((res) => setTimeout(res, 250));
  }

  renderBoard();
  const won = scoreP > scoreO;
  if (won) audio.trophy();
  return { won, scoreP, scoreO, playerRounds, oppRounds };
}
