import type { MediaItem } from '@/types/media';

export interface LayoutItem {
  readonly mediaItem: MediaItem;
  readonly left: number;   // x-offset within the row (px, float)
  readonly width: number;  // rendered width (px, float)
  readonly height: number; // rendered height (px, float) — same as parent row.height
}

export interface LayoutRow {
  readonly items: readonly LayoutItem[];
  readonly top: number;        // y-offset from top of feed (px)
  readonly height: number;     // row height (px)
  readonly isLastRow: boolean;
}

export interface FeedLayout {
  readonly rows: readonly LayoutRow[];
  readonly totalHeight: number; // full scrollable height of the feed
}

export interface LayoutConfig {
  readonly containerWidth: number;
  readonly targetRowHeight: number;
  readonly gap: number;
}

export function computeLayout(
  items: readonly MediaItem[],
  config: LayoutConfig,
): FeedLayout {
  const { containerWidth, targetRowHeight, gap } = config;

  if (items.length === 0 || containerWidth <= 0 || targetRowHeight <= 0) {
    return { rows: [], totalHeight: 0 };
  }

  const rows: LayoutRow[] = [];
  let pendingItems: MediaItem[] = [];
  let ratioSum = 0;
  let top = 0;

  const sealRow = (batch: readonly MediaItem[], height: number, isLastRow: boolean): void => {
    let left = 0;
    const layoutItems: LayoutItem[] = batch.map((mediaItem) => {
      const width = mediaItem.aspectRatio * height;
      const item: LayoutItem = { mediaItem, left, width, height };
      left += width + gap;
      return item;
    });
    rows.push({ items: layoutItems, top, height, isLastRow });
    top += height + gap;
  };

  for (const item of items) {
    pendingItems.push(item);
    ratioSum += item.aspectRatio;

    // Natural width: total px these items would occupy if rendered at exactly targetRowHeight
    const naturalWidth = ratioSum * targetRowHeight + (pendingItems.length - 1) * gap;

    if (naturalWidth >= containerWidth) {
      // Solve for the height that makes items fill containerWidth exactly:
      //   height × ratioSum + (n−1) × gap = containerWidth
      const rowHeight = (containerWidth - (pendingItems.length - 1) * gap) / ratioSum;
      sealRow(pendingItems, rowHeight, false);
      pendingItems = [];
      ratioSum = 0;
    }
  }

  // Remaining items: last (incomplete) row — left-aligned at target height, no stretching
  if (pendingItems.length > 0) {
    sealRow(pendingItems, targetRowHeight, true);
  }

  // top now points past the end of the last row; subtract the trailing gap
  const totalHeight = rows.length > 0 ? top - gap : 0;

  return { rows, totalHeight };
}
