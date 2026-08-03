import type { PixelGrid } from "./render";

interface PixelSpriteProps {
  grid: PixelGrid;
  palette: Record<string, string>;
  pixelSize?: number;
}

export function PixelSprite({ grid, palette, pixelSize = 3 }: PixelSpriteProps) {
  const height = grid.length;
  const width = grid[0]?.length ?? 0;

  return (
    <svg
      width={width * pixelSize}
      height={height * pixelSize}
      shapeRendering="crispEdges"
      style={{ display: "block" }}
    >
      {grid.flatMap((row, y) =>
        row.split("").map((ch, x) =>
          ch === "." ? null : (
            <rect
              key={`${x}-${y}`}
              x={x * pixelSize}
              y={y * pixelSize}
              width={pixelSize}
              height={pixelSize}
              fill={palette[ch] ?? "#000"}
            />
          )
        )
      )}
    </svg>
  );
}

export default PixelSprite;
