# Necromunda Tactical Auspex

A retro CRT-style tactical map system for Necromunda tabletop scenarios,
featuring Zone Mortalis procedural generation and multiple scenario types.

## Features

### Visual Effects

- Authentic CRT monitor simulation with scanlines and phosphor glow
- Retro green monochrome terminal aesthetic
- Dynamic box-drawing for walls and structures
- Animated hazards and objective markers

### Scenarios

#### 1. Bushwhack

Zone Mortalis ambush scenario focused on eliminating enemy leaders and
high-value targets.

- **Objective**: Take out enemy leaders
- **Defender Forces**: D3+2 units with reinforcements

#### 2. Scrag

Targeted assassination mission with a priority target.

- **Objective**: Eliminate nominated priority target
- **Defender Forces**: D3+2 units with reinforcements

#### 3. Mayhem

Cause maximum casualties and escape via deployment edge.

- **Objective**: Inflict serious injuries and extract
- **Defender Forces**: D3+2 units with reinforcements

#### 4. Manufactorum Raid ⭐

Plant explosives on rival House machinery. Based on _The Book of Peril, p80_.

- **Objective**: Plant and detonate 3 bombs
- **Defender Forces**: D3+5 units with D3 reinforcements per round (starting
  Round 2)
- **Special Rules**: Functioning Manufactorum (industrial terrain activates on
  3+)

**Bomb Mechanics:**

- **Plant Bomb (Double)**: Attackers place bombs at marked sites
- **Disarm Bomb (Double)**: Defenders attempt Intelligence check (4+) to disarm
  - Critical failure on doubles causes immediate detonation
- **Rearm Bomb (Double)**: Attackers can rearm disarmed bombs
- **Detonation**: Each end phase, roll D6 + bomb counter
  - 7+ = Explosion (Strength 6, D3 damage, 3-cell radius)
  - Otherwise, counter increases by 1

**Victory Conditions:**

- Attacker wins if all 3 bombs detonate
- Defender wins if bombs are prevented or attackers eliminated

**Rewards (Campaign):**

- Attacker: D3 Reputation (all bombs explode), 1 XP per fighter, +1 XP per bomb
  planted/rearmed
- Defender: 2D6x10 credits (victory), D6 or D3 Reputation (based on bombs
  exploded), 1 XP per fighter, +D3 XP per bomb disarmed

#### 5. The Conveyer ⭐

Descend through the hive on a moving platform. Based on _The Book of Peril,
p82_.

- **Objective (Attacker)**: Eliminate all defenders or survive 9 rounds
- **Objective (Defender)**: Hold the platform for 9 rounds, recover loot caskets
- **Crew Size**: 10 fighters each (Custom Selection)
- **Max Rounds**: 9

**Platform Mechanics:**

- **Central Platform**: 12-cell radius safe zone in center of map
- **Defenders deploy ON platform**, attackers deploy 16+ cells away
- **Platform Movement**: Each End phase, roll D6 + cumulative bonus (+1 per turn
  stationary)
  - 6+ = Platform descends to new level
  - Fighters not on platform when it moves are removed from board
  - Terrain regenerates around platform
  - Attackers redeploy around new platform
- **Loot Caskets**: 4 caskets (◆) placed around platform
  - Can be moved onto platform by either side
  - Caskets on platform when it descends are secured by defenders

**Victory Conditions:**

- Attacker wins if all defenders eliminated before Round 9
- Defender wins if they survive to Round 9

**Rewards (Campaign):**

- Attacker: D3 Reputation if game ends before round 9, 1 XP per fighter + 1 XP
  for being on platform when it moves
- Defender: D6x10 credits per loot casket on platform + D3 Reputation, 1 XP per
  fighter + 1 XP for being on platform at end

**Special Features:**

- Dynamic level changes as platform descends
- Risk/reward of staying off platform vs. securing loot
- Escalating platform movement chance each round

#### 6. Fungal Horror ⭐

Survive a rapidly spreading fungal jungle. Based on _The Book of Peril, p84_.

- **Objective**: Last gang standing wins
- **Crew Size**: 10 fighters each (Custom Selection)
- **Environment**: Rapidly growing carnivorous fungus

**Fungal Growth Mechanics:**

- **Initial Marker**: Central fungal horror marker with 6-cell radius overgrown
  area
- **Spreading**: Each End phase, roll D6 for each marker
  - 4+ = Fungus spreads in random direction (12 cells away)
  - New marker creates new overgrown zone
- **Game Ends**: When 9 markers placed or all fighters eliminated

**Overgrown Area Effects:**

- **Flesh-Eating Spores**: Treat as Blaze (catch fire effect)
  - Fighters in overgrown areas risk spore coating
- **Limited Vision**: Line of sight limited to 6" (3 cells) through overgrowth
- **Movement Restriction**: Only one Move action per activation (unless
  respirator equipped)
