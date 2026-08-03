import { useEffect, useState } from "react";

export function useSpriteFrame(frameCount: number, intervalMs: number): number {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    setFrame(0);
    if (frameCount <= 1) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % frameCount), intervalMs);
    return () => clearInterval(id);
  }, [frameCount, intervalMs]);

  return frame;
}
