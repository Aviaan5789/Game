import { ATTR_MIN, ATTR_MAX, XP_PER_POINT } from './constants.js';
import { CLUBS } from '../data/clubs.js';

export function clampAttr(v) {
  return Math.max(ATTR_MIN, Math.min(ATTR_MAX, Math.round(v)));
}

export function computeRating(attrs) {
  const r = attrs.accuracy * 0.35 + attrs.power * 0.15 + attrs.composure * 0.25
    + attrs.technique * 0.2 + attrs.weakFoot * 0.05;
  return clampAttr(r);
}

export function computeGkRating(gk) {
  const r = gk.reflexes * 0.35 + gk.positioning * 0.25 + gk.reach * 0.2 + gk.anticipation * 0.2;
  return clampAttr(r);
}

export function newPlayer({ name, nationality, age, foot }) {
  const attrs = {
    accuracy: 48, power: 50, composure: 45, technique: 47, weakFoot: 35,
  };
  const gkAttrs = { reflexes: 45, positioning: 45, reach: 45, anticipation: 45 };
  return {
    name: name.trim() || 'Rookie',
    nationality,
    age: Math.max(15, Math.min(24, Math.round(age))),
    foot,
    attrs,
    gkAttrs,
    rating: computeRating(attrs),
    gkRating: computeGkRating(gkAttrs),
    xp: 0,
    attributePoints: 1,
    gkPoints: 1,
    club: 'Youth Academy',
    clubTier: 0,
    previousClubs: [],
    reputation: 4,
    earnings: 0,
    season: 1,
    difficulty: 'normal',
    seasonFixture: 0,
    seasonGoals: 0,
    cupRound: null,
    pendingOffers: null,
    stats: {
      matches: 0,
      penaltiesTaken: 0,
      penaltiesScored: 0,
      penaltiesMissed: 0,
      goals: 0,
      shootoutWins: 0,
      shootoutLosses: 0,
      trophies: [],
      careerXp: 0,
      bestSeason: null,
      currentStreak: 0,
      bestStreak: 0,
      pressureGoals: 0,
      gkSaves: 0,
      gkFaced: 0,
      legendaryGoals: 0,
      panenkaGoals: 0,
      trainingBest: 0,
    },
    achievements: {},
    timeline: [{ season: 1, age: Math.round(age), event: `Joined the Youth Academy as a ${age}-year-old prospect.` }],
    createdAt: Date.now(),
  };
}

export function addXp(player, amount) {
  player.xp += amount;
  player.stats.careerXp += amount;
  let gained = 0;
  while (player.xp >= XP_PER_POINT) {
    player.xp -= XP_PER_POINT;
    player.attributePoints += 1;
    gained += 1;
  }
  return gained;
}

export function addGkXp(player, amount) {
  player.xp += 0; // outfield xp untouched
  player._gkXp = (player._gkXp || 0) + amount;
  let gained = 0;
  while (player._gkXp >= XP_PER_POINT) {
    player._gkXp -= XP_PER_POINT;
    player.gkPoints += 1;
    gained += 1;
  }
  return gained;
}

export function allocateAttribute(player, key) {
  if (player.attributePoints <= 0) return false;
  if (!(key in player.attrs)) return false;
  player.attrs[key] = clampAttr(player.attrs[key] + 3);
  player.attributePoints -= 1;
  player.rating = computeRating(player.attrs);
  return true;
}

export function allocateGkAttribute(player, key) {
  if (player.gkPoints <= 0) return false;
  if (!(key in player.gkAttrs)) return false;
  player.gkAttrs[key] = clampAttr(player.gkAttrs[key] + 3);
  player.gkPoints -= 1;
  player.gkRating = computeGkRating(player.gkAttrs);
  return true;
}

export function conversionPct(stats) {
  if (stats.penaltiesTaken === 0) return 0;
  return Math.round((stats.penaltiesScored / stats.penaltiesTaken) * 100);
}

export function currentClubData(player) {
  return CLUBS.find((c) => c.name === player.club) || null;
}

export function formatMoney(n) {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `€${(n / 1_000).toFixed(0)}K`;
  return `€${Math.round(n)}`;
}
