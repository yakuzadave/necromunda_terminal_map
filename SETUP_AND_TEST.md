# Setup and Testing Guide

## Prerequisites

### Install Deno

Deno is required to run the server and tests.

**Windows (PowerShell):**
```powershell
irm https://deno.land/install.ps1 | iex
```

**macOS/Linux:**
```bash
curl -fsSL https://deno.land/install.sh | sh
```

**Verify installation:**
```bash
deno --version
```

## First-Time Setup

### 1. Install Playwright Browsers

```bash
deno task playwright:install
```

This downloads Chromium, Firefox, and WebKit browsers for testing (~500MB).

### 2. Verify Server Works

```bash
deno task start
```

Open http://localhost:8000 in your browser. You should see the Necromunda Tactical Auspex.

Press `Ctrl+C` to stop the server.

## Running Tests

### Option 1: Using Deno Tasks (Recommended)

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

### Option 2: Using PowerShell Script (Windows)

```powershell
# Headless mode
.\run-tests.ps1

# With visible browser
.\run-tests.ps1 headed

# Interactive UI
.\run-tests.ps1 ui

# Debug mode
.\run-tests.ps1 debug
```

### Option 3: Direct Playwright Commands

```bash
# Run specific test file
deno run -A npm:playwright test tests/e2e/scenario-loading.spec.ts

# Run in debug mode
deno run -A npm:playwright test --debug

# Run specific browser
deno run -A npm:playwright test --project=chromium

# View test report
deno run -A npm:playwright show-report
```

## Test Modes

### Headless Mode (Default)
- Fastest execution
- No browser window visible
- Best for CI/CD and quick checks

### Headed Mode
- Browser window visible
- See what's happening
- Good for understanding test flow

### UI Mode (Interactive)
- Step through tests
- Pause and inspect
- Time-travel debugging
- Best for test development

### Debug Mode
- Playwright Inspector
- Set breakpoints
- Execute step-by-step
- Best for troubleshooting

## Troubleshooting

### Deno Not Found

**Issue:** `deno: command not found`

**Solution:**
1. Make sure Deno is installed (see Prerequisites)
2. Restart your terminal/PowerShell
3. Add Deno to PATH manually:
   - Windows: `C:\Users\YourName\.deno\bin`
   - macOS/Linux: `~/.deno/bin`

### Port 8000 Already in Use

**Issue:** Server fails to start because port is busy

**Solution:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <process_id> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

Or change the port in `server.ts` and `playwright.config.ts`.

### Playwright Browsers Not Installed

**Issue:** Tests fail with browser not found error

**Solution:**
```bash
deno task playwright:install

# Or install specific browser
deno run -A npm:playwright install chromium
```

### Tests Fail on First Run

Some tests may be flaky on first run. Try:

1. Run again (tests have retry logic)
2. Run with longer timeout:
   ```bash
   deno run -A npm:playwright test --timeout=60000
   ```
3. Run specific browser:
   ```bash
   deno run -A npm:playwright test --project=chromium
   ```

### Permission Errors (Deno)

**Issue:** Deno permission denied errors

**Solution:** Ensure commands include necessary flags:
- `--allow-net` for network access
- `--allow-read` for reading files
- `-A` for all permissions (testing only)

## Understanding Test Results

### Success
```
✓ tests/e2e/scenario-loading.spec.ts
  ✓ should load the page (1s)
  ✓ should display header (500ms)

5 passed (5s)
```

### Failure
```
✗ tests/e2e/scenario-loading.spec.ts
  ✗ should load the page (1s)
    Error: Timeout waiting for selector

1 failed, 4 passed (5s)
```

### Viewing Failed Tests

```bash
# View HTML report
deno run -A npm:playwright show-report

# View screenshots
# Check: test-results/*/test-failed-1.png

# View videos
# Check: test-results/*/video.webm
```

## CI/CD

Tests run automatically via GitHub Actions on:
- Push to main/develop
- Pull requests

### View CI Results

1. Go to GitHub repository
2. Click "Actions" tab
3. Select workflow run
4. View test results
5. Download artifacts (screenshots, videos) if tests failed

## Test Coverage

Current test suite covers:

- ✅ Scenario loading and generation
- ✅ Unit selection and movement
- ✅ Bomb mechanics (Manufactorum Raid)
- ✅ Platform mechanics (The Conveyer)
- ✅ Fungal spread (Fungal Horror)
- ✅ Priority targets (Scrag)
- ✅ Visual effects (CRT, animations)
- ✅ Responsive design

### Coverage Report

To see detailed coverage:
```bash
deno run -A npm:playwright test --reporter=html
deno run -A npm:playwright show-report
```

## Performance

### Expected Times

- **Test suite**: ~30-60 seconds (headless)
- **Single test file**: ~5-10 seconds
- **Single test**: ~1-3 seconds

### Optimization

Speed up tests:
```bash
# Run specific test
deno run -A npm:playwright test -g "should load the page"

# Run single browser
deno run -A npm:playwright test --project=chromium

# Increase workers
deno run -A npm:playwright test --workers=4
```

## Best Practices

### Before Committing
```bash
# Run full test suite
deno task test:all

# Check formatting
deno fmt --check

# Check linting
deno lint
```

### During Development
```bash
# Use UI mode for test development
deno task test:e2e:ui

# Use headed mode to see what's happening
deno task test:e2e:headed
```

### When Tests Fail
1. Read error message carefully
2. Check screenshots in `test-results/`
3. Run in headed mode to see what's happening
4. Use debug mode to step through
5. Check server logs

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Deno Documentation](https://deno.land/manual)
- [PLAYWRIGHT_TESTING.md](PLAYWRIGHT_TESTING.md) - Detailed testing guide
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Command cheat sheet

## Need Help?

### Common Commands

```bash
# Install everything
deno task playwright:install

# Run tests
deno task test:e2e

# Debug tests
deno task test:e2e:ui

# Start dev server
deno task dev

# View test report
deno run -A npm:playwright show-report
```

### Getting Support

1. Check this guide
2. Check [PLAYWRIGHT_TESTING.md](PLAYWRIGHT_TESTING.md)
3. Check [Playwright docs](https://playwright.dev/)
4. Check GitHub Issues

---

🎲 **Happy Testing!** 🎲
