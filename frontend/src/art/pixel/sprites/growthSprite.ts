import type { GrowthState } from "../../../domain/types";
import type { PixelGrid } from "../render";

// Growth stages differ by shape (a plant maturing), not by expression, so
// each stage gets its own hand-drawn grid rather than a shared base+patch.
export const growthPalette: Record<string, string> = {
  G: "#4f8f3a",
  D: "#6b4a2b",
  O: "#8a5a2b",
  W: "#e8a6c1",
  Y: "#f2c94c",
  H: "#f2c94c",
};

const SOIL = ["DDDDDDDDD", "DDDDDDDDD"];

const STAGE_A: Record<GrowthState, PixelGrid> = {
  seed: [".........", ".........", ".........", ".........", ".........", ".........", "....O....", ...SOIL],
  sprout: [".........", ".........", ".........", ".........", ".........", "....G....", "...GGG...", ...SOIL],
  growing: [".........", ".........", ".........", "....G....", "...GGG...", "..G.G.G..", "...GGG...", ...SOIL],
  blooming: [".........", "...WWW...", "..WYYYW..", "...WWW...", "....G....", "..G.G.G..", "...GGG...", ...SOIL],
  harvest: ["H.......H", "...WWW...", "..WYYYW..", "...WWW...", "....G....", "..G.G.G..", "...GGG...", ...SOIL],
};

// A second frame per stage with one accent pixel toggled — the idle "twinkle".
const STAGE_B: Record<GrowthState, PixelGrid> = {
  seed: [".........", ".........", ".........", ".........", ".........", ".........", "....OH...", ...SOIL],
  sprout: [".........", ".........", ".........", ".........", "....H....", "....G....", "...GGG...", ...SOIL],
  growing: [".........", ".........", "....H....", "....G....", "...GGG...", "..G.G.G..", "...GGG...", ...SOIL],
  blooming: [".........", "...WWW...", ".HWYYYW..", "...WWW...", "....G....", "..G.G.G..", "...GGG...", ...SOIL],
  harvest: ["H.......H", "..HWWW...", "..WYYYW.H", "...WWW...", "....G....", "..G.G.G..", "...GGG...", ...SOIL],
};

export function growthFrames(state: GrowthState): PixelGrid[] {
  const a = STAGE_A[state];
  const b = STAGE_B[state];
  return [a, a, b, a, a];
}

const speeds: Record<GrowthState, number> = {
  seed: 2400,
  sprout: 2000,
  growing: 1700,
  blooming: 1400,
  harvest: 900,
};

export function growthSpeed(state: GrowthState): number {
  return speeds[state];
}
