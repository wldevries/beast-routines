// Regenerates docs/screenshot.png: a Repeaters session frozen mid-set.
// Usage: npm run screenshot
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = new URL('../docs/screenshot.png', import.meta.url);
mkdirSync(new URL('../docs/', import.meta.url), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 820 }, deviceScaleFactor: 2 });
await page.clock.install();
await page.goto(pathToFileURL(`${root}site/index.html`).href);
await page.evaluate(() => document.fonts.ready);

await page.click('[data-mode=repeaters]');
await page.click('#setupStartBtn');
// 5s get-ready + 3 reps of 7s hang / 3s rest, then 3s into rep 4.
await page.clock.runFor((5 + 3 * 10 + 3) * 1000);
await page.waitForTimeout(400); // let pip/ring CSS transitions settle

await page.screenshot({ path: fileURLToPath(out), fullPage: true });
await browser.close();
console.log(`Saved ${fileURLToPath(out)}`);
