# PowerShell script to run Playwright tests
# This script helps run tests even if Deno is not in PATH

Write-Host "Necromunda Tactical Auspex - Test Runner" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if Deno is installed
$denoPath = Get-Command deno -ErrorAction SilentlyContinue

if (-not $denoPath) {
    Write-Host "ERROR: Deno is not installed or not in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Deno from: https://deno.land/manual/getting_started/installation" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Windows installation:" -ForegroundColor Cyan
    Write-Host "  irm https://deno.land/install.ps1 | iex" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "Deno found at: $($denoPath.Source)" -ForegroundColor Cyan
Write-Host ""

# Check if Playwright browsers are installed
Write-Host "Checking Playwright installation..." -ForegroundColor Yellow

$playwrightCheck = & deno run -A npm:playwright --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing Playwright..." -ForegroundColor Yellow
    & deno task playwright:install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install Playwright" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Playwright is ready!" -ForegroundColor Green
Write-Host ""

# Run tests
Write-Host "Running Playwright tests..." -ForegroundColor Yellow
Write-Host ""

$testMode = $args[0]

switch ($testMode) {
    "headed" {
        Write-Host "Running tests with visible browser..." -ForegroundColor Cyan
        & deno task test:e2e:headed
    }
    "ui" {
        Write-Host "Running tests with interactive UI..." -ForegroundColor Cyan
        & deno task test:e2e:ui
    }
    "debug" {
        Write-Host "Running tests in debug mode..." -ForegroundColor Cyan
        & deno run -A npm:playwright test --debug
    }
    default {
        Write-Host "Running tests in headless mode..." -ForegroundColor Cyan
        & deno task test:e2e
    }
}

$exitCode = $LASTEXITCODE

Write-Host ""
if ($exitCode -eq 0) {
    Write-Host "✓ All tests passed!" -ForegroundColor Green
} else {
    Write-Host "✗ Some tests failed (exit code: $exitCode)" -ForegroundColor Red
    Write-Host ""
    Write-Host "To view the test report, run:" -ForegroundColor Yellow
    Write-Host "  deno run -A npm:playwright show-report" -ForegroundColor White
}

Write-Host ""
exit $exitCode
