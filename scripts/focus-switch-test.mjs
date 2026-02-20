import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const out = { console: [], requests: [] };
  let browser;
  try {
    browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  } catch (e) {
    browser = await chromium.launch({ headless: true });
  }
  const page = await browser.newPage();

  page.on('console', msg => {
    try { out.console.push(msg.text()); } catch (e) { out.console.push('<console read error>'); }
  });

  page.on('request', req => {
    out.requests.push({ url: req.url(), method: req.method(), resourceType: req.resourceType() });
  });

  const url = 'http://localhost:9000/admin?dev=true';
  console.log('Opening', url);
  await page.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1500);

  // baseline requests during initial load
  const baseline = out.requests.slice();

  // Helper to simulate tab switch: blur -> wait -> focus
  async function simulateSwitch(iter) {
    // Clear requests recorded since last step
    const startLen = out.requests.length;
    // Simulate leaving tab
    await page.evaluate(() => {
      window.dispatchEvent(new Event('blur'));
      document.hidden = true;
      document.dispatchEvent(new Event('visibilitychange'));
    }).catch(() => {});
    await page.waitForTimeout(1000);

    // Simulate returning to tab
    await page.evaluate(() => {
      window.dispatchEvent(new Event('focus'));
      document.hidden = false;
      document.dispatchEvent(new Event('visibilitychange'));
    }).catch(() => {});
    await page.waitForTimeout(1200);

    const newRequests = out.requests.slice(startLen).map(r => r.url);
    console.log(`Cycle ${iter} new requests:`, newRequests.length);
    out.console.push(`Cycle ${iter} new requests: ${newRequests.length}`);
    out.console.push(...newRequests);
  }

  // Do three focus cycles
  await simulateSwitch(1);
  await simulateSwitch(2);
  await simulateSwitch(3);

  await browser.close();
  fs.writeFileSync('scripts/focus-switch-test-logs.json', JSON.stringify(out, null, 2));
  console.log('Saved logs to scripts/focus-switch-test-logs.json');
})();
