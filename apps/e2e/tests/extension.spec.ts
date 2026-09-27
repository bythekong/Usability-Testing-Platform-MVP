import { test, expect, chromium } from '@playwright/test';
import path from 'path';
import { resetDb } from './utils/db';

test.describe('Extension Flow', () => {
  let context: any;
  let extensionId: string;

  test.beforeEach(async () => {
    resetDb();

    // Launch Chromium with Extension
    const extensionPath = path.resolve(__dirname, '../../../apps/extension/dist');
    context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });

    // Extract Extension ID if needed (for background page interactions or logs)
    let [background] = context.serviceWorkers();
    if (!background)
      background = await context.waitForEvent('serviceworker');

    const extensionIdMatch = background.url().match(/chrome-extension:\/\/(.*)\//);
    extensionId = extensionIdMatch ? extensionIdMatch[1] : '';
  });

  test.afterEach(async () => {
    await context.close();
  });

  test('Extension injects widget on target site when test is active', async () => {
    const page = await context.newPage();

    // 1. Setup Data as Owner
    await page.goto('http://localhost:3000/');
    await page.fill('input[type="email"]', 'owner_ext@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.selectOption('select', 'OWNER');
    await page.click('button:has-text("Register New Account")');
    await expect(page).toHaveURL('http://localhost:3000/owner');

    await page.fill('input#target-url', 'https://example.com');
    await page.fill('textarea[placeholder*="Brief the tester"]', 'Extension Scenario');
    await page.fill('textarea[placeholder*="What should the tester do"]', 'Extension Task');
    await page.click('button:has-text("Launch Campaign")');
    await expect(page.locator('text=Campaign created successfully')).toBeVisible();
    await page.click('button:has-text("Logout")');

    // 2. Claim as Tester
    await page.fill('input[type="email"]', 'tester_ext@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.selectOption('select', 'TESTER');
    await page.click('button:has-text("Register New Account")');
    await expect(page).toHaveURL('http://localhost:3000/tester');
    
    await page.click('button:has-text("Claim Job")');
    await expect(page.locator('text=Claimed successfully')).toBeVisible();

    // 3. Sync Extension
    await page.click('button:has-text("Extension Setup")');
    // The "Sync Extension Now" button triggers postMessage which the extension listens to.
    await page.click('button:has-text("Sync Extension Now")');
    await expect(page.locator('text=Extension synced successfully!')).toBeVisible();

    // 4. Navigate to Target URL (example.com)
    await page.goto('https://example.com');

    // Verify Widget appears (The overlay has id "usability-testing-overlay" or we can look for specific text)
    // Wait for the React component to inject
    await expect(page.locator('text=Usability Testing MVP')).toBeVisible({ timeout: 10000 });
    
    // The scenario text should be visible
    await expect(page.locator('text=Extension Scenario')).toBeVisible();

    // Minimize widget
    await page.click('button:has-text("Minimize")'); // Depends on actual text, assuming X icon or text
    
    // Check for Start Recording button
    await expect(page.locator('button:has-text("Start Task 1")')).toBeVisible();
  });
});
