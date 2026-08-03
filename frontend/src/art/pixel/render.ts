export type PixelGrid = string[]; // each string is one row, one char per pixel, "." = transparent
export type Patch = string[]; // ["x,y:c", ...], "_" for char means erase to transparent

export function applyPatch(base: PixelGrid, patch: Patch): PixelGrid {
  const grid = base.map((row) => row.split(""));
  for (const op of patch) {
    const [coord, char] = op.split(":");
    const [xs, ys] = coord.split(",");
    grid[Number(ys)][Number(xs)] = char === "_" ? "." : char;
  }
  return grid.map((row) => row.join(""));
}

// A state's "rest" look (patch) plus a shared blink patch gives a cheap
// 5-frame idle loop: hold, hold, blink, hold, hold.
export function blinkCycle(restPatch: Patch, blinkPatch: Patch): Patch[] {
  return [restPatch, restPatch, [...restPatch, ...blinkPatch], restPatch, restPatch];
}
