export type EntityMediaRecord = {
  foto_portada?: string | string[] | null;
  foto_portada_focus_x?: number | null;
  foto_portada_focus_y?: number | null;
  foto_portada_zoom?: number | null;
  galeria_fotos?: string[] | null;
  galeria_fotos_focus?: EntityStoredGalleryFocus | null;
  fotos?: string[] | null;
  media_optimizados?: string[] | null;
  media_optimizados_map?: EntityOptimizedMediaMap | null;
};

export type EntityImageFocus = {
  x: number;
  y: number;
};

export type EntityImageCrop = EntityImageFocus & {
  zoom: number;
};

export type EntityStoredGalleryFocus = Record<string, Partial<EntityImageCrop>>;

export type EntityGalleryFocus = Record<string, EntityImageCrop>;

export type EntityOptimizedMediaMap = Record<string, string | null | undefined>;

export type EntityMediaImageRef = {
  filename: string;
  sourceField: 'foto_portada' | 'galeria_fotos' | 'fotos';
  displayFilename: string;
};

export const DEFAULT_IMAGE_FOCUS: EntityImageFocus = { x: 50, y: 50 };
export const DEFAULT_IMAGE_ZOOM = 100;
export const DEFAULT_IMAGE_CROP: EntityImageCrop = { ...DEFAULT_IMAGE_FOCUS, zoom: DEFAULT_IMAGE_ZOOM };

export function getEntityCoverImage(record?: EntityMediaRecord | null): string | null {
  return getEntityCoverImageRef(record)?.filename ?? null;
}

export function getEntityCoverImageRef(record?: EntityMediaRecord | null): EntityMediaImageRef | null {
  if (!record) return null;
  const explicitCover = firstFilename(record.foto_portada);
  if (explicitCover) return buildImageRef(record, 'foto_portada', explicitCover);

  const legacyCover = firstFilename(record.fotos);
  if (legacyCover) return buildImageRef(record, 'fotos', legacyCover);

  return null;
}

export function getEntityCoverFocus(record?: EntityMediaRecord | null): EntityImageFocus {
  if (!record) return DEFAULT_IMAGE_FOCUS;
  return normalizeImageFocus({
    x: record.foto_portada_focus_x,
    y: record.foto_portada_focus_y,
  });
}

export function getEntityCoverZoom(record?: EntityMediaRecord | null): number {
  return normalizeImageZoom(record?.foto_portada_zoom);
}

export function getEntityGalleryFocuses(record?: EntityMediaRecord | null): EntityGalleryFocus {
  if (!record?.galeria_fotos_focus || typeof record.galeria_fotos_focus !== 'object') return {};
  return Object.fromEntries(
    Object.entries(record.galeria_fotos_focus)
      .map(([filename, crop]) => [filename, normalizeImageCrop(crop)])
      .filter(([filename]) => Boolean(filename))
  );
}

export function getGalleryImageFocus(focuses: EntityGalleryFocus | null | undefined, filename: string): EntityImageFocus {
  return normalizeImageFocus(focuses?.[filename]);
}

export function getGalleryImageCrop(focuses: EntityGalleryFocus | null | undefined, filename: string): EntityImageCrop {
  return normalizeImageCrop(focuses?.[filename]);
}

export function getImageFocusStyle(focus?: EntityImageFocus | null) {
  const normalized = normalizeImageFocus(focus);
  return { objectPosition: `${normalized.x}% ${normalized.y}%` };
}

export function getImageCropStyle(focus?: EntityImageFocus | null, zoom?: number | null) {
  const normalizedFocus = normalizeImageFocus(focus);
  const normalizedZoom = normalizeImageZoom(zoom);
  const focusPoint = `${normalizedFocus.x}% ${normalizedFocus.y}%`;

  return {
    objectFit: 'contain' as const,
    objectPosition: focusPoint,
    transform: `scale(${normalizedZoom / 100})`,
    transformOrigin: focusPoint,
  };
}

export function pruneGalleryFocuses(focuses: EntityGalleryFocus, filenames: string[]): EntityGalleryFocus {
  const allowed = new Set(filenames);
  return Object.fromEntries(
    Object.entries(focuses).filter(([filename]) => allowed.has(filename))
  );
}

export function normalizeImageFocus(focus?: { x?: unknown; y?: unknown } | null): EntityImageFocus {
  return {
    x: clampFocus(focus?.x),
    y: clampFocus(focus?.y),
  };
}

export function normalizeImageCrop(crop?: { x?: unknown; y?: unknown; zoom?: unknown } | null): EntityImageCrop {
  const normalizedFocus = normalizeImageFocus(crop);
  return {
    ...normalizedFocus,
    zoom: normalizeImageZoom(crop?.zoom),
  };
}

export function normalizeImageZoom(value: unknown): number {
  const numberValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numberValue)) return DEFAULT_IMAGE_ZOOM;
  return Math.min(300, Math.max(100, Math.round(numberValue)));
}

export function getEntityGalleryImages(record?: EntityMediaRecord | null): string[] {
  return getEntityGalleryImageRefs(record).map((image) => image.filename);
}

export function getEntityGalleryImageRefs(record?: EntityMediaRecord | null): EntityMediaImageRef[] {
  if (!record) return [];
  const cover = getEntityCoverImageRef(record);
  const legacyFotos = normalizeFilenames(record.fotos);
  const legacyGallery = firstFilename(record.foto_portada) ? legacyFotos : legacyFotos.slice(1);
  const refs = [
    ...normalizeFilenames(record.galeria_fotos).map((filename) => buildImageRef(record, 'galeria_fotos', filename)),
    ...legacyGallery.map((filename) => buildImageRef(record, 'fotos', filename)),
  ];

  return dedupeImageRefs(refs).filter((image) => image.filename !== cover?.filename);
}

export function getEntityMediaImages(record?: EntityMediaRecord | null) {
  const cover = getEntityCoverImageRef(record);
  const gallery = getEntityGalleryImageRefs(record);
  return { cover, gallery };
}

export function dedupeFilenames(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

function firstFilename(value?: string | string[] | null): string | null {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

function normalizeFilenames(value?: string | string[] | null): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

function buildImageRef(record: EntityMediaRecord, sourceField: EntityMediaImageRef['sourceField'], filename: string): EntityMediaImageRef {
  return {
    filename,
    sourceField,
    displayFilename: getOptimizedFilename(record, sourceField, filename) || filename,
  };
}

function getOptimizedFilename(record: EntityMediaRecord, sourceField: EntityMediaImageRef['sourceField'], filename: string) {
  if (!record.media_optimizados_map || typeof record.media_optimizados_map !== 'object') return null;
  const mapped = record.media_optimizados_map[`${sourceField}:${filename}`];
  if (!mapped || !normalizeFilenames(record.media_optimizados).includes(mapped)) return null;
  return mapped;
}

function dedupeImageRefs(values: EntityMediaImageRef[]): EntityMediaImageRef[] {
  const seen = new Set<string>();
  const deduped: EntityMediaImageRef[] = [];
  for (const value of values) {
    if (seen.has(value.filename)) continue;
    seen.add(value.filename);
    deduped.push(value);
  }
  return deduped;
}

function clampFocus(value: unknown): number {
  const numberValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numberValue)) return 50;
  return Math.min(100, Math.max(0, Math.round(numberValue)));
}
