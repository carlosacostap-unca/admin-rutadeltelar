import { expect, test } from '@playwright/test';
import {
  editorUser,
  mockAuthenticatedUser,
  mockPocketBaseCollections,
  revisorUser,
} from './fixtures/pocketbase';

test('editor can open the drafts queue with mocked draft content', async ({ page }) => {
  await mockAuthenticatedUser(page, editorUser);
  await mockPocketBaseCollections(page, {
    estaciones: [{
      id: 'draft-estacion',
      nombre: 'Estacion en borrador',
      localidad: 'Tinogasta',
      estado: 'borrador',
      updated: '2026-01-05 00:00:00.000Z',
    }],
  });

  await page.goto('/borradores');

  await expect(page.getByRole('heading', { name: 'Borradores' })).toBeVisible();
  await expect(page.getByText('Estacion en borrador')).toBeVisible();
  await expect(page.locator('span', { hasText: /^BORRADOR$/ })).toBeVisible();
});

test('reviewer can open the review queue with mocked review content', async ({ page }) => {
  await mockAuthenticatedUser(page, revisorUser);
  await mockPocketBaseCollections(page, {
    productos: [{
      id: 'review-producto',
      nombre: 'Poncho en revision',
      categoria: 'Textil',
      estado: 'en_revision',
      updated: '2026-01-06 00:00:00.000Z',
    }],
  });

  await page.goto('/revision');

  await expect(page.getByRole('heading', { name: /Revisi.n de Contenido/i })).toBeVisible();
  await expect(page.getByText('Poncho en revision')).toBeVisible();
  await expect(page.locator('span', { hasText: /^EN REVISI.N$/i })).toBeVisible();
});
