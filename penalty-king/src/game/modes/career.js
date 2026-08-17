import { registerScreen, goto } from '../router.js';
import { state, save } from '../core/state.js';
import {
  addXp, allocateAttribute, conversionPct, currentClubData, formatMoney, computeRating, clampAttr,
} from '../core/player.js';
import { DIFFICULTIES } from '../core/constants.js';
import { clubsForTier, eligibleTier, tierLabel } from '../data/clubs.js';
import { runPenaltyAttempt, pressureBannerHTML } from '../flow.js';
import { runShootout } from '../shootoutEngine.js';
import {
  clubBadgeHTML, attrBar, toast, showAchievementPopup, playerCardHTML,
} from '../ui/components.js';
import { checkAchievements } from '../data/achievements.js';
import { audio } from '../audio.js';

const LEAGUE_FIXTURES = 8;
const CUP_ROUNDS = ['Quarter-Final', 'Semi-Final', 'Final'];

function fireAchievements() {
  const unlocked = checkAchievements(state);
  unlocked.forEach((a, i) => setTimeout(() => showAchievementPopup(a), i * 900));
}

function pickOpponent(player) {
  const tier = Math.max(1, player.clubTier);
  const pool = clubsForTier(tier).filter((c) => c.name !== player.club);
  if (pool.length) return pool[Math.floor(Math.random() * pool.length)].name;
  return 'Local Rivals FC';
}

function formatMinute(m) {
  return m > 90 ? `90+${m - 90}'` : `${m}'`;
}

function applyPenaltyOutcome(scored, { pressure, note }) {
  const p = state.player;
  const diff = DIFFICULTIES[p.difficulty];
  p.stats.penaltiesTaken++;
  p.stats.matches += 0;
  let xp = 15;
  if (scored) {
    p.stats.penaltiesScored++;
    p.stats.goals++;
    p.seasonGoals++;
    p.stats.currentStreak++;
    p.stats.bestStreak = Math.max(p.stats.bestStreak, p.stats.currentStreak);
    xp += 25;
    if (pressure >= 0.6) { p.stats.pressureGoals++; xp += 15; }
    if (p.difficulty === 'legendary') p.stats.legendaryGoals++;
    p.reputation = Math.min(100, p.reputation + 1 + pressure * 3);
    p.earnings += 400 + p.clubTier * 350;
  } else {
    p.stats.penaltiesMissed++;
    p.stats.currentStreak = 0;
    p.reputation = Math.min(100, p.reputation + 0.2);
  }
  if (diff.pressureMult > 1) xp = Math.round(xp * (1 + (diff.pressureMult - 1) * 0.4));
  const gained = addXp(p, xp);
  save();
  fireAchievements();
  if (gained > 0) toast(`+${gained} Attribute Point${gained > 1 ? 's' : ''} earned!`, { type: 'good' });
  return xp;
}

function seasonProgressLabel(p) {
  if (p.cupRound) return `Cup ${p.cupRound}`;
  return `League Matchday ${p.seasonFixture + 1} / ${LEAGUE_FIXTURES}`;
}

function renderHub(app) {
  const p = state.player;
  const club = currentClubData(p);
  app.innerHTML = `
    <div class="screen career-hub">
      <div class="hub-topbar">
        <button class="btn ghost back-btn" id="back-menu">&#8592; Menu</button>
        <div class="hub-title">CAREER</div>
        <div class="diff-pill">${DIFFICULTIES[p.difficulty].label}</div>
      </div>

      <div class="hub-player-row">
        ${playerCardHTML(p)}
        <div class="hub-info">
          <div class="hub-club-line">${clubBadgeHTML(club)}<div><div class="hub-club-name">${p.club}</div><div class="hub-club-tier">${tierLabel(p.clubTier)}</div></div></div>
          <div class="hub-stat-grid">
            <div class="hs"><span>Age</span><b>${p.age}</b></div>
            <div class="hs"><span>Season</span><b>${p.season}</b></div>
            <div class="hs"><span>Reputation</span><b>${Math.round(p.reputation)}</b></div>
            <div class="hs"><span>Earnings</span><b>${formatMoney(p.earnings)}</b></div>
            <div class="hs"><span>Goals</span><b>${p.stats.goals}</b></div>
            <div class="hs"><span>Conversion</span><b>${conversionPct(p.stats)}%</b></div>
            <div class="hs"><span>Trophies</span><b>${p.stats.trophies.length}</b></div>
            <div class="hs"><span>Attr. Points</span><b>${p.attributePoints}</b></div>
          </div>
        </div>
      </div>

      <div class="season-progress">
        <div class="sp-label">${seasonProgressLabel(p)}</div>
        <div class="sp-track"><div class="sp-fill" style="width:${Math.min(100, (p.seasonFixture / (LEAGUE_FIXTURES + 3)) * 100)}%"></div></div>
      </div>

      <div class="hub-actions">
        <button class="btn primary big" id="play-match">${p.cupRound ? `PLAY CUP ${p.cupRound.toUpperCase()}` : 'PLAY NEXT MATCH'}</button>
        <button class="btn secondary" id="improve-btn">Improve Player ${p.attributePoints > 0 ? `(${p.attributePoints})` : ''}</button>
        <button class="btn secondary" id="timeline-btn">Career Timeline</button>
      </div>
    </div>`;

  app.querySelector('#back-menu').addEventListener('click', () => { audio.click(); goto('mainMenu'); });
  app.querySelector('#play-match').addEventListener('click', () => { audio.click(); startMatch(app); });
  app.querySelector('#improve-btn').addEventListener('click', () => { audio.click(); renderImprove(app); });
  app.querySelector('#timeline-btn').addEventListener('click', () => { audio.click(); renderTimeline(app); });
}

