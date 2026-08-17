import { registerScreen, goto } from '../router.js';
import { state, save } from '../core/state.js';
import { newPlayer } from '../core/player.js';
import { NATIONALITIES } from '../data/names.js';
import { FOOT_OPTIONS } from '../core/constants.js';
import { audio } from '../audio.js';

function render(app) {
  app.innerHTML = `
    <div class="screen create-player">
      <div class="cp-panel">
        <div class="cp-title">CREATE YOUR PLAYER</div>
        <form id="cp-form">
          <label class="cp-field">
            <span>Player Name</span>
            <input type="text" id="cp-name" maxlength="24" placeholder="Enter any name" required autocomplete="off" />
          </label>

          <label class="cp-field">
            <span>Nationality</span>
            <select id="cp-nation">
              ${NATIONALITIES.map((n) => `<option value="${n}">${n}</option>`).join('')}
            </select>
          </label>

          <label class="cp-field">
            <span>Starting Age: <b id="cp-age-val">17</b></span>
            <input type="range" id="cp-age" min="15" max="24" value="17" />
          </label>

          <div class="cp-field">
            <span>Preferred Foot</span>
            <div class="cp-foot-toggle">
              ${FOOT_OPTIONS.map((f, i) => `<button type="button" class="foot-btn ${i === 0 ? 'selected' : ''}" data-foot="${f}">${f}</button>`).join('')}
            </div>
          </div>

          <button type="submit" class="btn primary cp-submit">START MY CAREER</button>
        </form>
      </div>
    </div>`;

  let foot = FOOT_OPTIONS[0];
  app.querySelectorAll('.foot-btn').forEach((b) => {
    b.addEventListener('click', () => {
      app.querySelectorAll('.foot-btn').forEach((x) => x.classList.remove('selected'));
      b.classList.add('selected');
      foot = b.dataset.foot;
      audio.click();
    });
  });

  const ageInput = app.querySelector('#cp-age');
  const ageVal = app.querySelector('#cp-age-val');
  ageInput.addEventListener('input', () => { ageVal.textContent = ageInput.value; });

  app.querySelector('#cp-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = app.querySelector('#cp-name').value.trim();
    if (!name) return;
    const nationality = app.querySelector('#cp-nation').value;
    const age = parseInt(ageInput.value, 10);
    state.player = newPlayer({ name, nationality, age, foot });
    save();
    audio.levelUp();
    goto('welcome');
  });
}

function renderWelcome(app) {
  const p = state.player;
  app.innerHTML = `
    <div class="screen welcome-screen">
      <div class="welcome-card">
        <div class="welcome-badge">⚽</div>
        <div class="welcome-title">Welcome, ${p.name}!</div>
        <div class="welcome-sub">${p.nationality} &middot; Age ${p.age} &middot; ${p.foot}-footed</div>
        <div class="welcome-body">
          Your journey begins at the <b>${p.club}</b>. Train hard, take your chances from
          the spot, and climb from the academy to the biggest stage in football.
        </div>
        <button class="btn primary" id="welcome-continue">ENTER CAREER</button>
      </div>
    </div>`;
  app.querySelector('#welcome-continue').addEventListener('click', () => {
    audio.click();
    goto('careerHub');
  });
}

registerScreen('createPlayer', render);
registerScreen('welcome', renderWelcome);
