import { expect, test } from '@playwright/test';
import { adminUser, mockAuthenticatedUser, mockPocketBaseCollections } from './fixtures/pocketbase';

const estaciones = [
  {
    id: 'est-santa-maria',
    nombre: 'Estacion Santa Maria',
    eslogan: 'Telares del valle',
    localidad: 'Santa Maria',
    departamento: 'dep-santa-maria',
    estado: 'aprobado',
    created: '2026-01-01 00:00:00.000Z',
    updated: '2026-01-02 00:00:00.000Z',
  },
  {
    id: 'est-belen',
    nombre: 'Estacion Belen',
    eslogan: 'Memoria textil',
    localidad: 'Belen',
    departamento: 'dep-belen',
    estado: 'borrador',
    created: '2026-01-03 00:00:00.000Z',
    updated: '2026-01-04 00:00:00.000Z',
  },
];

test('station list renders records and filters by search text', async ({ page }) => {
  await mockAuthenticatedUser(page, adminUser);
  await mockPocketBaseCollections(page, { estaciones });

  await page.goto('/estaciones');

  await expect(page.locator('main').getByRole('heading', { name: 'Estaciones', exact: true })).toBeVisible();
  await expect(page.locator('main').getByRole('link', { name: /Nueva Estaci/i })).toBeVisible();
  await expect(page.getByText('Estacion Santa Maria')).toBeVisible();
  await expect(page.getByText('Estacion Belen')).toBeVisible();

  await page.getByPlaceholder(/Buscar por nombre/i).fill('Belen');

  await expect(page.getByText('Estacion Belen')).toBeVisible();
  await expect(page.getByText('Estacion Santa Maria')).toHaveCount(0);
});
