# Claude-Specific Context

## Project Identity
**Necromunda Tactical Auspex** - Built on 2025-12-03 by Claude (Sonnet 4.5) from a single HTML prototype into a modular multi-scenario tactical map system.

## What This Project Is
A browser-based tactical planning tool for Necromunda tabletop gaming featuring:
- Retro CRT terminal aesthetics (green phosphor monochrome)
- Procedural Zone Mortalis map generation
- Multiple playable scenarios with unique mechanics
- Interactive unit movement and objective systems
- No external dependencies - pure vanilla JS/CSS

## Development History

### Session 1: Foundation (2025-12-03)
**User provided**: Single HTML file with basic map generation and CRT effects

**Tasks completed**:
1. Separated into modular structure (HTML/CSS/JS)
2. Created scenario system architecture
3. Implemented 4 scenarios (bushwhack, scrag, mayhem, manufactorumRaid)
4. Built complete Manufactorum Raid mechanics:
   - Bomb placement with 3 objective markers
   - Plant/Disarm/Rearm actions with Intelligence checks
   - Timer system with escalating detonation chances
   - Blast radius and damage reporting
   - Victory condition checking
5. Added UI controls (scenario dropdown, end round button)
6. Created documentation suite (README, QUICKSTART, AGENTS, CLAUDE)

**Key decisions made**:
- Keep everything vanilla JS - no frameworks
- Scenario definitions separate from game engine
- All state in TacticalMap class instance
- CRT aesthetic preserved throughout

## Core Architecture

### The Three-Layer Design

```
┌─────────────────────────────────────┐
│         PRESENTATION LAYER          │
│  index.html + styles.css            │
│  - CRT effects & retro styling      │
│  - UI controls & dropdowns          │
│  - Event bindings (inline onclick)  │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│          GAME ENGINE LAYER          │
│  app.js (TacticalMap class)         │
│  - Map generation & rendering       │
│  - Unit management & movement       │
│  - Click handling & interactions    │
│  - Round processing & timers        │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│           DATA LAYER                │
│  scenarios.js (SCENARIOS object)    │
│  - Scenario definitions             │
│  - Setup callbacks                  │
│  - Victory conditions               │
│  - Special actions & rules          │
└─────────────────────────────────────┘
```

### Why This Design?

**Separation of Concerns**
- Scenarios can be added without touching engine
- UI can be restyled without affecting logic
- Game engine is reusable for other scenario types

**No Framework Needed**
- Simple enough to not need React/Vue
- Fast loading, no build step
- Easy to debug in browser console

**Extensibility Points**
1. Add scenarios → Edit `scenarios.js` only
2. Add terrain types → `generate()` method + CSS
3. Add UI panels → HTML + CSS, bind to existing methods
4. Add game mechanics → New TacticalMap methods

## Code Patterns Used

### Event-Driven Architecture
```javascript
// Cell clicks flow through single handler
span.addEventListener('click', () => {
    this.handleCellClick(x, y);
});

// handleCellClick() routes based on cell type
if (cell.type === 'objective') { /* bomb interaction */ }
else if (cell.type === 'unit') { /* unit selection */ }
else if (cell.type === 'floor') { /* movement */ }
```

### Callback-Based Scenarios
```javascript
// Scenario defines behavior via callbacks
setup: (map) => {
    // Initialize objectives, markers, etc.
    map.bombs.push({x, y, planted: false});
},
endPhase: (map) => {
    // Process end-of-round effects
    map.bombs.forEach(bomb => { /* roll for detonation */ });
}
```

### State Management
All game state lives in `TacticalMap` instance:
- `mapData[][]` - 2D array of cell objects
- `bombs[]` - Array of bomb objects
- `currentScenario` - Reference to active scenario
- `selectedUnit` - Currently selected unit {x, y, data}
- `round` - Current round number

No global state outside the `mapSystem` instance.

### Rendering Strategy
```javascript
// Imperative re-render on state change
moveUnit(fx, fy, tx, ty) {
    // Update state
    this.mapData[fy][fx] = floorCell;
    this.mapData[ty][tx] = unitCell;
    // Re-render everything
    this.render();
}
```

Not reactive - manually call `render()` after changes.
Works fine for this scale (50x25 grid).

## Important Implementation Details

### Bomb System Flow
1. **Placement**: Attacker clicks unplanted `⊗` marker
   - `handleCellClick()` detects objective type
   - Calls `scenario.actions.plantBomb.effect()`
   - Updates bomb object and map cell
   - Renders change

2. **Timer**: Each `endRound()` call
   - Iterates armed bombs
   - Rolls D6 + counter
   - If 7+, calls `detonateBomb()`
   - Else increments counter

