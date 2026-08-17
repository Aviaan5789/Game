import { registerScreen, goto } from '../router.js';
import { state } from '../core/state.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { audio } from '../audio.js';

function render(app) {
  const p = state.player;
  const unlockedCount = ACHIEVEMENTS.filter((a) => p.achievements[a.id]).length;
  app.innerHTML = `
    <div class="screen achievements-screen">
      <div class="hub-topbar">
        <button class="btn ghost back-btn" id="back-menu">&#8592; Menu</button>
        <div class="hub-title">ACHIEVEMENTS</div>
        <div class="diff-pill">${unlockedCount}/${ACHIEVEMENTS.length}</div>
      </div>
      <div class="achievements-grid">
        ${ACHIEVEMENTS.map((a) => {
    const unlocked = !!p.achievements[a.id];
    return `
            <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
              <div class="ac-icon">${a.icon}</div>
              <div class="ac-name">${a.name}</div>
              <div class="ac-desc">${a.desc}</div>
              ${unlocked ? '<div class="ac-badge">UNLOCKED</div>' : '<div class="ac-badge locked">LOCKED</div>'}
            </div>`;
  }).join('')}
      </div>
    </div>`;
  app.querySelector('#back-menu').addEventListener('click', () => { audio.click(); goto('mainMenu'); });
}

registerScreen('achievements', render);
