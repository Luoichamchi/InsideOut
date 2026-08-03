import { describe, it, expect } from "vitest";
import { deriveCheer, deriveRestrain, deriveGrowth } from "./mascot";

describe("deriveCheer", () => {
  it("returns empty when no profit yet", () => {
    expect(deriveCheer({ profit: 0, goal: 100, dryDays: 0, isRecord: false })).toBe("empty");
  });

  it("cold beats percentage bands even mid-way to goal", () => {
    // 50% of goal would normally be onTrack, but 4 dry days must win.
    expect(deriveCheer({ profit: 50, goal: 100, dryDays: 4, isRecord: false })).toBe("cold");
  });

  it("slow below 40%", () => {
    expect(deriveCheer({ profit: 30, goal: 100, dryDays: 0, isRecord: false })).toBe("slow");
  });

  it("onTrack between 40% and 80%", () => {
    expect(deriveCheer({ profit: 50, goal: 100, dryDays: 0, isRecord: false })).toBe("onTrack");
  });

  it("almost between 80% and 100%", () => {
    expect(deriveCheer({ profit: 85, goal: 100, dryDays: 0, isRecord: false })).toBe("almost");
  });

  it("cleared at or above 100%, not a record", () => {
    expect(deriveCheer({ profit: 100, goal: 100, dryDays: 0, isRecord: false })).toBe("cleared");
  });

  it("newRecord at or above 100% when isRecord", () => {
    expect(deriveCheer({ profit: 120, goal: 100, dryDays: 0, isRecord: true })).toBe("newRecord");
  });
});

describe("deriveRestrain", () => {
  it("calm under 60%", () => {
    expect(deriveRestrain({ spent: 50, budget: 100, wasOverLastMonth: false })).toBe("calm");
  });

  it("watch between 60% and 85%", () => {
    expect(deriveRestrain({ spent: 70, budget: 100, wasOverLastMonth: false })).toBe("watch");
  });

  it("stop between 85% and 100%", () => {
    expect(deriveRestrain({ spent: 90, budget: 100, wasOverLastMonth: false })).toBe("stop");
  });

  it("over above 100% even if recovered flag set", () => {
    expect(deriveRestrain({ spent: 150, budget: 100, wasOverLastMonth: true })).toBe("over");
  });

  it("recovered when back under 60% after a month over budget", () => {
    expect(deriveRestrain({ spent: 40, budget: 100, wasOverLastMonth: true })).toBe("recovered");
  });
});

describe("deriveGrowth", () => {
  it("seed under 20%", () => {
    expect(deriveGrowth({ saved: 10, target: 100 })).toBe("seed");
  });
  it("sprout 20-50%", () => {
    expect(deriveGrowth({ saved: 30, target: 100 })).toBe("sprout");
  });
  it("growing 50-80%", () => {
    expect(deriveGrowth({ saved: 60, target: 100 })).toBe("growing");
  });
  it("blooming 80-99%", () => {
    expect(deriveGrowth({ saved: 90, target: 100 })).toBe("blooming");
  });
  it("harvest at or above 100%", () => {
    expect(deriveGrowth({ saved: 100, target: 100 })).toBe("harvest");
  });
});
