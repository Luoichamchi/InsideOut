import { useCallback, useEffect, useState } from "react";
import { Dashboard } from "./dashboard/Dashboard";
import {
  buildCheerContext,
  buildRestrainContext,
  buildGrowthContext,
  buildYearlyOverview,
  computeSalesLog,
} from "./domain/aggregate";
import { deriveCheer, deriveRestrain, deriveGrowth } from "./domain/mascot";
import { fetchTransactions, fetchConfigs, fetchSettings } from "./api/client";
import { useDashboardConfig } from "./config/useDashboardConfig";
import { TransactionsScreen } from "./screens/TransactionsScreen";
import { ConfigScreen } from "./screens/ConfigScreen";
import { WidgetSettingsScreen } from "./screens/WidgetSettingsScreen";
import { todayISO, currentMonth } from "./today";
import type { Transaction, MonthlyConfig, AppSettings } from "./domain/types";
import type { WidgetPropsMap } from "./widgets/registry";
import "./theme/theme.css";

const DEFAULT_CONFIG_VALUES = {
  salary_amount: 12_000_000,
  side_goal: 6_000_000,
  budget: 8_000_000,
};

const DEFAULT_SETTINGS: AppSettings = { savings_target: 50_000_000 };

type Tab = "dashboard" | "transactions" | "config" | "settings";

function App() {
  const month = currentMonth();
  const today = todayISO();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [configs, setConfigs] = useState<MonthlyConfig[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [chartYear, setChartYear] = useState(month.slice(0, 4));
  const [loading, setLoading] = useState(true);
  const { entries, toggleVisible, toggleOption, moveUp, moveDown } = useDashboardConfig();

  const reload = useCallback(async () => {
    const [allTransactions, allConfigs, appSettings] = await Promise.all([
      fetchTransactions(),
      fetchConfigs(),
      fetchSettings(),
    ]);
    setTransactions(allTransactions);
    setConfigs(allConfigs);
    setSettings(appSettings);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  if (loading) {
    return <div className="app">Đang tải...</div>;
  }

  const config: MonthlyConfig = configs.find((c) => c.month === month) ?? { month, ...DEFAULT_CONFIG_VALUES };

  const cheerCtx = buildCheerContext(transactions, config, today);
  const restrainCtx = buildRestrainContext(transactions, configs.some((c) => c.month === month) ? configs : [...configs, config], month);
  const growthCtx = buildGrowthContext(transactions, month, settings.savings_target);
  const yearOverview = buildYearlyOverview(transactions, configs, chartYear);

  const widgetProps: WidgetPropsMap = {
    income_compare: {
      salary: config.salary_amount,
      profit: cheerCtx.profit,
      goal: config.side_goal,
      cheerState: deriveCheer(cheerCtx),
      spent: restrainCtx.spent,
      budget: restrainCtx.budget,
      restrainState: deriveRestrain(restrainCtx),
      month,
      yearOverview,
      year: chartYear,
      onPrevYear: () => setChartYear(String(Number(chartYear) - 1)),
      onNextYear: () => setChartYear(String(Number(chartYear) + 1)),
    },
    savings_goal: {
      saved: growthCtx.saved,
      target: growthCtx.target,
      growthState: deriveGrowth(growthCtx),
    },
    sales_log: {
      days: computeSalesLog(transactions, month),
    },
  };

  return (
    <div className="app">
      <header className="app-header">Goal Fighter</header>

      {tab === "dashboard" && <Dashboard entries={entries} widgetProps={widgetProps} />}
      {tab === "transactions" && (
        <TransactionsScreen
          transactions={transactions.filter((t) => t.date.slice(0, 7) === month)}
          today={today}
          onChanged={reload}
        />
      )}
      {tab === "config" && (
        <ConfigScreen month={month} config={config} settings={settings} onSaved={reload} />
      )}
      {tab === "settings" && (
        <WidgetSettingsScreen
          entries={entries}
          onToggle={toggleVisible}
          onToggleOption={toggleOption}
          onMoveUp={moveUp}
          onMoveDown={moveDown}
        />
      )}

      <nav className="bottom-nav">
        <button className={tab === "dashboard" ? "active" : ""} onClick={() => setTab("dashboard")}>
          Tổng quan
        </button>
        <button className={tab === "transactions" ? "active" : ""} onClick={() => setTab("transactions")}>
          Giao dịch
        </button>
        <button className={tab === "config" ? "active" : ""} onClick={() => setTab("config")}>
          Cấu hình
        </button>
        <button className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")}>
          Widget
        </button>
      </nav>
    </div>
  );
}

export default App;
