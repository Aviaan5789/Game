import { registerScreen, goto } from '../router.js';
import { state } from '../core/state.js';
import { conversionPct, formatMoney, currentClubData } from '../core/player.js';
import { clubBadgeHTML, playerCardHTML } from '../ui/components.js';
import { audio } from '../audio.js';

function render(app) {
  const p = state.player;
  const s = p.stats;
  const club = currentClubData(p);
  app.innerHTML = `
    <div class="screen statistics-screen">
      <div class="hub-topbar">
        <button class="btn ghost back-btn" id="back-menu">&#8592; Menu</button>
        <div class="hub-title">STATISTICS</div>
        <div></div>
      </div>

      <div class="hub-player-row">
        ${playerCardHTML(p)}
        <div class="hub-info">
          <div class="hub-club-line">${clubBadgeHTML(club)}<div><div class="hub-club-name">${p.club}</div><div class="hub-club-tier">Previous: ${p.previousClubs.slice(-3).join(', ') || 'None'}</div></div></div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card"><span>Matches</span><b>${s.matches}</b></div>
        <div class="stat-card"><span>Penalties Taken</span><b>${s.penaltiesTaken}</b></div>
        <div class="stat-card"><span>Goals</span><b>${s.goals}</b></div>
        <div class="stat-card"><span>Misses</span><b>${s.penaltiesMissed}</b></div>
        <div class="stat-card"><span>Conversion %</span><b>${conversionPct(s)}%</b></div>
        <div class="stat-card"><span>Best Streak</span><b>${s.bestStreak}</b></div>
        <div class="stat-card"><span>Shootout Wins</span><b>${s.shootoutWins}</b></div>
        <div class="stat-card"><span>Shootout Losses</span><b>${s.shootoutLosses}</b></div>
        <div class="stat-card"><span>Trophies</span><b>${s.trophies.length}</b></div>
        <div class="stat-card"><span>Career XP</span><b>${s.careerXp}</b></div>
        <div class="stat-card"><span>Player Rating</span><b>${p.rating}</b></div>
        <div class="stat-card"><span>GK Saves</span><b>${s.gkSaves} / ${s.gkFaced}</b></div>
        <div class="stat-card"><span>Earnings</span><b>${formatMoney(p.earnings)}</b></div>
        <div class="stat-card"><span>Reputation</span><b>${Math.round(p.reputation)}</b></div>
        <div class="stat-card wide"><span>Best Season</span><b>${s.bestSeason || 'No season completed yet'}</b></div>
      </div>

      <div class="trophy-cabinet">
        <div class="tc-title">Trophy Cabinet</div>
        ${s.trophies.length ? `<div class="tc-list">${s.trophies.map((t) => `<div class="tc-item">\u{1F3C6} ${t.name} <span>S${t.season}</span></div>`).join('')}</div>` : '<div class="tc-empty">No trophies yet — get out there and win one.</div>'}
      </div>

      <div class="timeline-list compact">
        ${p.timeline.slice().reverse().slice(0, 8).map((t) => `<div class="timeline-item"><div class="ti-season">S${t.season}</div><div class="ti-event">${t.event}</div></div>`).join('')}
      </div>
    </div>`;

  app.querySelector('#back-menu').addEventListener('click', () => { audio.click(); goto('mainMenu'); });
}

registerScreen('statistics', render);
