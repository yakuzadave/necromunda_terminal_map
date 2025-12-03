/** @jsxImportSource https://esm.sh/react@18.2.0 */
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

/**
 * Necromunda Tactical Auspex - Val Town Edition
 * Complete single-file deployment
 */

// Inline HTML template with all code
const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Necromunda Tactical Auspex - The Marauders</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet">
    <style>
${getStyles()}
    </style>
</head>
<body>

<div class="crt-container">
    <div class="crt-overlay"></div>
    <div class="crt-glow"></div>
    <div class="scan-bar"></div>

    <header>
        <div>
            <h1>Sector 9-Z // The Marauders</h1>
            <div style="font-size: 0.8rem; opacity: 0.7;">Zone Mortalis Configuration</div>
        </div>
        <div class="meta-data">
            <div>DATE: 994.M41</div>
            <div>AUSPEX: ONLINE</div>
            <div>STATUS: INCURSION</div>
        </div>
    </header>

    <div class="main-display">
        <div class="map-frame">
            <div id="battle-map"></div>
        </div>

        <div class="sidebar">
            <div class="panel" style="flex: 0 0 auto;">
                <div class="panel-header">Mission Select</div>
                <select id="scenario-select" class="scenario-dropdown">
                    <option value="random">Random Ambush</option>
                    <option value="bushwhack">Bushwhack</option>
                    <option value="scrag">Scrag</option>
                    <option value="mayhem">Mayhem</option>
                    <option value="manufactorumRaid">Manufactorum Raid</option>
                </select>
            </div>

            <div class="panel" style="flex: 0 0 auto;">
                <div class="panel-header">Tactical Legend</div>
                <div class="legend-item"><span class="symbol unit-attacker">M</span> Marauder (Attacker)</div>
                <div class="legend-item"><span class="symbol unit-defender">G</span> Garrison (Defender)</div>
                <div class="legend-item"><span class="symbol terrain-wall">╬</span> Bulkhead Structure</div>
                <div class="legend-item"><span class="symbol terrain-rubble">▒</span> Debris (Light Cover)</div>
                <div class="legend-item"><span class="symbol terrain-hazard">≈</span> Chem-Pit (Hazard)</div>
                <div class="legend-item"><span class="symbol obj-marker">⊗</span> Objective Marker</div>
            </div>

            <div class="panel" id="info-panel">
                <div class="panel-header">Cogitator Feed</div>
                <div id="status-text" class="typing-cursor">System Ready.</div>
            </div>

            <div class="panel" id="controls">
                <button onclick="startNewBattle()">New Battle</button>
                <button onclick="mapSystem.endRound()">End Round</button>
                <button onclick="mapSystem.toggleOverlay()">Vis-Mode</button>
            </div>
        </div>
    </div>
</div>

<script>
${getScenarios()}
</script>
<script>
${getApp()}
</script>
<script>
    function startNewBattle() {
        const select = document.getElementById('scenario-select');
        const scenario = select.value === 'random' ? null : select.value;
        mapSystem.generate(scenario);
    }
</script>

</body>
</html>`;

function getStyles(): string {
  return `
:root {
    --phosphor-primary: #33ff00;
    --phosphor-dim: #1a8000;
    --phosphor-bright: #ccffcc;
    --bg-color: #050505;
    --scanline-color: rgba(0, 0, 0, 0.5);
    --glass-reflection: rgba(255, 255, 255, 0.02);
}

body {
    margin: 0;
    background-color: #000;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'VT323', monospace;
    color: var(--phosphor-primary);
    overflow: hidden;
}

.crt-container {
    position: relative;
    width: 95vw;
    height: 90vh;
    max-width: 1200px;
    background-color: var(--bg-color);
    border-radius: 20px;
    box-shadow: 0 0 20px rgba(51, 255, 0, 0.1), inset 0 0 100px rgba(0, 0, 0, 0.9);
    border: 2px solid #333;
    overflow: hidden;
    padding: 20px;
    display: flex;
    flex-direction: column;
}

