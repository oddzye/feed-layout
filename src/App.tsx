import { useRef, useState, useLayoutEffect, useMemo } from "react";
import { generateDataset } from "@/data/generate";
import { computeLayout } from "@/lib/layout";
import type { FeedLayout, LayoutItem, LayoutRow } from "@/lib/layout";

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

  const imgStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  if (mediaItem.type === "video") {
    return (
      <div style={tileStyle}>
        {/*
          preload="none" — browser loads nothing until the user clicks play.
          Without this, 200+ video elements would each request metadata on mount.
          poster shows the picsum thumbnail while the video is idle.
        */}
        <video
          src={mediaItem.src}
          poster={mediaItem.thumbnailSrc}
          controls
          preload="none"
          style={{ ...imgStyle, objectFit: "cover" }}
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
        style={imgStyle}
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  const layout = useMemo((): FeedLayout | null => {
    if (containerWidth === 0) return null;
    return computeLayout(DATASET, {
      containerWidth,
      targetRowHeight: TARGET_ROW_HEIGHT,
      gap: GAP,
    });
  }, [containerWidth]);

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
