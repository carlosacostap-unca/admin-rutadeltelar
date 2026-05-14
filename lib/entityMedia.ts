export type EntityMediaRecord = {
  foto_portada?: string | string[] | null;
  galeria_fotos?: string[] | null;
  fotos?: string[] | null;
};

export function getEntityCoverImage(record?: EntityMediaRecord | null): string | null {
  if (!record) return null;
  const explicitCover = firstFilename(record.foto_portada);
  if (explicitCover) return explicitCover;
  return firstFilename(record.fotos);
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
