import { CatalogoItem } from '@/types/catalogo';

export const getCatalogoLabel = (
  expanded: CatalogoItem | null | undefined,
  fallback?: string | null
) => {
  return expanded?.nombre || fallback || '-';
};

export const buildCatalogoSort = () => 'nombre';

export const normalizeCatalogName = (value?: string | null) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
