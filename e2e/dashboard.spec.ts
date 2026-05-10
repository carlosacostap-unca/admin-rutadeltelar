import { expect, test } from '@playwright/test';
import { adminUser, editorUser, mockAuthenticatedUser, mockPocketBaseCollections } from './fixtures/pocketbase';

test('admin user sees dashboard metrics and administration navigation', async ({ page }) => {
  await mockAuthenticatedUser(page, adminUser);
  await mockPocketBaseCollections(page, {
    estaciones: [{ id: 'est-1' }, { id: 'est-2' }],
    actores: [{ id: 'act-1' }],
    productos: [{ id: 'prod-1' }, { id: 'prod-2' }, { id: 'prod-3' }],
    experiencias: [],
    imperdibles: [{ id: 'imp-1' }],
    users: [adminUser],
  });

  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Bienvenido\/a, Admin Test/i })).toBeVisible();
  await expect(page.locator('aside').getByRole('link', { name: 'Dashboard' })).toBeVisible();
  await expect(page.locator('aside').getByRole('link', { name: 'Usuarios' })).toBeVisible();
  await expect(page.locator('aside').getByRole('link', { name: /Auditor/i })).toBeVisible();
  await expect(page.locator('main').getByRole('link', { name: '2 Estaciones' })).toBeVisible();
  await expect(page.locator('main').getByRole('link', { name: '3 Productos' })).toBeVisible();
});

test('editor user sees editorial navigation but not admin-only links', async ({ page }) => {
  await mockAuthenticatedUser(page, editorUser);
  await mockPocketBaseCollections(page);

  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Bienvenido\/a, Editor Test/i })).toBeVisible();
  await expect(page.locator('aside').getByRole('link', { name: 'Estaciones' })).toBeVisible();
  await expect(page.locator('aside').getByRole('link', { name: 'Borradores' })).toBeVisible();
  await expect(page.locator('aside').getByRole('link', { name: 'Usuarios' })).toHaveCount(0);
  await expect(page.locator('aside').getByRole('link', { name: /Auditor/i })).toHaveCount(0);
});
