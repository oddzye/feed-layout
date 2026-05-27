import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { computeLayout } from "@/lib/layout";
import type { FeedLayout } from "@/lib/layout";
import type { MediaItem } from "@/types/media";

export function useLayout(
  items: readonly MediaItem[],
  targetColumns: number,
  gap: number,
): {
  layout: FeedLayout | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
} {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Synchronous initial measurement: fires before the browser paints so the
  // first visible frame already has the correct layout (no empty-feed flash).
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (el) setContainerWidth(el.getBoundingClientRect().width);
  }, []);

  // ResizeObserver handles all subsequent container size changes.
  // rAF throttle: ResizeObserver can fire multiple times per frame; we coalesce
  // into one update per frame using the latest reported entry.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let rafId: number | undefined;

    const observer = new ResizeObserver((entries) => {
      if (rafId !== undefined) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = undefined;
        const entry = entries[entries.length - 1];
        if (entry) {
          const width = entry.contentRect.width;
          if (width > 0) setContainerWidth(width);
        }
      });
    });

    observer.observe(el);

    return () => {
      if (rafId !== undefined) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  // Average aspect ratio of the dataset — used to convert targetColumns → targetRowHeight.
  // A justified row at targetRowHeight with targetColumns average-ratio items fills exactly
  // containerWidth: targetRowHeight = (containerWidth − (n−1)×gap) / (n × avgAspectRatio)
  const avgAspectRatio = useMemo(
    () =>
      items.length === 0
        ? 1
        : items.reduce((sum, item) => sum + item.aspectRatio, 0) / items.length,
    [items],
  );

  // Fixed reference width keeps targetRowHeight constant regardless of viewport size.
  // On a narrow window fewer items fit per row at the same absolute height, so the
  // layout restructures on resize rather than just scaling everything down.
  const REFERENCE_WIDTH = 1200;

  const layout = useMemo((): FeedLayout | null => {
    if (containerWidth <= 0 || targetColumns <= 0) return null;
    const targetRowHeight =
      (REFERENCE_WIDTH - (targetColumns - 1) * gap) / (targetColumns * avgAspectRatio);
    return computeLayout(items, { containerWidth, targetRowHeight, gap });
  }, [items, containerWidth, targetColumns, gap, avgAspectRatio]);

  return { layout, containerRef };
}
