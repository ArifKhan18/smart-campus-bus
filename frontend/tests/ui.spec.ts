import { test, expect } from '@playwright/test';

test.describe('Smart Campus Bus UI Tests', () => {

  test('Login page loads correctly', async ({ page }) => {
    await page.goto('http://127.0.0.1:5500/pages/login.html');
    
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Login/);
    
    // Verify role select link exists
    const roleLink = page.locator('text=Choose a different role');
    await expect(roleLink).toBeVisible();
    
  });

  test('Register page loads correctly', async ({ page }) => {
    await page.goto('http://127.0.0.1:5500/pages/register.html');
    
    await expect(page).toHaveTitle(/Register/);
  });
  
});
