import type {
  CheerContext,
  CheerState,
  RestrainContext,
  RestrainState,
  GrowthContext,
  GrowthState,
} from "./types";

// Event beats threshold: `cold` must be checked before percentage bands,
// otherwise a long dry streak inside an otherwise-decent month never surfaces.
export function deriveCheer(ctx: CheerContext): CheerState {
  if (ctx.profit <= 0) return "empty";
  if (ctx.dryDays >= 4) return "cold";
  const r = ctx.profit / ctx.goal;
  if (r >= 1) return ctx.isRecord ? "newRecord" : "cleared";
  if (r >= 0.8) return "almost";
  if (r >= 0.4) return "onTrack";
  return "slow";
}

export function deriveRestrain(ctx: RestrainContext): RestrainState {
  const r = ctx.spent / ctx.budget;
  if (r > 1) return "over";
  if (ctx.wasOverLastMonth && r < 0.6) return "recovered";
  if (r >= 0.85) return "stop";
  if (r >= 0.6) return "watch";
  return "calm";
}

export function deriveGrowth(ctx: GrowthContext): GrowthState {
  const r = ctx.saved / ctx.target;
  if (r >= 1) return "harvest";
  if (r >= 0.8) return "blooming";
  if (r >= 0.5) return "growing";
  if (r >= 0.2) return "sprout";
  return "seed";
}