.crt-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0) 50%, var(--scanline-color) 50%, var(--scanline-color));
    background-size: 100% 4px;
    pointer-events: none;
    z-index: 10;
    border-radius: 18px;
    animation: flicker 0.15s infinite;
}

.crt-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    box-shadow: inset 0 0 50px rgba(51, 255, 0, 0.1);
    pointer-events: none;
    z-index: 11;
    border-radius: 18px;
}

.scan-bar {
    width: 100%;
    height: 10px;
    background: rgba(51, 255, 0, 0.1);
    position: absolute;
    z-index: 12;
    top: -10px;
    animation: scan 8s linear infinite;
    pointer-events: none;
    opacity: 0.3;
}

header {
    border-bottom: 2px solid var(--phosphor-dim);
    padding-bottom: 10px;
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    text-shadow: 0 0 5px var(--phosphor-dim);
    z-index: 5;
}

h1 {
    margin: 0;
    font-size: 2rem;
    letter-spacing: 2px;
    text-transform: uppercase;
}

.meta-data {
    text-align: right;
    font-size: 1rem;
    color: var(--phosphor-dim);
}

.main-display {
    display: flex;
    flex: 1;
    gap: 20px;
    overflow: hidden;
    z-index: 5;
}

.map-frame {
    flex: 2;
    border: 1px solid var(--phosphor-dim);
    padding: 10px;
    position: relative;
    overflow: hidden;
    background: rgba(0, 20, 0, 0.4);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

#battle-map {
    display: grid;
    font-family: 'VT323', monospace;
    line-height: 1;
    white-space: pre;
    cursor: crosshair;
    user-select: none;
    font-size: 1.2rem;
}

.cell {
    display: inline-block;
    width: 1ch;
    text-align: center;
    transition: all 0.1s;
}

.cell:hover {
    background-color: var(--phosphor-primary);
    color: #000 !important;
    font-weight: bold;
    box-shadow: 0 0 10px var(--phosphor-primary);
    z-index: 2;
    position: relative;
}

.cell.selected {
    background-color: #fff !important;
    color: #000 !important;
    animation: blink-select 1s infinite;
    box-shadow: 0 0 15px #fff;
    z-index: 3;
    position: relative;
}

@keyframes blink-select {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
}

.sidebar {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 15px;
    min-width: 250px;
}

.panel {
    border: 1px solid var(--phosphor-dim);
    padding: 10px;
    background: rgba(0, 10, 0, 0.3);
}

.panel-header {
    background: var(--phosphor-dim);
    color: #000;
    padding: 2px 5px;
    font-weight: bold;
    margin: -10px -10px 10px -10px;
    text-transform: uppercase;
}

#info-panel {
    flex: 1;
    overflow-y: auto;
}

#controls {
    display: flex;
    gap: 10px;
}

button, select.scenario-dropdown {
    background: transparent;
    border: 1px solid var(--phosphor-primary);
    color: var(--phosphor-primary);
    font-family: 'VT323', monospace;
    font-size: 1.2rem;
    padding: 5px 15px;
    cursor: pointer;
    transition: all 0.2s;
    text-transform: uppercase;
}

select.scenario-dropdown {
    width: 100%;
    text-transform: none;
    background-color: rgba(0, 20, 0, 0.6);
}

select.scenario-dropdown option {
    background-color: #000;
    color: var(--phosphor-primary);
}

button:hover, select.scenario-dropdown:hover {
    background: var(--phosphor-primary);
    color: #000;
    box-shadow: 0 0 10px var(--phosphor-dim);
}

.legend-item {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    font-size: 0.9rem;
}

.symbol {
    width: 20px;
    text-align: center;
    margin-right: 10px;
    font-weight: bold;
    display: inline-block;
}

