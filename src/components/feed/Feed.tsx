import { useLayout } from "@/hooks/useLayout";
import { useVirtualScroll } from "@/hooks/useVirtualScroll";
import type { MediaItem } from "@/types/media";
import { FeedRow } from "./FeedRow";

interface Props {
  items: readonly MediaItem[];
  targetColumns: number;
  gap: number;
}

// Rows above and below the viewport to keep rendered as a scroll buffer.
const OVERSCAN = 3;

// Stable empty reference — avoids triggering effects on every render when layout is null.
const EMPTY_ROWS = [] as const;

export function Feed({ items, targetColumns, gap }: Props) {
  const { layout, containerRef } = useLayout(items, targetColumns, gap);
  const rows = layout?.rows ?? EMPTY_ROWS;
  const { range, viewportRef } = useVirtualScroll(rows, OVERSCAN);

  const visibleRows = rows.slice(range.startIndex, range.endIndex + 1);

  return (
    // viewport: fixed-height scroll container. scrollTop drives virtualization.
    <div ref={viewportRef} style={{ height: "100dvh", overflow: "auto" }}>
      {/* canvas: full content height so the scrollbar reflects total feed size */}
      <div
        ref={containerRef}
        style={{ position: "relative", height: layout?.totalHeight ?? 0 }}
      >
        {visibleRows.map((row) => (
          // Stable key: reuses the DOM node for this row as the window scrolls past it.
          // Index-as-key would cause React to re-render all shared rows on every scroll step.
          <FeedRow key={row.items[0]?.mediaItem.id ?? row.top} row={row} />
        ))}
      </div>
    </div>
  );
}
