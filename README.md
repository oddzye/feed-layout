# Feed layout

A justified photo/video feed prototype inspired by Higgsfield — think Google Photos layout with auto-playing video clips mixed in.

---

## Setup

```bash
npm install
npm run dev    # http://localhost:5173
npm run build
```

---

## Where the media comes from

There's no backend or API key involved. Everything is generated at startup from a seeded random number generator so the layout looks the same on every reload.

**Images** come from [Picsum Photos](https://picsum.photos) — a free CDN that returns a deterministic photo for any seed string. Each image is fetched at the exact pixel size of its tile, so there's no wasted bandwidth on oversized images.

**Videos** are a small set of short public-domain clips (515 KB – 4.3 MB) pulled from MDN, W3C, and Cloudinary's demo accounts — no sign-in needed. The six clips cycle across the ~600 video items in the 2 000-item dataset. They're obviously placeholder content; in production you'd swap these for real user-generated clips.

The dataset itself is ~30% videos and ~70% images, with aspect ratios spread across landscape, portrait, square, and panoramic to stress-test the layout. See `src/data/generate.ts`.

---

## What's built

**Justified-row layout.** Each row is filled greedily and then scaled so items stretch edge-to-edge while keeping their original proportions. The last row is left-aligned at the target height rather than stretched — you can tell it's the end of the feed without a visual cue. The whole layout for 2 000 items computes in one pass in under a millisecond.

**Virtualization.** Only the rows near the viewport are in the DOM — roughly 10–12 rows at any time regardless of how many items there are. Scrolling stays smooth because nothing expensive happens on the scroll path; it's just a couple of binary searches and a React state update once per frame.

**Density slider.** There's a "Compact ↔ Spacious" slider in the top-right corner. Dragging it changes how many items fit per row across the whole feed. When you resize the window or move the slider, the feed re-layouts and your scroll position stays anchored to whatever you were looking at — the item doesn't jump.

**Lazy loading.** Images don't start loading until you're about 500 px away from them. Videos auto-play when they enter the viewport and pause when they leave. While anything is loading you see a shimmer skeleton; if a request fails you get a small broken-image icon instead of a stuck spinner. The shimmer animation is skipped automatically for users with reduced-motion enabled.

---

## A few decisions worth calling out

**No virtualization library.** `react-window` and other libs expect a flat list of uniform-height items. Our layout is rows of variable height, computed after the fact, so the library API doesn't fit, and the custom implementation ended up being about 80 lines anyway.

**Density slider, not a column count.** In a justified layout, rows naturally have different numbers of items depending on what's in them. Promising "exactly 5 columns" would be misleading. The slider controls density (Compact to Spacious), which is the version of the same idea.

**Caches at module scope, not in React state.** When virtualization unmounts a tile and remounts it later, component state resets. We keep the image URL and thumbnail-loaded flag outside React so scrolling back to something you've already seen is instant, not a re-load.

---

## What was left out

**Keyboard navigation and accessibility.** No focus management, no ARIA roles on the feed. Would need real work before this is usable without a mouse.

**Infinite scroll.** The dataset is fixed at 2 000 items. Appending more rows while keeping the scroll anchor stable is a non-trivial problem — skipped for now.

**Profiling.** The component tree is shallow and scrolling feels smooth, but there hasn't been a proper profiling pass under a throttled CPU. Worth doing before treating this as production-ready.

---

## Known rough edges

- **Videos re-buffer on scroll-back.** The browser's video buffer is tied to the element, not the URL. When virtualization destroys the element, the buffer is gone. Scrolling back to a video that was already playing means waiting for it to buffer again. With short clips it's quick, but it could be noticeable with the larger test files.

- **The same six video clips repeat.** Placeholder content only. The cycling is obvious once you notice it.

- **Error state retries on remount.** If a tile fails to load and you scroll away and back, it tries again. Usually fine (transient errors), but a permanently broken URL will keep flashing the broken-image icon on every visit.
