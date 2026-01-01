# Agent Context & Instructions

## Project Overview

**Necromunda Tactical Auspex** - A retro CRT-style tactical map system for
Necromunda tabletop scenarios with procedural Zone Mortalis generation and
multiple scenario support.

## Current State (Updated: 2025-12-03)

### Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Pure CSS3 with custom CRT effects
- **No Dependencies**: No frameworks, libraries, or build tools
- **Browser-based**: Runs entirely client-side

### Architecture

#### Core Classes

1. **TacticalMap** (`app.js`)
   - Main game engine
   - Handles map generation, rendering, and game state
   - Properties: `width`, `height`, `mapData[]`, `bombs[]`, `currentScenario`,
     `round`
   - Key methods: `generate()`, `render()`, `deployUnits()`, `endRound()`,
     `detonateBomb()`

2. **SCENARIOS** (`scenarios.js`)
   - Object containing all scenario definitions
   - Each scenario has: `name`, `description`, `attacker`, `defender`,
     `setup()`, `endPhase()`, `checkVictory()`
   - Currently implemented: bushwhack, scrag, mayhem, manufactorumRaid

### File Structure

```
necromunda_terminal_map/
├── index.html          # UI structure, includes both JS files
├── styles.css          # All styling including CRT effects
├── app.js             # TacticalMap class and game logic
├── scenarios.js       # Scenario definitions
├── README.md          # User documentation
├── QUICKSTART.md      # Quick start guide
├── AGENTS.md          # This file - for AI agents
└── CLAUDE.md          # Claude-specific context (coming next)
```

### Data Structures

#### Map Cell Object

```javascript
{
    type: 'floor' | 'wall' | 'unit' | 'rubble' | 'hazard' | 'objective',
    char: 'display character',
    css: 'css-class-name',
    desc: 'Description text',
    // Optional properties:
    bombIndex: number,      // For objective cells
    priority: boolean       // For priority target units
}
```

#### Bomb Object

```javascript
{
    x: number,
    y: number,
    planted: boolean,
    armed: boolean,
    counter: number,
    exploded: boolean
}
```

#### Scenario Object Structure

```javascript
{
    name: string,
    description: string,
    source: string,
    attacker: {
        deployment: string,
        count: number | 'custom',
        objective: string
    },
    defender: {
        deployment: string,
        count: string (e.g., 'D3+5'),
        reinforcements: boolean,
        reinforcementRate?: string
    },
    bombs?: { /* bomb configuration */ },
    setup: (map) => void,           // Initialize scenario
    endPhase?: (map) => void,       // Process end-of-round
    checkVictory?: (map) => object, // Check win conditions
    actions?: { /* scenario-specific actions */ },
    rules?: { /* special rules */ },
    rewards?: { /* campaign rewards */ }
}
```

## Development Guidelines

### When Adding New Features

1. **New Scenarios**
   - Add to `scenarios.js` following existing structure
   - Update dropdown in `index.html`
   - Add legend entries if new symbols are introduced
   - Document in README.md

2. **New Terrain Types**
   - Add to `generate()` method's terrain generation loop
   - Create CSS class in `styles.css` with color and effects
   - Add to legend in `index.html`
   - Update `isValidSpawn()` if it affects unit placement

3. **New Game Mechanics**
   - Add methods to `TacticalMap` class
   - Keep methods small and focused
   - Use `this.log()` for user feedback
   - Call `this.render()` after state changes

4. **UI Changes**
   - Keep retro terminal aesthetic
   - Use phosphor green (`--phosphor-primary`) as primary color
   - Add hover states for interactive elements
   - Test with different screen sizes

### Code Style

#### JavaScript

```javascript
// Use descriptive names
getUnitsByType(char) { }  // Good
getUnits(c) { }           // Bad

// ES6+ features are fine
const units = this.getUnitsByType('M');
units.forEach(unit => { /* ... */ });

// Keep methods focused
// Good: One responsibility
detonateBomb(bombIndex) { }
checkVictoryConditions() { }

// Bad: Mixed responsibilities
detonateBombAndCheckVictory(bombIndex) { }
```

#### CSS

```css
/* Use CSS custom properties for theming */
:root {
  --phosphor-primary: #33ff00;
  --phosphor-dim: #1a8000;
}

/* Descriptive class names */
.unit-attacker {} /* Good */
.red {} /* Bad */

/* Keep animations subtle */
@keyframes pulse {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}
```

### Common Tasks

#### Adding a New Scenario Type

1. Define scenario object in `scenarios.js`
2. Implement `setup(map)` callback
3. Implement `endPhase(map)` if needed
4. Implement `checkVictory(map)` for win conditions
5. Add option to dropdown in `index.html`
6. Test with `mapSystem.generate('yourScenarioKey')`

#### Adding Interactive Objects

1. Place object in `mapData` during `setup()`
2. Handle click in `handleCellClick(x, y)`
3. Update `showInfo()` to display object details
4. Add interaction feedback via `this.log()`

