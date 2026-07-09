import { chromium } from 'playwright';

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 393, height: 852 } });
await page.goto('http://localhost:5173/library', { waitUntil: 'networkidle' });
await page.waitForSelector('text=Library');
const sw = await page.evaluate(() => document.documentElement.scrollWidth);
console.log('page scrollWidth:', sw);
await page.screenshot({ path: 'library-final.png', clip: { x: 0, y: 0, width: 393, height: 700 } });

// also check 375px width (older test size) still fine
await page.setViewportSize({ width: 375, height: 812 });
await page.reload({ waitUntil: 'networkidle' });
await page.waitForSelector('text=Library');
const sw2 = await page.evaluate(() => document.documentElement.scrollWidth);
console.log('375px page scrollWidth:', sw2);

await browser.close();
