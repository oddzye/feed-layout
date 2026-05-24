import type { LayoutItem } from '@/lib/layout';

interface Props {
  layoutItem: LayoutItem;
}

export function MediaTile({ layoutItem }: Props) {
  const { mediaItem, left, width, height } = layoutItem;

  const tileStyle: React.CSSProperties = {
    position: 'absolute',
    left,
    top: 0,
    width,
    height,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  };

  const mediaStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  if (mediaItem.type === 'video') {
    return (
      <div style={tileStyle}>
        <video
          src={mediaItem.src}
          poster={mediaItem.thumbnailSrc}
          controls
          preload="none"
          style={mediaStyle}
        />
      </div>
    );
  }

  return (
    <div style={tileStyle}>
      <img
        src={mediaItem.src}
        alt={mediaItem.alt}
        loading="lazy"
        style={mediaStyle}
      />
    </div>
  );
}
