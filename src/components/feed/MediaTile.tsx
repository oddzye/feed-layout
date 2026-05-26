import type { LayoutItem } from '@/lib/layout';
import { ImageTile } from './ImageTile';
import { VideoTile } from './VideoTile';

interface Props {
  layoutItem: LayoutItem;
}

export function MediaTile({ layoutItem }: Props) {
  const { mediaItem, left, width, height } = layoutItem;

  return (
    <div className="media-tile" style={{ left, width, height }}>
      {mediaItem.type === 'image' ? (
        <ImageTile mediaItem={mediaItem} displayWidth={width} displayHeight={height} />
      ) : (
        <VideoTile mediaItem={mediaItem} />
      )}
    </div>
  );
}
