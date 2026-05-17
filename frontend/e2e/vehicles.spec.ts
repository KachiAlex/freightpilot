import { test, expect } from '@playwright/test'

test.describe('Vehicle Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Register and login before each test
    const email = `test-${Date.now()}@example.com`
    const password = 'TestPassword123'

    await page.goto('/auth/register')
    await page.fill('input[type="email"]', email)
    await page.fill('input[placeholder*="Full name"]', 'Test User')
    await page.fill('input[type="password"]', password)
    await page.click('button:has-text("Create account")')

    await page.waitForURL('/auth/login')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    await page.click('button:has-text("Sign in")')

    await expect(page).toHaveURL('/dashboard')
  })

  test('user can create a vehicle', async ({ page }) => {
    await page.goto('/dashboard')

    // Scroll to vehicle section
    await page.locator('text=Your vehicles').scrollIntoViewIfNeeded()

    // Click Add Vehicle button
    await page.click('button:has-text("Add Vehicle")')

    // Fill vehicle form
    await page.fill('input[placeholder*="Truck"]', 'TRUCK-001')
    await page.fill('input[placeholder*="Trailer"]', 'TRAILER-001')
    await page.fill('input[placeholder*="Fuel"]', '6.5')

    // Submit form
    await page.click('button:has-text("Add Vehicle")')

    // Should see vehicle in list
    await expect(page.locator('text=TRUCK-001')).toBeVisible()
  })

  test('user can view vehicles in list', async ({ page }) => {
    await page.goto('/dashboard')

    // Create a vehicle first
    await page.locator('text=Your vehicles').scrollIntoViewIfNeeded()
    await page.click('button:has-text("Add Vehicle")')

    await page.fill('input[placeholder*="Truck"]', 'TRUCK-002')
    await page.fill('input[placeholder*="Trailer"]', 'TRAILER-002')
    await page.fill('input[placeholder*="Fuel"]', '6.5')
    await page.click('button:has-text("Add Vehicle")')

    // Scroll to vehicle list
    await page.locator('text=Your vehicles').scrollIntoViewIfNeeded()

    // Should see vehicle in list
    await expect(page.locator('text=TRUCK-002')).toBeVisible()
    await expect(page.locator('text=TRAILER-002')).toBeVisible()
  })
})
