import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import os from 'os'

const EMAIL    = process.env['E2E_EMAIL']    ?? 'test@example.com'
const PASSWORD = process.env['E2E_PASSWORD'] ?? 'password'

const CSV_CONTENT = [
  'Date,Amount,Description,Type',
  '2026-06-01,25.50,Supermarket,expense',
  '2026-06-02,1200.00,Salary,income',
  '2026-06-03,8.00,Coffee,expense',
].join('
')

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', EMAIL)
  await page.fill('input[type="password"]', PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL('/')
})

test.describe('CSV Import', () => {
  test('import page loads', async ({ page }) => {
    await page.goto('/settings/import')
    await expect(page.locator('h1')).toContainText('Import')
  })

  test('uploading a CSV reveals column mapping dropdowns', async ({ page }) => {
    const tmpPath = path.join(os.tmpdir(), `test-import-${Date.now()}.csv`)
    fs.writeFileSync(tmpPath, CSV_CONTENT)

    await page.goto('/settings/import')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(tmpPath)

    await expect(page.locator('text=Map columns')).toBeVisible({ timeout: 5_000 })
    fs.unlinkSync(tmpPath)
  })
})
