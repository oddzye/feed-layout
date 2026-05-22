import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { computeLayout } from "@/lib/layout";
import type { FeedLayout } from "@/lib/layout";
import type { MediaItem } from "@/types/media";

export function useLayout(
  items: readonly MediaItem[],
  targetRowHeight: number,
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
        // entries is always non-empty when ResizeObserver fires; take the latest
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
  }, []); // containerRef and setContainerWidth are both stable after mount

  const layout = useMemo((): FeedLayout | null => {
    if (containerWidth <= 0) return null;
    return computeLayout(items, { containerWidth, targetRowHeight, gap });
  }, [items, containerWidth, targetRowHeight, gap]);

  return { layout, containerRef };
}
