import type { LayoutItem } from '@/lib/layout';
import { ImageTile } from './ImageTile';
import { VideoTile } from './VideoTile';

interface Props {
  layoutItem: LayoutItem;
}

export function MediaTile({ layoutItem }: Props) {
  const { mediaItem, left, width, height } = layoutItem;

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top: 0,
        width,
        height,
        overflow: 'hidden',
        // Dark base shows through as skeleton while image/poster loads
        backgroundColor: '#1a1a1a',
      }}
    >
      {mediaItem.type === 'image' ? (
        <ImageTile mediaItem={mediaItem} displayWidth={width} displayHeight={height} />
      ) : (
        <VideoTile mediaItem={mediaItem} />
      )}
    </div>
  );
}
