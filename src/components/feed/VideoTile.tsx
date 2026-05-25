import { useEffect, useRef, useState } from 'react';
import type { VideoItem } from '@/types/media';

interface Props {
  mediaItem: VideoItem;
}

const thumbnailLoaded = new Set<string>();

export function VideoTile({ mediaItem }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(thumbnailLoaded.has(mediaItem.id));
  const [videoStarted, setVideoStarted] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (!video) return;
        if (entry?.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <video
        ref={videoRef}
        src={mediaItem.src}
        poster={mediaItem.thumbnailSrc}
        muted
        loop
        playsInline
        onPlaying={() => setVideoStarted(true)}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      {/* Thumbnail overlaid on video, fades out once video starts playing */}
      <img
        src={mediaItem.thumbnailSrc}
        alt=""
        onLoad={() => {
          thumbnailLoaded.add(mediaItem.id);
          setLoaded(true);
        }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: loaded && !videoStarted ? 1 : 0,
          transition: 'opacity 0.25s ease',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
