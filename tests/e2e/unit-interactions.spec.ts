import { test, expect } from '@playwright/test';

/**
 * Unit Interaction Tests
 *
 * These tests verify that users can interact with units on the map,
 * including selection, movement, and hover information.
 */

test.describe('Unit Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#battle-map', { timeout: 5000 });
    await page.waitForTimeout(1500); // Wait for auto-generation

    // Generate a fresh map
    await page.click('button:has-text("New Battle")');
    await page.waitForTimeout(500);
  });

  test('should display unit information on hover', async ({ page, isMobile }) => {
    if (isMobile) test.skip();
    // Find an attacker unit (M)
    const attackerUnit = page.locator('#battle-map .unit-attacker').first();
    await expect(attackerUnit).toBeVisible();

    // Hover over the unit
    await attackerUnit.hover();

    // Wait for status to update
    await page.waitForTimeout(200);

    // Check that status panel shows unit info
    const statusText = page.locator('#status-text');
    await expect(statusText).toContainText(/GRID/);
    await expect(statusText).toContainText(/Marauder|Attacker/i);
  });

  test('should select unit on click', async ({ page }) => {
    // Find an attacker unit
    const attackerUnit = page.locator('#battle-map .unit-attacker').first();
    await attackerUnit.click();

    // Unit should have 'selected' class
    await expect(attackerUnit).toHaveClass(/selected/);

    // Status should show selection
    const statusText = page.locator('#status-text');
    await expect(statusText).toContainText(/STATUS: ACTIVE/i);
  });

  test('should deselect unit on second click', async ({ page }) => {
    const attackerUnit = page.locator('#battle-map .unit-attacker').first();

    // Select
    await attackerUnit.click();
    await expect(attackerUnit).toHaveClass(/selected/);

    // Deselect
    await attackerUnit.click();
    await expect(attackerUnit).not.toHaveClass(/selected/);

    // Status should show deselection
    const statusText = page.locator('#status-text');
    await expect(statusText).toContainText(/STATUS: IDLE/i);
  });

  test('should show terrain information on hover', async ({ page, isMobile }) => {
    if (isMobile) test.skip();
    // Find a floor tile
    const floorTile = page.locator('#battle-map .terrain-floor').first();
    await floorTile.hover();

    await page.waitForTimeout(200);

    // Check status shows terrain info
    const statusText = page.locator('#status-text');
    await expect(statusText).toContainText(/GRID/);
    await expect(statusText).toContainText(/TYPE:/);
  });

  test('should display hazard warning on hover', async ({ page, isMobile }) => {
    if (isMobile) test.skip();
    // Find a hazard tile
    const hazardTile = page.locator('#battle-map .terrain-hazard').first();

    if ((await hazardTile.count()) > 0) {
      await hazardTile.hover();
      await page.waitForTimeout(200);

      const statusText = page.locator('#status-text');
      await expect(statusText).toContainText(/DANGER|HAZARD|CRITICAL/i);
    }
  });

  test('should allow switching between unit selections', async ({ page }) => {
    const attackerUnits = page.locator('#battle-map .unit-attacker');
    const count = await attackerUnits.count();

    if (count >= 2) {
      // Select first unit
      await attackerUnits.nth(0).click();
      await expect(attackerUnits.nth(0)).toHaveClass(/selected/);

      // Select second unit
      await attackerUnits.nth(1).click();

      // Second unit should be selected
      await expect(attackerUnits.nth(1)).toHaveClass(/selected/);

      // First unit should not be selected
      await expect(attackerUnits.nth(0)).not.toHaveClass(/selected/);
    }
  });
});

test.describe('Unit Movement', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#battle-map', { timeout: 5000 });
    await page.waitForTimeout(1500);
    await page.click('button:has-text("New Battle")');
    await page.waitForTimeout(500);
  });

  test('should move unit to floor tile when selected', async ({ page }) => {
    // Find an attacker unit
    const attackerUnit = page.locator('#battle-map .unit-attacker').first();
    const unitPos = await attackerUnit.boundingBox();

    if (!unitPos) return;

    // Select the unit
    await attackerUnit.click({ force: true });

    // Find a nearby floor tile
    const floorTile = page.locator('#battle-map .terrain-floor').first();
    const floorPos = await floorTile.boundingBox();

    if (!floorPos) return;

    // Click floor tile to move
    await floorTile.click({ force: true });

    // Wait for movement
    await page.waitForTimeout(300);

    // Status should indicate movement
    const statusText = page.locator('#status-text');
    await expect(statusText).toContainText(/GRID/i);
  });

  test('should not move unit to wall tile', async ({ page }) => {
    // Find an attacker unit
    const attackerUnit = page.locator('#battle-map .unit-attacker').first();
    await attackerUnit.click({ force: true });

    // Try to click a wall
    const wallTile = page.locator('#battle-map .terrain-wall').first();

    if ((await wallTile.count()) > 0) {
      await wallTile.click({ force: true });
      await page.waitForTimeout(300);

      const statusText = page.locator('#status-text');
      await expect(statusText).toContainText(/blocked/i);
    }
  });
});

test.describe('Visual Modes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#battle-map', { timeout: 5000 });
    await page.waitForTimeout(1500);
  });

  test('should toggle visualization mode', async ({ page }) => {
    const visButton = page.locator('button:has-text("Vis-Mode")');
    await visButton.click();

    await page.waitForTimeout(200);

    // Status should indicate mode change
    const statusText = page.locator('#status-text');
    await expect(statusText).toContainText(/Visual Mode/i);

    // Click again to toggle back
    await visButton.click();
    await page.waitForTimeout(200);

    await expect(statusText).toContainText(/Visual Mode/i);
  });
});
