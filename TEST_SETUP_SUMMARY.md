# Test Setup Summary

## Overview

The Necromunda Tactical Auspex project has been enhanced with comprehensive
Playwright testing infrastructure. The Deno server now runs automatically in the
background during testing, and extensive E2E tests verify functionality across
multiple browsers.

## What Was Added

### 1. Configuration Files

#### `deno.json` - Enhanced Task Configuration

Added new tasks for testing:

- `test:e2e` - Run Playwright E2E tests
- `test:e2e:headed` - Run tests with visible browser
- `test:e2e:ui` - Run tests with interactive UI
- `test:all` - Run both unit and E2E tests
- `playwright:install` - Install browser binaries

Also added npm imports for Playwright package.

#### `playwright.config.ts` - Playwright Configuration

Comprehensive configuration including:

- **Auto-start server**: Deno server starts automatically before tests
- **Multi-browser**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Parallel execution**: Tests run in parallel for speed
- **Retry logic**: Automatic retries for flaky tests in CI
- **Artifacts**: Screenshots, videos, and traces on failure
- **Timeouts**: Appropriate timeouts for various operations

### 2. Test Files

#### `tests/e2e/scenario-loading.spec.ts`

Tests for scenario loading and generation:

- Page loads with correct title
- All scenarios appear in dropdown
- Legend displays correctly
- Control buttons are present
- Map auto-generates on load
- Each scenario can be generated individually
- Random scenario generation works

#### `tests/e2e/unit-interactions.spec.ts`

Tests for user interactions:

- Unit information displays on hover
- Units can be selected and deselected
- Units can move to valid tiles
- Movement is blocked by walls
- Multiple unit selection works
- Visualization mode toggles
- Terrain information displays correctly

#### `tests/e2e/scenario-mechanics.spec.ts`

Tests for scenario-specific features:

- **Manufactorum Raid**: Bomb markers, planting, disarming, detonation
- **The Conveyer**: Platform marking, loot caskets, platform movement
- **Fungal Horror**: Overgrowth display, spread mechanics
- **Scrag**: Priority target marking
- Round management and incrementing

#### `tests/e2e/visual-regression.spec.ts`

Tests for visual rendering:

- CRT overlay effects
- Monospace font usage
- Green phosphor color scheme
- Grid layout rendering
- Responsive design on different viewports
- Box-drawing characters for walls
- Special Unicode symbols for objectives
- Animations (scan bar, typing cursor, fungal pulse)
- Color coding for units and terrain

#### `tests/e2e/helpers.ts`

Reusable test utilities:

- `waitForAppReady()` - Wait for app initialization
- `generateScenario()` - Start a new scenario
- `endRound()` - End current round
- `selectUnit()` - Select a unit
- `getStatusText()` - Get status panel text
- `expectStatusContains()` - Assert status content
- `getCellAt()` - Get cell by coordinates
- `getBombMarkers()` - Get bomb markers
- `getLootCaskets()` - Get loot caskets
- `getFungalCells()` - Get fungal cells
- `playScenario()` - Simulate complete game
- Plus many more helpers for common operations

### 3. CI/CD

#### `.github/workflows/test.yml`

GitHub Actions workflow that:

- Runs on push to main/develop branches
- Runs on pull requests
- Tests on Ubuntu, Windows, and macOS
- Runs unit tests
- Installs Playwright browsers
- Runs E2E tests
- Uploads artifacts (screenshots, videos) on failure
- Includes lint and type-check jobs

### 4. Documentation

#### `PLAYWRIGHT_TESTING.md`

Comprehensive testing guide covering:

- Quick start instructions
- Test structure and organization
- Test categories and coverage
- Browser coverage
- Configuration details
- Helper utility usage
- Writing new tests
- Debugging tests
- CI/CD integration
- Performance considerations
- Troubleshooting
- Best practices
- Resources

#### `README.md` - Updated

Added testing section with:

- Quick start commands
- Test coverage summary
- Link to detailed documentation
- CI/CD information

#### `TEST_SETUP_SUMMARY.md` (this file)

Summary of all testing enhancements.

## File Structure

