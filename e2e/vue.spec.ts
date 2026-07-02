import { test, expect } from '@playwright/test'

test('login page renders email and password fields', async ({ page }) => {
  await page.goto('/auth/login')
  await expect(page.locator('#email')).toBeVisible()
  await expect(page.locator('#password')).toBeVisible()
  await expect(page.getByRole('button', { name: /login|log in/i })).toBeVisible()
})
