import { Page, expect } from '@playwright/test';

/**
 * Test Helper Utilities
 *
 * Reusable functions for Playwright tests to reduce code duplication
 * and provide consistent test patterns.
 */

/**
 * Wait for the application to fully load and initialize
 */
export async function waitForAppReady(page: Page) {
  await page.waitForSelector('#battle-map', { timeout: 5000 });
  await page.waitForTimeout(1500); // Auto-generation delay
}

/**
 * Generate a new battle with a specific scenario
 */
export async function generateScenario(page: Page, scenarioKey: string) {
  await page.selectOption('#scenario-select', scenarioKey);
  await page.click('button:has-text("New Battle")');
  await page.waitForTimeout(500);
}

/**
 * End the current round and wait for processing
 */
export async function endRound(page: Page) {
  await page.click('button:has-text("End Round")');
  await page.waitForTimeout(500);
}

/**
 * Select a unit on the map by type and index
 */
export async function selectUnit(
  page: Page,
  unitType: 'attacker' | 'defender',
  index: number = 0
) {
  const cssClass = unitType === 'attacker' ? '.unit-attacker' : '.unit-defender';
  const unit = page.locator(`#battle-map ${cssClass}`).nth(index);
  await unit.click();
  return unit;
}

/**
 * Get the status text content
 */
export async function getStatusText(page: Page): Promise<string> {
  const statusText = page.locator('#status-text');
  return (await statusText.textContent()) || '';
}

/**
 * Check if status contains expected text
 */
export async function expectStatusContains(page: Page, text: string | RegExp) {
  const statusText = page.locator('#status-text');
  await expect(statusText).toContainText(text);
}

/**
 * Get all units of a specific type
 */
export async function getUnits(page: Page, unitType: 'attacker' | 'defender') {
  const cssClass = unitType === 'attacker' ? '.unit-attacker' : '.unit-defender';
  return page.locator(`#battle-map ${cssClass}`);
}

/**
 * Get unit count by type
 */
export async function getUnitCount(
  page: Page,
  unitType: 'attacker' | 'defender'
): Promise<number> {
  const units = await getUnits(page, unitType);
  return await units.count();
}

/**
 * Find a cell by grid coordinates
 */
export async function getCellAt(page: Page, x: number, y: number) {
  return page.locator(`#battle-map .cell[data-x="${x}"][data-y="${y}"]`);
}

/**
 * Hover over a cell and get info
 */
export async function hoverCell(page: Page, x: number, y: number) {
  const cell = await getCellAt(page, x, y);
  await cell.hover();
  await page.waitForTimeout(200);
  return await getStatusText(page);
}

/**
 * Get all cells of a specific terrain type
 */
export async function getCellsByType(page: Page, terrainType: string) {
  return page.locator(`#battle-map .terrain-${terrainType}`);
}

/**
 * Check if a specific scenario is loaded
 */
export async function expectScenario(page: Page, scenarioName: string) {
  await expectStatusContains(page, new RegExp(scenarioName, 'i'));
}

/**
 * Toggle visualization mode
 */
export async function toggleVisMode(page: Page) {
  await page.click('button:has-text("Vis-Mode")');
  await page.waitForTimeout(200);
}

/**
 * Get the current round number from status
 */
export async function getCurrentRound(page: Page): Promise<number> {
  const status = await getStatusText(page);
  const match = status.match(/ROUND (\d+)/i);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Wait for a specific number of rounds to pass
 */
export async function waitForRounds(page: Page, rounds: number) {
  for (let i = 0; i < rounds; i++) {
    await endRound(page);
  }
}

/**
 * Get bomb markers (Manufactorum Raid scenario)
 */
export async function getBombMarkers(page: Page) {
  return page.locator('#battle-map .obj-marker');
}

/**
 * Get loot caskets (The Conveyer scenario)
 */
export async function getLootCaskets(page: Page) {
  return page.locator('#battle-map [data-x][data-y]:has-text("◆")');
}

/**
 * Get fungal cells (Fungal Horror scenario)
 */
export async function getFungalCells(page: Page) {
  return page.locator('#battle-map .terrain-fungal');
}

/**
 * Check if map has been generated
 */
export async function expectMapGenerated(page: Page) {
  const cells = page.locator('#battle-map .cell');
  const count = await cells.count();
  expect(count).toBe(1250); // 50x25 grid
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
}

/**
 * Get color of an element
 */
export async function getElementColor(
  page: Page,
  selector: string,
  property: 'color' | 'backgroundColor' = 'color'
): Promise<string> {
  const element = page.locator(selector);
  return await element.evaluate((el, prop) => {
    return window.getComputedStyle(el)[prop];
  }, property);
}

/**
 * Check if element has animation
 */
export async function hasAnimation(page: Page, selector: string): Promise<boolean> {
  const element = page.locator(selector);
  return await element.evaluate((el) => {
    const animation = window.getComputedStyle(el).animation;
    return animation && animation !== 'none';
  });
}

/**
 * Get all control buttons
 */
export async function getControls(page: Page) {
  return {
    newBattle: page.locator('button:has-text("New Battle")'),
    endRound: page.locator('button:has-text("End Round")'),
    visMode: page.locator('button:has-text("Vis-Mode")'),
  };
}

/**
 * Simulate a complete game flow
 */
export async function playScenario(
  page: Page,
  scenarioKey: string,
  rounds: number = 3
) {
  await generateScenario(page, scenarioKey);
  await expectMapGenerated(page);
  await expectScenario(page, scenarioKey);

  for (let i = 0; i < rounds; i++) {
    await endRound(page);
    const currentRound = await getCurrentRound(page);
    expect(currentRound).toBe(i + 1);
  }
}

/**
 * Check if victory condition is met
 */
export async function expectVictory(page: Page, winner?: 'attacker' | 'defender') {
  const status = await getStatusText(page);
  expect(status).toMatch(/VICTORY|WIN|DEFEAT/i);

  if (winner) {
    const expectedText = winner === 'attacker' ? 'Attacker' : 'Defender';
    expect(status).toContain(expectedText);
  }
}

/**
 * Get map dimensions
 */
export async function getMapDimensions(page: Page) {
  const battleMap = page.locator('#battle-map');
  return await battleMap.boundingBox();
}

/**
 * Check if element is in viewport
 */
export async function isInViewport(page: Page, selector: string): Promise<boolean> {
  const element = page.locator(selector);
  return await element.isVisible();
}

/**
 * Scenarios enum for type safety
 */
export const Scenarios = {
  RANDOM: 'random',
  BUSHWHACK: 'bushwhack',
  SCRAG: 'scrag',
  MAYHEM: 'mayhem',
  MANUFACTORUM_RAID: 'manufactorumRaid',
  CONVEYER: 'conveyer',
  FUNGAL_HORROR: 'fungalHorror',
} as const;

/**
 * Common test data
 */
export const TestData = {
  MAP_WIDTH: 50,
  MAP_HEIGHT: 25,
  TOTAL_CELLS: 1250,
  MIN_BOMB_COUNT: 3,
  MIN_LOOT_COUNT: 4,
  MAX_ROUNDS: 9,
};