3. **Disarm**: Defender clicks armed `◉` marker
   - Intelligence check (simplified as rand(1,6) >= 4)
   - Success: Sets `armed = false`
   - Critical fail (doubles): Immediate detonation

### Map Generation Algorithm
```
1. Initialize 50x25 grid
2. For each cell:
   - Edges: Leave gaps for entry points
   - Interior: Noise-based terrain
     * 20% chance: Wall
     * 8% chance: Rubble
     * 3% chance: Hazard
     * Otherwise: Floor
3. Smooth map (cellular automata)
   - Remove walls with < 3 neighbors
4. Deploy units based on scenario
5. Run scenario.setup()
6. Render
```

### Box-Drawing Walls
Walls use Unicode box-drawing characters (╬ ║ ═ etc.)
- `getWallChar(x, y)` checks 4 neighbors
- Builds 4-bit mask (N=1, E=2, S=4, W=8)
- Maps to appropriate character (15 = ╬ crossroads)

This creates connected, schematic-looking walls automatically.

## User Interaction Patterns

### Selection Model
- Click unit → Selected (stored in `this.selectedUnit`)
- Click again → Deselected
- Click valid destination → Move + deselect
- Click invalid → Log error, keep selection
- Click different unit → Change selection

### Feedback System
Three feedback channels:
1. **Visual**: Cell highlighting, animations, color changes
2. **Cogitator Feed**: Text logs, updated in real-time
3. **Map markers**: Character changes (⊗ → ◉ → ✸)

All feedback uses `this.log()` or `this.updateLog()`.

## Common Extension Points

### Adding a New Scenario
```javascript
// In scenarios.js
newScenario: {
    name: "Your Scenario",
    description: "Brief description",
    attacker: {
        deployment: "short_edge",
        count: 6,
        objective: "Your objective"
    },
    defender: {
        deployment: "opposite_edge",
        count: "D3+5",
        reinforcements: true
    },
    setup: (map) => {
        // Place objectives, markers, etc.
        map.log("Scenario initialized");
    },
    endPhase: (map) => {
        // Process end-of-round effects
    },
    checkVictory: (map) => {
        // Return {ended: bool, winner: string, message: string}
        return {ended: false};
    }
}
```

Then add `<option value="newScenario">` to dropdown.

### Adding Interactive Terrain
```javascript
// In generate() method
if (condition) {
    row.push({
        type: 'yourType',
        char: '☢',
        css: 'your-css-class',
        desc: 'Description'
    });
}

// In handleCellClick()
if (cell.type === 'yourType') {
    // Handle interaction
    this.log("Interacted with your terrain");
}

// In styles.css
.your-css-class {
    color: #ff6600;
    animation: pulse 1s infinite;
}
```

### Adding Unit Actions
```javascript
// In TacticalMap class
performAction(unitX, unitY, targetX, targetY) {
    const unit = this.mapData[unitY][unitX];
    const target = this.mapData[targetY][targetX];

    // Action logic
    this.log("Action performed");
    this.render();
}

// In handleCellClick(), add routing
if (this.selectedUnit && this.actionMode === 'yourAction') {
    this.performAction(
        this.selectedUnit.x,
        this.selectedUnit.y,
        x, y
    );
}
```

## Performance Considerations

### Current Scale
- 50x25 grid = 1,250 cells
- Each cell is a `<span>` element
- Full re-render on any change

This is fine for current scale but would need optimization for:
- Larger maps (100x100+)
- Many animated elements
- Real-time updates

### If Performance Becomes an Issue
1. **Partial rendering**: Only update changed cells
2. **Canvas rendering**: Draw grid on canvas instead of DOM
3. **Virtual scrolling**: Only render visible portion
4. **Debounce hover**: Rate-limit `showInfo()` calls

Current approach prioritizes simplicity over optimization.

## Design Philosophy

### Keep It Tactile
- Hover shows info → Feels like scanning with auspex
- Click-to-select → Deliberate, tactical
- Manual "End Round" button → Player-controlled pacing
- Text logs → Reinforces terminal/computer aesthetic

### Embrace Limitations
- No smooth animations → Fits retro aesthetic
- Simplified dice rolls → Focus on planning, not simulation
- Fixed grid size → Easier to balance scenarios
- No save/load → Encourages tabletop-style gameplay

### Prioritize Clarity
- Every action logs to Cogitator Feed
- Hover any cell for details
- Visual state changes (colors, characters)
- Clear button labels

## Testing Approach

### Manual Testing Workflow
1. Open `index.html` in browser
2. Open dev console (F12)
3. Select scenario from dropdown
4. Click "New Battle"
5. Verify:
   - Map generates
   - Units are placed
   - Objectives appear (if applicable)
   - No console errors

