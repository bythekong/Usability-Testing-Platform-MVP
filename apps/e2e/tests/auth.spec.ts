import { test, expect } from '@playwright/test';
import { resetDb } from './utils/db';

test.describe('Authentication & Access Control', () => {
  test.beforeEach(() => {
    resetDb();
  });

  test('User can register and login as OWNER', async ({ page }) => {
    // Navigate to home page
    await page.goto('http://localhost:3000/');
    
    // Fill out registration
    await page.fill('input[type="email"]', 'owner@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.selectOption('select', 'OWNER');
    await page.click('button:has-text("Register New Account")');

    // Should redirect to /owner
    await expect(page).toHaveURL('http://localhost:3000/owner');
    
    // Verify dashboard content
    await expect(page.locator('h1')).toContainText('Manage Campaigns');

    // Logout
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL('http://localhost:3000/');

    // Login
    await page.click('button:has-text("Switch to Login")');
    await page.fill('input[type="email"]', 'owner@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Login")');

    // Should redirect to /owner again
    await expect(page).toHaveURL('http://localhost:3000/owner');
  });

  test('User can register and login as TESTER', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Fill out registration
    await page.fill('input[type="email"]', 'tester@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.selectOption('select', 'TESTER');
    await page.click('button:has-text("Register New Account")');

    // Should redirect to /tester
    await expect(page).toHaveURL('http://localhost:3000/tester');
    
    // Verify dashboard content
    await expect(page.locator('h1')).toContainText('Available Jobs');
  });

  test('Role protection prevents cross-access', async ({ page }) => {
    // Register as OWNER
    await page.goto('http://localhost:3000/');
    await page.fill('input[type="email"]', 'owner2@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.selectOption('select', 'OWNER');
    await page.click('button:has-text("Register New Account")');

    await expect(page).toHaveURL('http://localhost:3000/owner');

    // Try to access /tester
    await page.goto('http://localhost:3000/tester');
    
    // Should be redirected back to root or /owner (depends on middleware)
    // In our implementation, usually middleware redirects to login or root
    await expect(page).not.toHaveURL('http://localhost:3000/tester');
  });
});
