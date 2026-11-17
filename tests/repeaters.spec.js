// Repeaters session flow, driven through the real UI with a fake clock.
//
// Default Repeaters setup: 5s get-ready, then 6 sets of 6 reps at 7s hang / 3s rest,
// with 180s between sets. So set k, rep r (both 0-based) starts hanging at
// 5 + k * 237 + r * 10 seconds. Checks are made mid-phase to stay clear of
// tick boundaries.
import { test as base, expect } from '@playwright/test';

const PREPARE = 5;
const HANG = 7;
const REP_REST = 3;
const REPS = 6;
const SET_REST = 180;
const SET_LEN = REPS * HANG + (REPS - 1) * REP_REST; // 57s

const hangStart = (setIdx, repIdx) => PREPARE + setIdx * (SET_LEN + SET_REST) + repIdx * (HANG + REP_REST);

// Each test gets a fresh context (empty localStorage) and a fake clock.
const test = base.extend({
  app: async ({ page }, use) => {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort());
    await page.clock.install();
    await page.goto('/');
    await use(new App(page));
  },
});

class App {
  constructor(page) {
    this.page = page;
    this.elapsed = 0;
    this.phase = page.locator('#phaseLabel');
    this.sublabel = page.locator('#sublabel');
    this.setNumber = page.locator('.set-number');
    this.tracker = page.locator('#repTracker');
    this.primaryBtn = page.locator('#primaryBtn');
    this.skipBtn = page.locator('#skipBtn');
    this.restartSetBtn = page.locator('#restartSetBtn');
  }

  async startRepeaters({ sets } = {}) {
    await this.page.click('[data-mode=repeaters]');
    if (sets !== undefined) {
      const minus = this.page.locator("[data-field=setsCount][data-delta='-1']");
      for (let i = 0; i < 6 - sets; i++) await minus.click();
    }
    await this.page.click('#setupStartBtn');
    this.elapsed = 0;
  }

  // Advance the fake clock to t seconds after the session started.
  async runUntil(t) {
    await this.page.clock.runFor(Math.round((t - this.elapsed) * 1000));
    this.elapsed = t;
  }

  async expectTracker({ done, active }) {
    await expect(this.tracker).toBeVisible();
    await expect(this.tracker.locator('.rep-pip')).toHaveCount(REPS);
    await expect(this.tracker.locator('.rep-pip-done')).toHaveCount(done);
    await expect(this.tracker.locator('.rep-pip-active')).toHaveCount(active ? 1 : 0);
    await expect(this.tracker.locator('.rep-count')).toHaveText(`${done} done · ${REPS - done} left`);
  }
}

test('rep tracker follows reps through a set', async ({ app }) => {
  await app.startRepeaters();
  await expect(app.phase).toHaveText('Get Ready');
  await expect(app.tracker).toBeHidden();

  await app.runUntil(hangStart(0, 0) + 2);
  await expect(app.phase).toHaveText('Hang');
  await app.expectTracker({ done: 0, active: true });

  await app.runUntil(hangStart(0, 0) + HANG + 1.5); // rest after rep 1
  await expect(app.phase).toHaveText('Rest');
  await app.expectTracker({ done: 1, active: false });

  await app.runUntil(hangStart(0, 3) + 2); // hanging rep 4
  await app.expectTracker({ done: 3, active: true });

  await app.runUntil(hangStart(0, REPS - 1) + HANG + 10); // long rest between sets
  await expect(app.tracker).toBeHidden();
});

test('restart set returns to rep 1 of the current set', async ({ app, page }) => {
  await app.startRepeaters();
  await app.runUntil(hangStart(1, 2) + 2); // set 2, hanging rep 3
  await expect(app.setNumber).toContainText('Set 2 / 6 · Rep 3/6');

  await page.keyboard.press('r');
  await expect(app.phase).toHaveText('Get Ready');
  await expect(app.sublabel).toHaveText('Set 2 restarting');

  // After the get-ready countdown, rep 1 of set 2 starts (not set 1).
  await page.clock.runFor((PREPARE + 2) * 1000);
  await expect(app.phase).toHaveText('Hang');
  await expect(app.setNumber).toContainText('Set 2 / 6 · Rep 1/6');
  await app.expectTracker({ done: 0, active: true });
});

test('restart set button resumes a paused session', async ({ app }) => {
  await app.startRepeaters();
  await app.runUntil(hangStart(0, 1) + 2);
  await app.primaryBtn.click(); // pause
  await expect(app.primaryBtn).toHaveText('Resume');

  await app.restartSetBtn.click();
  await expect(app.primaryBtn).toHaveText('Pause');
  await expect(app.phase).toHaveText('Get Ready');
});

test('restart set is only enabled inside a set', async ({ app, page }) => {
  await app.startRepeaters();
  await expect(app.restartSetBtn).toBeDisabled(); // initial get-ready

  await app.runUntil(hangStart(0, 0) + 2);
  await expect(app.restartSetBtn).toBeEnabled(); // hanging

  await app.runUntil(hangStart(0, 0) + HANG + 1.5);
  await expect(app.restartSetBtn).toBeEnabled(); // rest between reps

  await app.runUntil(hangStart(0, REPS - 1) + HANG + 10);
  await expect(app.restartSetBtn).toBeDisabled(); // long rest between sets

  // Pressing R in the long rest does nothing.
  await page.keyboard.press('r');
  await expect(app.phase).toHaveText('Rest');
});

test('completion hides skip and restart set, and logs the session', async ({ app, page }) => {
  await app.startRepeaters({ sets: 2 });
  await expect(app.skipBtn).toBeVisible();
  await expect(app.restartSetBtn).toBeVisible();

  await app.runUntil(hangStart(1, REPS - 1) + HANG + 2);
  await expect(app.phase).toHaveText('Complete');
  await expect(app.primaryBtn).toHaveText('Restart');
  await expect(app.skipBtn).toBeHidden();
  await expect(app.restartSetBtn).toBeHidden();

  await page.click('#logbookBtn');
  await expect(page.locator('.logbook-entry')).toHaveCount(1);
  await expect(page.locator('.logbook-entry-protocol')).toHaveText('Repeaters');
});

test('an abandoned session is not logged', async ({ app, page }) => {
  await app.startRepeaters();
  await app.runUntil(hangStart(0, 2) + 2);
  await page.click('#backBtn');
  await page.click('#logbookBtn');
  await expect(page.locator('.logbook-entry')).toHaveCount(0);
});
