import { expect, test } from '@playwright/test';

test('protected routes redirect anonymous users to login', async ({ page }) => {
  await page.goto('/estaciones');

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Ruta del Telar' })).toBeVisible();
});
