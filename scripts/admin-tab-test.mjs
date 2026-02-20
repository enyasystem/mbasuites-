import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const outLog = [];
  let browser;
  try {
    // Try to launch a locally installed Chrome to avoid downloading Playwright browsers
    browser = await chromium.launch({
      headless: true,
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    });
  } catch (err) {
    // Fallback to default launch which requires Playwright browsers to be installed
    browser = await chromium.launch({ headless: true });
  }
  const page = await browser.newPage();

  page.on('console', msg => {
    try {
      const text = msg.text();
      outLog.push(text);
      console.log('PAGE:', text);
    } catch (e) {
      console.log('PAGE: <failed to read console message>');
    }
  });

  const url = 'http://localhost:9000/admin?dev=true';
  console.log('Opening', url);
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  } catch (e) {
    console.log('Warning: navigation timed out, continuing with best-effort');
  }
  await page.waitForTimeout(1500);

  // Try clicking quick action buttons (case-insensitive) and sidebar tabs robustly
  const quickSelectors = [
    'text=/View All Bookings/i',
    'text=/Manage Rooms/i',
    'text=/View All Bookings/i',
  ];
  for (const sel of quickSelectors) {
    try {
      const el = page.locator(sel);
      if (await el.count()) {
        await el.first().click();
        await page.waitForTimeout(800);
      }
    } catch (e) {
      console.log('Quick action click failed:', e.message);
    }
  }

  // Sidebar/tab names to try (case-insensitive)
  const tabNames = ['Bookings', 'Rooms', 'Gallery', 'Promotions', 'Guest Registrations'];
  for (const name of tabNames) {
    try {
      // Try button or link with the tab text
      const el = page.locator(`text=/${name}/i`);
      if (await el.count()) {
        await el.first().click();
        await page.waitForTimeout(700);
        continue;
      }
      // fallback: look for elements containing the slug
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      const el2 = page.locator(`text=/\b${slug}\b/i`);
      if (await el2.count()) {
        await el2.first().click();
        await page.waitForTimeout(700);
      }
    } catch (e) {
      // ignore and continue
    }
  }

  await page.waitForTimeout(500);
  await browser.close();

  fs.writeFileSync('c:/Users/Enyasystem/Documents/Projects/mbasuites_production/scripts/admin-tab-test-logs.txt', outLog.join('\n'));
  console.log('Saved logs to scripts/admin-tab-test-logs.txt');
})();
