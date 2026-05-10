import { expect, test } from '@playwright/test';

test('login page renders the Ruta del Telar access screen', async ({ page }) => {
  await page.goto('/login');

  await expect(page).toHaveTitle(/Ruta del Telar/);
  await expect(page.getByRole('heading', { name: 'Ruta del Telar' })).toBeVisible();
  await expect(page.getByText(/Sistema de Gesti/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /Iniciar sesi/i })).toBeVisible();
});
