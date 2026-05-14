import { expect, test } from '@playwright/test';
import { getEntityCoverImage, getEntityGalleryImages } from '@/lib/entityMedia';

test('entity media helper uses first legacy photo as cover and dedupes gallery', () => {
  const record = {
    fotos: ['portada.jpg', 'galeria-1.jpg', 'galeria-1.jpg', 'galeria-2.jpg'],
  };

  expect(getEntityCoverImage(record)).toBe('portada.jpg');
  expect(getEntityGalleryImages(record)).toEqual(['galeria-1.jpg', 'galeria-2.jpg']);
});

test('entity media helper prefers explicit cover and excludes it from gallery', () => {
  const record = {
    foto_portada: 'portada-explicita.jpg',
    galeria_fotos: ['galeria-1.jpg', 'portada-explicita.jpg'],
    fotos: ['legacy-cover.jpg', 'galeria-1.jpg', 'galeria-2.jpg'],
  };

  expect(getEntityCoverImage(record)).toBe('portada-explicita.jpg');
  expect(getEntityGalleryImages(record)).toEqual(['galeria-1.jpg', 'legacy-cover.jpg', 'galeria-2.jpg']);
});
