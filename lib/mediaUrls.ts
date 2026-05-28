import pb from './pocketbase';

export const POCKETBASE_IMAGE_THUMBS = ['320x0', '768x0', '1280x0', '1600x0'] as const;

export type PocketBaseImageUsage = 'thumbnail' | 'small' | 'medium' | 'large';

const THUMB_BY_USAGE: Record<PocketBaseImageUsage, (typeof POCKETBASE_IMAGE_THUMBS)[number]> = {
  thumbnail: '320x0',
  small: '768x0',
  medium: '1280x0',
  large: '1600x0',
};

export function getPocketBaseImageUrl(
  record: object,
  filename: string,
  usage: PocketBaseImageUsage = 'medium'
) {
  return pb.files.getURL(record as Record<string, unknown>, filename, { thumb: THUMB_BY_USAGE[usage] });
}

export function getPocketBaseOriginalFileUrl(record: object, filename: string) {
  return pb.files.getURL(record as Record<string, unknown>, filename);
}
