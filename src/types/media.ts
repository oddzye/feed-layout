interface BaseMediaItem {
  readonly id: string;
  readonly src: string;
  readonly width: number;       // canonical source width (px)
  readonly height: number;      // canonical source height (px)
  readonly aspectRatio: number; // precomputed width / height (derived from integers)
}

export interface ImageItem extends BaseMediaItem {
  readonly type: 'image';
  readonly alt: string;
}

export interface VideoItem extends BaseMediaItem {
  readonly type: 'video';
  readonly thumbnailSrc: string;
}

export type MediaItem = ImageItem | VideoItem;
