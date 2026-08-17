import { DIFFICULTIES, ZONES } from './constants.js';

export function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

export function zoneById(id) {
  return ZONES.find((z) => z.id === id);
}

function sideOfZone(zone) {
  if (zone.col === 0) return 'left';
  if (zone.col === 2) return 'right';
  return 'center';
}

export const SHOT_PROFILES = {
  normal: { center: 76, width: 24 },
  low: { center: 54, width: 20 },
  high: { center: 86, width: 18 },
  panenka: { center: 28, width: 34 },
};

// Core shot-quality model shared by every mode: player attributes + power
// meter precision + pressure + difficulty all feed into one 0..1 quality
// score that everything else (off-target chance, save chance) reads from.
export function computeShotQuality({ attrs, power, shotType = 'normal', pressure = 0, difficultyKey = 'normal', weakFoot = false }) {
  const diff = DIFFICULTIES[difficultyKey] || DIFFICULTIES.normal;
  const profile = SHOT_PROFILES[shotType] || SHOT_PROFILES.normal;
  const effectiveWidth = profile.width * diff.targetWindow;
  const powerError01 = clamp01(Math.abs(power - profile.center) / (effectiveWidth * 1.6));

  const skill01 = (attrs.accuracy * 0.4 + attrs.technique * 0.3 + attrs.composure * 0.3) / 99;
  const composureFactor = 1 - attrs.composure / 99;
  const pressurePenalty = pressure * composureFactor * diff.pressureMult * 0.35;
  const timingPenalty = powerError01 * 0.55;
  const weakFootPenalty = weakFoot ? (1 - attrs.weakFoot / 99) * 0.18 : 0;
  const rand = (Math.random() - 0.5) * 0.12;

  let quality = skill01 - pressurePenalty - timingPenalty - weakFootPenalty + rand;
  if (shotType === 'panenka') quality -= 0.04;
  return clamp01(quality);
}

// Determines the flavour of a missed/off-target attempt.
function pickOffTargetResult(zone) {
  const cornerish = zone.row !== 1;
  const roll = Math.random();
  if (cornerish) {
    if (roll < 0.45) return 'POST';
    if (roll < 0.7) return 'MISS';
    return 'CROSSBAR';
  }
  if (roll < 0.55) return 'MISS';
  if (roll < 0.8) return 'CROSSBAR';
  return 'POST';
}

// Keeper (AI) picks which side to commit to, given a skill level 0..1 and
// the actual side the shot is going. Used whenever the AI is in goal.
export function keeperPickCommitSide({ actualSide, guessSkill01, shotType = 'normal' }) {
  const pCenterStay = shotType === 'panenka' ? 0.06 : 0.12;
  const r = Math.random();
  if (r < pCenterStay) return 'center';
  const r2 = Math.random();
  if (r2 < guessSkill01) return actualSide;
  const others = ['left', 'center', 'right'].filter((s) => s !== actualSide);
  return others[Math.floor(Math.random() * others.length)];
}

// Given a shot (zone + quality) and a keeper's committed side + strength,
// decides SAVE vs GOAL. keeperStrength01 folds in difficulty or the
// human goalkeeper's attributes/reaction quality.
export function computeSaveOutcome({ zone, quality, commitSide, keeperStrength01 }) {
  const shotSide = sideOfZone(zone);
  const sameSide = commitSide === shotSide;
  let saveChance;
  if (!sameSide) {
    saveChance = 0.04 + keeperStrength01 * 0.05;
  } else if (zone.row === 1) {
    saveChance = 0.58 + keeperStrength01 * 0.22 - quality * 0.42;
  } else {
    saveChance = 0.3 + keeperStrength01 * 0.22 - quality * 0.42;
  }
  saveChance = clamp01(saveChance);
  return Math.random() < saveChance ? 'SAVE' : 'GOAL';
}

// Full resolution for a shot taken BY THE PLAYER against an AI keeper
// (career, shootout, tournament, training all funnel through this).
export function resolvePlayerShot({ attrs, zone, power, shotType = 'normal', pressure = 0, difficultyKey = 'normal', weakFoot = false }) {
  const diff = DIFFICULTIES[difficultyKey] || DIFFICULTIES.normal;
  const quality = computeShotQuality({ attrs, power, shotType, pressure, difficultyKey, weakFoot });
  const offTargetChance = clamp01((1 - quality) * 0.38 - (attrs.technique / 99) * 0.08 + (shotType === 'panenka' ? 0.05 : 0));

  if (Math.random() < offTargetChance) {
    return { result: pickOffTargetResult(zone), quality, keeperSide: null };
  }

  const actualSide = sideOfZone(zone);
  const commitSide = keeperPickCommitSide({ actualSide, guessSkill01: diff.keeperSkill, shotType });
  const result = computeSaveOutcome({ zone, quality, commitSide, keeperStrength01: diff.keeperReaction / 1.25 });
  return { result, quality, keeperSide: commitSide };
}

// Generates an AI-taken shot (opponent shooter in a shootout, or the
// attacker the player faces in Goalkeeper Mode).
export function generateAiShot({ attackStrength01, difficultyKey = 'normal', pressure = 0 }) {
  const diff = DIFFICULTIES[difficultyKey] || DIFFICULTIES.normal;
  const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
  const power = SHOT_PROFILES.normal.center + (Math.random() - 0.5) * 20;
  const baseQuality = clamp01(attackStrength01 - pressure * 0.15 * diff.pressureMult + (Math.random() - 0.5) * 0.25);
  const offTargetChance = clamp01((1 - baseQuality) * 0.3);
  if (Math.random() < offTargetChance) {
    return { zone, quality: baseQuality, offTarget: pickOffTargetResult(zone) };
  }
  return { zone, quality: baseQuality, offTarget: null };
}

// Resolves an AI shot against the PLAYER acting as goalkeeper.
export function resolveGoalkeeperSave({ shot, commitSide, gkStrength01 }) {
  if (shot.offTarget) return shot.offTarget;
  return computeSaveOutcome({ zone: shot.zone, quality: shot.quality, commitSide, keeperStrength01: gkStrength01 });
}

export function sideOf(zone) {
  return sideOfZone(zone);
}

// Resolves an AI-taken shot against an automatic (non-player) keeper —
// used for the opponent's kicks in Shootout/Tournament mode.
export function resolveAiShotVsKeeper({ attackStrength01, difficultyKey = 'normal', pressure = 0, ownKeeperStrength01 = 0.5 }) {
  const shot = generateAiShot({ attackStrength01, difficultyKey, pressure });
  if (shot.offTarget) return { result: shot.offTarget, zone: shot.zone, keeperSide: null };
  const commitSide = keeperPickCommitSide({ actualSide: sideOfZone(shot.zone), guessSkill01: 0.5, shotType: 'normal' });
  const result = computeSaveOutcome({ zone: shot.zone, quality: shot.quality, commitSide, keeperStrength01: ownKeeperStrength01 });
  return { result, zone: shot.zone, keeperSide: commitSide };
}
