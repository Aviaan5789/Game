import { state, deleteSave, load, save } from '../core/state.js';
import { goto, registerScreen } from '../router.js';
import { clubBadgeHTML } from './components.js';
import { currentClubData, conversionPct } from '../core/player.js';
import { audio } from '../audio.js';
import { DIFFICULTIES } from '../core/constants.js';

function menuItem({ icon, title, desc, screen, disabled }) {
  return `
    <button class="menu-card ${disabled ? 'disabled' : ''}" data-screen="${screen}" ${disabled ? 'disabled' : ''}>
      <div class="menu-icon">${icon}</div>
      <div class="menu-text">
        <div class="menu-title">${title}</div>
        <div class="menu-desc">${desc}</div>
      </div>
      <div class="menu-arrow">&#8594;</div>
    </button>`;
}

function render(app) {
  const hasPlayer = !!state.player;
  const club = hasPlayer ? currentClubData(state.player) : null;

  app.innerHTML = `
    <div class="screen main-menu">
      <div class="menu-hero">
        <div class="game-title">PENALTY <span>KING</span></div>
        <div class="game-tagline">Create a legend. Live for the spot-kick.</div>
      </div>

      ${hasPlayer ? `
      <div class="player-summary" id="menu-player-summary">
        ${clubBadgeHTML(club, 52)}
        <div class="ps-info">
          <div class="ps-name">${state.player.name}</div>
          <div class="ps-club">${state.player.club} &middot; Age ${state.player.age} &middot; OVR ${state.player.rating}</div>
        </div>
        <div class="ps-diff" id="diff-cycle" title="Click to change difficulty">${DIFFICULTIES[state.player.difficulty].label}</div>
      </div>` : ''}

      <div class="menu-grid">
        ${hasPlayer ? menuItem({ icon: '\u{1F4C8}', title: 'Continue Career', desc: 'Pick up where you left off', screen: 'careerHub' })
    : menuItem({ icon: '\u{1F195}', title: 'Create Your Player', desc: 'Start your penalty legend', screen: 'createPlayer' })}
        ${menuItem({ icon: '⚽', title: 'Shootout', desc: 'Play a full penalty shootout', screen: 'shootoutSetup', disabled: !hasPlayer })}
        ${menuItem({ icon: '\u{1F3C6}', title: 'Tournament', desc: 'Knockout tournament with your nation', screen: 'tournamentSetup', disabled: !hasPlayer })}
        ${menuItem({ icon: '\u{1F9E4}', title: 'Goalkeeper', desc: 'Step between the posts', screen: 'goalkeeperSetup', disabled: !hasPlayer })}
        ${menuItem({ icon: '\u{1F3CB}️', title: 'Training', desc: 'Unlimited penalty practice', screen: 'training', disabled: !hasPlayer })}
        ${menuItem({ icon: '\u{1F4CA}', title: 'Statistics', desc: 'Your career in numbers', screen: 'statistics', disabled: !hasPlayer })}
        ${menuItem({ icon: '\u{1F3C5}', title: 'Achievements', desc: 'Track your milestones', screen: 'achievements', disabled: !hasPlayer })}
      </div>

      ${hasPlayer ? `<button class="btn danger-link" id="new-career-btn">Retire &amp; start a new career</button>` : ''}
    </div>`;

  app.querySelectorAll('.menu-card').forEach((btn) => {
    if (btn.disabled) return;
    btn.addEventListener('click', () => { audio.click(); goto(btn.dataset.screen); });
  });

  const diffEl = app.querySelector('#diff-cycle');
  if (diffEl) {
    diffEl.addEventListener('click', () => {
      const keys = Object.keys(DIFFICULTIES);
      const idx = keys.indexOf(state.player.difficulty);
      state.player.difficulty = keys[(idx + 1) % keys.length];
      save();
      render(app);
    });
  }

  const retireBtn = app.querySelector('#new-career-btn');
  if (retireBtn) {
    retireBtn.addEventListener('click', () => {
      if (confirm('Retire this player and start a brand new career? This cannot be undone.')) {
        deleteSave();
        state.player = null;
        goto('createPlayer');
      }
    });
  }
}

registerScreen('mainMenu', render);

export function bootMainMenu() {
  load();
  goto('mainMenu');
}
