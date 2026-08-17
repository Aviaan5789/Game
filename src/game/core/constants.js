export const SAVE_KEY = 'penaltyking_save_v2';

export const ZONES = [
  { id: 'TL', label: 'Top Left', col: 0, row: 0 },
  { id: 'ML', label: 'Mid Left', col: 0, row: 1 },
  { id: 'BL', label: 'Bottom Left', col: 0, row: 2 },
  { id: 'C', label: 'Center', col: 1, row: 1 },
  { id: 'BR', label: 'Bottom Right', col: 2, row: 2 },
  { id: 'MR', label: 'Mid Right', col: 2, row: 1 },
  { id: 'TR', label: 'Top Right', col: 2, row: 0 },
];

export const DIFFICULTIES = {
  easy: {
    label: 'Easy', targetWindow: 1.35, keeperSkill: 0.32, keeperReaction: 0.75,
    unpredictability: 0.2, pressureMult: 0.7,
  },
  normal: {
    label: 'Normal', targetWindow: 1.0, keeperSkill: 0.5, keeperReaction: 0.9,
    unpredictability: 0.4, pressureMult: 1.0,
  },
  hard: {
    label: 'Hard', targetWindow: 0.75, keeperSkill: 0.68, keeperReaction: 1.05,
    unpredictability: 0.6, pressureMult: 1.25,
  },
  legendary: {
    label: 'Legendary', targetWindow: 0.55, keeperSkill: 0.85, keeperReaction: 1.25,
    unpredictability: 0.8, pressureMult: 1.6,
  },
};

export const ATTR_MIN = 25;
export const ATTR_MAX = 99;

export const XP_PER_POINT = 120;

export const FOOT_OPTIONS = ['Right', 'Left'];
