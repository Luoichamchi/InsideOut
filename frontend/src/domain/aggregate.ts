import type {
  Transaction,
  MonthSummary,
  MonthlyConfig,
  CheerContext,
  RestrainContext,
  GrowthContext,
} from "./types";

// Number of days used when there's no prior side_income at all — matches the
// old client-side walk-back guard, kept only as a display cap.
const DRY_DAYS_CAP = 3650;

function summaryFor(summaries: MonthSummary[], month: string): MonthSummary {
  return (
    summaries.find((s) => s.month === month) ?? {
      month,
      side_income: 0,
      expense: 0,
      saving: 0,
    }
  );
}

export function previousMonthKey(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Whole-day gap between two YYYY-MM-DD dates (b - a), or the display cap when
// there's no prior side_income date to measure from.
export function dryDaysSince(lastSideIncomeDate: string | null, referenceDate: string): number {
  if (!lastSideIncomeDate) return DRY_DAYS_CAP;
  const a = new Date(`${lastSideIncomeDate}T00:00:00`);
  const b = new Date(`${referenceDate}T00:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

// 31-slot grid for sales_log; index i = day i+1, false past end of month.
export function computeSalesLog(transactions: Transaction[], month: string): boolean[] {
  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const hasOrder = new Set(
    transactions
      .filter((t) => t.type === "side_income" && t.date.slice(0, 7) === month)
      .map((t) => t.date)
  );
  return Array.from({ length: 31 }, (_, i) => {
    if (i >= daysInMonth) return false;
    const day = String(i + 1).padStart(2, "0");
    return hasOrder.has(`${month}-${day}`);
  });
}

export function buildCheerContext(
  summaries: MonthSummary[],
  config: MonthlyConfig,
  dryDays: number
): CheerContext {
  const current = summaryFor(summaries, config.month).side_income;
  const priorMax = Math.max(
    0,
    ...summaries.filter((s) => s.month !== config.month).map((s) => s.side_income)
  );
  return {
    profit: current,
    goal: config.side_goal,
    dryDays,
    isRecord: current > priorMax,
  };
}

export function buildRestrainContext(
  summaries: MonthSummary[],
  configs: MonthlyConfig[],
  month: string
): RestrainContext {
  const config = configs.find((c) => c.month === month);
  if (!config) throw new Error(`no config for month ${month}`);
  const prevMonth = previousMonthKey(month);
  const prevConfig = configs.find((c) => c.month === prevMonth);
  const wasOverLastMonth = prevConfig
    ? summaryFor(summaries, prevMonth).expense > prevConfig.budget
    : false;
  return {
    spent: summaryFor(summaries, month).expense,
    budget: config.budget,
    wasOverLastMonth,
  };
}

export function buildGrowthContext(
  summaries: MonthSummary[],
  month: string,
  savingsTarget: number
): GrowthContext {
  return {
    saved: summaryFor(summaries, month).saving,
    target: savingsTarget,
  };
}

export interface MonthOverview {
  month: string; // YYYY-MM
  salary: number;
  profit: number;
  spent: number;
}

// One entry per calendar month of `year`, in order — months with no saved
// config fall back to salary: 0 rather than throwing, since past/future
// months may never have had a config row.
export function buildYearlyOverview(
  summaries: MonthSummary[],
  configs: MonthlyConfig[],
  year: string
): MonthOverview[] {
  return Array.from({ length: 12 }, (_, i) => {
    const month = `${year}-${String(i + 1).padStart(2, "0")}`;
    const config = configs.find((c) => c.month === month);
    const s = summaryFor(summaries, month);
    return {
      month,
      salary: config?.salary_amount ?? 0,
      profit: s.side_income,
      spent: s.expense,
    };
  });
}
