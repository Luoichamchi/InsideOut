export type TransactionType = "side_income" | "expense" | "saving";

export interface Transaction {
  id: number;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  amount: number; // VND, integer, no float
  note: string | null;
}

export interface MonthSummary {
  month: string; // YYYY-MM
  side_income: number;
  expense: number;
  saving: number;
}

export interface MonthlyConfig {
  month: string; // YYYY-MM
  salary_amount: number;
  side_goal: number;
  budget: number;
}

// Not tied to any month — a single global setting.
export interface AppSettings {
  savings_target: number;
}

export type CheerState =
  | "empty"
  | "cold"
  | "slow"
  | "onTrack"
  | "almost"
  | "cleared"
  | "newRecord";

export interface CheerContext {
  profit: number;
  goal: number;
  dryDays: number;
  isRecord: boolean;
}

export type RestrainState = "calm" | "watch" | "stop" | "over" | "recovered";

export interface RestrainContext {
  spent: number;
  budget: number;
  wasOverLastMonth: boolean;
}

export type GrowthState = "seed" | "sprout" | "growing" | "blooming" | "harvest";

export interface GrowthContext {
  saved: number;
  target: number;
}
