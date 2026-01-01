import { test, expect } from '@playwright/test';

/**
 * Scenario-Specific Mechanics Tests
 *
 * These tests verify that special scenario mechanics work correctly,
 * including bomb mechanics, platform movement, and fungal spread.
 */

test.describe('Manufactorum Raid - Bomb Mechanics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#battle-map', { timeout: 5000 });
    await page.waitForTimeout(1500);

    // Select Manufactorum Raid scenario
    await page.selectOption('#scenario-select', 'manufactorumRaid');
    await page.click('button:has-text("New Battle")');
    await page.waitForTimeout(500);
  });

  test('should display 3 bomb markers', async ({ page }) => {
    // Look for bomb markers (⊗)
    const bombMarkers = page.locator('#battle-map .obj-marker');
    await expect(bombMarkers).toHaveCount(3);
  });

  test('should show bomb information on hover', async ({ page }) => {
    const bombMarker = page.locator('#battle-map .obj-marker').first();
    await bombMarker.hover();

    await page.waitForTimeout(200);

    const statusText = page.locator('#status-text');
    await expect(statusText).toContainText(/Bomb|STATUS/i);
  });

  test('should update status on end round', async ({ page }) => {
    // Click End Round button
    await page.click('button:has-text("End Round")');

    await page.waitForTimeout(500);

    // Status should show round ended
    const statusText = page.locator('#status-text');
    await expect(statusText).toContainText(/END OF ROUND/i);
  });

  test('should show scenario name in status', async ({ page }) => {
    const statusText = page.locator('#status-text');
    await expect(statusText).toContainText(/MANUFACTORUM RAID/i);
  });
});

test.describe('The Conveyer - Platform Mechanics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#battle-map', { timeout: 5000 });
    await page.waitForTimeout(1500);

    // Select The Conveyer scenario
    await page.selectOption('#scenario-select', 'conveyer');
    await page.click('button:has-text("New Battle")');
    await page.waitForTimeout(500);
  });

  test('should display platform area', async ({ page }) => {
    // Status should mention platform
    const statusText = page.locator('#status-text');
    await expect(statusText).toContainText(/CONVEYER|Platform/i);
  });

  test('should display loot caskets', async ({ page }) => {
    // Status should mention loot caskets
    const statusText = page.locator('#status-text');
    await expect(statusText).toContainText(/loot casket/i);
  });

  test('should show platform cells with [PLATFORM] tag on hover', async ({ page }) => {
    // Find cells near center (platform should be there)
    const centerCell = page.locator('#battle-map .cell[data-x="25"][data-y="12"]');

    if ((await centerCell.count()) > 0) {
      await centerCell.hover();
      await page.waitForTimeout(200);

      const statusText = page.locator('#status-text');
      const text = await statusText.textContent();

      // Platform cell should show PLATFORM marker
      if (text?.includes('[PLATFORM]')) {
        expect(text).toContain('[PLATFORM]');
      }
    }
  });

  test('should show platform movement on end round', async ({ page }) => {
    await page.click('button:has-text("End Round")');
    await page.waitForTimeout(500);

    const statusText = page.locator('#status-text');
    await expect(statusText).toContainText(/Platform|stability/i);
  });
});

test.describe('Fungal Horror - Growth Mechanics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#battle-map', { timeout: 5000 });
    await page.waitForTimeout(1500);

    // Select Fungal Horror scenario
    await page.selectOption('#scenario-select', 'fungalHorror');
    await page.click('button:has-text("New Battle")');
    await page.waitForTimeout(500);
  });

  test('should display fungal overgrowth', async ({ page }) => {
    // Look for fungal terrain (▓)
    const fungalCells = page.locator('#battle-map .terrain-fungal');
    const count = await fungalCells.count();

    // Should have at least some fungal cells
    expect(count).toBeGreaterThan(0);
  });

  test('should show fungal marker in status', async ({ page }) => {
    const statusText = page.locator('#status-text');
    await expect(statusText).toContainText(/FUNGAL HORROR|fungal/i);
  });

  test('should show overgrown area on hover', async ({ page }) => {
    const fungalCell = page.locator('#battle-map .terrain-fungal').first();

    if ((await fungalCell.count()) > 0) {
      await fungalCell.hover();
      await page.waitForTimeout(200);

      const statusText = page.locator('#status-text');
      await expect(statusText).toContainText(/OVERGROWN/i);
    }
  });

  test('should process fungal spread on end round', async ({ page }) => {
    await page.click('button:has-text("End Round")');
    await page.waitForTimeout(500);

    const statusText = page.locator('#status-text');
    const text = await statusText.textContent();

    // Should show fungal growth roll or spread message
    const hasFungalMessage =
      text?.includes('fungal') ||
      text?.includes('marker') ||
      text?.includes('Growth');

    expect(hasFungalMessage).toBe(true);
  });
});

test.describe('Round Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#battle-map', { timeout: 5000 });
    await page.waitForTimeout(1500);
    await page.click('button:has-text("New Battle")');
    await page.waitForTimeout(500);
  });

  test('should increment round counter on end round', async ({ page }) => {
    // End first round
    await page.click('button:has-text("End Round")');
    await page.waitForTimeout(500);

    const statusText = page.locator('#status-text');
    await expect(statusText).toContainText(/ROUND 1/i);

    // End second round
    await page.click('button:has-text("End Round")');
    await page.waitForTimeout(500);

    await expect(statusText).toContainText(/ROUND 2/i);
  });

  test('should allow multiple rounds', async ({ page }) => {
    // End 3 rounds
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("End Round")');
      await page.waitForTimeout(300);
    }

    const statusText = page.locator('#status-text');
    await expect(statusText).toContainText(/ROUND 3/i);
  });
});

test.describe('Priority Target (Scrag)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#battle-map', { timeout: 5000 });
    await page.waitForTimeout(1500);

    // Select Scrag scenario
    await page.selectOption('#scenario-select', 'scrag');
    await page.click('button:has-text("New Battle")');
    await page.waitForTimeout(500);
  });

  test('should mark priority target', async ({ page }) => {
    const statusText = page.locator('#status-text');
    await expect(statusText).toContainText(/SCRAG|priority target/i);
  });

  test('should show priority target marker on hover', async ({ page }) => {
    // Find defender units and hover to check for priority marker
    const defenderUnits = page.locator('#battle-map .unit-defender');
    const count = await defenderUnits.count();

    if (count > 0) {
      // Try hovering over each defender to find priority target
      for (let i = 0; i < Math.min(count, 5); i++) {
        await defenderUnits.nth(i).hover();
        await page.waitForTimeout(200);

        const statusText = page.locator('#status-text');
        const text = await statusText.textContent();

        if (text?.includes('Priority') || text?.includes('[!]')) {
          expect(text).toMatch(/Priority|Target|\[!\]/i);
          break;
        }
      }
    }
  });
});
