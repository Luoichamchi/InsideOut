import type { CSSProperties } from "react";
import type { CheerState, RestrainState, GrowthState } from "../domain/types";
import { cheerCopy, restrainCopy, growthCopy } from "./copy";
import { PixelSprite } from "./pixel/PixelSprite";
import { useSpriteFrame } from "./pixel/useSpriteFrame";
import { cheerFrames, cheerPalette, cheerSpeed } from "./pixel/sprites/cheerSprite";
import { restrainFrames, restrainPalette, restrainSpeed } from "./pixel/sprites/restrainSprite";
import { growthFrames, growthPalette, growthSpeed } from "./pixel/sprites/growthSprite";

export type MascotFamily = "cheer" | "restrain" | "growth";
export type MascotState = CheerState | RestrainState | GrowthState;

interface MascotProps {
  family: MascotFamily;
  state: MascotState;
  style?: CSSProperties;
  pixelSize?: number;
}

// A mascot follows its bar via left/bottom % + translate(-50%). At the very
// start or end of the track that pushes half its width/height off the card,
// so callers should clamp the position through this before passing style.
export function clampMascotPercent(percent: number): number {
  return Math.min(76, Math.max(24, percent));
}

const copyByFamily: Record<MascotFamily, Record<string, string>> = {
  cheer: cheerCopy,
  restrain: restrainCopy,
  growth: growthCopy,
};

function spriteFor(family: MascotFamily, state: MascotState) {
  switch (family) {
    case "cheer":
      return {
        frames: cheerFrames(state as CheerState),
        palette: cheerPalette,
        speedMs: cheerSpeed(state as CheerState),
      };
    case "restrain":
      return {
        frames: restrainFrames(state as RestrainState),
        palette: restrainPalette,
        speedMs: restrainSpeed(state as RestrainState),
      };
    case "growth":
      return {
        frames: growthFrames(state as GrowthState),
        palette: growthPalette,
        speedMs: growthSpeed(state as GrowthState),
      };
  }
}

export function Mascot({ family, state, style, pixelSize = 3 }: MascotProps) {
  const line = copyByFamily[family][state];
  const { frames, palette, speedMs } = spriteFor(family, state);
  const frameIndex = useSpriteFrame(frames.length, speedMs);

  return (
    <div className="art-mascot" data-family={family} data-state={state} style={style}>
      <div className="art-mascot-bob">
        <div className="art-mascot-sprite">
          <PixelSprite grid={frames[frameIndex]} palette={palette} pixelSize={pixelSize} />
        </div>
        <div className="art-mascot-speech">{line}</div>
      </div>
    </div>
  );
}

export default Mascot;
