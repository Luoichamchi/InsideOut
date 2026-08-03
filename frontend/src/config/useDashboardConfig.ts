import { useState } from "react";
import rawConfig from "./dashboard.config.json";
import type { WidgetKey } from "../widgets/registry";

export interface DashboardConfigEntry {
  key: WidgetKey;
  visible: boolean;
  order: number;
  options?: Record<string, unknown>;
}

const STORAGE_KEY = "dashboard-config-overrides";

type Overrides = Record<string, { visible: boolean; order: number; options?: Record<string, unknown> }>;

function loadOverrides(): Overrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function mergedEntries(): DashboardConfigEntry[] {
  const overrides = loadOverrides();
  return (rawConfig.widgets as DashboardConfigEntry[]).map((w) => {
    const o = overrides[w.key];
    return { ...w, ...o, options: { ...w.options, ...o?.options } };
  });
}

export function useDashboardConfig() {
  const [entries, setEntries] = useState<DashboardConfigEntry[]>(mergedEntries);

  const persist = (next: DashboardConfigEntry[]) => {
    const overrides: Overrides = {};
    for (const e of next) overrides[e.key] = { visible: e.visible, order: e.order, options: e.options };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    setEntries(next);
  };

  const toggleVisible = (key: WidgetKey) => {
    persist(entries.map((e) => (e.key === key ? { ...e, visible: !e.visible } : e)));
  };

  const toggleOption = (key: WidgetKey, optionKey: string) => {
    persist(
      entries.map((e) =>
        e.key === key ? { ...e, options: { ...e.options, [optionKey]: !(e.options?.[optionKey] ?? true) } } : e
      )
    );
  };

  const move = (key: WidgetKey, direction: -1 | 1) => {
    const sorted = [...entries].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((e) => e.key === key);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    persist(
      entries.map((e) => {
        if (e.key === a.key) return { ...e, order: b.order };
        if (e.key === b.key) return { ...e, order: a.order };
        return e;
      })
    );
  };

  return {
    entries,
    toggleVisible,
    toggleOption,
    moveUp: (key: WidgetKey) => move(key, -1),
    moveDown: (key: WidgetKey) => move(key, 1),
  };
}
