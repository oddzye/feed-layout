import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ImageItem } from '@/types/media';
import { BrokenMediaIcon } from './BrokenMediaIcon';

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

  useLayoutEffect(() => {
    dimsRef.current = { width: displayWidth, height: displayHeight };
  });

  const cachedSrc = srcCache.get(mediaItem.id);
  const [src, setSrc] = useState<string | undefined>(cachedSrc);
  const [loaded, setLoaded] = useState(cachedSrc !== undefined);
  const [error, setError] = useState(false);

  useEffect(() => {
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
    <div
      ref={containerRef}
      className={`image-tile${!loaded && !error ? ' tile-skeleton' : ''}`}
    >
      {src !== undefined && (
        <img
          src={src}
          alt={mediaItem.alt}
          onLoad={handleLoad}
          onError={() => setError(true)}
          className="image-tile-img tile-fade"
          style={{ opacity: loaded ? 1 : 0 }}
        />
      )}
      {error && <BrokenMediaIcon />}
    </div>
  );
}
