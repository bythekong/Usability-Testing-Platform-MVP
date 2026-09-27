import { test, expect } from '@playwright/test';
import { resetDb } from './utils/db';

test.describe('Tester Experience', () => {
  test.beforeEach(async ({ page }) => {
    resetDb();

    // Set up a campaign as OWNER
    await page.goto('/');
    const ownerEmail = `owner_${Date.now()}@example.com`;
    await page.fill('input[type="email"]', ownerEmail);
    await page.fill('input[type="password"]', 'password123');
    await page.selectOption('select', 'OWNER');
    await page.click('button:has-text("Register New Account")');
    await expect(page).toHaveURL('/owner');

    // Create a campaign with target Min Age = 20
    await page.fill('input#target-url', 'https://example.com/test');
    await page.fill('input#targetMinAge', '20');
    await page.fill('textarea[placeholder*="Brief the tester"]', 'Scenario');
    await page.fill('input[aria-label="Task 1"]', 'Task 1');
    await page.click('button:has-text("Launch Campaign")');
    await expect(page.locator('text=Campaign created successfully')).toBeVisible();

    // Logout via localStorage clear
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
  });

  test('Tester targeting filters jobs correctly', async ({ page }) => {
    // Register as TESTER
    const testerEmail = `tester_${Date.now()}@example.com`;
    await page.fill('input[type="email"]', testerEmail);
    await page.fill('input[type="password"]', 'password123');
    await page.selectOption('select', 'TESTER');
    await page.click('button:has-text("Register New Account")');
    await expect(page).toHaveURL('/tester');

    // Should NOT see the campaign initially (No age set → doesn't match targetMinAge=20)
    await expect(page.locator('text=No jobs available')).toBeVisible();

    // Navigate to Settings tab via URL (sidebar uses <a> links, not buttons)
    await page.goto('/tester?tab=settings');
    await page.fill('input#age', '25');
    await page.click('button:has-text("Save Profile")');
    await expect(page.locator('text=Profile saved successfully')).toBeVisible();

    // Navigate back to Available Jobs tab
    await page.goto('/tester?tab=available');

    // Now the campaign should be visible
    await expect(page.locator('text=https://example.com/test')).toBeVisible();

    // Claim the job
    await page.click('button:has-text("Claim Job")');

    // Should show success toast
    await expect(page.locator('text=Job claimed successfully')).toBeVisible();

    // Navigate to My Jobs tab
    await page.goto('/tester?tab=my-jobs');
    await expect(page.locator('article')).toContainText('https://example.com/test');
  });
});
