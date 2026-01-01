import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Reference Screenshots Generator
 *
 * This test suite iterates through all scenarios and captures
 * screenshots of the initial state and visual mode.
 * Images are saved to 'test-results/screenshots/'.
 */

const scenarios = [
  { value: 'bushwhack', name: 'Bushwhack' },
  { value: 'scrag', name: 'Scrag' },
  { value: 'mayhem', name: 'Mayhem' },
  { value: 'manufactorumRaid', name: 'Manufactorum Raid' },
  { value: 'conveyer', name: 'The Conveyer' },
  { value: 'fungalHorror', name: 'Fungal Horror' },
  { value: 'tollBridge', name: 'Toll Bridge' },
];

test.describe('Reference Screenshots', () => {
  // Ensure screenshot directory exists
  test.beforeAll(async () => {
    const screenshotDir = path.join(process.cwd(), 'test-results', 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
  });

  for (const scenario of scenarios) {
    test(`capture ${scenario.name}`, async ({ page }) => {
      // 1. Load Page
      await page.goto('/');
      await page.waitForSelector('#battle-map', { timeout: 10000 });
      await page.waitForTimeout(1000); // Wait for initial auto-gen to settle

      // 2. Select Scenario
      await page.selectOption('#scenario-select', scenario.value);
      await page.click('button:has-text("New Battle")');
      
      // Wait for map generation and animations
      await page.waitForTimeout(2000);

      // 3. Capture Standard Mode
      await page.screenshot({
        path: `test-results/screenshots/${scenario.value}_standard.png`,
        fullPage: true,
      });

      // 4. Toggle Visual Mode
      await page.click('button:has-text("Vis-Mode")');
      await page.waitForTimeout(500); // Wait for opacity transition

      // 5. Capture Visual Mode
      await page.screenshot({
        path: `test-results/screenshots/${scenario.value}_visual.png`,
        fullPage: true,
      });
    });
  }
});
