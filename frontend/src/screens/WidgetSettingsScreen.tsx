import type { WidgetKey } from "../widgets/registry";
import type { DashboardConfigEntry } from "../config/useDashboardConfig";

const labels: Record<WidgetKey, string> = {
  income_compare: "Để dành · Kiếm thêm · Chi tiêu",
  savings_goal: "Tiến độ tích góp",
  sales_log: "Nhật ký bán hàng",
};

interface WidgetSettingsScreenProps {
  entries: DashboardConfigEntry[];
  onToggle: (key: WidgetKey) => void;
  onToggleOption: (key: WidgetKey, optionKey: string) => void;
  onMoveUp: (key: WidgetKey) => void;
  onMoveDown: (key: WidgetKey) => void;
}

export function WidgetSettingsScreen({
  entries,
  onToggle,
  onToggleOption,
  onMoveUp,
  onMoveDown,
}: WidgetSettingsScreenProps) {
  const sorted = [...entries].sort((a, b) => a.order - b.order);

  return (
    <div className="screen">
      <h2 className="screen-title">Bật/tắt & sắp xếp widget</h2>
      <ul className="widget-settings-list">
        {sorted.map((w, i) => (
          <li key={w.key} className="widget-settings-row">
            <div className="widget-settings-row-main">
              <label>
                <input type="checkbox" checked={w.visible} onChange={() => onToggle(w.key)} />
                {labels[w.key]}
              </label>
              <div className="widget-settings-actions">
                <button type="button" disabled={i === 0} onClick={() => onMoveUp(w.key)}>
                  ↑
                </button>
                <button type="button" disabled={i === sorted.length - 1} onClick={() => onMoveDown(w.key)}>
                  ↓
                </button>
              </div>
            </div>
            {w.key === "income_compare" && (
              <label className="widget-settings-sub">
                <input
                  type="checkbox"
                  checked={(w.options?.showSpendingColumn ?? true) as boolean}
                  onChange={() => onToggleOption("income_compare", "showSpendingColumn")}
                />
                └ Hiện cột chi tiêu trên chart
              </label>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WidgetSettingsScreen;
