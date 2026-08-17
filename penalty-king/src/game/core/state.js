import { SAVE_KEY } from './constants.js';

export const state = {
  player: null,
  screen: 'loading',
  screenCtx: {},
};

export function hasSave() {
  try {
    return !!localStorage.getItem(SAVE_KEY);
  } catch {
    return false;
  }
}

export function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state.player));
  } catch {
    // storage unavailable — ignore, game still playable this session
  }
}

export function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    state.player = JSON.parse(raw);
    return true;
  } catch {
    return false;
  }
}

export function deleteSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // ignore
  }
}

export function autosave() {
  if (state.player) save();
}
