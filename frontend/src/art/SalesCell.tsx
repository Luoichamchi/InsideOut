export function SalesCell({ day, active }: { day: number; active: boolean }) {
  return (
    <div className="art-sales-cell pixel-num" data-active={active}>
      {day}
    </div>
  );
}

export default SalesCell;
