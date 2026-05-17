import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('user can register with valid data', async ({ page }) => {
    await page.goto('/')
    await page.click('a:has-text("Launch app")')
    await page.waitForURL('/auth/register')

    // Fill registration form
    await page.fill('input[type="email"]', `test-${Date.now()}@example.com`)
    await page.fill('input[placeholder*="Full name"]', 'Test User')
    await page.fill('input[type="password"]', 'TestPassword123')

    // Submit form
    await page.click('button:has-text("Create account")')

    // Should see success message and redirect to login
    await expect(page).toHaveURL('/auth/login')
  })

  test('user can log in with valid credentials', async ({ page }) => {
    // First register a user
    const email = `test-${Date.now()}@example.com`
    const password = 'TestPassword123'

    await page.goto('/auth/register')
    await page.fill('input[type="email"]', email)
    await page.fill('input[placeholder*="Full name"]', 'Test User')
    await page.fill('input[type="password"]', password)
    await page.click('button:has-text("Create account")')

    // Wait for redirect to login
    await page.waitForURL('/auth/login')

    // Now log in
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    await page.click('button:has-text("Sign in")')

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=Welcome')).toBeVisible()
  })

  test('user is redirected to login when accessing protected route', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/auth/login')
  })

  test('user can log out', async ({ page, context }) => {
    // Register and login first
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

    // Click logout
    await page.click('button:has-text("Sign out")')

    // Should redirect to landing page
    await expect(page).toHaveURL('/')
  })
})
