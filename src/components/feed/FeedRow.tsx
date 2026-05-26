import type { LayoutRow } from '@/lib/layout';
import { MediaTile } from './MediaTile';

interface Props {
  row: LayoutRow;
}

export function FeedRow({ row }: Props) {
  return (
    <div className="feed-row" style={{ top: row.top, height: row.height }}>
      {row.items.map((item) => (
        <MediaTile key={item.mediaItem.id} layoutItem={item} />
      ))}
    </div>
  );
}
