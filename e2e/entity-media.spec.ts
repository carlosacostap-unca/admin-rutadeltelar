import { expect, test } from '@playwright/test';
import { getEntityCoverImage, getEntityCoverZoom, getEntityGalleryImages, getGalleryImageCrop, getImageCropStyle, normalizeImageZoom } from '@/lib/entityMedia';

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

test('entity media helper normalizes cover zoom', () => {
  expect(getEntityCoverZoom({ foto_portada_zoom: 175 })).toBe(175);
  expect(normalizeImageZoom(40)).toBe(100);
  expect(normalizeImageZoom(450)).toBe(300);
});

test('entity media helper preserves gallery zoom and starts from full image fit', () => {
  const crop = getGalleryImageCrop({
    'galeria.jpg': { x: 25, y: 75, zoom: 180 },
  }, 'galeria.jpg');

  expect(crop).toEqual({ x: 25, y: 75, zoom: 180 });
  expect(getGalleryImageCrop({}, 'sin-ajustes.jpg')).toEqual({ x: 50, y: 50, zoom: 100 });
  expect(getImageCropStyle(crop, crop.zoom)).toMatchObject({
    objectFit: 'contain',
    objectPosition: '25% 75%',
    transform: 'scale(1.8)',
  });
});
