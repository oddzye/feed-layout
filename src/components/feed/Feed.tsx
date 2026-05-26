import { useLayout } from "@/hooks/useLayout";
import { useVirtualScroll } from "@/hooks/useVirtualScroll";
import type { MediaItem } from "@/types/media";
import { FeedRow } from "./FeedRow";

interface Props {
  items: readonly MediaItem[];
  targetColumns: number;
  gap: number;
}

const OVERSCAN = 3;
const EMPTY_ROWS = [] as const;

export function Feed({ items, targetColumns, gap }: Props) {
  const { layout, containerRef } = useLayout(items, targetColumns, gap);
  const rows = layout?.rows ?? EMPTY_ROWS;
  const { range, viewportRef } = useVirtualScroll(rows, OVERSCAN);

  const visibleRows = rows.slice(range.startIndex, range.endIndex + 1);

  return (
    <div ref={viewportRef} className="feed-viewport">
      <div
        ref={containerRef}
        className="feed-canvas"
        style={{ height: layout?.totalHeight ?? 0 }}
      >
        {visibleRows.map((row) => (
          <FeedRow key={row.items[0]?.mediaItem.id ?? row.top} row={row} />
        ))}
      </div>
    </div>
  );
}
