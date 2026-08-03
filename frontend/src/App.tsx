import { useCallback, useEffect, useRef, useState } from "react";
import { Dashboard } from "./dashboard/Dashboard";
import {
  buildCheerContext,
  buildRestrainContext,
  buildGrowthContext,
  buildYearlyOverview,
  computeSalesLog,
  dryDaysSince,
} from "./domain/aggregate";
import { deriveCheer, deriveRestrain, deriveGrowth } from "./domain/mascot";
import {
  fetchTransactions,
  fetchMonthlySummary,
  fetchLastSideIncomeDate,
  fetchConfigs,
  fetchSettings,
} from "./api/client";
import { useDashboardConfig } from "./config/useDashboardConfig";
import { TransactionsScreen } from "./screens/TransactionsScreen";
import { ConfigScreen } from "./screens/ConfigScreen";
import { WidgetSettingsScreen } from "./screens/WidgetSettingsScreen";
import { todayISO, currentMonth } from "./today";
import type { Transaction, MonthSummary, MonthlyConfig, AppSettings } from "./domain/types";
import type { WidgetPropsMap } from "./widgets/registry";
import "./theme/theme.css";

const DEFAULT_CONFIG_VALUES = {
  salary_amount: 12_000_000,
  side_goal: 6_000_000,
  budget: 8_000_000,
};

const DEFAULT_SETTINGS: AppSettings = { savings_target: 50_000_000 };

type Tab = "dashboard" | "transactions" | "config" | "settings";

const PULL_THRESHOLD = 70;
const MAX_PULL = 120;

function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [pull, setPull] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const pullRef = useRef(0);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (refreshing || window.scrollY > 0) {
        startY.current = null;
        return;
      }
      startY.current = e.touches[0].clientY;
      setDragging(true);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (startY.current === null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta <= 0) return;
      e.preventDefault();
      pullRef.current = Math.min(delta * 0.5, MAX_PULL);
      setPull(pullRef.current);
    };
    const onTouchEnd = () => {
      if (startY.current === null) return;
      startY.current = null;
      setDragging(false);
      if (pullRef.current >= PULL_THRESHOLD) {
        setPull(PULL_THRESHOLD);
        setRefreshing(true);
        onRefresh().finally(() => {
          setRefreshing(false);
          setPull(0);
        });
      } else {
        setPull(0);
      }
      pullRef.current = 0;
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [onRefresh, refreshing]);

  return { pull, dragging, refreshing };
}

function App() {
  const month = currentMonth();
  const today = todayISO();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [monthTransactions, setMonthTransactions] = useState<Transaction[]>([]);
  const [summaries, setSummaries] = useState<MonthSummary[]>([]);
  const [dryDays, setDryDays] = useState(0);
  const [configs, setConfigs] = useState<MonthlyConfig[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [chartYear, setChartYear] = useState(month.slice(0, 4));
  const [loading, setLoading] = useState(true);
  const { entries, toggleVisible, toggleOption, moveUp, moveDown } = useDashboardConfig();

  const reload = useCallback(async () => {
    const [thisMonthTransactions, monthlySummaries, lastSideIncomeDate, allConfigs, appSettings] =
      await Promise.all([
        fetchTransactions(month),
        fetchMonthlySummary(),
        fetchLastSideIncomeDate(today),
        fetchConfigs(),
        fetchSettings(),
      ]);
    setMonthTransactions(thisMonthTransactions);
    setSummaries(monthlySummaries);
    setDryDays(dryDaysSince(lastSideIncomeDate, today));
    setConfigs(allConfigs);
    setSettings(appSettings);
    setLoading(false);
  }, [month, today]);

  useEffect(() => {
    reload();
  }, [reload]);

  const { pull, dragging, refreshing } = usePullToRefresh(reload);

  if (loading) {
    return <div className="app">Đang tải...</div>;
  }

  const config: MonthlyConfig = configs.find((c) => c.month === month) ?? { month, ...DEFAULT_CONFIG_VALUES };

  const cheerCtx = buildCheerContext(summaries, config, dryDays);
  const restrainCtx = buildRestrainContext(summaries, configs.some((c) => c.month === month) ? configs : [...configs, config], month);
  const growthCtx = buildGrowthContext(summaries, month, settings.savings_target);
  const yearOverview = buildYearlyOverview(summaries, configs, chartYear);

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
      days: computeSalesLog(monthTransactions, month),
    },
  };

  return (
    <div className="app">
      <header className="app-header">Goal Fighter</header>

      <div
        className="pull-indicator"
        style={{ height: pull, transition: dragging ? "none" : "height 200ms ease" }}
      >
        {refreshing ? "Đang tải lại..." : pull >= PULL_THRESHOLD ? "Thả để tải lại" : pull > 0 ? "Kéo để tải lại" : ""}
      </div>

      {tab === "dashboard" && <Dashboard entries={entries} widgetProps={widgetProps} />}
      {tab === "transactions" && (
        <TransactionsScreen
          transactions={monthTransactions}
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
