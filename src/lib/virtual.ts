import type { LayoutRow } from './layout';

export interface VirtualRange {
  readonly startIndex: number;
  readonly endIndex: number; // inclusive; -1 means empty
}

// First row whose bottom edge is below scrollTop (first row not entirely above viewport).
// rows[i].top + rows[i].height is strictly increasing, so binary search is valid.
function findFirstVisible(rows: readonly LayoutRow[], scrollTop: number): number {
  let lo = 0, hi = rows.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const row = rows[mid];
    if (row === undefined || row.top + row.height <= scrollTop) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}

// First row whose top edge is at or below viewBottom (first row fully below viewport).
// rows[i].top is strictly increasing, so binary search is valid.
function findFirstBelow(rows: readonly LayoutRow[], viewBottom: number): number {
  let lo = 0, hi = rows.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const row = rows[mid];
    if (row === undefined || row.top < viewBottom) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}

export function getVisibleRange(
  rows: readonly LayoutRow[],
  scrollTop: number,
  viewportHeight: number,
  overscan: number,
): VirtualRange {
  const n = rows.length;
  if (n === 0) return { startIndex: 0, endIndex: -1 };

  const firstVisible = findFirstVisible(rows, scrollTop);
  const firstBelow = findFirstBelow(rows, scrollTop + viewportHeight);
  const lastVisible = firstBelow - 1;

  return {
    startIndex: Math.max(0, firstVisible - overscan),
    endIndex: Math.min(n - 1, lastVisible + overscan),
  };
}
