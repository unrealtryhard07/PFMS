import { test, expect } from '@playwright/test'

const EMAIL    = process.env['E2E_EMAIL']    ?? 'test@example.com'
const PASSWORD = process.env['E2E_PASSWORD'] ?? 'password'

test.describe('Authentication', () => {
  test('login page renders email and password inputs', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('invalid credentials show error toast', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'wrong@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 6_000 })
  })

  test('valid credentials redirect to dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', EMAIL)
    await page.fill('input[type="password"]', PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL('/', { timeout: 10_000 })
    await expect(page.locator('main')).toBeVisible()
  })

  test('unauthenticated access to /transactions redirects to /login', async ({ page }) => {
    await page.goto('/transactions')
    await expect(page).toHaveURL(//login/, { timeout: 5_000 })
  })
})
