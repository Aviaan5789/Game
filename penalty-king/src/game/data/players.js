// Gameplay attribute cards for real-world star players. These are original
// gameplay numbers (not licensed ratings) and no photos/logos are used —
// only generated text/gradient player cards in the UI.
export const STAR_PLAYERS = [
  { name: 'Cristiano Ronaldo', nation: 'Portugal', accuracy: 93, power: 95, composure: 96, technique: 90, badge: '\u{1F1F5}\u{1F1F9}' },
  { name: 'Lionel Messi', nation: 'Argentina', accuracy: 96, power: 78, composure: 95, technique: 98, badge: '\u{1F1E6}\u{1F1F7}' },
  { name: 'Kylian Mbappe', nation: 'France', accuracy: 89, power: 92, composure: 88, technique: 93, badge: '\u{1F1EB}\u{1F1F7}' },
  { name: 'Erling Haaland', nation: 'Norway', accuracy: 85, power: 98, composure: 87, technique: 84, badge: '\u{1F1F3}\u{1F1F4}' },
  { name: 'Neymar Jr', nation: 'Brazil', accuracy: 90, power: 80, composure: 86, technique: 97, badge: '\u{1F1E7}\u{1F1F7}' },
  { name: 'Harry Kane', nation: 'England', accuracy: 91, power: 89, composure: 92, technique: 88, badge: '\u{1F1EC}\u{1F1E7}' },
  { name: 'Mohamed Salah', nation: 'Egypt', accuracy: 88, power: 84, composure: 89, technique: 90, badge: '\u{1F1EA}\u{1F1EC}' },
  { name: 'Vinicius Junior', nation: 'Brazil', accuracy: 84, power: 82, composure: 85, technique: 94, badge: '\u{1F1E7}\u{1F1F7}' },
  { name: 'Jude Bellingham', nation: 'England', accuracy: 86, power: 87, composure: 90, technique: 88, badge: '\u{1F1EC}\u{1F1E7}' },
  { name: 'Lamine Yamal', nation: 'Spain', accuracy: 87, power: 76, composure: 84, technique: 92, badge: '\u{1F1EA}\u{1F1F8}' },
];

export function starForNation(nation) {
  return STAR_PLAYERS.filter((p) => p.nation === nation);
}
