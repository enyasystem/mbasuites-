import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const screenshotsDir = join(__dirname, '../screenshots');

// Admin credentials
const ADMIN_EMAIL = 'enyaelvis@gmail.com';
const ADMIN_PASSWORD = 'password';
const BASE_URL = 'http://localhost:9003';

// Admin tabs to capture
const ADMIN_TABS = [
  { name: 'Overview', path: 'overview', label: 'Dashboard Overview' },
  { name: 'Bookings', path: 'bookings', label: 'Bookings Management' },
  { name: 'Rooms', path: 'rooms', label: 'Rooms Management' },
  { name: 'Gallery', path: 'gallery', label: 'Gallery & Room Media' },
  { name: 'Hero', path: 'hero', label: 'Hero Banner' },
  { name: 'Promotions', path: 'promotions', label: 'Promotions' },
  { name: 'Sync', path: 'sync', label: 'Calendar Sync' },
  { name: 'Analytics', path: 'analytics', label: 'Analytics' },
  { name: 'Staff', path: 'staff', label: 'Staff Management' },
  { name: 'Activity', path: 'activity', label: 'Activity Log' },
  { name: 'Payments', path: 'payments', label: 'Payment Management' },
  { name: 'Guest Registration', path: 'guest-registration', label: 'Guest Registration' },
  { name: 'Guest List', path: 'guest-registrations', label: 'Guest List' },
  { name: 'Settings', path: 'settings', label: 'Payment Settings' },
];

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
  console.log(`✓ Created screenshots directory: ${screenshotsDir}`);
}

