export const ACHIEVEMENTS = [
  { id: 'first_ten', icon: '\u{1F3C6}', name: 'On the Board', desc: 'Score 10 career penalties', check: (s) => s.player.stats.penaltiesScored >= 10 },
  { id: 'streak_ten', icon: '\u{1F525}', name: 'Unstoppable', desc: 'Score 10 penalties in a row', check: (s) => s.player.stats.bestStreak >= 10 },
  { id: 'pressure_goal', icon: '\u{1F9E0}', name: 'Ice in the Veins', desc: 'Score a high-pressure penalty', check: (s) => s.player.stats.pressureGoals >= 1 },
  { id: 'shootout_win', icon: '\u{1F945}', name: 'Shootout Hero', desc: 'Win a penalty shootout', check: (s) => s.player.stats.shootoutWins >= 1 },
  { id: 'tournament_win', icon: '\u{1F3C6}', name: 'Champion', desc: 'Win a tournament', check: (s) => s.player.stats.trophies.some((t) => t.type === 'tournament') },
  { id: 'rating_90', icon: '⭐', name: 'World Class', desc: 'Reach 90 overall rating', check: (s) => s.player.rating >= 90 },
  { id: 'rating_99', icon: '\u{1F451}', name: 'The GOAT', desc: 'Reach 99 overall rating', check: (s) => s.player.rating >= 99 },
  { id: 'world_cup', icon: '\u{1F30D}', name: 'World Champion', desc: 'Win the full World Cup-style tournament', check: (s) => s.player.stats.trophies.some((t) => t.name.includes('World')) },
  { id: 'first_goal', icon: '⚽', name: 'Off the Mark', desc: 'Score your first career penalty', check: (s) => s.player.stats.penaltiesScored >= 1 },
  { id: 'fifty_scored', icon: '\u{1F4AF}', name: 'Penalty Machine', desc: 'Score 50 career penalties', check: (s) => s.player.stats.penaltiesScored >= 50 },
  { id: 'club_elite', icon: '\u{1F3DF}️', name: 'Big Time', desc: 'Sign for a Tier 4+ club', check: (s) => s.player.clubTier >= 4 },
  { id: 'club_super', icon: '\u{1F3C6}', name: 'Superclub', desc: 'Sign for a Tier 5 superclub', check: (s) => s.player.clubTier >= 5 },
  { id: 'gk_saves', icon: '\u{1F9E4}', name: 'The Wall', desc: 'Make 10 saves as goalkeeper', check: (s) => s.player.stats.gkSaves >= 10 },
  { id: 'legendary_goal', icon: '\u{1F480}', name: 'Nerves of Steel', desc: 'Score on Legendary difficulty', check: (s) => s.player.stats.legendaryGoals >= 1 },
  { id: 'panenka', icon: '\u{1F3A9}', name: 'Panenka!', desc: 'Score a Panenka in training', check: (s) => s.player.stats.panenkaGoals >= 1 },
  { id: 'trophy_five', icon: '\u{1F3C5}', name: 'Trophy Cabinet', desc: 'Win 5 career trophies', check: (s) => s.player.stats.trophies.length >= 5 },
];

export function checkAchievements(state) {
  const unlocked = [];
  for (const a of ACHIEVEMENTS) {
    if (!state.player.achievements[a.id] && a.check(state)) {
      state.player.achievements[a.id] = true;
      unlocked.push(a);
    }
  }
  return unlocked;
}