- **Serious Injuries**: Fighters Seriously Injured in overgrown areas go Out of
  Action immediately

**Victory Conditions:**

- Last gang with fighters on board wins
- If 9 markers placed: Gang with most fighters wins
- Both eliminated = Draw

**Rewards (Campaign):**

- Winner: D3 Reputation, 1 XP per fighter
- Bottle out: -1 Reputation

**Special Features:**

- Escalating threat - fungus spreads faster as game progresses
- Environmental hazard affects both sides equally
- Race against time before battlefield is overrun
- Strategic positioning to avoid overgrown zones

## How to Play

### Setup

1. Open `index.html` in a web browser
2. Select a scenario from the dropdown menu
3. Click "New Battle" to generate the battlefield

### Controls

- **Click units** to select them (highlighted with white blinking)
- **Click terrain** to move selected units
- **Hover cells** to view tactical information
- **Click bomb sites** (when adjacent unit selected) to interact

### Buttons

- **New Battle**: Generate fresh battlefield with selected scenario
- **End Round**: Advance to next round (processes bomb timers, reinforcements,
  victory checks)
- **Vis-Mode**: Toggle floor opacity for clearer tactical view

### Map Symbols

- `M` - Marauder (Attacker) - Red chip
- `G` - Garrison (Defender) - Cyan chip
- `╬` - Bulkhead/Structure - Green walls with smart connections
- `▒` - Debris/Rubble - Light cover
- `≈` - Chem-Pit/Hazard - Animated toxic spills
- `⊗` - Bomb Site (Not planted)
- `◉` - Armed Bomb
- `⊘` - Disarmed Bomb
- `✸` - Detonated Bomb
- `◆` - Loot Casket (The Conveyer)
- `▓` - Fungal Overgrowth (Fungal Horror)

## Project Structure

```
necromunda_terminal_map/
├── index.html       # Main HTML structure
├── styles.css       # CRT effects and styling
├── app.js          # TacticalMap class and game logic
├── scenarios.js    # Scenario definitions and rules
└── README.md       # This file
```

## Technical Details

### Map Generation

- Procedural Zone Mortalis generation using noise functions
- Cellular automata smoothing for natural corridors
- Smart wall connections using box-drawing characters
- Dynamic terrain density configuration

### Scenario System

Each scenario includes:

- Deployment rules for attackers and defenders
- Setup callbacks for objectives and markers
- End phase processing for timers and effects
- Victory condition checking
- Reward calculation (for campaign play)

### Adding New Scenarios

Edit `scenarios.js` and add a new scenario object with:

```javascript
scenarioName: {
    name: "Scenario Display Name",
    description: "Brief description",
    attacker: { deployment, count, objective },
    defender: { deployment, count, reinforcements },
    setup: (map) => { /* Initialize objectives */ },
    endPhase: (map) => { /* Process end-of-round effects */ },
    checkVictory: (map) => { /* Return victory status */ }
}
```

## Testing

This project includes comprehensive automated testing using Playwright for
end-to-end browser testing.

### Quick Start

Install Playwright browsers (first time only):

```bash
deno task playwright:install
```

Run all E2E tests:

```bash
deno task test:e2e
```

Run tests with visible browser:

```bash
deno task test:e2e:headed
```

Run tests with interactive UI:

```bash
deno task test:e2e:ui
```

Run all tests (unit + E2E):

```bash
deno task test:all
```

### Test Coverage

- ✅ **Scenario Loading**: All scenarios generate correctly
- ✅ **Unit Interactions**: Selection, movement, and hover info
- ✅ **Bomb Mechanics**: Plant, disarm, rearm, and detonation
- ✅ **Platform Movement**: Descent mechanics and unit tracking
- ✅ **Fungal Spread**: Growth patterns and overgrowth marking
- ✅ **Visual Effects**: CRT styling, animations, and responsive design
- ✅ **Cross-Browser**: Chrome, Firefox, Safari (desktop + mobile)

See [PLAYWRIGHT_TESTING.md](PLAYWRIGHT_TESTING.md) for complete testing
documentation.

### CI/CD

Tests run automatically on every push and pull request via GitHub Actions.
Results and artifacts (screenshots, videos) are uploaded on failure.

## Future Enhancements

Potential features to add:

- Save/load game states
- Full combat resolution system
- Fighter equipment and injuries
- Line of sight calculations
- Multiple battlefield types (Sector Mechanicus)
- Network multiplayer support
- Campaign progression tracking
- Additional scenarios from official books

## Credits

Based on the Necromunda tabletop game by Games Workshop. Scenarios adapted from
official rulebooks including _The Book of Peril_.

## License

Fan project for personal use. All Necromunda IP belongs to Games Workshop.
