import type { ComponentProps } from "react";
import { IncomeCompare } from "./IncomeCompare/IncomeCompare";
import { SavingsGoal } from "./SavingsGoal/SavingsGoal";
import { SalesLog } from "./SalesLog/SalesLog";

export const widgetRegistry = {
  income_compare: IncomeCompare,
  savings_goal: SavingsGoal,
  sales_log: SalesLog,
};

export type WidgetKey = keyof typeof widgetRegistry;

export type WidgetPropsMap = {
  income_compare: ComponentProps<typeof IncomeCompare>;
  savings_goal: ComponentProps<typeof SavingsGoal>;
  sales_log: ComponentProps<typeof SalesLog>;
};