async function captureScreenshots() {
  let browser;
  try {
    console.log('🚀 Starting Playwright browser...');
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    console.log(`\n🔐 Navigating to ${BASE_URL}/login...`);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'load', timeout: 15000 });
    console.log('✓ Login page loaded');
    
    // Take screenshot of login page for debugging
    await page.screenshot({ path: join(screenshotsDir, '00-login-page.png') });
    console.log('📸 Saved: login-page.png');

    // Log in with more robust selectors
    console.log('\n🔐 Logging in as admin...');
    console.log(`  Email: ${ADMIN_EMAIL}`);
    
    // Wait for ANY input element (not just email type)
    await page.waitForSelector('input', { timeout: 10000 });
    console.log('  ✓ Found input fields');
    
    // Get all inputs and their properties
    const allInputs = await page.locator('input').all();
    console.log(`  Found ${allInputs.length} input field(s)`);
    
    // Print each input's attributes for debugging
    for (let i = 0; i < allInputs.length; i++) {
      try {
        const placeholder = await allInputs[i].getAttribute('placeholder');
        const type = await allInputs[i].getAttribute('type');
        console.log(`    Input ${i}: type="${type}", placeholder="${placeholder}"`);
      } catch (e) {
        console.log(`    Input ${i}: (couldn't get attributes)`);
      }
    }
    
    // Try different strategies to fill email
    let emailFilled = false;
    
    // Strategy 1: Find input by type="email"
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      await emailInput.fill(ADMIN_EMAIL);
      emailFilled = true;
      console.log('  ✓ Email entered (via type=email)');
    }
    
    // Strategy 2: Find first input if no type email
    if (!emailFilled && allInputs.length > 0) {
      await allInputs[0].fill(ADMIN_EMAIL);
      emailFilled = true;
      console.log('  ✓ Email entered (via first input)');
    }
    
    if (!emailFilled) {
      throw new Error('Could not fill email field - no suitable input found');
    }
    
    // Wait between fields
    await page.waitForTimeout(300);
    
    // Find and fill password
    const allInputsAfterEmail = await page.locator('input').all();
    let passwordFilled = false;
    
    // Strategy 1: Find by type="password"
    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
      await passwordInput.fill(ADMIN_PASSWORD);
      passwordFilled = true;
      console.log('  ✓ Password entered (via type=password)');
    }
    
    // Strategy 2: Use second input if exists
    if (!passwordFilled && allInputsAfterEmail.length > 1) {
      await allInputsAfterEmail[1].fill(ADMIN_PASSWORD);
      passwordFilled = true;
      console.log('  ✓ Password entered (via second input)');
    }
    
    if (!passwordFilled) {
      throw new Error('Could not fill password field');
    }
    
    await page.waitForTimeout(300);
    
    // Find and click login button - try many selectors
    console.log('  Looking for login button...');
    
    let buttonClicked = false;
    
    // Try button selectors
    const selectors = [
      'button:has-text("Sign In")',
      'button:has-text("sign in")',
      'button:has-text("Login")',
      'button:has-text("login")',
      'button[type="submit"]',
      'button',
    ];
    
    for (const selector of selectors) {
      try {
        const btn = page.locator(selector).first();
        if (await btn.isVisible({ timeout: 1000 })) {
          const btnText = await btn.textContent();
          console.log(`  ✓ Found button: "${btnText}"`);
          await btn.click();
          buttonClicked = true;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!buttonClicked) {
      throw new Error('Could not find or click login button');
    }
    
    // Wait for authentication
    console.log('⏳ Waiting for authentication...');
    await page.waitForTimeout(5000); // Wait longer
    
    // Check for error messages
    const errorMessage = await page.locator('p:has-text("error"), span:has-text("Error"), div.text-red').first().textContent().catch(() => null);
    if (errorMessage) {
      console.log(`  ⚠ Error message: ${errorMessage}`);
    }
    
    // Take screenshot to see current state
    await page.screenshot({ path: join(screenshotsDir, '_debug-after-login-attempt.png') });
    console.log('  📸 Debug screenshot saved');
    
    // Check if login succeeded
    const currentUrl = page.url();
    console.log(`  Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/login')) {
      console.log('❌ Still on login page - authentication may have failed');
      
      // Try to find any text on the page
      const pageText = await page.locator('body').textContent();
      console.log(`  Page text (first 200 chars): ${pageText.substring(0, 200)}`);
      
      throw new Error('Login failed - still on login page after waiting 5 seconds. Email/password may be incorrect.');
    }
    
    console.log('✓ Successfully logged in!');

    // Navigate to admin dashboard
    console.log('\n📊 Navigating to admin dashboard...');
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'load', timeout: 15000 });
    console.log('✓ Admin page loaded');
    
    // Wait for tabs to be interactive
    await page.waitForTimeout(2000);
    
    // Take a screenshot to see what's on the page
    await page.screenshot({ path: join(screenshotsDir, '_debug-admin-page.png') });
    console.log('  📸 Admin page debug screenshot saved');
    
    // Look for different tab selectors
    const tabSelectors = [
      'button[role="tab"]',
      '[role="tab"]',
      '[role="tablist"] button',
      '[data-state="active"], [data-state="inactive"]',
      'button[class*="tab"]',
    ];
    
    let tabButtons = [];
    for (const selector of tabSelectors) {
      tabButtons = await page.locator(selector).all();
      console.log(`  Trying "${selector}": found ${tabButtons.length} tabs`);
      if (tabButtons.length > 0) {
        break;
      }
    }
    
    if (tabButtons.length === 0) {
      // Try to find any buttons in the sidebar
      console.log('  Looking for sidebar buttons...');
      const sidebarButtons = await page.locator('aside button, .sidebar button, nav button').all();
      console.log(`  Found ${sidebarButtons.length} sidebar buttons`);
      tabButtons = sidebarButtons;
    }
    
    if (tabButtons.length === 0) {
      // Last resort: find all buttons
      const allButtons = await page.locator('button').all();
      console.log(`  Found ${allButtons.length} total buttons`);
      
      // Get button texts
      const buttonTexts = [];
      for (const btn of allButtons) {
        const text = (await btn.textContent() || '').trim();
        buttonTexts.push(text);
        if (buttonTexts.length <= 14) { // Show first 14
          console.log(`    Button ${buttonTexts.length}: "${text}"`);
        }
      }
      
      // Use first 14 buttons as tabs
      tabButtons = allButtons.slice(0, 14);
      console.log(`  Using first ${tabButtons.length} buttons as admin tabs`);
    }

    // Capture screenshots for each tab
    for (let i = 0; i < tabButtons.length; i++) {
      const tabButton = tabButtons[i];
      const tabName = await tabButton.textContent();
      const tabPath = ADMIN_TABS[i] ? ADMIN_TABS[i].path : `tab-${i}`;
      
      try {
        console.log(`\n📸 Tab ${i + 1}/14: ${tabName}...`);
        
        // Click the tab
        await tabButton.click();
        console.log(`  ✓ Clicked "${tabName}"`);
        
        // Wait for content to load
        await page.waitForTimeout(1500);
        
        // Take screenshot
        const filename = `${String(i + 1).padStart(2, '0')}-${tabPath.replace('/', '-')}.png`;
        const filepath = join(screenshotsDir, filename);
        await page.screenshot({ path: filepath });
        console.log(`  ✓ Saved: ${filename}`);
      } catch (error) {
        console.error(`  ✗ Error: ${error.message}`);
      }
    }

    console.log('\n✅ Screenshot capture complete!');
    console.log(`📁 Screenshots saved to: ${screenshotsDir}`);

    // Keep browser open for 3 seconds
    await page.waitForTimeout(3000);
    
    await context.close();
  } catch (error) {
    console.error('❌ Error during screenshot capture:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the script
captureScreenshots();
