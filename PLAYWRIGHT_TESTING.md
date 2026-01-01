# Playwright Testing Guide

## Overview

This project uses Playwright for end-to-end browser testing. The Playwright test
suite automatically starts the Deno server in the background, runs comprehensive
tests across multiple browsers, and generates detailed reports.

## Quick Start

### 1. Install Playwright Browsers

First time setup:

```bash
deno task playwright:install
```

This downloads Chromium, Firefox, and WebKit browsers for testing.

### 2. Run Tests

Run all E2E tests (headless mode):

```bash
deno task test:e2e
```

Run with visible browser (headed mode):

```bash
deno task test:e2e:headed
```

Run with interactive UI:

```bash
deno task test:e2e:ui
```

### 3. Run All Tests

Run both unit tests and E2E tests:

```bash
deno task test:all
```

## Test Structure

```
tests/
└── e2e/
    ├── scenario-loading.spec.ts      # Scenario loading and generation tests
    ├── unit-interactions.spec.ts     # Unit selection and movement tests
    ├── scenario-mechanics.spec.ts    # Scenario-specific mechanics tests
    ├── visual-regression.spec.ts     # Visual effects and styling tests
    └── helpers.ts                     # Reusable test utilities
```

## Test Categories

### 1. Scenario Loading Tests

**File**: `scenario-loading.spec.ts`

Tests that verify:

- ✅ Page loads with correct title
- ✅ All scenarios appear in dropdown
- ✅ Legend displays correctly
- ✅ Control buttons are present
- ✅ Map auto-generates on load
- ✅ Each scenario can be generated

### 2. Unit Interaction Tests

**File**: `unit-interactions.spec.ts`

Tests that verify:

- ✅ Unit information displays on hover
- ✅ Units can be selected/deselected
- ✅ Units can move to valid tiles
- ✅ Movement is blocked by walls
- ✅ Multiple units can be selected
- ✅ Visualization mode toggles

### 3. Scenario Mechanics Tests

**File**: `scenario-mechanics.spec.ts`

Tests scenario-specific features:

**Manufactorum Raid:**

- ✅ 3 bomb markers appear
- ✅ Bomb information shows on hover
- ✅ Bombs update on end round

**The Conveyer:**

- ✅ Platform area is marked
- ✅ Loot caskets are placed
- ✅ Platform movement rolls occur

**Fungal Horror:**

- ✅ Fungal overgrowth appears
- ✅ Overgrown areas are marked
- ✅ Fungal spread processes each round

**Scrag:**

- ✅ Priority target is marked
- ✅ Priority indicator shows on hover

### 4. Visual Regression Tests

**File**: `visual-regression.spec.ts`

Tests visual rendering:

- ✅ CRT overlay effects display
- ✅ Monospace font is used
- ✅ Green phosphor color scheme
- ✅ Grid layout renders correctly
- ✅ Responsive design on different viewports
- ✅ Box-drawing characters for walls
- ✅ Special symbols for objectives
- ✅ Animations are active

## Browser Coverage

Tests run on:

- **Chromium** (Desktop Chrome)
- **Firefox** (Desktop Firefox)
- **WebKit** (Desktop Safari)
- **Mobile Chrome** (Pixel 5)
- **Mobile Safari** (iPhone 12)

## Configuration

### playwright.config.ts

Key features:

- **Auto-start server**: Deno server starts automatically before tests
- **Parallel execution**: Tests run in parallel for speed
- **Retry logic**: Flaky tests retry automatically in CI
- **Screenshots**: Captured on failure
- **Video**: Recorded on failure
- **Trace**: Captured on first retry

### Environment Variables

- `CI=true`: Enables CI-specific behavior (retries, sequential execution)

## Helper Utilities

The `helpers.ts` file provides reusable functions:

```typescript
import {
  endRound,
  expectStatusContains,
  generateScenario,
  Scenarios,
  selectUnit,
  waitForAppReady,
} from "./helpers";

test("example test", async ({ page }) => {
  await waitForAppReady(page);
  await generateScenario(page, Scenarios.MANUFACTORUM_RAID);
  await expectStatusContains(page, /MANUFACTORUM RAID/i);
});
```

### Available Helpers

- `waitForAppReady(page)` - Wait for app initialization
- `generateScenario(page, scenarioKey)` - Start a new scenario
- `endRound(page)` - End current round
- `selectUnit(page, type, index)` - Select a unit
- `getStatusText(page)` - Get current status text
- `expectStatusContains(page, text)` - Assert status contains text
- `getCellAt(page, x, y)` - Get cell by coordinates
- `hoverCell(page, x, y)` - Hover and get cell info
- `getBombMarkers(page)` - Get all bomb markers
- `getLootCaskets(page)` - Get all loot caskets
- `getFungalCells(page)` - Get all fungal cells
- `playScenario(page, key, rounds)` - Simulate complete game
- `expectVictory(page, winner)` - Check victory conditions

## Writing New Tests

### Basic Test Structure

```typescript
import { expect, test } from "@playwright/test";
import { generateScenario, Scenarios, waitForAppReady } from "./helpers";

test.describe("My Test Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
  });

  test("should do something", async ({ page }) => {
    await generateScenario(page, Scenarios.BUSHWHACK);

    const statusText = page.locator("#status-text");
    await expect(statusText).toContainText(/BUSHWHACK/i);
  });
});
```