function renderImprove(app) {
  const p = state.player;
  const keys = [
    ['accuracy', '\u{1F3AF} Penalty Accuracy'],
    ['power', '\u{1F4AA} Power'],
    ['composure', '\u{1F9E0} Composure'],
    ['technique', '⚡ Technique'],
    ['weakFoot', '\u{1F9B6} Weak Foot'],
  ];
  app.innerHTML = `
    <div class="screen improve-screen">
      <div class="hub-topbar">
        <button class="btn ghost back-btn" id="back-hub">&#8592; Back</button>
        <div class="hub-title">IMPROVE PLAYER</div>
        <div></div>
      </div>
      <div class="improve-panel">
        <div class="improve-points">Attribute Points Available: <b>${p.attributePoints}</b></div>
        <div class="improve-rating">Overall Rating: <b>${p.rating}</b></div>
        <div class="improve-list">
          ${keys.map(([k, label]) => `
            <div class="improve-row">
              ${attrBar(label, p.attrs[k])}
              <button class="btn small" data-key="${k}" ${p.attributePoints <= 0 || p.attrs[k] >= 99 ? 'disabled' : ''}>+3</button>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
  app.querySelector('#back-hub').addEventListener('click', () => { audio.click(); goto('careerHub'); });
  app.querySelectorAll('.improve-row button').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (allocateAttribute(p, btn.dataset.key)) {
        audio.levelUp();
        save();
        fireAchievements();
        renderImprove(app);
      }
    });
  });
}

function renderTimeline(app) {
  const p = state.player;
  app.innerHTML = `
    <div class="screen timeline-screen">
      <div class="hub-topbar">
        <button class="btn ghost back-btn" id="back-hub">&#8592; Back</button>
        <div class="hub-title">CAREER TIMELINE</div>
        <div></div>
      </div>
      <div class="timeline-list">
        ${p.timeline.slice().reverse().map((t) => `
          <div class="timeline-item">
            <div class="ti-season">S${t.season}</div>
            <div class="ti-event">${t.event}</div>
          </div>`).join('')}
      </div>
    </div>`;
  app.querySelector('#back-hub').addEventListener('click', () => { audio.click(); goto('careerHub'); });
}

async function startMatch(app) {
  const p = state.player;
  if (p.cupRound) return startCupRound(app);
  return startLeagueMatch(app);
}

