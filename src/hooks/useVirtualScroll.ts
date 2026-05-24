import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getVisibleRange } from '@/lib/virtual';
import type { VirtualRange } from '@/lib/virtual';
import type { LayoutRow } from '@/lib/layout';

const EMPTY_RANGE: VirtualRange = { startIndex: 0, endIndex: 0 };

export function useVirtualScroll(
  rows: readonly LayoutRow[],
  overscan: number,
): {
  range: VirtualRange;
  viewportRef: React.RefObject<HTMLDivElement | null>;
} {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const [range, setRange] = useState<VirtualRange>(EMPTY_RANGE);

  // Recompute range before paint whenever rows or overscan change.
  // Covers: initial mount and layout recomputation on container resize.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || rows.length === 0) return;

    const next = getVisibleRange(rows, viewport.scrollTop, viewport.clientHeight, overscan);
    setRange((prev) =>
      prev.startIndex === next.startIndex && prev.endIndex === next.endIndex ? prev : next,
    );
  }, [rows, overscan]);

  // Re-attach scroll listener when rows change so the closure is never stale.
  // passive: true — browser doesn't wait for the handler before compositing scroll.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const onScroll = () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = undefined;
        const next = getVisibleRange(rows, viewport.scrollTop, viewport.clientHeight, overscan);
        setRange((prev) =>
          prev.startIndex === next.startIndex && prev.endIndex === next.endIndex ? prev : next,
        );
      });
    };

    viewport.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      viewport.removeEventListener('scroll', onScroll);
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    };
  }, [rows, overscan]);

  return { range, viewportRef };
}