.terrain-wall { color: #2ecc71; text-shadow: 0 0 2px #2ecc71; }
.terrain-floor { color: #0a3300; opacity: 0.5; }
.terrain-rubble { color: #889900; }
.terrain-hazard { color: #adff2f; animation: wave 2s infinite linear; font-weight: bold; }

.unit-attacker {
    background-color: #ff3333;
    color: #000;
    font-weight: bold;
    border-radius: 2px;
    box-shadow: 0 0 5px #ff3333;
    cursor: pointer;
}

.unit-defender {
    background-color: #00ffff;
    color: #000;
    font-weight: bold;
    border-radius: 2px;
    box-shadow: 0 0 5px #00ffff;
    cursor: pointer;
}

.obj-marker { color: #ffffff; animation: pulse 1s infinite; }

@keyframes flicker {
    0% { opacity: 0.95; }
    5% { opacity: 0.85; }
    10% { opacity: 0.95; }
    100% { opacity: 0.95; }
}

@keyframes scan {
    0% { top: -10%; }
    100% { top: 110%; }
}

@keyframes pulse {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
}

@keyframes wave {
    0% { opacity: 0.6; }
    50% { opacity: 1; text-shadow: 0 0 8px #adff2f; }
    100% { opacity: 0.6; }
}

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #000; }
::-webkit-scrollbar-thumb { background: var(--phosphor-dim); }
::-webkit-scrollbar-thumb:hover { background: var(--phosphor-primary); }

.typing-cursor::after {
    content: '█';
    animation: blink 1s step-end infinite;
}
@keyframes blink { 50% { opacity: 0; } }
`;
}

function getScenarios(): string {
  return `
// Inline scenarios for Val Town deployment
const SCENARIOS = ${JSON.stringify({
    bushwhack: {
      name: "Bushwhack",
      description: "Target Enemy Leaders/Champions",
      attacker: { count: 6 },
      defender: { count: "D3+2", reinforcements: true }
    },
    scrag: {
      name: "Scrag",
      description: "Target nominated fighter (Priority Target)",
      attacker: { count: 6 },
      defender: { count: "D3+2", reinforcements: true }
    },
    mayhem: {
      name: "Mayhem",
      description: "Serious Injuries & Escape via short edge",
      attacker: { count: 6 },
      defender: { count: "D3+2", reinforcements: true }
    },
    manufactorumRaid: {
      name: "Manufactorum Raid",
      description: "Plant bombs on vital machinery",
      attacker: { count: "custom" },
      defender: { count: "D3+5", reinforcements: true },
      rules: { reinforcementStart: 2 }
    }
  }, null, 2)};

// Setup functions embedded
SCENARIOS.bushwhack.setup = (map) => {
    map.log("OBJECTIVE: BUSHWHACK<br>Eliminate enemy leaders and high-value targets.");
};

SCENARIOS.scrag.setup = (map) => {
    map.log("OBJECTIVE: SCRAG<br>Eliminate the priority target marked with [!]");
    const defenders = map.getUnitsByType('G');
    if (defenders.length > 0) {
        const target = defenders[Math.floor(Math.random() * defenders.length)];
        target.priority = true;
        target.desc = "Priority Target [!]";
    }
};

SCENARIOS.mayhem.setup = (map) => {
    map.log("OBJECTIVE: MAYHEM<br>Inflict maximum casualties and escape via deployment edge.");
};

SCENARIOS.manufactorumRaid.setup = (map) => {
    map.log("SCENARIO: MANUFACTORUM RAID<br>Plant explosives on critical machinery!");
    map.bombs = [];
    let placedBombs = 0, attempts = 0;

    while (placedBombs < 3 && attempts < 100) {
        attempts++;
        const x = map.rand(5, map.width - 5);
        const y = map.rand(5, Math.floor(map.height / 2));
        const distFromAttacker = Math.abs(y - (map.height - 4));

        let validPlacement = distFromAttacker >= 8;
        for (const bomb of map.bombs) {
            const dist = Math.sqrt(Math.pow(x - bomb.x, 2) + Math.pow(y - bomb.y, 2));
            if (dist < 12) { validPlacement = false; break; }
        }

        if (validPlacement && map.isValidSpawn(x, y)) {
            map.bombs.push({ x, y, planted: false, armed: false, counter: 0, exploded: false });
            map.mapData[y][x] = {
                type: 'objective', char: '⊗', css: 'obj-marker',
                desc: 'Bomb Site [Not Planted]', bombIndex: placedBombs
            };
            placedBombs++;
        }
    }
    map.log(placedBombs + " bomb sites identified and marked.");
};

SCENARIOS.manufactorumRaid.actions = {
    plantBomb: {
        effect: (map, unit, bombIndex) => {
            const bomb = map.bombs[bombIndex];
            if (!bomb.planted) {
                bomb.planted = true; bomb.armed = true; bomb.counter = 1;
                map.log("Bomb planted at site " + (bombIndex + 1) + "! Timer: " + bomb.counter);
                const marker = map.mapData[bomb.y][bomb.x];
                marker.char = '◉';
                marker.desc = "Bomb [ARMED] Counter: " + bomb.counter;
                return true;
            }
            return false;
        }
    },
    disarmBomb: {
        effect: (map, unit, bombIndex) => {
            const bomb = map.bombs[bombIndex];
            if (bomb.planted && bomb.armed) {
                const roll = map.rand(1, 6), doubleCheck = map.rand(1, 6);
                if (roll >= 4) {
                    bomb.armed = false;
                    map.log("Bomb " + (bombIndex + 1) + " DISARMED by defender!");
                    map.mapData[bomb.y][bomb.x].char = '⊘';
                    map.mapData[bomb.y][bomb.x].desc = "Bomb [DISARMED]";
                    return true;
                } else {
                    map.log("Disarm attempt failed (rolled " + roll + ")");
                    if (roll === doubleCheck) {
                        map.log("CRITICAL FAILURE! Bomb detonates!");
                        map.detonateBomb(bombIndex);
                    }
                }
            }
            return false;
        }
    },
    rearmBomb: {
        effect: (map, unit, bombIndex) => {
            const bomb = map.bombs[bombIndex];
            if (bomb.planted && !bomb.armed) {
                bomb.armed = true; bomb.counter = 1;
                map.log("Bomb " + (bombIndex + 1) + " REARMED!");
                map.mapData[bomb.y][bomb.x].char = '◉';
                map.mapData[bomb.y][bomb.x].desc = "Bomb [ARMED] Counter: " + bomb.counter;
                return true;
            }
            return false;
        }
    }
};

SCENARIOS.manufactorumRaid.endPhase = (map) => {
    map.bombs.forEach((bomb, index) => {
        if (bomb.armed && !bomb.exploded) {
            const roll = map.rand(1, 6), total = roll + bomb.counter;
            map.log("Bomb " + (index + 1) + ": Rolled " + roll + " + " + bomb.counter + " = " + total);
            if (total >= 7) {
                map.detonateBomb(index);
            } else {
                bomb.counter++;
                map.mapData[bomb.y][bomb.x].desc = "Bomb [ARMED] Counter: " + bomb.counter;
                map.log("Bomb " + (index + 1) + " counter increased to " + bomb.counter);
            }
        }
    });
};

SCENARIOS.manufactorumRaid.checkVictory = (map) => {
    const exploded = map.bombs.filter(b => b.exploded).length;
    if (exploded === map.bombs.length) {
        return { ended: true, winner: "attacker", message: "ALL BOMBS DETONATED! Attacker Victory!" };
    }
    const attackers = map.getUnitsByType('M'), defenders = map.getUnitsByType('G');
    if (attackers.length === 0) {
        return { ended: true, winner: "defender", message: "Attackers eliminated! Defender Victory!" };
    }
    return { ended: false };
};
`;
}

function getApp(): string {
  // Read the original app.js and return it
  // For Val Town, we'll inline a simplified version
  return `
class TacticalMap {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.mapData = [];
        this.container = document.getElementById('battle-map');
        this.statusDisplay = document.getElementById('status-text');
        this.entities = [];
        this.visMode = false;
        this.selectedUnit = null;
        this.terrainDensity = 0.2;
        this.rubbleDensity = 0.08;
        this.hazardDensity = 0.03;
        this.currentScenario = null;
        this.bombs = [];
        this.round = 0;
        this.defenderReinforcements = true;
    }

    rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    generate(scenarioKey = null) {
        this.mapData = [];
        this.entities = [];
        this.selectedUnit = null;
        this.bombs = [];
        this.round = 0;
        this.container.innerHTML = '';

        if (scenarioKey && SCENARIOS[scenarioKey]) {
            this.currentScenario = SCENARIOS[scenarioKey];
        } else {
            const ambushScenarios = ['bushwhack', 'scrag', 'mayhem'];
            scenarioKey = ambushScenarios[this.rand(0, ambushScenarios.length - 1)];
            this.currentScenario = SCENARIOS[scenarioKey];
        }

        this.log('<br>=== ' + this.currentScenario.name.toUpperCase() + ' ===<br>' + this.currentScenario.description);

        for (let y = 0; y < this.height; y++) {
            let row = [];
            for (let x = 0; x < this.width; x++) {
                if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
                    if ((x === 0 || x === this.width - 1) && y > 10 && y < 15) {
                        row.push({ type: 'floor', char: '·', css: 'terrain-floor', desc: 'Access Point' });
                    } else if ((y === 0 || y === this.height - 1) && x > 20 && x < 30) {
                        row.push({ type: 'floor', char: '·', css: 'terrain-floor', desc: 'Access Point' });
                    } else {
                        row.push({ type: 'floor', char: '·', css: 'terrain-floor', desc: 'Sector Perimeter' });
                    }
                } else {
                    const noise = Math.random();
                    if (noise < this.terrainDensity) {
                        row.push({ type: 'wall', char: '#', css: 'terrain-wall', desc: x % 4 === 0 || y % 4 === 0 ? 'Structural Column' : 'Bulkhead' });
                    } else if (noise < this.terrainDensity + this.rubbleDensity) {
                        row.push({ type: 'rubble', char: '▒', css: 'terrain-rubble', desc: 'Industrial Detritus' });
                    } else if (noise < this.terrainDensity + this.rubbleDensity + this.hazardDensity) {
                        row.push({ type: 'hazard', char: '≈', css: 'terrain-hazard', desc: 'Sump Spill' });
                    } else {
                        row.push({ type: 'floor', char: '·', css: 'terrain-floor', desc: 'Metal Grating' });
                    }
                }
            }
            this.mapData.push(row);
        }

        this.smoothMap();
        this.deployUnits();
        if (this.currentScenario.setup) this.currentScenario.setup(this);
        this.render();
    }

    deployUnits() {
        const attackerCount = 6;
        let placedAttackers = 0, attempts = 0;
        while (placedAttackers < attackerCount && attempts < 100) {
            attempts++;
            let ax = this.rand(2, this.width - 3);
            let ay = this.rand(this.height - 6, this.height - 2);
            if (this.isValidSpawn(ax, ay)) {
                this.placeEntity(ax, ay, 'M', 'unit-attacker', 'Marauder (Attacker)');
                placedAttackers++;
            }
        }

        const defenderRoll = this.rand(1, 3);
        const defenderCount = this.currentScenario.defender.count === 'D3+5' ? defenderRoll + 5 : defenderRoll + 2;
        this.log('DEFENDER STRENGTH: ' + defenderCount + ' detected.');

        let placedDefenders = 0;
        attempts = 0;
        while (placedDefenders < defenderCount && attempts < 100) {
            attempts++;
            let dx = this.rand(2, this.width - 3);
            let dy = this.rand(2, Math.floor(this.height / 2));
            if (this.isValidSpawn(dx, dy)) {
                this.placeEntity(dx, dy, 'G', 'unit-defender', 'Garrison Sentry (Defender)');
                placedDefenders++;
            }
        }
    }

    smoothMap() {
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                let walls = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (this.mapData[y+dy][x+dx].type === 'wall') walls++;
                    }
                }
                if (this.mapData[y][x].type === 'wall' && walls < 3) {
                    this.mapData[y][x] = { type: 'floor', char: '·', css: 'terrain-floor', desc: 'Corridor' };
                }
            }
        }
    }

    spawnReinforcements() {
        const count = this.rand(1, 3);
        let spawned = 0, attempts = 0;
        this.log('REINFORCEMENTS REQUESTED. INCOMING: ' + count);

        while (spawned < count && attempts < 50) {
            attempts++;
            let rx, ry;
            if (Math.random() > 0.5) {
                ry = Math.random() > 0.5 ? 1 : this.height - 2;
                rx = this.rand(1, this.width - 2);
            } else {
                rx = Math.random() > 0.5 ? 1 : this.width - 2;
                ry = this.rand(1, this.height - 2);
            }

            if (this.isValidSpawn(rx, ry) && this.isSafeFromAttackers(rx, ry)) {
                this.placeEntity(rx, ry, 'G', 'unit-defender', 'Reinforcement Unit');
                spawned++;
            }
        }

        if (spawned > 0) {
            this.render();
            this.updateLog('Success: ' + spawned + ' units entered the sector.');
        } else {
            this.updateLog("WARNING: Entry points blocked or unsafe.");
        }
    }

    isSafeFromAttackers(x, y) {
        const safeDist = 10;
        for (let dy = 0; dy < this.height; dy++) {
            for (let dx = 0; dx < this.width; dx++) {
                const cell = this.mapData[dy][dx];
                if (cell.type === 'unit' && cell.char === 'M') {
                    const dist = Math.sqrt(Math.pow(x - dx, 2) + Math.pow(y - dy, 2));
                    if (dist < safeDist) return false;
                }
            }
        }
        return true;
    }

    isValidSpawn(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        const cell = this.mapData[y][x];
        return cell.type !== 'wall' && cell.type !== 'unit' && cell.type !== 'hazard' && cell.type !== 'objective';
    }

    placeEntity(x, y, char, css, desc) {
        this.mapData[y][x] = { type: 'unit', char: char, css: css, desc: desc };
    }

    getUnitsByType(char) {
        const units = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.mapData[y][x];
                if (cell.type === 'unit' && cell.char === char) {
                    units.push({ x, y, ...cell });
                }
            }
        }
        return units;
    }

    detonateBomb(bombIndex) {
        const bomb = this.bombs[bombIndex];
        if (bomb.exploded) return;

        bomb.exploded = true;
        this.log('<span style="color: #ff3333; font-weight: bold;">*** DETONATION! BOMB ' + (bombIndex + 1) + ' ***</span>');

        const marker = this.mapData[bomb.y][bomb.x];
        marker.char = '✸';
        marker.css = 'terrain-hazard';
        marker.desc = 'DETONATED';

        const blastRadius = 3;
        for (let dy = -blastRadius; dy <= blastRadius; dy++) {
            for (let dx = -blastRadius; dx <= blastRadius; dx++) {
                const tx = bomb.x + dx, ty = bomb.y + dy;
                if (tx >= 0 && tx < this.width && ty >= 0 && ty < this.height) {
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist <= blastRadius) {
                        const cell = this.mapData[ty][tx];
                        if (cell.type === 'unit') {
                            this.log('Unit at [' + tx + ',' + ty + '] caught in blast! (Str 6, D3 damage)');
                        }
                    }
                }
            }
        }

        this.render();
        this.checkVictoryConditions();
    }

    endRound() {
        this.round++;
        this.log('<br>--- END OF ROUND ' + this.round + ' ---');

        if (this.currentScenario && this.currentScenario.endPhase) {
            this.currentScenario.endPhase(this);
        }

        if (this.currentScenario && this.currentScenario.defender.reinforcements) {
            const rules = this.currentScenario.rules;
            if (rules && this.round >= rules.reinforcementStart) {
                this.spawnReinforcements();
            }
        }

        this.checkVictoryConditions();
    }

    checkVictoryConditions() {
        if (!this.currentScenario || !this.currentScenario.checkVictory) return;

        const result = this.currentScenario.checkVictory(this);
        if (result.ended) {
            this.log('<br><span style="color: #33ff00; font-weight: bold;">' + result.message + '</span>');
        }
    }

    getWallChar(x, y) {
        let mask = 0;
        const isWall = (tx, ty) => {
            if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) return false;
            return this.mapData[ty][tx].type === 'wall';
        };

        if (isWall(x, y - 1)) mask |= 1;
        if (isWall(x + 1, y)) mask |= 2;
        if (isWall(x, y + 1)) mask |= 4;
        if (isWall(x - 1, y)) mask |= 8;

        const chars = {
            0: '●', 1: '║', 2: '═', 3: '╚', 4: '║',
            5: '║', 6: '╔', 7: '╠', 8: '═',
            9: '╝', 10: '═', 11: '╩', 12: '┐',
            13: '┤', 14: '┬', 15: '╬'
        };
        return chars[mask] || '#';
    }

    render() {
        this.container.style.gridTemplateColumns = 'repeat(' + this.width + ', 1ch)';
        this.container.innerHTML = '';

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let cellData = this.mapData[y][x];
                let displayChar = cellData.char;

                if (cellData.type === 'wall') {
                    displayChar = this.getWallChar(x, y);
                }

                const span = document.createElement('span');
                span.textContent = displayChar;
                span.className = 'cell ' + cellData.css;
                span.dataset.x = x;
                span.dataset.y = y;

                if (this.selectedUnit && this.selectedUnit.x === x && this.selectedUnit.y === y) {
                    span.classList.add('selected');
                }

                span.addEventListener('mouseenter', () => {
                    this.showInfo(cellData, x, y);
                });

                span.addEventListener('click', () => {
                    this.handleCellClick(x, y);
                });

                this.container.appendChild(span);
            }
        }
    }

    handleCellClick(x, y) {
        const cell = this.mapData[y][x];

        if (cell.type === 'objective' && typeof cell.bombIndex !== 'undefined') {
            if (this.selectedUnit) {
                const unit = this.selectedUnit.data;
                const bomb = this.bombs[cell.bombIndex];
                const dist = Math.sqrt(Math.pow(x - this.selectedUnit.x, 2) + Math.pow(y - this.selectedUnit.y, 2));

                if (dist <= 1.5) {
                    if (unit.char === 'M' && !bomb.planted) {
                        this.currentScenario.actions.plantBomb.effect(this, unit, cell.bombIndex);
                        this.render();
                    } else if (unit.char === 'M' && bomb.planted && !bomb.armed) {
                        this.currentScenario.actions.rearmBomb.effect(this, unit, cell.bombIndex);
                        this.render();
                    } else if (unit.char === 'G' && bomb.planted && bomb.armed) {
                        this.currentScenario.actions.disarmBomb.effect(this, unit, cell.bombIndex);
                        this.render();
                    } else {
                        this.log("Cannot interact with this bomb.");
                    }
                } else {
                    this.log("Unit must be adjacent to interact with bomb.");
                }
            }
            return;
        }

        if (this.selectedUnit) {
            if (this.selectedUnit.x === x && this.selectedUnit.y === y) {
                this.selectedUnit = null;
                this.log("Unit deselected.");
                this.render();
                return;
            }

            if (cell.type === 'floor' || cell.type === 'rubble') {
                this.moveUnit(this.selectedUnit.x, this.selectedUnit.y, x, y);
                this.selectedUnit = null;
                this.render();
                return;
            }

            if (cell.type === 'wall' || cell.type === 'unit' || cell.type === 'hazard') {
                if (cell.type === 'unit') {
                    this.selectedUnit = { x, y, data: cell };
                    this.log('Selection updated to [' + x + ',' + y + '].');
                    this.render();
                } else {
                    this.log("Movement blocked.");
                }
                return;
            }
        } else {
            if (cell.type === 'unit') {
                this.selectedUnit = { x, y, data: cell };
                this.log('Unit selected at [' + x + ',' + y + '].');
                this.render();
            }
        }
    }

    moveUnit(fx, fy, tx, ty) {
        const unit = this.mapData[fy][fx];
        this.mapData[fy][fx] = { type: 'floor', char: '·', css: 'terrain-floor', desc: 'Open Ground' };
        this.mapData[ty][tx] = unit;
        this.log('Moving to coordinate [' + tx + ',' + ty + '].');
    }

    showInfo(data, x, y) {
        let info = 'GRID [' + x + ',' + y + ']<br>';
        info += 'TYPE: ' + data.desc + '<br>';

        if (data.type === 'unit') {
            const status = this.selectedUnit && this.selectedUnit.x === x && this.selectedUnit.y === y ? "ACTIVE" : "IDLE";
            info += 'STATUS: ' + status + '<br>';
            info += 'LOADOUT: ' + this.getRandomWeapon(data.char);
        } else if (data.type === 'hazard') {
            info += 'DANGER LEVEL: CRITICAL<br>';
        } else if (data.type === 'wall') {
            info += 'MATERIAL: PLASTEEL<br>';
        } else if (data.type === 'objective' && typeof data.bombIndex !== 'undefined') {
            const bomb = this.bombs[data.bombIndex];
            if (bomb.exploded) {
                info += 'STATUS: DETONATED<br>';
            } else if (bomb.planted && bomb.armed) {
                info += 'STATUS: ARMED<br>COUNTER: ' + bomb.counter + '<br>';
                info += 'DETONATION: ' + (7 - bomb.counter) + '+ to explode<br>';
            } else if (bomb.planted && !bomb.armed) {
                info += 'STATUS: DISARMED<br>';
            } else {
                info += 'STATUS: Not planted<br>';
                info += 'ACTION: Attacker can plant (Double)';
            }
        }

        this.updateLog(info);
    }

    getRandomWeapon(char) {
        const weapons = ["Bolter", "Lasgun", "Power Sword", "Stub Gun", "Chainsword", "Shotgun"];
        return weapons[Math.floor(Math.random() * weapons.length)];
    }

    updateLog(html) {
        this.statusDisplay.innerHTML = html;
        this.statusDisplay.classList.remove('typing-cursor');
        void this.statusDisplay.offsetWidth;
        this.statusDisplay.classList.add('typing-cursor');
    }

    log(text) {
        const current = this.statusDisplay.innerHTML;
        this.statusDisplay.innerHTML = text + "<br><br>" + current;
    }

    toggleOverlay() {
        this.visMode = !this.visMode;
        const els = document.querySelectorAll('.terrain-floor');
        els.forEach(el => {
            el.style.opacity = this.visMode ? '0.1' : '0.5';
        });
        this.log(this.visMode ? "Visual Mode: TACTICAL" : "Visual Mode: STANDARD");
    }
}

const mapSystem = new TacticalMap(50, 25);

window.onload = () => {
    setTimeout(() => {
        mapSystem.generate();
    }, 1000);
};
`;
}

export default async function handler(req: Request): Promise<Response> {
  return new Response(HTML_TEMPLATE, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
