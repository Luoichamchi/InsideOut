import type { CheerState } from "../../../domain/types";
import { applyPatch, blinkCycle, type PixelGrid, type Patch } from "../render";
import {
  CRITTER_BASE,
  EYES_DEFAULT,
  EYES_SQUINT,
  EYES_STAR,
  MOUTH_SMILE,
  MOUTH_FLAT,
  MOUTH_SMALL,
  MOUTH_LAUGH,
  ACC_NONE,
  ACC_SWEAT,
  ACC_SPARKLE,
  ACC_SPARKLE_BIG,
  BLINK_PATCH,
} from "./critterBase";

export const cheerPalette: Record<string, string> = {
  A: "#7a5230",
  B: "#c98a3d",
  F: "#f4e3c1",
  P: "#3a2a1a",
  Y: "#f2c94c",
  T: "#4a90d9",
  S: "#4a90d9",
  H: "#f2c94c",
};

interface StateDef {
  patch: Patch;
  speedMs: number;
}

const stateDefs: Record<CheerState, StateDef> = {
  empty: { patch: [...EYES_DEFAULT, ...MOUTH_SMALL, ...ACC_NONE], speedMs: 2200 },
  cold: { patch: [...EYES_DEFAULT, ...MOUTH_FLAT, ...ACC_SWEAT], speedMs: 2400 },
  slow: { patch: [...EYES_DEFAULT, ...MOUTH_FLAT, ...ACC_NONE], speedMs: 2000 },
  onTrack: { patch: [...EYES_SQUINT, ...MOUTH_SMILE, ...ACC_NONE], speedMs: 1500 },
  almost: { patch: [...EYES_SQUINT, ...MOUTH_LAUGH, ...ACC_NONE], speedMs: 1100 },
  cleared: { patch: [...EYES_STAR, ...MOUTH_LAUGH, ...ACC_SPARKLE], speedMs: 800 },
  newRecord: { patch: [...EYES_STAR, ...MOUTH_LAUGH, ...ACC_SPARKLE_BIG], speedMs: 600 },
};

export function cheerFrames(state: CheerState): PixelGrid[] {
  const { patch } = stateDefs[state];
  return blinkCycle(patch, BLINK_PATCH).map((p) => applyPatch(CRITTER_BASE, p));
}

export function cheerSpeed(state: CheerState): number {
  return stateDefs[state].speedMs;
}
