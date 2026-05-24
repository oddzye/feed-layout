import type { LayoutRow } from '@/lib/layout';
import { MediaTile } from './MediaTile';

interface Props {
  row: LayoutRow;
}

export function FeedRow({ row }: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        top: row.top,
        left: 0,
        width: '100%',
        height: row.height,
      }}
    >
      {row.items.map((item) => (
        <MediaTile key={item.mediaItem.id} layoutItem={item} />
      ))}
    </div>
  );
}