### Testing Scenario Mechanics

```typescript
test("should plant bomb in Manufactorum Raid", async ({ page }) => {
  await generateScenario(page, Scenarios.MANUFACTORUM_RAID);

  // Get first bomb marker
  const bomb = await getBombMarkers(page).first();
  await bomb.hover();

  // Check bomb is unplanted
  await expectStatusContains(page, /Not planted/i);

  // Select attacker and attempt interaction
  await selectUnit(page, "attacker", 0);
  // ... test plant interaction
});
```

### Testing Visual Elements

```typescript
test("should have correct color scheme", async ({ page }) => {
  const color = await getElementColor(page, "#battle-map", "color");
  expect(color).toMatch(/rgb/);
});
```

## Debugging Tests

### Interactive Mode

Run tests with UI for step-by-step debugging:

```bash
deno task test:e2e:ui
```

### Headed Mode

See the browser while tests run:

```bash
deno task test:e2e:headed
```

### Debug Specific Test

```bash
deno run -A npm:playwright test --debug tests/e2e/scenario-loading.spec.ts
```

### Pause Test Execution

Add `await page.pause()` in your test:

```typescript
test("debug test", async ({ page }) => {
  await page.goto("/");
  await page.pause(); // Opens Playwright Inspector
  // ... rest of test
});
```

## CI/CD Integration

Tests run automatically on:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

CI workflow:

1. Checkout code
2. Install Deno
3. Run unit tests
4. Install Playwright browsers
5. Run E2E tests
6. Upload artifacts on failure

### Test Artifacts

On failure, CI uploads:

- Test results (`playwright-report/`)
- Screenshots (`screenshots/`)
- Videos (`test-results/`)

Download from GitHub Actions artifacts tab.

## Performance

### Parallel Execution

Tests run in parallel by default:

```typescript
// In playwright.config.ts
fullyParallel: true,
workers: undefined, // Uses all CPU cores
```

CI uses sequential execution for stability:

```typescript
workers: Deno.env.get('CI') ? 1 : undefined,
```

### Timeouts

- Per-test timeout: 30 seconds
- Total suite timeout: 15 minutes (CI)
- Server startup timeout: 120 seconds

## Troubleshooting

### Server doesn't start

Check if port 8000 is already in use:

```bash
# Windows
netstat -ano | findstr :8000

# Unix/Mac
lsof -i :8000
```

Kill the process or change port in `server.ts` and `playwright.config.ts`.

### Browser installation fails

Manually install browsers:

```bash
deno run -A npm:playwright install chromium
deno run -A npm:playwright install firefox
deno run -A npm:playwright install webkit
```

### Tests fail in CI but pass locally

- Check browser compatibility
- Review CI logs for environment differences
- Increase timeouts if needed
- Check for race conditions

### Screenshot/video not captured

Ensure config has:

```typescript
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

## Best Practices

### 1. Use Helper Functions

Don't repeat code - use helpers from `helpers.ts`:

```typescript
// ❌ Don't
await page.selectOption("#scenario-select", "bushwhack");
await page.click('button:has-text("New Battle")');
await page.waitForTimeout(500);

// ✅ Do
await generateScenario(page, Scenarios.BUSHWHACK);
```

### 2. Wait for Elements

Always wait for elements to be ready:

```typescript
// ❌ Don't
const text = await page.locator("#status-text").textContent();

// ✅ Do
await page.waitForSelector("#status-text");
const text = await page.locator("#status-text").textContent();
```

### 3. Use Data Attributes

Add data attributes for reliable selectors:

```html
<button data-testid="new-battle">New Battle</button>
```

```typescript
await page.click('[data-testid="new-battle"]');
```

### 4. Group Related Tests

Use `test.describe()` for organization:

```typescript
test.describe("Bomb Mechanics", () => {
  test("should plant bomb", async ({ page }) => {});
  test("should disarm bomb", async ({ page }) => {});
  test("should detonate bomb", async ({ page }) => {});
});
```

### 5. Clean Up State

Use `beforeEach` to ensure clean state:

```typescript
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await waitForAppReady(page);
  await generateScenario(page, Scenarios.BUSHWHACK);
});
```

## Continuous Improvement

### Coverage Goals

- ✅ All scenarios load successfully
- ✅ Core interactions work (select, move, hover)
- ✅ Scenario-specific mechanics function
- ✅ Visual effects render correctly
- ⏳ Victory conditions trigger correctly
- ⏳ Combat simulation accuracy
- ⏳ Mobile touch interactions
- ⏳ Accessibility compliance

### Adding New Tests

When adding new features:

1. Write test first (TDD approach)
2. Use existing helpers or create new ones
3. Test across all browsers
4. Add to appropriate test file
5. Update this documentation

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Deno Documentation](https://deno.land/manual)
- [Test Best Practices](https://playwright.dev/docs/best-practices)
- [CI/CD Guide](https://playwright.dev/docs/ci)

---

**Remember**: Well-tested code is reliable code. Every scenario, every
interaction, every visual effect should be verified automatically!

🎲 **Test Well, Deploy with Confidence** 🎲
