import { useEffect, useRef, useState } from 'react';
import type { VideoItem } from '@/types/media';
import { BrokenMediaIcon } from './BrokenMediaIcon';

interface Props {
  mediaItem: VideoItem;
}

const thumbnailLoaded = new Set<string>();

export function VideoTile({ mediaItem }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(thumbnailLoaded.has(mediaItem.id));
  const [videoStarted, setVideoStarted] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (!video || error) return;
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
  }, [error]);

  return (
    <div
      ref={containerRef}
      className={`video-tile${!loaded && !videoStarted && !error ? ' tile-skeleton' : ''}`}
    >
      <video
        ref={videoRef}
        src={mediaItem.src}
        poster={mediaItem.thumbnailSrc}
        muted
        loop
        playsInline
        onPlaying={() => setVideoStarted(true)}
        onError={() => setError(true)}
        className="video-tile-video"
      />
      <img
        src={mediaItem.thumbnailSrc}
        alt=""
        onLoad={() => {
          thumbnailLoaded.add(mediaItem.id);
          setLoaded(true);
        }}
        className="video-tile-thumbnail tile-fade"
        style={{ opacity: loaded && !videoStarted ? 1 : 0 }}
      />
      {error && <BrokenMediaIcon />}
    </div>
  );
}
