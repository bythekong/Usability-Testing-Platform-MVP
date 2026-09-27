import { test, expect } from '@playwright/test';
import { resetDb } from './utils/db';

test.describe('Tester Experience', () => {
  test.beforeEach(async ({ page }) => {
    resetDb();

    // Set up a campaign as OWNER
    await page.goto('http://localhost:3000/');
    await page.fill('input[type="email"]', 'owner@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.selectOption('select', 'OWNER');
    await page.click('button:has-text("Register New Account")');
    await expect(page).toHaveURL('http://localhost:3000/owner');

    // Create a campaign with target Min Age = 20
    await page.fill('input#target-url', 'https://example.com/test');
    await page.fill('input#targetMinAge', '20');
    await page.fill('textarea[placeholder*="Brief the tester"]', 'Scenario');
    await page.fill('textarea[placeholder*="What should the tester do"]', 'Task 1');
    await page.click('button:has-text("Launch Campaign")');
    await expect(page.locator('text=Campaign created successfully')).toBeVisible();

    // Logout
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('Tester targeting filters jobs correctly', async ({ page }) => {
    // Register as TESTER
    await page.fill('input[type="email"]', 'tester@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.selectOption('select', 'TESTER');
    await page.click('button:has-text("Register New Account")');
    await expect(page).toHaveURL('http://localhost:3000/tester');

    // Should NOT see the campaign initially (No age set, or age < 20)
    await expect(page.locator('text=No jobs available')).toBeVisible();

    // Go to Settings and set Age = 25
    await page.click('button:has-text("Settings")');
    await page.fill('input#age', '25');
    await page.click('button:has-text("Save Profile")');
    await expect(page.locator('text=Profile saved successfully')).toBeVisible();

    // Go back to Available Jobs
    await page.click('button:has-text("Available Jobs")');
    
    // Now the campaign should be visible
    await expect(page.locator('text=https://example.com/test')).toBeVisible();

    // Claim the job
    await page.click('button:has-text("Claim Job")');
    
    // Should be moved to My Jobs
    await expect(page.locator('text=Claimed successfully')).toBeVisible();
    await page.click('button:has-text("My Jobs")');
    await expect(page.locator('article')).toContainText('https://example.com/test');
  });
});