async function startLeagueMatch(app) {
  const p = state.player;
  const opponent = pickOpponent(p);
  const minute = 55 + Math.floor(Math.random() * 40);
  const homeGoals = Math.floor(Math.random() * 3);
  const awayGoals = Math.floor(Math.random() * 3);
  const importance = Math.random();
  const pressure = 0.15 + importance * 0.45;
  const isPenaltyMoment = Math.random() < 0.55;
  const weakFoot = Math.random() < 0.12;

  if (!isPenaltyMoment) {
    const outcomes = ['win', 'draw', 'loss'];
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    p.stats.matches++;
    p.earnings += 150 + p.clubTier * 100;
    const gained = addXp(p, 5);
    save();
    app.innerHTML = `
      <div class="screen match-report">
        <div class="mr-title">FULL TIME</div>
        <div class="mr-score">${p.club} ${homeGoals}${outcome === 'win' ? '+1' : ''} - ${awayGoals} ${opponent}</div>
        <div class="mr-desc">A quiet game for you today — no clear penalty chance. Match report filed.</div>
        ${gained > 0 ? `<div class="mr-xp">+${gained} Attribute Point!</div>` : ''}
        <button class="btn primary" id="mr-continue">CONTINUE</button>
      </div>`;
    app.querySelector('#mr-continue').addEventListener('click', () => { audio.click(); advanceFixture(app); });
    return;
  }

  const situation = `${p.club} ${homeGoals}-${awayGoals} ${opponent} &middot; ${formatMinute(minute)} &middot; PENALTY!`;
  const header = pressureBannerHTML(pressure, situation);
  const outcome = await runPenaltyAttempt({
    mount: app,
    headerHTML: header,
    attrs: p.attrs,
    pressure,
    difficultyKey: p.difficulty,
    weakFoot,
    keeperLabel: `${opponent} Goalkeeper`,
  });

  const scored = outcome.result === 'GOAL';
  p.stats.matches++;
  applyPenaltyOutcome(scored, { pressure });
  toast(scored ? 'What a finish! The crowd erupts.' : 'So close — the away end falls silent.', { type: scored ? 'good' : 'bad' });

  setTimeout(() => advanceFixture(app), 1200);
}

function advanceFixture(app) {
  const p = state.player;
  save();
  p.seasonFixture++;
  if (p.seasonFixture >= LEAGUE_FIXTURES) {
    p.cupRound = CUP_ROUNDS[0];
  }
  save();
  goto('careerHub');
}

async function startCupRound(app) {
  const p = state.player;
  const roundIdx = CUP_ROUNDS.indexOf(p.cupRound);
  const opponent = pickOpponent(p);

  if (p.cupRound === 'Final') {
    const opponentStrength = 0.55 + roundIdx * 0.05 + p.clubTier * 0.02;
    app.innerHTML = `<div class="screen shootout-screen"><div class="hub-title center">CUP FINAL SHOOTOUT</div></div>`;
    const mount = document.createElement('div');
    mount.className = 'shootout-mount';
    app.appendChild(mount);
    const result = await runShootout({
      mount,
      attrs: p.attrs,
      difficultyKey: p.difficulty,
      playerName: p.club,
      oppName: opponent,
      opponentStrength01: Math.min(0.85, opponentStrength),
      pressureBase: 0.75,
    });
    result.playerRounds.forEach((scored) => applyPenaltyOutcome(scored, { pressure: 0.8 }));
    p.stats.matches++;
    if (result.won) {
      p.stats.shootoutWins++;
      p.stats.trophies.push({ name: `${p.club} Cup`, season: p.season, type: 'cup' });
      p.reputation = Math.min(100, p.reputation + 12);
      p.earnings += 15000 + p.clubTier * 8000;
      p.timeline.push({ season: p.season, event: `Won the ${p.club} Cup, beating ${opponent} on penalties!` });
      audio.trophy();
      toast('CUP WINNERS! Trophy added to the cabinet.', { type: 'good' });
    } else {
      p.stats.shootoutLosses++;
      p.timeline.push({ season: p.season, event: `Runners-up in the Cup Final, losing on penalties to ${opponent}.` });
      toast('Heartbreak in the final. So close.', { type: 'bad' });
    }
    save();
    fireAchievements();
    p.cupRound = null;
    setTimeout(() => finishSeason(app), 1400);
    return;
  }

  const pressure = 0.65 + roundIdx * 0.08;
  const situation = `Cup ${p.cupRound} &middot; ${p.club} vs ${opponent} &middot; Tied on aggregate &middot; DECISIVE PENALTY!`;
  const header = pressureBannerHTML(pressure, situation);
  const outcome = await runPenaltyAttempt({
    mount: app, headerHTML: header, attrs: p.attrs, pressure, difficultyKey: p.difficulty, keeperLabel: `${opponent} Goalkeeper`,
  });
  const scored = outcome.result === 'GOAL';
  p.stats.matches++;
  applyPenaltyOutcome(scored, { pressure });

  if (scored) {
    toast(`You send ${p.club} through to the ${CUP_ROUNDS[roundIdx + 1]}!`, { type: 'good' });
    p.cupRound = CUP_ROUNDS[roundIdx + 1];
    save();
    setTimeout(() => goto('careerHub'), 1400);
  } else {
    toast(`Cup dream over — eliminated in the ${p.cupRound}.`, { type: 'bad' });
    p.timeline.push({ season: p.season, event: `Cup run ended at the ${p.cupRound}.` });
    p.cupRound = null;
    save();
    setTimeout(() => finishSeason(app), 1400);
  }
}

