# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication & Access Control >> Role protection prevents cross-access
- Location: tests\auth.spec.ts:55:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Sign Up")')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - heading "Usability Testing" [level=1] [ref=e5]
        - paragraph [ref=e6]: Sign in to your account
      - generic [ref=e7]:
        - generic [ref=e8]:
          - generic [ref=e9]: Email address
          - textbox "Email address" [ref=e10]:
            - /placeholder: name@example.com
            - text: owner2@example.com
        - generic [ref=e11]:
          - generic [ref=e12]: Password
          - textbox "Password" [active] [ref=e13]: password123
        - generic [ref=e14]:
          - generic [ref=e15]: Role (for registration)
          - combobox "Role (for registration)" [ref=e16]:
            - option "Owner (Create Tests)" [selected]
            - option "Tester (Take Tests)"
        - generic [ref=e17]:
          - button "Sign In" [ref=e18]
          - generic [ref=e19]: Or continue with
          - button "Register New Account" [ref=e24]
  - button "Open Next.js Dev Tools" [ref=e30] [cursor=pointer]
  - alert [ref=e34]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { resetDb } from './utils/db';
  3  | 
  4  | test.describe('Authentication & Access Control', () => {
  5  |   test.beforeEach(() => {
  6  |     resetDb();
  7  |   });
  8  | 
  9  |   test('User can register and login as OWNER', async ({ page }) => {
  10 |     // Navigate to home page
  11 |     await page.goto('http://localhost:3000/');
  12 |     
  13 |     // Fill out registration
  14 |     await page.fill('input[type="email"]', 'owner@example.com');
  15 |     await page.fill('input[type="password"]', 'password123');
  16 |     await page.selectOption('select', 'OWNER');
  17 |     await page.click('button:has-text("Sign Up")');
  18 | 
  19 |     // Should redirect to /owner
  20 |     await expect(page).toHaveURL('http://localhost:3000/owner');
  21 |     
  22 |     // Verify dashboard content
  23 |     await expect(page.locator('h1')).toContainText('Manage Campaigns');
  24 | 
  25 |     // Logout
  26 |     await page.click('button:has-text("Logout")');
  27 |     await expect(page).toHaveURL('http://localhost:3000/');
  28 | 
  29 |     // Login
  30 |     await page.click('button:has-text("Switch to Login")');
  31 |     await page.fill('input[type="email"]', 'owner@example.com');
  32 |     await page.fill('input[type="password"]', 'password123');
  33 |     await page.click('button:has-text("Login")');
  34 | 
  35 |     // Should redirect to /owner again
  36 |     await expect(page).toHaveURL('http://localhost:3000/owner');
  37 |   });
  38 | 
  39 |   test('User can register and login as TESTER', async ({ page }) => {
  40 |     await page.goto('http://localhost:3000/');
  41 |     
  42 |     // Fill out registration
  43 |     await page.fill('input[type="email"]', 'tester@example.com');
  44 |     await page.fill('input[type="password"]', 'password123');
  45 |     await page.selectOption('select', 'TESTER');
  46 |     await page.click('button:has-text("Sign Up")');
  47 | 
  48 |     // Should redirect to /tester
  49 |     await expect(page).toHaveURL('http://localhost:3000/tester');
  50 |     
  51 |     // Verify dashboard content
  52 |     await expect(page.locator('h1')).toContainText('Available Jobs');
  53 |   });
  54 | 
  55 |   test('Role protection prevents cross-access', async ({ page }) => {
  56 |     // Register as OWNER
  57 |     await page.goto('http://localhost:3000/');
  58 |     await page.fill('input[type="email"]', 'owner2@example.com');
  59 |     await page.fill('input[type="password"]', 'password123');
  60 |     await page.selectOption('select', 'OWNER');
> 61 |     await page.click('button:has-text("Sign Up")');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  62 | 
  63 |     await expect(page).toHaveURL('http://localhost:3000/owner');
  64 | 
  65 |     // Try to access /tester
  66 |     await page.goto('http://localhost:3000/tester');
  67 |     
  68 |     // Should be redirected back to root or /owner (depends on middleware)
  69 |     // In our implementation, usually middleware redirects to login or root
  70 |     await expect(page).not.toHaveURL('http://localhost:3000/tester');
  71 |   });
  72 | });
  73 | 
```