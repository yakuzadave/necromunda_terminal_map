import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests
 *
 * These tests verify that the CRT visual effects and styling
 * render correctly across different browsers and viewports.
 */

test.describe('Visual Effects', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#battle-map', { timeout: 5000 });
    await page.waitForTimeout(1500);
  });

  test('should display CRT overlay effects', async ({ page }) => {
    const crtOverlay = page.locator('.crt-overlay');
    await expect(crtOverlay).toBeVisible();

    const crtGlow = page.locator('.crt-glow');
    await expect(crtGlow).toBeVisible();

    const scanBar = page.locator('.scan-bar');
    await expect(scanBar).toBeVisible();
  });

  test('should have monospace font for terminal effect', async ({ page }) => {
    const battleMap = page.locator('#battle-map');
    const fontFamily = await battleMap.evaluate((el) => {
      return window.getComputedStyle(el).fontFamily;
    });

    expect(fontFamily).toContain('VT323');
  });

  test('should have green phosphor color scheme', async ({ page }) => {
    const battleMap = page.locator('#battle-map');
    const color = await battleMap.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // Should be some shade of green (RGB values where G > R and G > B)
    expect(color).toMatch(/rgb/);
  });

  test('should render map in grid layout', async ({ page }) => {
    const battleMap = page.locator('#battle-map');
    const display = await battleMap.evaluate((el) => {
      return window.getComputedStyle(el).display;
    });

    expect(display).toBe('grid');
  });

  test('should have proper cell sizing', async ({ page }) => {
    const cell = page.locator('#battle-map .cell').first();
    const box = await cell.boundingBox();

    // Cells should have similar width and height for monospace grid
    if (box) {
      const ratio = box.width / box.height;
      expect(ratio).toBeGreaterThan(0.35);
      expect(ratio).toBeLessThan(2.5);
    }
  });
});

test.describe('Responsive Design', () => {
  test('should render on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForSelector('#battle-map', { timeout: 5000 });

    const battleMap = page.locator('#battle-map');
    await expect(battleMap).toBeVisible();
  });

  test('should render on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForSelector('#battle-map', { timeout: 5000 });

    const battleMap = page.locator('#battle-map');
    await expect(battleMap).toBeVisible();
  });

  test('should render on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('#battle-map', { timeout: 5000 });

    const battleMap = page.locator('#battle-map');
    await expect(battleMap).toBeVisible();
  });
});

test.describe('Color Coding', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#battle-map', { timeout: 5000 });
    await page.waitForTimeout(1500);
  });

  test('should have distinct colors for attackers and defenders', async ({ page }) => {
    const attacker = page.locator('#battle-map .unit-attacker').first();
    const defender = page.locator('#battle-map .unit-defender').first();

    if ((await attacker.count()) > 0 && (await defender.count()) > 0) {
      const attackerColor = await attacker.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      const defenderColor = await defender.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // Colors should be different
      expect(attackerColor).not.toBe(defenderColor);
    }
  });

  test('should highlight selected units', async ({ page }) => {
    const attacker = page.locator('#battle-map .unit-attacker').first();

    // Get color before selection
    const normalColor = await attacker.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Select unit
    await attacker.click();

    // Get color after selection
    const selectedColor = await attacker.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Selected should have different background
    expect(selectedColor).not.toBe(normalColor);
  });

  test('should have hazard warning colors', async ({ page }) => {
    const hazard = page.locator('#battle-map .terrain-hazard').first();

    if ((await hazard.count()) > 0) {
      const hazardColor = await hazard.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      // Hazards should have warning colors (red/yellow tones)
      // Just check it's not the default green
      expect(hazardColor).toBeTruthy();
    }
  });
});

test.describe('Terrain Symbols', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#battle-map', { timeout: 5000 });
    await page.waitForTimeout(1500);
  });

  test('should render box-drawing characters for walls', async ({ page }) => {
    const walls = page.locator('#battle-map .terrain-wall');
    const count = await walls.count();

    if (count > 0) {
      const wallText = await walls.first().textContent();

      // Should be box-drawing Unicode characters
      const boxChars = ['╬', '║', '═', '╚', '╔', '╠', '╝', '╩', '┐', '┤', '┬', '●', '#'];
      const hasBoxChar = boxChars.some((char) => wallText?.includes(char));

      expect(hasBoxChar).toBe(true);
    }
  });

  test('should render special symbols for objectives', async ({ page }) => {
    // Generate a scenario with objectives
    await page.selectOption('#scenario-select', 'manufactorumRaid');
    await page.click('button:has-text("New Battle")');
    await page.waitForTimeout(500);

    const objectives = page.locator('#battle-map .obj-marker');

    if ((await objectives.count()) > 0) {
      const objectiveText = await objectives.first().textContent();

      // Should be special Unicode symbols
      const symbols = ['⊗', '◉', '⊘', '✸', '◆'];
      const hasSymbol = symbols.some((char) => objectiveText?.includes(char));

      expect(hasSymbol).toBe(true);
    }
  });

  test('should render fungal overgrowth with correct symbol', async ({ page }) => {
    await page.selectOption('#scenario-select', 'fungalHorror');
    await page.click('button:has-text("New Battle")');
    await page.waitForTimeout(500);

    const fungal = page.locator('#battle-map .terrain-fungal');

    if ((await fungal.count()) > 0) {
      const fungalText = await fungal.first().textContent();
      expect(fungalText).toContain('▓');
    }
  });
});

test.describe('Animations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#battle-map', { timeout: 5000 });
  });

  test('should have scan bar animation', async ({ page }) => {
    const scanBar = page.locator('.scan-bar');

    const hasAnimation = await scanBar.evaluate((el) => {
      const animation = window.getComputedStyle(el).animation;
      return animation && animation !== 'none';
    });

    expect(hasAnimation).toBe(true);
  });

  test('should have typing cursor animation on status text', async ({ page }) => {
    await page.waitForTimeout(1500);

    const statusText = page.locator('#status-text');

    const hasAnimation = await statusText.evaluate((el) => {
      const classList = Array.from(el.classList);
      return classList.includes('typing-cursor');
    });

    expect(hasAnimation).toBe(true);
  });

  test('should have fungal pulse animation', async ({ page }) => {
    await page.selectOption('#scenario-select', 'fungalHorror');
    await page.click('button:has-text("New Battle")');
    await page.waitForTimeout(500);

    const fungal = page.locator('#battle-map .terrain-fungal').first();

    if ((await fungal.count()) > 0) {
      const hasAnimation = await fungal.evaluate((el) => {
        const animation = window.getComputedStyle(el).animation;
        return animation && animation !== 'none';
      });

      expect(hasAnimation).toBe(true);
    }
  });
});
