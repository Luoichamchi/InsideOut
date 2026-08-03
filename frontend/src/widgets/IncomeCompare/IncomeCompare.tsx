import { useRef, useState } from "react";
import type { CheerState, RestrainState } from "../../domain/types";
import type { MonthOverview } from "../../domain/aggregate";
import { ProgressColumn } from "../../art/ProgressColumn";
import { Mascot, clampMascotPercent } from "../../art/Mascot";
import { formatVND } from "../format";

export interface IncomeCompareProps {
  salary: number;
  profit: number;
  goal: number;
  cheerState: CheerState;
  spent: number;
  budget: number;
  restrainState: RestrainState;
  showMascot?: boolean;
  showSpendingColumn?: boolean;
  month: string;
  yearOverview: MonthOverview[];
  year: string;
  onPrevYear: () => void;
  onNextYear: () => void;
}

const SWIPE_THRESHOLD = 40;

export function IncomeCompare({
  salary,
  profit,
  goal,
  cheerState,
  spent,
  budget,
  restrainState,
  showMascot = true,
  showSpendingColumn = true,
  month,
  yearOverview,
  year,
  onPrevYear,
  onNextYear,
}: IncomeCompareProps) {
  const profitPercent = (profit / salary) * 100;
  const goalPercent = (goal / salary) * 100;
  // Spending column drains from the top: it starts at the budget's height
  // (full tank) and shrinks as expenses eat into it, rather than filling up.
  const remainingPercent = Math.max(0, ((budget - spent) / salary) * 100);
  const isOverBudget = spent > budget;

  const [page, setPage] = useState<0 | 1>(0);
  const startX = useRef<number | null>(null);
  const maxYearValue = Math.max(1, ...yearOverview.flatMap((m) => [m.salary, m.profit, m.spent]));

  const handlePointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    setPage(dx < 0 ? 1 : 0);
  };

  return (
    <div className="widget">
      <h3 className="widget-title">
        {page === 0 ? `Tháng ${month.slice(5)}/${month.slice(0, 4)}` : `Biểu đồ năm ${year}`}
      </h3>
      <div className="income-compare-viewport">
        <div
          className="income-compare-swipe"
          style={{ transform: `translateX(-${page * 50}%)` }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <div className="income-compare-page">
            <div className="income-compare-chart">
              <div className="income-compare-track">
                <ProgressColumn kind="salary" percent={100} />
                <span className="income-compare-label pixel-num">{formatVND(salary)}</span>
              </div>
              <div className="income-compare-track">
                {showMascot && (
                  <Mascot
                    family="cheer"
                    state={cheerState}
                    style={{ bottom: `${clampMascotPercent(profitPercent)}%` }}
                  />
                )}
                <ProgressColumn kind="side" percent={profitPercent} goalPercent={goalPercent} />
                <span className="income-compare-label pixel-num">{formatVND(profit)}</span>
              </div>
              {showSpendingColumn && (
                <div className="income-compare-track">
                  {showMascot && (
                    <Mascot
                      family="restrain"
                      state={restrainState}
                      style={{ bottom: `${clampMascotPercent(remainingPercent)}%` }}
                    />
                  )}
                  <ProgressColumn kind="spending" percent={remainingPercent} over={isOverBudget} />
                  <span className="income-compare-label pixel-num">
                    {formatVND(spent)}/{formatVND(budget)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="income-compare-page">
            <div className="income-compare-year-nav">
              <button type="button" onClick={onPrevYear}>
                ←
              </button>
              <button type="button" onClick={onNextYear}>
                →
              </button>
            </div>
            <div className="income-compare-year-chart">
              {yearOverview.map((m) => (
                <div className="income-compare-year-group" key={m.month}>
                  <div className="income-compare-year-bars">
                    <div
                      className="income-compare-year-bar"
                      data-kind="salary"
                      style={{ height: `${(m.salary / maxYearValue) * 100}%` }}
                    />
                    <div
                      className="income-compare-year-bar"
                      data-kind="side"
                      style={{ height: `${(m.profit / maxYearValue) * 100}%` }}
                    />
                    <div
                      className="income-compare-year-bar"
                      data-kind="spending"
                      style={{ height: `${(m.spent / maxYearValue) * 100}%` }}
                    />
                  </div>
                  <span className="income-compare-year-label">T{Number(m.month.slice(5))}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="income-compare-dots">
        <span className={page === 0 ? "active" : ""} />
        <span className={page === 1 ? "active" : ""} />
      </div>
    </div>
  );
}

export default IncomeCompare;
