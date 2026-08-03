import type { RestrainState } from "../../../domain/types";
import { applyPatch, blinkCycle, type PixelGrid, type Patch } from "../render";
import {
  CRITTER_BASE,
  EYES_DEFAULT,
  EYES_SQUINT,
  MOUTH_SMILE,
  MOUTH_FLAT,
  MOUTH_GRIT,
  ACC_NONE,
  ACC_SWEAT,
  BLINK_PATCH,
} from "./critterBase";

export const restrainPalette: Record<string, string> = {
  A: "#2f5c3f",
  B: "#4f8f5c",
  F: "#dff0d8",
  P: "#22331f",
  Y: "#f2c94c",
  T: "#4a90d9",
  S: "#4a90d9",
  H: "#f2c94c",
};

interface StateDef {
  patch: Patch;
  speedMs: number;
}

const stateDefs: Record<RestrainState, StateDef> = {
  calm: { patch: [...EYES_DEFAULT, ...MOUTH_SMILE, ...ACC_NONE], speedMs: 2200 },
  watch: { patch: [...EYES_DEFAULT, ...MOUTH_FLAT, ...ACC_NONE], speedMs: 1900 },
  stop: { patch: [...EYES_DEFAULT, ...MOUTH_GRIT, ...ACC_NONE], speedMs: 1400 },
  over: { patch: [...EYES_DEFAULT, ...MOUTH_GRIT, ...ACC_SWEAT], speedMs: 1000 },
  recovered: { patch: [...EYES_SQUINT, ...MOUTH_SMILE, ...ACC_NONE], speedMs: 1800 },
};

export function restrainFrames(state: RestrainState): PixelGrid[] {
  const { patch } = stateDefs[state];
  return blinkCycle(patch, BLINK_PATCH).map((p) => applyPatch(CRITTER_BASE, p));
}

export function restrainSpeed(state: RestrainState): number {
  return stateDefs[state].speedMs;
}
