# STATUS.md

## Current State
**Date:** 2026-01-01
**Agent:** NecroAuspexForgeAgent
**Phase:** Maintenance / Ready for Feature

### Recent Changes
- **Sector Mechanicus Map (BATCH-004) Complete:**
  - Implemented `src/map-generator-sector-mechanicus.js` ("Industrial Sprawl" style).
  - Added UI Selector (ZM / SM) in `index.html`.
  - Refactored `app.js` `generate()` to support strategy pattern-ish logic.
  - Verified with `tests/generator_sm_test.ts` + Visuals.

### Known Issues
- `deno task test` passes unit tests; E2E strictness still WIP.
- Verticality is purely visual (no falling rules... yet).

### Next Steps
- Select next batch from TASKS.md (e.g. Campaign Hooks or Book of Peril scenarios).
