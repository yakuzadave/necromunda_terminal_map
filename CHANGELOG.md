# CHANGELOG

## [Unreleased]
### [BATCH-004] Sector Mechanicus Map
- **Added:** `src/map-generator-sector-mechanicus.js`.
- **Added:** UI dropdown for selecting Map Type (Zone Mortalis / Sector Mechanicus).
- **Added:** CSS for `.terrain-pipe`, `.terrain-vat`, `.terrain-walkway`.

### [BATCH-003] Save/Load System
- **Added:** `src/state-manager.js` for LocalStorage persistence.
- **Added:** Serialization support in `app.js` and `rng.js`.
- **Added:** Save [F5] and Load [F9] buttons to UI.

### [BATCH-002] Visual Mechanics (Auspex)
- **Added:** Line of Sight system (`src/los.js`).
- **Added:** "Auspex" UI toggle for visualizing vision/shroud.
- **Added:** `.shrouded` and `.visible` CSS states.
- **Changed:** Debug overlay now reports visibility status.

### [BATCH-001] Baseline Hygiene & Stability
- **Added:** `src/rng.js` for seeded/deterministic random number generation.
- **Added:** `deno lint` and `deno fmt` configuration.
- **Added:** `tests/scenario_contract_test.ts` for preventing scenario regression.
- **Changed:** Replaced all `Math.random()` calls with `rng.random()`/`rng.pick()`.
- **Fixed:** Multiple lint error refactors in `app.js` and `scenarios.js`.
