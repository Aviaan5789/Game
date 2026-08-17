// Real club names used purely as text — no logos/crests are used anywhere,
// only generated initials + colour badges, per licensing constraints.
export const CLUB_TIERS = [
  { tier: 0, label: 'Academy', repRequired: 0 },
  { tier: 1, label: 'Lower League', repRequired: 0 },
  { tier: 2, label: 'Top Flight', repRequired: 18 },
  { tier: 3, label: 'European Contender', repRequired: 38 },
  { tier: 4, label: 'Champions League Elite', repRequired: 62 },
  { tier: 5, label: 'Global Superclub', repRequired: 85 },
];

export const CLUBS = [
  // Tier 1 — lower league
  { name: 'Sunderland', tier: 1, country: 'England', c1: '#e11d2e', c2: '#ffffff', wage: 1200 },
  { name: 'Preston North End', tier: 1, country: 'England', c1: '#1e3a8a', c2: '#ffffff', wage: 1100 },
  { name: 'Millwall', tier: 1, country: 'England', c1: '#1d4ed8', c2: '#ffffff', wage: 1100 },
  { name: 'Norwich City', tier: 1, country: 'England', c1: '#16a34a', c2: '#ffd400', wage: 1200 },
  { name: 'Coventry City', tier: 1, country: 'England', c1: '#5eb3e4', c2: '#ffffff', wage: 1000 },
  { name: 'Real Valladolid', tier: 1, country: 'Spain', c1: '#5b21b6', c2: '#ffffff', wage: 1100 },
  { name: 'Hellas Verona', tier: 1, country: 'Italy', c1: '#1e3a8a', c2: '#ffd400', wage: 1000 },
  { name: 'Union Berlin', tier: 1, country: 'Germany', c1: '#dc2626', c2: '#ffd400', wage: 1200 },
  { name: 'Le Havre', tier: 1, country: 'France', c1: '#1d4ed8', c2: '#ffffff', wage: 1000 },
  { name: 'Toulouse', tier: 1, country: 'France', c1: '#7c2d92', c2: '#ffffff', wage: 1000 },

  // Tier 2 — top flight, mid table
  { name: 'Everton', tier: 2, country: 'England', c1: '#1d4ed8', c2: '#ffffff', wage: 8000 },
  { name: 'West Ham United', tier: 2, country: 'England', c1: '#7c2d92', c2: '#7fd1e0', wage: 8500 },
  { name: 'Fulham', tier: 2, country: 'England', c1: '#ffffff', c2: '#000000', wage: 8000 },
  { name: 'Real Betis', tier: 2, country: 'Spain', c1: '#16a34a', c2: '#ffffff', wage: 8500 },
  { name: 'Bologna', tier: 2, country: 'Italy', c1: '#b91c1c', c2: '#1e3a8a', wage: 7500 },
  { name: 'Werder Bremen', tier: 2, country: 'Germany', c1: '#16a34a', c2: '#ffffff', wage: 7500 },
  { name: 'Rennes', tier: 2, country: 'France', c1: '#dc2626', c2: '#000000', wage: 7800 },
  { name: 'Celta Vigo', tier: 2, country: 'Spain', c1: '#5eb3e4', c2: '#ffffff', wage: 7500 },
  { name: 'Torino', tier: 2, country: 'Italy', c1: '#7c2d92', c2: '#ffffff', wage: 7500 },
  { name: 'Crystal Palace', tier: 2, country: 'England', c1: '#1e3a8a', c2: '#dc2626', wage: 8200 },

  // Tier 3 — European contenders
  { name: 'Napoli', tier: 3, country: 'Italy', c1: '#0284c7', c2: '#ffffff', wage: 28000 },
  { name: 'Villarreal', tier: 3, country: 'Spain', c1: '#facc15', c2: '#1e3a8a', wage: 26000 },
  { name: 'RB Leipzig', tier: 3, country: 'Germany', c1: '#ffffff', c2: '#1e3a8a', wage: 30000 },
  { name: 'AS Roma', tier: 3, country: 'Italy', c1: '#7f1d1d', c2: '#facc15', wage: 28000 },
  { name: 'Newcastle United', tier: 3, country: 'England', c1: '#000000', c2: '#ffffff', wage: 32000 },
  { name: 'Atalanta', tier: 3, country: 'Italy', c1: '#1e3a8a', c2: '#000000', wage: 26000 },
  { name: 'Olympique Lyonnais', tier: 3, country: 'France', c1: '#1d4ed8', c2: '#ffffff', wage: 27000 },
  { name: 'Sevilla', tier: 3, country: 'Spain', c1: '#ffffff', c2: '#dc2626', wage: 27000 },
  { name: 'Ajax', tier: 3, country: 'Netherlands', c1: '#dc2626', c2: '#ffffff', wage: 29000 },
  { name: 'Benfica', tier: 3, country: 'Portugal', c1: '#dc2626', c2: '#ffffff', wage: 29000 },

  // Tier 4 — Champions League elite
  { name: 'Arsenal', tier: 4, country: 'England', c1: '#dc2626', c2: '#ffffff', wage: 90000 },
  { name: 'Liverpool', tier: 4, country: 'England', c1: '#dc2626', c2: '#ffffff', wage: 95000 },
  { name: 'Chelsea', tier: 4, country: 'England', c1: '#1d4ed8', c2: '#ffffff', wage: 92000 },
  { name: 'Atletico Madrid', tier: 4, country: 'Spain', c1: '#b91c1c', c2: '#1e3a8a', wage: 88000 },
  { name: 'Inter Milan', tier: 4, country: 'Italy', c1: '#1e3a8a', c2: '#000000', wage: 88000 },
  { name: 'Juventus', tier: 4, country: 'Italy', c1: '#000000', c2: '#ffffff', wage: 90000 },
  { name: 'Borussia Dortmund', tier: 4, country: 'Germany', c1: '#facc15', c2: '#000000', wage: 85000 },
  { name: 'Tottenham Hotspur', tier: 4, country: 'England', c1: '#ffffff', c2: '#0b1e3c', wage: 86000 },
  { name: 'FC Porto', tier: 4, country: 'Portugal', c1: '#1e3a8a', c2: '#ffffff', wage: 80000 },

  // Tier 5 — global superclubs
  { name: 'Real Madrid', tier: 5, country: 'Spain', c1: '#ffffff', c2: '#facc15', wage: 250000 },
  { name: 'FC Barcelona', tier: 5, country: 'Spain', c1: '#7c2d92', c2: '#dc2626', wage: 240000 },
  { name: 'Manchester City', tier: 5, country: 'England', c1: '#5eb3e4', c2: '#ffffff', wage: 260000 },
  { name: 'Manchester United', tier: 5, country: 'England', c1: '#dc2626', c2: '#ffd400', wage: 230000 },
  { name: 'Bayern Munich', tier: 5, country: 'Germany', c1: '#dc2626', c2: '#ffffff', wage: 245000 },
  { name: 'Paris Saint-Germain', tier: 5, country: 'France', c1: '#1e3a8a', c2: '#dc2626', wage: 250000 },
  { name: 'AC Milan', tier: 5, country: 'Italy', c1: '#dc2626', c2: '#000000', wage: 220000 },
];

export function clubsForTier(tier) {
  return CLUBS.filter((c) => c.tier === tier);
}

export function eligibleTier(reputation) {
  let best = 1;
  for (const t of CLUB_TIERS) {
    if (t.tier === 0) continue;
    if (reputation >= t.repRequired) best = t.tier;
  }
  return best;
}

export function tierLabel(tier) {
  return CLUB_TIERS.find((t) => t.tier === tier)?.label || 'Club';
}
