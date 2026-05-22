import { generateDataset } from "@/data/generate";
import { useLayout } from "@/hooks/useLayout";
import type { LayoutItem, LayoutRow } from "@/lib/layout";

const DATASET = generateDataset(2000);
const TARGET_ROW_HEIGHT = 220;
const GAP = 4;

function MediaTile({ layoutItem }: { layoutItem: LayoutItem }) {
  const { mediaItem, left, width, height } = layoutItem;

  const tileStyle: React.CSSProperties = {
    position: "absolute",
    left,
    top: 0,
    width,
    height,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  };

  const mediaStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  if (mediaItem.type === "video") {
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

function FeedRow({ row }: { row: LayoutRow }) {
  return (
    <div
      style={{
        position: "absolute",
        top: row.top,
        left: 0,
        width: "100%",
        height: row.height,
      }}
    >
      {row.items.map((item) => (
        <MediaTile key={item.mediaItem.id} layoutItem={item} />
      ))}
    </div>
  );
}

function App() {
  const { layout, containerRef } = useLayout(DATASET, TARGET_ROW_HEIGHT, GAP);

  return (
    <div style={{ padding: GAP }}>
      <div
        ref={containerRef}
        style={{
          position: "relative",
          height: layout?.totalHeight ?? 0,
        }}
      >
        {layout?.rows.map((row, i) => (
          <FeedRow key={i} row={row} />
        ))}
      </div>
    </div>
  );
}

export default App;
