import type { GrowthState } from "../../domain/types";
import { ProgressBar } from "../../art/ProgressBar";
import { Mascot } from "../../art/Mascot";
import { formatVND } from "../format";

export interface SavingsGoalProps {
  saved: number;
  target: number;
  growthState: GrowthState;
}

export function SavingsGoal({ saved, target, growthState }: SavingsGoalProps) {
  const percent = (saved / target) * 100;

  return (
    <div className="widget savings-goal-widget">
      <h3 className="widget-title">Tiến độ tích góp</h3>
      <div className="savings-goal-track-row">
        <div className="savings-goal-track">
          <ProgressBar percent={percent} />
        </div>
        <Mascot family="growth" state={growthState} style={{ position: "static", transform: "none" }} />
      </div>
      <span className="savings-goal-label pixel-num">
        {formatVND(saved)} / {formatVND(target)}
      </span>
    </div>
  );
}

export default SavingsGoal;