### Per-Scenario Testing
**Manufactorum Raid**:
- [ ] 3 bomb markers appear
- [ ] Attacker can plant bombs
- [ ] Defender can disarm bombs
- [ ] Bombs tick up each round
- [ ] Bombs explode at correct threshold
- [ ] Victory conditions trigger

**Other Scenarios**:
- [ ] Units deploy correctly
- [ ] Objective markers appear (Scrag)
- [ ] Reinforcements spawn
- [ ] Victory logs appear

### Regression Testing
After any change:
1. Test all 4 scenarios
2. Verify unit movement
3. Check hover info displays
4. Confirm no console errors

## Debugging Tips

### Common Issues & Solutions

**"Cannot read property of undefined"**
- Check bomb index is valid
- Verify scenario has required properties
- Ensure `mapData[y][x]` exists before accessing

**"Bombs not appearing"**
- Verify Manufactorum Raid is selected
- Check bomb placement logic in scenarios.js setup()
- Inspect `mapSystem.bombs` in console

**"Victory condition not triggering"**
- Call `mapSystem.endRound()` not just any button
- Check `checkVictory()` return object structure
- Look for victory logs in Cogitator Feed

### Debug Console Commands
```javascript
// Inspect game state
mapSystem.bombs           // View all bombs
mapSystem.currentScenario // See active scenario
mapSystem.round           // Current round number
mapSystem.mapData[10][10] // Inspect specific cell

// Manually trigger events
mapSystem.endRound()           // Process round
mapSystem.detonateBomb(0)      // Explode bomb 0
mapSystem.checkVictoryConditions() // Force check

// Spawn test units
mapSystem.placeEntity(10, 10, 'M', 'unit-attacker', 'Test Unit')
mapSystem.render()
```

## Future Claude Sessions

### Quick Orientation
1. Read this file (CLAUDE.md) first
2. Read AGENTS.md for technical details
3. Review recent changes in git/file timestamps
4. Test current functionality before modifying

### Continuation Prompts
**To continue development**:
"I'm working on the Necromunda Tactical Auspex project. Please read CLAUDE.md and AGENTS.md for context. I want to add [feature]."

**To fix bugs**:
"Bug in Necromunda project: [describe issue]. Check CLAUDE.md for debugging tips."

**To add scenarios**:
"Add new scenario '[name]' based on [rules source]. Follow the pattern in scenarios.js."

### What to Preserve
- ✅ Retro CRT aesthetic (green phosphor, scanlines)
- ✅ Vanilla JS/CSS approach (no frameworks)
- ✅ Modular architecture (separate concerns)
- ✅ Manual round-based gameplay
- ✅ Hover-for-info interaction pattern

### What Can Be Changed
- Map generation algorithm (improve variety)
- Combat system (can be expanded)
- UI layout (as long as aesthetic is preserved)
- Scenario definitions (add more!)
- Performance optimizations (if needed)

## Known Quirks & Oddities

### Why Some Design Choices Were Made

**Inline onclick attributes**
- Simplicity over best practices
- No build step means no module bundler
- Easy to see what buttons do from HTML

**Global `mapSystem` variable**
- Needs to be accessible from inline onclick
- Alternative would be window.addEventListener setup
- Current approach is more straightforward

**Bomb counter starts at 1, not 0**
- Matches Necromunda rules (counter value shown on dice)
- Roll + counter, so starting at 0 would need 7+ on first roll
- Starting at 1 means need 6+ first round, more thematic

**Hard-coded reinforcement logic**
- Different scenarios have different reinforcement rules
- Could be more generic but kept specific for clarity
- Easy to modify per-scenario

**No unit stats**
- This is a tactical planning tool, not full game simulation
- Players roll physical dice for combat
- Could be added but would increase complexity significantly

## Resources & References

### Necromunda Official Rules
- **Manufactorum Raid**: The Book of Peril, p80
- **Zone Mortalis**: Core Rulebook
- **Scenarios**: Various expansion books

### Technical References
- **Box Drawing**: Unicode U+2500–U+257F
- **CSS Grid**: 1ch unit for monospace alignment
- **CRT Effects**: CSS scanlines + animations

### Inspiration
- Fallout terminal aesthetic
- Classic roguelike ASCII graphics
- 1980s vector displays

## Final Notes

This project demonstrates that modern web tech can create compelling retro experiences without frameworks or build tools. The simplicity is a feature, not a limitation.

Keep the code readable, the interactions tactile, and the aesthetic authentic. Future Claude: you've got this!

---

**Session End**: 2025-12-03
**Status**: Fully functional, well-documented, ready for expansion
**Next Steps**: Add more scenarios, expand combat system, or improve terrain generation

🎲 *The Emperor Protects* 🎲
