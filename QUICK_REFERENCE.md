# Quick Reference Card

## Testing Commands

### Setup (First Time Only)
```bash
deno task playwright:install
```

### Running Tests
```bash
# All E2E tests (headless)
deno task test:e2e

# With visible browser
deno task test:e2e:headed

# With interactive UI
deno task test:e2e:ui

# All tests (unit + E2E)
deno task test:all
```

### Development
```bash
# Start dev server with watch mode
deno task dev

# Start production server
deno task start

# Run unit tests
deno task test
```

### Debugging
```bash
# Run specific test file
deno run -A npm:playwright test tests/e2e/scenario-loading.spec.ts

# Debug mode (step through)
deno run -A npm:playwright test --debug

# View test report
deno run -A npm:playwright show-report
```

## Test Files

| File | Purpose |
|------|---------|
| `scenario-loading.spec.ts` | Scenario loading and generation |
| `unit-interactions.spec.ts` | Unit selection and movement |
| `scenario-mechanics.spec.ts` | Scenario-specific features |
| `visual-regression.spec.ts` | Visual effects and styling |
| `helpers.ts` | Reusable test utilities |

## Helper Functions

```typescript
import {
  waitForAppReady,      // Wait for app to load
  generateScenario,     // Start a new scenario
  endRound,             // End current round
  selectUnit,           // Select a unit
  getStatusText,        // Get status panel text
  expectStatusContains, // Assert status content
  Scenarios,            // Scenario enum
} from './helpers';
```

## Common Patterns

### Basic Test
```typescript
test('my test', async ({ page }) => {
  await page.goto('/');
  await waitForAppReady(page);
  // ... test code
});
```

### Generate Scenario
```typescript
await generateScenario(page, Scenarios.MANUFACTORUM_RAID);
await expectStatusContains(page, /MANUFACTORUM RAID/i);
```

### Select and Move Unit
```typescript
const unit = await selectUnit(page, 'attacker', 0);
const floor = page.locator('.terrain-floor').first();
await floor.click();
```

### End Round
```typescript
await endRound(page);
const round = await getCurrentRound(page);
expect(round).toBe(1);
```

## Browsers Tested

- ✅ Desktop Chrome (Chromium)
- ✅ Desktop Firefox
- ✅ Desktop Safari (WebKit)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)

## File Structure

```
tests/
└── e2e/
    ├── scenario-loading.spec.ts
    ├── unit-interactions.spec.ts
    ├── scenario-mechanics.spec.ts
    ├── visual-regression.spec.ts
    └── helpers.ts

playwright.config.ts        # Playwright configuration
deno.json                   # Task definitions
.github/workflows/test.yml  # CI/CD workflow
```

## Scenarios

| Scenario | Key |
|----------|-----|
| Random Ambush | `random` |
| Bushwhack | `bushwhack` |
| Scrag | `scrag` |
| Mayhem | `mayhem` |
| Manufactorum Raid | `manufactorumRaid` |
| The Conveyer | `conveyer` |
| Fungal Horror | `fungalHorror` |

## Key Selectors

| Element | Selector |
|---------|----------|
| Battle Map | `#battle-map` |
| Status Panel | `#status-text` |
| Scenario Dropdown | `#scenario-select` |
| Attacker Unit | `.unit-attacker` |
| Defender Unit | `.unit-defender` |
| Wall | `.terrain-wall` |
| Floor | `.terrain-floor` |
| Hazard | `.terrain-hazard` |
| Objective | `.obj-marker` |
| Fungal | `.terrain-fungal` |

## Documentation

- [PLAYWRIGHT_TESTING.md](PLAYWRIGHT_TESTING.md) - Full testing guide
- [TESTING.md](TESTING.md) - Original test documentation
- [README.md](README.md) - Project overview
- [TEST_SETUP_SUMMARY.md](TEST_SETUP_SUMMARY.md) - Setup summary

---

**Quick Commands Cheat Sheet:**

```bash
# First time setup
deno task playwright:install

# Run tests
deno task test:e2e

# Debug tests
deno task test:e2e:ui

# Start dev server
deno task dev
```

🎲 **Happy Testing!** 🎲
