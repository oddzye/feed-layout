import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ImageItem } from '@/types/media';

interface Props {
  mediaItem: ImageItem;
  displayWidth: number;
  displayHeight: number;
}

const MAX_DPR = 2;

function buildSrc(itemId: string, displayWidth: number, displayHeight: number): string {
  const dpr = Math.min(window.devicePixelRatio, MAX_DPR);
  const w = Math.round(displayWidth * dpr);
  const h = Math.round(displayHeight * dpr);
  return `https://picsum.photos/seed/${itemId}/${w}/${h}`;
}

// Module-level: survives component unmount/remount across the feed's lifetime.
// Stores the exact URL that was loaded — not reconstructed from current dimensions —
// so a layout resize after first load doesn't produce a different URL and a cache miss.
const srcCache = new Map<string, string>();

export function ImageTile({ mediaItem, displayWidth, displayHeight }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dimsRef = useRef({ width: displayWidth, height: displayHeight });

  // Keep dimsRef current without mutating it during render (linter violation).
  // useLayoutEffect with no deps runs after every render, synchronously before
  // paint — well before any IntersectionObserver callback can fire.
  useLayoutEffect(() => {
    dimsRef.current = { width: displayWidth, height: displayHeight };
  });

  const cachedSrc = srcCache.get(mediaItem.id);
  const [src, setSrc] = useState<string | undefined>(cachedSrc);
  const [loaded, setLoaded] = useState(cachedSrc !== undefined);

  useEffect(() => {
    // Skip IO setup if we already have a src (restored from cache or just set).
    if (src !== undefined) return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          const { width, height } = dimsRef.current;
          setSrc(buildSrc(mediaItem.id, width, height));
          observer.disconnect();
        }
      },
      { rootMargin: '500px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [mediaItem.id, src]);

  const handleLoad = () => {
    if (src !== undefined) srcCache.set(mediaItem.id, src);
    setLoaded(true);
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      {src !== undefined && (
        <img
          src={src}
          alt={mediaItem.alt}
          onLoad={handleLoad}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.25s ease',
          }}
        />
      )}
    </div>
  );
}
