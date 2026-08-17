import { STAR_PLAYERS } from './players.js';

// 16-nation pool used by Tournament Mode. Each nation has a base "strength"
// rating that governs how tough its AI shooters/keeper are, scaled further
// by the round of the tournament.
export const TOURNAMENT_NATIONS = [
  { name: 'Portugal', flag: '\u{1F1F5}\u{1F1F9}', strength: 90 },
  { name: 'Argentina', flag: '\u{1F1E6}\u{1F1F7}', strength: 92 },
  { name: 'France', flag: '\u{1F1EB}\u{1F1F7}', strength: 91 },
  { name: 'Norway', flag: '\u{1F1F3}\u{1F1F4}', strength: 84 },
  { name: 'Brazil', flag: '\u{1F1E7}\u{1F1F7}', strength: 93 },
  { name: 'England', flag: '\u{1F1EC}\u{1F1E7}', strength: 89 },
  { name: 'Egypt', flag: '\u{1F1EA}\u{1F1EC}', strength: 82 },
  { name: 'Spain', flag: '\u{1F1EA}\u{1F1F8}', strength: 90 },
  { name: 'Germany', flag: '\u{1F1E9}\u{1F1EA}', strength: 87 },
  { name: 'Netherlands', flag: '\u{1F1F3}\u{1F1F1}', strength: 86 },
  { name: 'Italy', flag: '\u{1F1EE}\u{1F1F9}', strength: 85 },
  { name: 'Belgium', flag: '\u{1F1E7}\u{1F1EA}', strength: 83 },
  { name: 'Croatia', flag: '\u{1F1ED}\u{1F1F7}', strength: 84 },
  { name: 'Morocco', flag: '\u{1F1F2}\u{1F1E6}', strength: 81 },
  { name: 'Uruguay', flag: '\u{1F1FA}\u{1F1FE}', strength: 82 },
  { name: 'Japan', flag: '\u{1F1EF}\u{1F1F5}', strength: 79 },
];

export function nationByName(name) {
  return TOURNAMENT_NATIONS.find((n) => n.name === name);
}

export function squadFor(nationName) {
  const nation = nationByName(nationName);
  const stars = STAR_PLAYERS.filter((p) => p.nation === nationName);
  return { nation, stars };
}
