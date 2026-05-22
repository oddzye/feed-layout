import { generateDataset } from "@/data/generate";
import type { MediaItem } from "@/types/media";

const DATASET: readonly MediaItem[] = generateDataset(2000);
const PREVIEW_COUNT = 30;

// Fixed row height for validation preview — not the justified layout algorithm,
// just enough to confirm images load and videos render with correct proportions.
const PREVIEW_ROW_HEIGHT = 180;

function MediaCard({ item }: { item: MediaItem }) {
  const width = Math.round(PREVIEW_ROW_HEIGHT * item.aspectRatio);

  const containerStyle: React.CSSProperties = {
    width,
    height: PREVIEW_ROW_HEIGHT,
    flexShrink: 0,
    position: "relative",
    background: "#1a1a1a",
    overflow: "hidden",
  };

  if (item.type === "video") {
    return (
      <div style={containerStyle}>
        <video
          src={item.src}
          poster={item.thumbnailSrc}
          controls
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            background: "rgba(0,0,0,0.7)",
            color: "#fff",
            fontSize: 10,
            padding: "2px 5px",
            borderRadius: 3,
          }}
        >
          VIDEO
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <img
        src={item.src}
        alt={item.alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </div>
  );
}

function App() {
  const preview = DATASET.slice(0, PREVIEW_COUNT);

  return (
    <div style={{ padding: "1rem", color: "#e5e5e5", fontFamily: "monospace" }}>
      <div style={{ marginBottom: "1rem", fontSize: "0.8rem", color: "#888" }}>
        <span style={{ marginRight: "1.5rem" }}>Total: {DATASET.length}</span>
        <span>
          Showing first {PREVIEW_COUNT} items at {PREVIEW_ROW_HEIGHT}px height
        </span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {preview.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export default App;
