import type {
  Transaction,
  MonthlyConfig,
  CheerContext,
  RestrainContext,
  GrowthContext,
} from "./types";

export function sumByType(
  transactions: Transaction[],
  month: string,
  type: Transaction["type"]
): number {
  return transactions
    .filter((t) => t.type === type && t.date.slice(0, 7) === month)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function previousMonthKey(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Consecutive days with no side_income, walking back from referenceDate.
export function computeDryDays(
  transactions: Transaction[],
  referenceDate: string
): number {
  const sideDays = new Set(
    transactions.filter((t) => t.type === "side_income").map((t) => t.date)
  );
  const cursor = new Date(`${referenceDate}T00:00:00`);
  let count = 0;
  while (!sideDays.has(toISODate(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
    if (count > 3650) break; // ponytail: safety guard, not a real calendar bound
  }
  return count;
}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function isNewRecord(transactions: Transaction[], month: string): boolean {
  const totals: Record<string, number> = {};
  for (const t of transactions) {
    if (t.type !== "side_income") continue;
    const m = t.date.slice(0, 7);
    totals[m] = (totals[m] ?? 0) + t.amount;
  }
  const current = totals[month] ?? 0;
  const priorMax = Math.max(
    0,
    ...Object.entries(totals)
      .filter(([m]) => m !== month)
      .map(([, v]) => v)
  );
  return current > priorMax;
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
  transactions: Transaction[],
  config: MonthlyConfig,
  referenceDate: string
): CheerContext {
  return {
    profit: sumByType(transactions, config.month, "side_income"),
    goal: config.side_goal,
    dryDays: computeDryDays(transactions, referenceDate),
    isRecord: isNewRecord(transactions, config.month),
  };
}

export function buildRestrainContext(
  transactions: Transaction[],
  configs: MonthlyConfig[],
  month: string
): RestrainContext {
  const config = configs.find((c) => c.month === month);
  if (!config) throw new Error(`no config for month ${month}`);
  const prevMonth = previousMonthKey(month);
  const prevConfig = configs.find((c) => c.month === prevMonth);
  const wasOverLastMonth = prevConfig
    ? sumByType(transactions, prevMonth, "expense") > prevConfig.budget
    : false;
  return {
    spent: sumByType(transactions, month, "expense"),
    budget: config.budget,
    wasOverLastMonth,
  };
}

export function buildGrowthContext(
  transactions: Transaction[],
  month: string,
  savingsTarget: number
): GrowthContext {
  return {
    saved: sumByType(transactions, month, "saving"),
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
  transactions: Transaction[],
  configs: MonthlyConfig[],
  year: string
): MonthOverview[] {
  return Array.from({ length: 12 }, (_, i) => {
    const month = `${year}-${String(i + 1).padStart(2, "0")}`;
    const config = configs.find((c) => c.month === month);
    return {
      month,
      salary: config?.salary_amount ?? 0,
      profit: sumByType(transactions, month, "side_income"),
      spent: sumByType(transactions, month, "expense"),
    };
  });
}
