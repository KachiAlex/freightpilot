import { test, expect } from '@playwright/test'

test.describe('Trip Planning Flow', () => {
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

  test('user can create a trip with valid data', async ({ page }) => {
    await page.goto('/dashboard')

    // Fill trip planner form
    await page.fill('input[placeholder*="Pickup"]', 'New York, NY')
    await page.fill('input[placeholder*="Dropoff"]', 'Los Angeles, CA')

    // Set start time to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateString = tomorrow.toISOString().split('T')[0]
    const timeString = '08:00'

    await page.fill('input[type="datetime-local"]', `${dateString}T${timeString}`)

    // Submit form
    await page.click('button:has-text("Plan Trip")')

    // Should see trip created with distance and time
    await expect(page.locator('text=mi')).toBeVisible()
    await expect(page.locator('text=hrs')).toBeVisible()
  })

  test('user can view trip in list after creation', async ({ page }) => {
    await page.goto('/dashboard')

    // Create a trip
    await page.fill('input[placeholder*="Pickup"]', 'New York, NY')
    await page.fill('input[placeholder*="Dropoff"]', 'Los Angeles, CA')

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateString = tomorrow.toISOString().split('T')[0]
    const timeString = '08:00'

    await page.fill('input[type="datetime-local"]', `${dateString}T${timeString}`)
    await page.click('button:has-text("Plan Trip")')

    // Scroll to trip list
    await page.locator('text=Auto-generated schedules').scrollIntoViewIfNeeded()

    // Should see trip in list
    await expect(page.locator('text=New York')).toBeVisible()
    await expect(page.locator('text=Los Angeles')).toBeVisible()
  })

  test('user can click trip to view details', async ({ page }) => {
    await page.goto('/dashboard')

    // Create a trip
    await page.fill('input[placeholder*="Pickup"]', 'New York, NY')
    await page.fill('input[placeholder*="Dropoff"]', 'Los Angeles, CA')

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateString = tomorrow.toISOString().split('T')[0]
    const timeString = '08:00'

    await page.fill('input[type="datetime-local"]', `${dateString}T${timeString}`)
    await page.click('button:has-text("Plan Trip")')

    // Scroll to trip list and click first trip
    await page.locator('text=Auto-generated schedules').scrollIntoViewIfNeeded()
    await page.click('text=New York')

    // Should navigate to trip detail page
    await expect(page).toHaveURL(/\/trips\/\d+/)
    await expect(page.locator('text=Schedule segments')).toBeVisible()
  })
})
