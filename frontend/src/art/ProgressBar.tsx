interface ProgressBarProps {
  percent: number;
  over?: boolean;
}

export function ProgressBar({ percent, over }: ProgressBarProps) {
  return (
    <div className="art-bar-track">
      <div className="art-bar-fill" style={{ width: `${Math.min(100, percent)}%` }} data-over={over} />
    </div>
  );
}

export default ProgressBar;
