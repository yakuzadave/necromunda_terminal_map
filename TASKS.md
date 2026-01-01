# TASKS.md — NecroAuspexForgeAgent

> Authoritative task ledger. Read fully at the start of EVERY run. Rule: Only
> pick next batch from unchecked tasks [ ]. Add new work here first
> (ANTI-DRIFT).

---

## 0) Run Protocol

- [ ] Read TASKS.md fully and pick next batch only from unchecked tasks.
- [ ] Fill in “1) Current Batch” before changes.
- [ ] End of run: update TASKS.md + STATUS.md + CHANGELOG.md with verification
      notes.

---

## 1) Current Batch (fill BEFORE changes)
## 1) Current Batch (fill BEFORE changes)
### Batch ID: BATCH-004
**Batch Type** (pick one):
- [x] 1 feature + tests + docs
- [ ] 2–3 small improvements + tests
- [ ] refactor prerequisite + tests
- [ ] testing hardening (determinism, flake fixes)

**Exit Criteria**
- [x] Sector Mechanicus Map Generator implemented (`src/map-generator-sector-mechanicus.js`).
- [x] Map Type Selection UI added to `index.html`.
- [x] Integration with `app.js` generation logic.
- [x] Feature works end-to-end (Visual verified).
- [x] Tests updated/added (Generator logic verified).
- [x] `deno task test:all` passed.
- [x] CHANGELOG.md updated.
- [x] TASKS.md updated truthfully.

---

## 2) Baseline Hygiene

- [x] Add/confirm Deno lint/fmt tasks (if not present).
- [x] Add deterministic seed option for generation (if needed for tests).
- [x] Add scenario contract validator (runtime checks) + tests.
- [ ] Improve debug overlay (cell info, selection state, scenario phase).

---

## 3) Feature Backlog (examples—expand as needed)

- [x] Save/Load game state (serialize map + units + scenario state).
- [x] Line of Sight (cell-based) + UI toggle.
- [x] Sector Mechanicus map type (optional theme).
- [ ] Campaign tracking hooks (XP/rep/credits summary panel).
- [ ] Additional scenario(s) from Book of Peril (one at a time).

---

## 4) Testing Improvements

- [ ] Add Playwright “golden” tests for map symbols and UI controls.
- [ ] Reduce E2E flakiness (seeded generation; stable selectors).
- [ ] Add logic tests for end-phase mechanics (if test harness exists).

---

## 5) Documentation

- [ ] Update README “Adding New Scenarios” with safer guidelines.
- [ ] Create SCENARIO_AUTHORING_GUIDE.md.
- [ ] Create ARCHITECTURE.md (state model, flow, scenario contract).

---
