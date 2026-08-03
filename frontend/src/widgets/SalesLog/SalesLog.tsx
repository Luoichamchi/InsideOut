import { SalesCell } from "../../art/SalesCell";

export interface SalesLogProps {
  days: boolean[]; // 31 slots, index i = day i+1
}

export function SalesLog({ days }: SalesLogProps) {
  return (
    <div className="widget">
      <h3 className="widget-title">Nhật ký bán hàng</h3>
      <div className="sales-log-grid">
        {days.map((active, i) => (
          <SalesCell key={i} day={i + 1} active={active} />
        ))}
      </div>
    </div>
  );
}

export default SalesLog;
