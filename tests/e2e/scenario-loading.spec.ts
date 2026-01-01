import { expect, test } from "@playwright/test";

/**
 * Scenario Loading Tests
 *
 * These tests verify that all scenarios load correctly and display
 * the expected UI elements.
 */

test.describe("Scenario Loading", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for the map to initialize
    await page.waitForSelector("#battle-map", { timeout: 5000 });
  });

  test("should load the page with correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/Necromunda Tactical Auspex/);
  });

  test("should display header with gang name", async ({ page }) => {
    const header = page.locator("h1");
    await expect(header).toContainText("The Marauders");
  });

  test("should have scenario dropdown with all scenarios", async ({ page }) => {
    const dropdown = page.locator("#scenario-select");
    await expect(dropdown).toBeVisible();

    // Check all scenario options exist
    const options = await dropdown.locator("option").allTextContents();
    expect(options).toContain("Random Ambush");
    expect(options).toContain("Bushwhack");
    expect(options).toContain("Scrag");
    expect(options).toContain("Mayhem");
    expect(options).toContain("Manufactorum Raid");
    expect(options).toContain("The Conveyer");
    expect(options).toContain("Fungal Horror");
  });

  test("should display legend with all terrain types", async ({ page }) => {
    const legendItems = page.locator(".legend-item");
    await expect(legendItems).toHaveCount(7);

    // Check for specific legend entries
    await expect(page.locator('.legend-item:has-text("Marauder (Attacker)")'))
      .toBeVisible();
    await expect(page.locator('.legend-item:has-text("Garrison (Defender)")'))
      .toBeVisible();
    await expect(page.locator('.legend-item:has-text("Bulkhead Structure")'))
      .toBeVisible();
  });

  test("should have control buttons", async ({ page }) => {
    await expect(page.locator('button:has-text("New Battle")')).toBeVisible();
    await expect(page.locator('button:has-text("End Round")')).toBeVisible();
    await expect(page.locator('button:has-text("Vis-Mode")')).toBeVisible();
  });

  test("should auto-generate map on load", async ({ page }) => {
    // Wait a bit for auto-generation (1 second delay in code)
    await page.waitForTimeout(1500);

    const mapCells = page.locator("#battle-map .cell");
    const cellCount = await mapCells.count();

    // Map is 50x25 = 1250 cells
    expect(cellCount).toBe(1250);
  });

  test("should display cogitator feed", async ({ page }) => {
    const statusText = page.locator("#status-text");
    await expect(statusText).toBeVisible();
    await expect(statusText).toContainText(/System Ready|SCENARIO:/i);
  });
});

test.describe("Scenario Generation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("#battle-map", { timeout: 5000 });
    await page.waitForTimeout(1500); // Wait for auto-generation
  });

  const scenarios = [
    { value: "bushwhack", name: "BUSHWHACK" },
    { value: "scrag", name: "SCRAG" },
    { value: "mayhem", name: "MAYHEM" },
    { value: "manufactorumRaid", name: "MANUFACTORUM RAID" },
    { value: "conveyer", name: "CONVEYER" },
    { value: "fungalHorror", name: "FUNGAL HORROR" },
  ];

  for (const scenario of scenarios) {
    test(`should generate ${scenario.name} scenario`, async ({ page }) => {
      // Select scenario
      await page.selectOption("#scenario-select", scenario.value);

      // Click New Battle
      await page.click('button:has-text("New Battle")');

      // Wait for map to regenerate
      await page.waitForTimeout(500);

      // Check that scenario name appears in status
      const statusText = page.locator("#status-text");
      await expect(statusText).toContainText(new RegExp(scenario.name, "i"));

      // Verify map has been regenerated
      const mapCells = page.locator("#battle-map .cell");
      expect(await mapCells.count()).toBe(1250);
    });
  }

  test("should generate random ambush scenario", async ({ page }) => {
    await page.selectOption("#scenario-select", "random");
    await page.click('button:has-text("New Battle")');
    await page.waitForTimeout(500);

    const statusText = page.locator("#status-text");
    const text = await statusText.textContent();

    // Should be one of the ambush scenarios
    const hasAmbushScenario = text?.includes("BUSHWHACK") ||
      text?.includes("SCRAG") ||
      text?.includes("MAYHEM");

    expect(hasAmbushScenario).toBe(true);
  });
});