function finishSeason(app) {
  const p = state.player;
  const wonCup = p.stats.trophies.some((t) => t.season === p.season && t.type === 'cup');
  const seasonSummary = `Season ${p.season}: ${p.seasonGoals} goals, ${conversionPct(p.stats)}% conversion${wonCup ? ', Cup Winner' : ''}.`;
  if (!p.stats.bestSeason || p.seasonGoals > (p._bestSeasonGoals || 0)) {
    p.stats.bestSeason = seasonSummary;
    p._bestSeasonGoals = p.seasonGoals;
  }
  p.timeline.push({ season: p.season, event: seasonSummary });
  const payout = 2000 + p.clubTier * 3000 + p.seasonGoals * 300;
  p.earnings += payout;
  p.age += 1;
  if (p.age >= 33 && Math.random() < 0.35) {
    const keys = Object.keys(p.attrs);
    const k = keys[Math.floor(Math.random() * keys.length)];
    p.attrs[k] = clampAttr(p.attrs[k] - 2);
    p.rating = computeRating(p.attrs);
  }

  const eligible = eligibleTier(p.reputation);
  let offers = null;
  if (eligible > p.clubTier) {
    const pool = clubsForTier(eligible).filter((c) => c.name !== p.club);
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 3);
    if (shuffled.length) offers = shuffled;
  }

  app.innerHTML = `
    <div class="screen season-summary">
      <div class="ss-title">SEASON ${p.season} COMPLETE</div>
      <div class="ss-grid">
        <div class="ss-item"><span>Goals</span><b>${p.seasonGoals}</b></div>
        <div class="ss-item"><span>Conversion</span><b>${conversionPct(p.stats)}%</b></div>
        <div class="ss-item"><span>Trophy</span><b>${wonCup ? 'Yes \u{1F3C6}' : 'None'}</b></div>
        <div class="ss-item"><span>Payout</span><b>${formatMoney(payout)}</b></div>
        <div class="ss-item"><span>New Age</span><b>${p.age}</b></div>
        <div class="ss-item"><span>Reputation</span><b>${Math.round(p.reputation)}</b></div>
      </div>
      ${offers ? '<div class="ss-note">Club offers have arrived based on your reputation!</div>' : ''}
      <button class="btn primary" id="ss-continue">${offers ? 'VIEW OFFERS' : 'CONTINUE'}</button>
    </div>`;

  p.season += 1;
  p.seasonFixture = 0;
  p.seasonGoals = 0;
  save();

  app.querySelector('#ss-continue').addEventListener('click', () => {
    audio.click();
    if (offers) renderOffers(app, offers);
    else goto('careerHub');
  });
}

function renderOffers(app, offers) {
  const p = state.player;
  app.innerHTML = `
    <div class="screen offers-screen">
      <div class="hub-title center">CLUB OFFERS</div>
      <div class="offers-sub">Reputation ${Math.round(p.reputation)} has attracted interest from ${tierLabel(offers[0].tier)} clubs.</div>
      <div class="offers-grid">
        ${offers.map((c, i) => `
          <button class="offer-card" data-idx="${i}">
            ${clubBadgeHTML(c, 56)}
            <div class="offer-name">${c.name}</div>
            <div class="offer-country">${c.country}</div>
            <div class="offer-wage">${formatMoney(c.wage)} / week</div>
          </button>`).join('')}
      </div>
      <button class="btn secondary" id="stay-btn">Stay at ${p.club}</button>
    </div>`;

  app.querySelectorAll('.offer-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      const c = offers[btn.dataset.idx];
      p.previousClubs.push(p.club);
      p.club = c.name;
      p.clubTier = c.tier;
      p.timeline.push({ season: p.season, event: `Signed for ${c.name} (${tierLabel(c.tier)}).` });
      audio.levelUp();
      save();
      fireAchievements();
      toast(`Welcome to ${c.name}!`, { type: 'good' });
      goto('careerHub');
    });
  });
  app.querySelector('#stay-btn').addEventListener('click', () => { audio.click(); goto('careerHub'); });
}

registerScreen('careerHub', renderHub);
