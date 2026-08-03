interface ProgressColumnProps {
  percent: number; // 0-100+, portion filled — unfilled blocks are never rendered
  goalPercent?: number;
  kind: "salary" | "side" | "spending";
  over?: boolean; // spending only: spent > budget, shown even when percent has floored to 0
}

// Pixel style (project-brief A.1): 20 discrete blocks stacked from the
// bottom, each worth scale/20. Unfilled slots render nothing (no gray
// placeholder) — that contrast is the whole point of the income_compare rule.
const BLOCK_COUNT = 20;

export function ProgressColumn({ percent, goalPercent, kind, over }: ProgressColumnProps) {
  const filled = Math.min(BLOCK_COUNT, Math.max(0, Math.floor((percent / 100) * BLOCK_COUNT)));
  const empty = BLOCK_COUNT - filled;

  return (
    <div className="art-column" data-kind={kind}>
      {goalPercent !== undefined && (
        <div className="art-goal-line" style={{ bottom: `${Math.min(100, goalPercent)}%` }} />
      )}
      <div className="art-column-blocks">
        {Array.from({ length: empty }, (_, i) => (
          <div key={`e${i}`} className="art-column-slot" />
        ))}
        {Array.from({ length: filled }, (_, i) => (
          <div key={`f${i}`} className="art-column-slot art-column-slot-filled" />
        ))}
      </div>
      {over && <div className="art-column-over-marker" />}
    </div>
  );
}

export default ProgressColumn;
