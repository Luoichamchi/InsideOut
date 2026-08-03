import type { ComponentType } from "react";
import { widgetRegistry, type WidgetPropsMap } from "../widgets/registry";
import type { DashboardConfigEntry } from "../config/useDashboardConfig";

interface DashboardProps {
  entries: DashboardConfigEntry[];
  widgetProps: WidgetPropsMap;
}

export function Dashboard({ entries, widgetProps }: DashboardProps) {
  const visible = entries.filter((w) => w.visible).sort((a, b) => a.order - b.order);

  return (
    <div className="dashboard">
      {visible.map((entry) => {
        const Component = widgetRegistry[entry.key] as unknown as ComponentType<Record<string, unknown>>;
        const props = { ...widgetProps[entry.key], ...entry.options };
        return <Component key={entry.key} {...props} />;
      })}
    </div>
  );
}

export default Dashboard;
