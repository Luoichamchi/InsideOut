import type { PixelGrid, Patch } from "../render";

// Shared 9x9 body for the cheer (horse) and restrain (turtle) mascots — they
// differ only by palette (art/theme concern) and the ear/shell accent patch.
// Legend: B=body  F=face plate (required light patch behind eyes/mouth)
// P=ink (eyes/mouth)  Y=starry eye  T=tear  S=sweat  H=sparkle  .=transparent
export const CRITTER_BASE: PixelGrid = [
  "..A...A..",
  ".BBBBBBB.",
  "BBBBBBBBB",
  "BFFFFFFFB",
  "BFPFFFPFB",
  "BFFFFFFFB",
  "BFFPPPFFB",
  "BBBBBBBBB",
  ".BB.B.BB.",
];

// --- eyes ---
export const EYES_DEFAULT: Patch = [];
export const EYES_SQUINT: Patch = ["2,4:_", "6,4:_", "2,3:P", "6,3:P"];
export const EYES_STAR: Patch = ["2,4:Y", "6,4:Y"];

// --- mouths (row 6 is the base smile; row 5 is blank face above it) ---
export const MOUTH_SMILE: Patch = [];
export const MOUTH_FLAT: Patch = ["3,6:F", "4,6:F", "5,6:F"];
export const MOUTH_SMALL: Patch = ["3,6:F", "5,6:F"];
export const MOUTH_LAUGH: Patch = ["3,5:P", "4,5:P", "5,5:P"];
export const MOUTH_GRIT: Patch = ["4,6:F"];

// --- accessories ---
export const ACC_NONE: Patch = [];
export const ACC_SWEAT: Patch = ["7,2:S"];
export const ACC_TEAR: Patch = ["2,5:T"];
export const ACC_SPARKLE: Patch = ["0,0:H", "8,0:H"];
export const ACC_SPARKLE_BIG: Patch = ["0,0:H", "8,0:H", "4,0:H"];

export const BLINK_PATCH: Patch = ["2,4:_", "6,4:_"];
