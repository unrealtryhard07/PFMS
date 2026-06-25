import { test, expect } from '@playwright/test'

const EMAIL    = process.env['E2E_EMAIL']    ?? 'test@example.com'
const PASSWORD = process.env['E2E_PASSWORD'] ?? 'password'

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', EMAIL)
  await page.fill('input[type="password"]', PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL('/')
})

test.describe('Dashboard and navigation', () => {
  test('dashboard loads with income and expenses labels', async ({ page }) => {
    await expect(page.locator('text=Income').or(page.locator('text=income')).first()).toBeVisible()
    await expect(page.locator('text=Expenses').or(page.locator('text=expenses')).first()).toBeVisible()
  })

  test('transactions page loads', async ({ page }) => {
    await page.goto('/transactions')
    await expect(page).toHaveURL('/transactions')
    await expect(page.locator('main')).toBeVisible()
  })

  test('new transaction page loads', async ({ page }) => {
    await page.goto('/transactions/new')
    await expect(page.locator('main')).toBeVisible()
  })

  test('budgets page loads', async ({ page }) => {
    await page.goto('/budgets')
    await expect(page.locator('h1')).toContainText('Budgets')
  })

  test('goals page loads', async ({ page }) => {
    await page.goto('/goals')
    await expect(page.locator('h1')).toContainText('Goals')
  })

  test('settings page loads with profile form', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.locator('input[name="full_name"]')).toBeVisible()
  })
})
