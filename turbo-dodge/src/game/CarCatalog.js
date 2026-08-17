// Catalog of unlockable car skins. `unlockLevel` is the player level
// required before a car becomes selectable (level 0 = always available).
export const CAR_CATALOG = [
  { id: 0, name: 'Rookie Red', unlockLevel: 0, body: 0xd1373f, accent: 0x2a2a2f, glass: 0x9fd8ff },
  { id: 1, name: 'Sunset Orange', unlockLevel: 1, body: 0xff7a3d, accent: 0x241f1a, glass: 0x9fd8ff },
  { id: 2, name: 'Volt Yellow', unlockLevel: 2, body: 0xffd23f, accent: 0x232016, glass: 0x9fd8ff },
  { id: 3, name: 'Toxic Green', unlockLevel: 3, body: 0x5be05a, accent: 0x152416, glass: 0x9fd8ff },
  { id: 4, name: 'Ocean Blue', unlockLevel: 4, body: 0x2fa8ff, accent: 0x101c24, glass: 0xcdeeff },
  { id: 5, name: 'Royal Purple', unlockLevel: 5, body: 0xa15cff, accent: 0x1c1424, glass: 0xe0cfff },
  { id: 6, name: 'Carbon Black', unlockLevel: 6, body: 0x1c1f26, accent: 0x00e5ff, glass: 0x6fe9ff },
  { id: 7, name: 'Platinum Chrome', unlockLevel: 7, body: 0xf1f4f8, accent: 0xffc93c, glass: 0xdff3ff },
];

export function carsUnlockedAt(level) {
  return CAR_CATALOG.filter((c) => c.unlockLevel <= level);
}

export function getCar(id) {
  return CAR_CATALOG.find((c) => c.id === id) ?? CAR_CATALOG[0];
}

export function highestUnlockedCar(level) {
  const unlocked = carsUnlockedAt(level);
  return unlocked[unlocked.length - 1];
}
