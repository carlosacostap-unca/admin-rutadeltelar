export type EntityMediaRecord = {
  foto_portada?: string | string[] | null;
  foto_portada_focus_x?: number | null;
  foto_portada_focus_y?: number | null;
  galeria_fotos?: string[] | null;
  galeria_fotos_focus?: EntityGalleryFocus | null;
  fotos?: string[] | null;
};

export type EntityImageFocus = {
  x: number;
  y: number;
};

export type EntityGalleryFocus = Record<string, EntityImageFocus>;

export const DEFAULT_IMAGE_FOCUS: EntityImageFocus = { x: 50, y: 50 };

export function getEntityCoverImage(record?: EntityMediaRecord | null): string | null {
  if (!record) return null;
  const explicitCover = firstFilename(record.foto_portada);
  if (explicitCover) return explicitCover;
  return firstFilename(record.fotos);
}

export function getEntityCoverFocus(record?: EntityMediaRecord | null): EntityImageFocus {
  if (!record) return DEFAULT_IMAGE_FOCUS;
  return normalizeImageFocus({
    x: record.foto_portada_focus_x,
    y: record.foto_portada_focus_y,
  });
}

export function getEntityGalleryFocuses(record?: EntityMediaRecord | null): EntityGalleryFocus {
  if (!record?.galeria_fotos_focus || typeof record.galeria_fotos_focus !== 'object') return {};
  return Object.fromEntries(
    Object.entries(record.galeria_fotos_focus)
      .map(([filename, focus]) => [filename, normalizeImageFocus(focus)])
      .filter(([filename]) => Boolean(filename))
  );
}

export function getGalleryImageFocus(focuses: EntityGalleryFocus | null | undefined, filename: string): EntityImageFocus {
  return normalizeImageFocus(focuses?.[filename]);
}

export function getImageFocusStyle(focus?: EntityImageFocus | null) {
  const normalized = normalizeImageFocus(focus);
  return { objectPosition: `${normalized.x}% ${normalized.y}%` };
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

export function getEntityGalleryImages(record?: EntityMediaRecord | null): string[] {
  if (!record) return [];
  const cover = getEntityCoverImage(record);
  const legacyFotos = normalizeFilenames(record.fotos);
  const legacyGallery = firstFilename(record.foto_portada) ? legacyFotos : legacyFotos.slice(1);

  return dedupeFilenames([
    ...normalizeFilenames(record.galeria_fotos),
    ...legacyGallery,
  ]).filter((filename) => filename !== cover);
}

export function getEntityMediaImages(record?: EntityMediaRecord | null) {
  const cover = getEntityCoverImage(record);
  const gallery = getEntityGalleryImages(record);
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

function clampFocus(value: unknown): number {
  const numberValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numberValue)) return 50;
  return Math.min(100, Math.max(0, Math.round(numberValue)));
}