#### Modifying Map Generation

1. Edit terrain generation loop in `generate()`
2. Adjust density constants in constructor
3. Test with multiple generations
4. Update `smoothMap()` if new terrain affects pathfinding

## Testing Checklist

When making changes, verify:

- [ ] Map generates without errors
- [ ] Units can be selected and moved
- [ ] Scenario-specific objectives appear
- [ ] End Round processes correctly
- [ ] Victory conditions trigger appropriately
- [ ] Visual feedback works (logs, animations)
- [ ] No console errors in browser dev tools
- [ ] Retro aesthetic is maintained

## Known Limitations

1. **No Server**: Everything is client-side, no persistence
2. **Simplified Combat**: Dice rolls are basic, no full combat resolution
3. **No Save/Load**: Game state is not persistent
4. **Single Player**: No multiplayer or networked play
5. **Fixed Map Size**: 50x25 grid is hardcoded

## Future Enhancement Ideas

### High Priority

- Save/load game states (localStorage)
- Full combat system with hit rolls and injuries
- Fighter equipment and loadouts
- Line of sight calculations

### Medium Priority

- Additional scenarios from official books
- Customizable map sizes
- Sound effects (optional, retro beeps)
- Campaign progression tracking

### Low Priority

- Sector Mechanicus terrain type
- Network multiplayer
- Mobile touch controls optimization
- Animated unit movement

## Troubleshooting

### Common Issues

**Map doesn't generate**

- Check browser console for errors
- Verify `scenarios.js` is loaded before `app.js`
- Ensure SCENARIOS object is defined

**Bombs don't work**

- Must be in Manufactorum Raid scenario
- Unit must be adjacent (distance ≤ 1.5)
- Check bomb state (planted, armed) in Cogitator Feed

**Victory conditions don't trigger**

- Call `mapSystem.endRound()` after each round
- Verify scenario has `checkVictory()` implemented
- Check console for victory condition logs

**Styling looks wrong**

- Clear browser cache
- Check CSS is loading (`styles.css`)
- Verify CSS custom properties are supported

## Contributing Guidelines

### Before Making Changes

1. Read this document completely
2. Review existing code structure
3. Test current functionality
4. Plan changes to minimize impact

### When Making Changes

1. Follow existing code style
2. Keep commits focused and small
3. Update documentation (README.md, this file)
4. Test thoroughly in browser
5. Check console for errors/warnings

### After Making Changes

1. Verify all scenarios still work
2. Update QUICKSTART.md if UI changed
3. Add to Future Enhancements if incomplete
4. Document any new limitations

## API Reference

### TacticalMap Methods

#### Core Methods

- `generate(scenarioKey)` - Generate new battlefield with scenario
- `render()` - Re-render the map display
- `endRound()` - Process end-of-round effects
- `deployUnits()` - Place attacker and defender units

#### Unit Management

- `getUnitsByType(char)` - Get all units of type ('M' or 'G')
- `placeEntity(x, y, char, css, desc)` - Place unit on map
- `moveUnit(fx, fy, tx, ty)` - Move unit from → to
- `isValidSpawn(x, y)` - Check if location can spawn unit

#### Bomb Mechanics (Manufactorum Raid)

- `detonateBomb(bombIndex)` - Explode bomb at index
- `checkVictoryConditions()` - Check and log victory status

#### UI & Feedback

- `log(text)` - Add message to Cogitator Feed (prepends)
- `updateLog(html)` - Replace Cogitator Feed content
- `showInfo(data, x, y)` - Display cell info on hover
- `toggleOverlay()` - Toggle visual mode

#### Utility

- `rand(min, max)` - Random integer between min and max (inclusive)
- `getWallChar(x, y)` - Calculate box-drawing character for wall
- `smoothMap()` - Apply cellular automata to open corridors
- `isSafeFromAttackers(x, y)` - Check if spawn location safe (10+ cells away)

### Global Functions (index.html)

- `startNewBattle()` - Read scenario dropdown and generate map
- `mapSystem` - Global TacticalMap instance (50x25)

## Version History

### v1.0 (2025-12-03)

- Initial modular structure (split HTML/CSS/JS)
- Scenario system with 4 scenarios
- Manufactorum Raid fully implemented
- Bomb mechanics (plant/disarm/rearm/detonate)
- Round-based gameplay with timers
- CRT visual effects and retro styling

## Contact & Resources

### Official Necromunda Resources

- Necromunda Rulebook
- The Book of Peril
- Games Workshop Official Site

### Development Resources

- MDN Web Docs (JavaScript/CSS reference)
- Box Drawing Characters: Unicode U+2500 to U+257F
- CSS Grid Layout Guide

---

**Note for AI Agents**: This project uses no build tools or package managers.
All code runs directly in the browser. When making suggestions, keep solutions
vanilla JS/CSS compatible.
