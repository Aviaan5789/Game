// Pure game-progression logic: score -> level thresholds, persistence.
// Level 1 needs 300 points, level 2 needs 700, then +400 per level after that.
// Points keep accumulating across attempts (runs) until the threshold for the
// next level is reached; on level-up the counter resets and any overflow
// carries forward into the new level's progress.

const STORAGE_KEY = 'turbo-dodge-save-v1';

export function thresholdForLevel(level) {
  // level is the level being reached (1-based). level N needs 300 + (N-1)*400.
  return 300 + (level - 1) * 400;
}

const defaultState = () => ({
  level: 0, // 0 = starting rank, "Rookie"
  points: 0, // points accumulated toward the next level
  bestScore: 0, // best single-run score ever recorded
  selectedCarId: 0,
});

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch (e) {
    return defaultState();
  }
}

export function saveProgress(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // storage unavailable (private mode etc.) - fail silently
  }
}

/**
 * Apply a finished run's score to the persisted progress.
 * Returns { state, levelsGained, isNewBest }.
 */
export function applyRunScore(state, runScore) {
  const scoreInt = Math.floor(runScore);
  const next = { ...state };
  const isNewBest = scoreInt > next.bestScore;
  if (isNewBest) next.bestScore = scoreInt;

  next.points += scoreInt;
  let levelsGained = 0;
  let need = thresholdForLevel(next.level + 1);
  while (next.points >= need) {
    next.points -= need;
    next.level += 1;
    levelsGained += 1;
    need = thresholdForLevel(next.level + 1);
  }

  return { state: next, levelsGained, isNewBest };
}

export function progressLabel(state) {
  const need = thresholdForLevel(state.level + 1);
  return { current: state.points, needed: need, ratio: Math.min(1, state.points / need) };
}
