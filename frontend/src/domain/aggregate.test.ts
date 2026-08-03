import { describe, it, expect } from "vitest";
import type { Transaction, MonthSummary, MonthlyConfig } from "./types";
import {
  previousMonthKey,
  dryDaysSince,
  computeSalesLog,
  buildCheerContext,
  buildRestrainContext,
  buildGrowthContext,
  buildYearlyOverview,
} from "./aggregate";

const tx = (id: number, date: string, type: Transaction["type"], amount: number): Transaction => ({
  id,
  date,
  type,
  amount,
  note: null,
});

const summary = (
  month: string,
  side_income = 0,
  expense = 0,
  saving = 0
): MonthSummary => ({ month, side_income, expense, saving });

describe("previousMonthKey", () => {
  it("rolls back across year boundary", () => {
    expect(previousMonthKey("2026-01")).toBe("2025-12");
  });
  it("rolls back within a year", () => {
    expect(previousMonthKey("2026-08")).toBe("2026-07");
  });
});

describe("dryDaysSince", () => {
  it("counts back from reference date to last side_income day", () => {
    // Aug 5 - Aug 1 = 4 dry days (2,3,4,5)
    expect(dryDaysSince("2026-08-01", "2026-08-05")).toBe(4);
  });

  it("is zero when income on the reference date itself", () => {
    expect(dryDaysSince("2026-08-05", "2026-08-05")).toBe(0);
  });

  it("falls back to the display cap when there is no prior side_income", () => {
    expect(dryDaysSince(null, "2026-08-05")).toBe(3650);
  });
});

describe("computeSalesLog", () => {
  it("marks only days with a side_income transaction", () => {
    const transactions = [
      tx(1, "2026-08-01", "side_income", 100),
      tx(2, "2026-08-03", "side_income", 100),
      tx(3, "2026-08-03", "expense", 100),
    ];
    const log = computeSalesLog(transactions, "2026-08");
    expect(log[0]).toBe(true);
    expect(log[1]).toBe(false);
    expect(log[2]).toBe(true);
    expect(log.length).toBe(31);
  });

  it("pads past end of month with false", () => {
    const log = computeSalesLog([], "2026-02"); // 28 days in 2026
    expect(log[27]).toBe(false);
    expect(log[28]).toBe(false);
  });
});

describe("context builders", () => {
  const configs: MonthlyConfig[] = [
    { month: "2026-07", salary_amount: 12_000_000, side_goal: 6_000_000, budget: 8_000_000 },
    { month: "2026-08", salary_amount: 12_000_000, side_goal: 6_000_000, budget: 8_000_000 },
  ];

  it("buildCheerContext wires profit/goal/dryDays/isRecord", () => {
    const summaries = [summary("2026-08", 3_000_000)];
    const ctx = buildCheerContext(summaries, configs[1], 0);
    expect(ctx).toEqual({ profit: 3_000_000, goal: 6_000_000, dryDays: 0, isRecord: true });
  });

  it("buildCheerContext.isRecord is false when a prior month was higher", () => {
    const summaries = [summary("2026-07", 700), summary("2026-08", 600)];
    const ctx = buildCheerContext(summaries, configs[1], 0);
    expect(ctx.isRecord).toBe(false);
  });

  it("buildRestrainContext flags wasOverLastMonth from prior month's spend vs budget", () => {
    const summaries = [
      summary("2026-07", 0, 9_000_000), // over July's 8M budget
      summary("2026-08", 0, 1_000_000),
    ];
    const ctx = buildRestrainContext(summaries, configs, "2026-08");
    expect(ctx).toEqual({ spent: 1_000_000, budget: 8_000_000, wasOverLastMonth: true });
  });

  it("buildGrowthContext wires saved/target", () => {
    const summaries = [summary("2026-08", 0, 0, 25_000_000)];
    const ctx = buildGrowthContext(summaries, "2026-08", 50_000_000);
    expect(ctx).toEqual({ saved: 25_000_000, target: 50_000_000 });
  });
});

describe("buildYearlyOverview", () => {
  const configs: MonthlyConfig[] = [
    { month: "2026-08", salary_amount: 12_000_000, side_goal: 6_000_000, budget: 8_000_000 },
  ];

  it("returns 12 months in order, salary/profit/spent per month", () => {
    const summaries = [
      summary("2026-03", 2_000_000, 500_000),
      summary("2026-11", 1_000_000),
    ];
    const overview = buildYearlyOverview(summaries, configs, "2026");

    expect(overview).toHaveLength(12);
    expect(overview.map((m) => m.month)).toEqual([
      "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06",
      "2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12",
    ]);
    expect(overview[2]).toEqual({ month: "2026-03", salary: 0, profit: 2_000_000, spent: 500_000 });
    expect(overview[7]).toEqual({ month: "2026-08", salary: 12_000_000, profit: 0, spent: 0 });
  });

  it("falls back to salary: 0 for months with no saved config", () => {
    const overview = buildYearlyOverview([], configs, "2026");
    expect(overview[0].salary).toBe(0); // 2026-01 has no config row
  });
});
