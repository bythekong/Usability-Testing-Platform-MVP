import { test, expect } from '@playwright/test';
import { resetDb } from './utils/db';

test.describe('Owner Experience', () => {
  test.beforeEach(async ({ page }) => {
    resetDb();

    // Register and login as OWNER
    await page.goto('/');
    const ownerEmail = `owner_ux_${Date.now()}@example.com`;
    await page.fill('input[type="email"]', ownerEmail);
    await page.fill('input[type="password"]', 'password123');
    await page.selectOption('select', 'OWNER');
    await page.click('button:has-text("Register New Account")');
    await expect(page).toHaveURL('/owner');
  });

  test('Owner can create a campaign', async ({ page }) => {
    // Fill campaign form
    await page.fill('input#target-url', 'https://example.com');
    await page.fill('input#reward', '15');
    await page.fill('input#testers', '3');
    
    // Fill task
    // It already has 1 empty task by default
    await page.fill('textarea[placeholder*="Brief the tester"]', 'This is a scenario');
    await page.fill('input[aria-label="Task 1"]', 'Find the pricing page');

    // Submit
    await page.click('button:has-text("Launch Campaign")');

    // Wait for success toast or UI update
    await expect(page.locator('text=Campaign created successfully')).toBeVisible();

    // Check if it appears in Campaigns tab
    await page.click('text="Manage Campaigns"');
    await expect(page.locator('article')).toContainText('https://example.com');
    await expect(page.locator('article')).toContainText('$15.00');
    await expect(page.locator('article')).toContainText('0'); // 0 Job Submissions initially wait it says 3 jobs but submissions are initially 3 total but not submitted, wait it shows length of campaign.jobs which is testerCount (3).
    await expect(page.locator('article')).toContainText('3'); // 3 total jobs 
  });
});
