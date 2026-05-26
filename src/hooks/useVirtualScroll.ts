import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getVisibleRange } from '@/lib/virtual';
import type { VirtualRange } from '@/lib/virtual';
import type { LayoutRow } from '@/lib/layout';

const EMPTY_RANGE: VirtualRange = { startIndex: 0, endIndex: 0 };
const FAST_SCROLL_PX_PER_MS = 20;

export function useVirtualScroll(
  rows: readonly LayoutRow[],
  overscan: number,
): {
  range: VirtualRange;
  viewportRef: React.RefObject<HTMLDivElement | null>;
} {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | undefined>(undefined);
  // Tracks the previous rows reference to detect layout recomputes.
  const prevRowsRef = useRef<readonly LayoutRow[] | undefined>(undefined);
  const [range, setRange] = useState<VirtualRange>(EMPTY_RANGE);

  // Recompute range before paint whenever rows or overscan change.
  // When rows changed because the layout recomputed (resize or row-height change),
  // anchor-restore runs first so the range is computed from the corrected scrollTop —
  // not the stale one. Both steps must be in one effect to guarantee this ordering.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || rows.length === 0) {
      prevRowsRef.current = rows;
      return;
    }

    let scrollTop = viewport.scrollTop;

    const prevRows = prevRowsRef.current;
    if (prevRows !== undefined && prevRows !== rows && scrollTop > 0) {
      // Binary-search the first partially-visible row in the old layout.
      const { startIndex } = getVisibleRange(prevRows, scrollTop, 0, 0);
      const anchorRow = prevRows[startIndex];
      if (anchorRow !== undefined) {
        const anchorItem = anchorRow.items[0];
        if (anchorItem !== undefined) {
          const offsetFromRowTop = scrollTop - anchorRow.top;
          // Find the same row in the new layout by its first item's stable ID.
          const newRow = rows.find(
            (r) => r.items[0]?.mediaItem.id === anchorItem.mediaItem.id,
          );
          if (newRow !== undefined) {
            scrollTop = newRow.top + Math.min(offsetFromRowTop, newRow.height);
            viewport.scrollTop = scrollTop;
          }
        }
      }
    }
    prevRowsRef.current = rows;

    const next = getVisibleRange(rows, scrollTop, viewport.clientHeight, overscan);
    setRange((prev) =>
      prev.startIndex === next.startIndex && prev.endIndex === next.endIndex ? prev : next,
    );
  }, [rows, overscan]);

  // Re-attach scroll listener when rows change so the closure is never stale.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let lastScrollTop = viewport.scrollTop;
    let lastScrollTime = performance.now();
    let slowdownTimer: ReturnType<typeof setTimeout> | undefined;

    const updateRange = (scrollTop: number) => {
      const next = getVisibleRange(rows, scrollTop, viewport.clientHeight, overscan);
      setRange((prev) =>
        prev.startIndex === next.startIndex && prev.endIndex === next.endIndex ? prev : next,
      );
    };

    const onScroll = () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = undefined;
        const now = performance.now();
        const scrollTop = viewport.scrollTop;
        const velocity = Math.abs(scrollTop - lastScrollTop) / Math.max(now - lastScrollTime, 1);
        lastScrollTop = scrollTop;
        lastScrollTime = now;

        if (slowdownTimer !== undefined) {
          clearTimeout(slowdownTimer);
          slowdownTimer = undefined;
        }

        if (velocity > FAST_SCROLL_PX_PER_MS) {
          // Fast-scroll grace: defer range update until scrolling settles.
          slowdownTimer = setTimeout(() => {
            slowdownTimer = undefined;
            updateRange(viewport.scrollTop);
          }, 150);
          return;
        }

        updateRange(scrollTop);
      });
    };

    viewport.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      viewport.removeEventListener('scroll', onScroll);
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
      if (slowdownTimer !== undefined) clearTimeout(slowdownTimer);
    };
  }, [rows, overscan]);

  return { range, viewportRef };
}