```
necromunda_terminal_map/
├── .github/
│   └── workflows/
│       └── test.yml                  # CI/CD workflow
├── tests/
│   └── e2e/
│       ├── scenario-loading.spec.ts  # Scenario tests
│       ├── unit-interactions.spec.ts # Interaction tests
│       ├── scenario-mechanics.spec.ts # Mechanics tests
│       ├── visual-regression.spec.ts # Visual tests
│       └── helpers.ts                # Test utilities
├── deno.json                         # Enhanced with test tasks
├── playwright.config.ts              # Playwright configuration
├── PLAYWRIGHT_TESTING.md             # Testing documentation
├── TEST_SETUP_SUMMARY.md             # This file
└── README.md                         # Updated with testing info
```

## Key Features

### Automatic Background Server

The Playwright configuration automatically:

1. Starts the Deno server before tests
2. Waits for server to be ready (http://localhost:8000)
3. Runs all tests
4. Shuts down server after tests complete

No manual server management needed!

### Cross-Browser Testing

Tests run on:

- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Pixel 5 (Chrome), iPhone 12 (Safari)

### Parallel Execution

Tests run in parallel for speed:

- Local: Uses all CPU cores
- CI: Sequential for stability

### Rich Debugging

Multiple debugging modes:

- Headless (default, fast)
- Headed (see browser)
- UI mode (step-by-step debugging)
- Debug mode (Playwright Inspector)

### Comprehensive Coverage

Current test coverage:

- ✅ Scenario loading and generation
- ✅ Unit selection and movement
- ✅ Bomb mechanics (plant, disarm, detonate)
- ✅ Platform movement and descent
- ✅ Fungal spread and overgrowth
- ✅ Visual effects and styling
- ✅ CRT animations
- ✅ Responsive design

## How to Use

### First Time Setup

```bash
# Install Playwright browsers
deno task playwright:install
```

### Running Tests

```bash
# Run all E2E tests (headless)
deno task test:e2e

# Run with visible browser
deno task test:e2e:headed

# Run with interactive UI
deno task test:e2e:ui

# Run all tests (unit + E2E)
deno task test:all
```

### Debugging Failed Tests

```bash
# Run specific test file
deno run -A npm:playwright test tests/e2e/scenario-loading.spec.ts

# Run with debug mode
deno run -A npm:playwright test --debug

# View test report
deno run -A npm:playwright show-report
```

## Benefits

### For Development

- **Confidence**: Know immediately if changes break functionality
- **Documentation**: Tests serve as living documentation
- **Regression Prevention**: Catch bugs before they reach production
- **Refactoring Safety**: Refactor with confidence

### For CI/CD

- **Automated Testing**: Every push and PR runs full test suite
- **Cross-Platform**: Tests on Linux, Windows, and macOS
- **Artifacts**: Screenshots and videos of failures
- **Quality Gate**: Prevents merging broken code

### For Collaboration

- **Shared Understanding**: Tests communicate expected behavior
- **Easier Onboarding**: New contributors understand features through tests
- **Code Review**: Tests provide context for changes
- **Bug Reports**: Tests can reproduce and verify fixes

## Next Steps

### Recommended Additions

1. **Visual Regression**: Add screenshot comparison tests
2. **Performance Tests**: Monitor map generation speed
3. **Accessibility Tests**: Check WCAG compliance
4. **Load Tests**: Verify performance with large maps
5. **Integration Tests**: Test with real game scenarios

### Coverage Expansion

- ✅ All scenarios load successfully
- ✅ Core interactions work
- ✅ Scenario-specific mechanics function
- ✅ Visual effects render correctly
- ⏳ Victory conditions trigger correctly
- ⏳ Combat simulation accuracy
- ⏳ Mobile touch interactions
- ⏳ Accessibility compliance

## Maintenance

### Regular Tasks

- Run tests before committing: `deno task test:all`
- Review test failures in CI
- Update tests when features change
- Add tests for new features
- Keep Playwright version updated

### Best Practices

1. **Write tests first** (TDD approach)
2. **Use helper functions** to reduce duplication
3. **Wait for elements** to be ready
4. **Group related tests** with `describe()`
5. **Clean up state** in `beforeEach()`
6. **Use data attributes** for reliable selectors
7. **Keep tests isolated** (no dependencies)
8. **Make tests readable** (clear names and comments)

## Conclusion

The Necromunda Tactical Auspex now has a robust testing infrastructure that:

- Automatically starts the Deno server
- Tests across multiple browsers
- Runs in parallel for speed
- Integrates with CI/CD
- Provides rich debugging tools
- Documents expected behavior

This ensures the application remains stable and reliable as it evolves!

---

**Test Well, Deploy with Confidence!** 🎲
