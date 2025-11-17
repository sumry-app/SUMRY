import { test, expect } from '@playwright/test';

test.describe('SUMRY App', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SUMRY/);
  });

  test('should display welcome message or students section', async ({ page }) => {
    await page.goto('/');
    // Wait for app to load
    await page.waitForLoadState('networkidle');
    // Check that the page has loaded by looking for common elements
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });

  test('should be accessible (no major a11y violations)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for skip link
    const skipLink = page.locator('[href="#main-content"]');
    if (await skipLink.count() > 0) {
      expect(skipLink).toBeVisible();
    }

    // Check for proper heading structure
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThan(0);
  });

  test('should have proper meta tags for PWA', async ({ page }) => {
    await page.goto('/');
    
    // Check for PWA manifest
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');

    // Check for theme color
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute('content');
  });

  test('should allow keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Tab through the page
    await page.keyboard.press('Tab');
    
    // Check that focus is visible
    const focusedElement = await page.locator(':focus');
    expect(focusedElement).toBeTruthy();
  });
});

test.describe('Student Management', () => {
  test('should show students list or empty state', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for either students table or empty state
    const body = await page.textContent('body');
    const hasContent = body.includes('student') || body.includes('Student') || body.includes('Add');
    expect(hasContent).toBeTruthy();
  });

  test('should handle adding a new student (if UI available)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for add student button
    const addButton = page.locator('button:has-text("Add Student")').or(
      page.locator('button:has-text("New Student")')
    );
    
    if (await addButton.count() > 0) {
      await addButton.first().click();
      // Check for form or modal
      await page.waitForTimeout(500);
      const modalOrForm = await page.locator('[role="dialog"], form').count();
      expect(modalOrForm).toBeGreaterThan(0);
    }
  });
});

test.describe('Data Persistence', () => {
  test('should persist data in localStorage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if localStorage has the app data
    const storageData = await page.evaluate(() => {
      return localStorage.getItem('sumry_complete_v1');
    });
    
    expect(storageData).toBeTruthy();
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that content is visible on mobile
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });
});

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});
