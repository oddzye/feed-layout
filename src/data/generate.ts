import type { ImageItem, MediaItem, VideoItem } from "@/types/media";

// Mulberry32 — fast seedable PRNG.
function createRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface AspectBucket {
  readonly ratio: number;
  readonly weight: number;
}

// Weighted distribution matching real photo collection statistics.
// Intentionally includes panoramics and portrait to stress-test layout edge cases.
const ASPECT_BUCKETS: readonly AspectBucket[] = [
  { ratio: 16 / 9, weight: 15 },
  { ratio: 4 / 3, weight: 15 },
  { ratio: 3 / 2, weight: 15 },
  { ratio: 2 / 1, weight: 8 },
  { ratio: 16 / 10, weight: 5 },
  { ratio: 3 / 4, weight: 10 },
  { ratio: 9 / 16, weight: 8 },
  { ratio: 2 / 3, weight: 7 },
  { ratio: 1 / 1, weight: 7 },
  { ratio: 3 / 1, weight: 3 },
  { ratio: 21 / 9, weight: 3 },
];

const TOTAL_WEIGHT = ASPECT_BUCKETS.reduce(
  (sum, bucket) => sum + bucket.weight,
  0,
);

// Always exactly 2 rand() calls regardless of bucket chosen — keeps the PRNG
// sequence stable so item types don't shift when the distribution changes.
function pickAspectRatio(rand: () => number): number {
  const target = rand() * TOTAL_WEIGHT;
  let cumulative = 0;
  let selected = ASPECT_BUCKETS[0]?.ratio ?? 4 / 3;

  for (const bucket of ASPECT_BUCKETS) {
    cumulative += bucket.weight;
    if (target <= cumulative) {
      selected = bucket.ratio;
      break;
    }
  }
  // ±5% jitter so the layout algorithm sees non-round numbers from the start
  const jitter = 1 + (rand() - 0.5) * 0.1;
  return selected * jitter;
}

// Short looping clips — all confirmed 200, all under 5MB for fast re-buffering
// after virtualization unmounts and remounts the tile.
const VIDEO_SRCS = [
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",   // 515KB
  "https://www.w3schools.com/html/mov_bbb.mp4",                                  // 788KB
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",   // 1.1MB
  "https://res.cloudinary.com/demo/video/upload/cat.mp4",                        // 3.5MB
  "https://media.w3.org/2010/05/sintel/trailer.mp4",                             // 4.3MB
  "https://media.w3.org/2010/05/video/movie_300.mp4",                            // 2.7MB
] as const satisfies readonly string[];

function pickVideoSrc(index: number): string {
  return VIDEO_SRCS[index % VIDEO_SRCS.length] as string;
}

function picsumUrl(seed: string, w: number, h: number): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

function generateItem(index: number, rand: () => number): MediaItem {
  const rawRatio = pickAspectRatio(rand);
  const isVideo = rand() < 0.1;

  // Canonical source dimensions at 800px wide.
  // aspectRatio is re-derived from the rounded integers — the layout algorithm
  // must see the same ratio the browser will compute from the actual dimensions.
  const canonicalWidth = 800;
  const canonicalHeight = Math.round(canonicalWidth / rawRatio);
  const aspectRatio = canonicalWidth / canonicalHeight;

  const id = `item-${index}`;

  if (isVideo) {
    const item: VideoItem = {
      id,
      type: "video",
      src: pickVideoSrc(index),
      width: canonicalWidth,
      height: canonicalHeight,
      aspectRatio,
      thumbnailSrc: picsumUrl(
        `thumb-${index}`,
        canonicalWidth,
        canonicalHeight,
      ),
    };
    return item;
  }

  const item: ImageItem = {
    id,
    type: "image",
    src: picsumUrl(id, canonicalWidth, canonicalHeight),
    width: canonicalWidth,
    height: canonicalHeight,
    aspectRatio,
    alt: `Photo ${index}`,
  };
  return item;
}

export function generateDataset(
  count: number,
  seed = 42,
): readonly MediaItem[] {
  const rand = createRng(seed);
  return Array.from({ length: count }, (_, i) => generateItem(i, rand));
}
