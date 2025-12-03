import { SCENARIOS } from './scenarios.js';

export class TacticalMap {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.mapData = [];
        this.container = document.getElementById('battle-map');
        console.log("TacticalMap constructor: container is", this.container);
        this.statusDisplay = document.getElementById('status-text');
        this.entities = [];
        this.visMode = false;
        this.selectedUnit = null;

        // Configuration
        this.terrainDensity = 0.2;
        this.rubbleDensity = 0.08;
        this.hazardDensity = 0.03;

        // Scenario system
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

        // Load scenario
        if (scenarioKey && SCENARIOS[scenarioKey]) {
            this.currentScenario = SCENARIOS[scenarioKey];
        } else {
            // Default to random ambush scenario
            const ambushScenarios = ['bushwhack', 'scrag', 'mayhem'];
            scenarioKey = ambushScenarios[this.rand(0, ambushScenarios.length - 1)];
            this.currentScenario = SCENARIOS[scenarioKey];
        }

        this.log(`<br>=== ${this.currentScenario.name.toUpperCase()} ===<br>${this.currentScenario.description}`);

        // 1. Initialize & Generate Zone Mortalis Terrain
        for (let y = 0; y < this.height; y++) {
            let row = [];
            for (let x = 0; x < this.width; x++) {
                // Outer Walls
                if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
                    // Leave gaps for entry points
                    if ((x === 0 || x === this.width - 1) && y > 10 && y < 15) {
                        row.push({ type: 'floor', char: '·', css: 'terrain-floor', desc: 'Access Point' });
                    } else if ((y === 0 || y === this.height - 1) && x > 20 && x < 30) {
                        row.push({ type: 'floor', char: '·', css: 'terrain-floor', desc: 'Access Point' });
                    } else {
                        // Edge is just floor marker for now, we dont want box walls surrounding everything
                        row.push({ type: 'floor', char: '·', css: 'terrain-floor', desc: 'Sector Perimeter' });
                    }
                } else {
                    // Procedural Noise for Zone Mortalis
                    const noise = Math.random();
                    if (noise < this.terrainDensity) {
                        // Create blocks rather than noise
                        if (x % 4 === 0 || y % 4 === 0) {
                            row.push({ type: 'wall', char: '#', css: 'terrain-wall', desc: 'Structural Column' });
                        } else {
                            row.push({ type: 'wall', char: '#', css: 'terrain-wall', desc: 'Bulkhead' });
                        }
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

        // Cleanup: Cellular Automata to open paths
        this.smoothMap();

        // 2. Deploy Units based on scenario
        this.deployUnits();

        // 3. Run scenario-specific setup
        if (this.currentScenario.setup) {
            this.currentScenario.setup(this);
        }

        this.render();
    }

    deployUnits() {
        // Special deployment for The Conveyer
        if (this.currentScenario.name === "The Conveyer") {
            this.deployConveyerUnits();
            return;
        }

        // Deploy Attackers
        const attackerCount = this.currentScenario.attacker.count === 'custom' ? 6 : (this.currentScenario.attacker.count || 6);
        let placedAttackers = 0;
        let attempts = 0;
        while (placedAttackers < attackerCount && attempts < 100) {
            attempts++;
            let ax = this.rand(2, this.width - 3);
            let ay = this.rand(this.height - 6, this.height - 2);
            if (this.isValidSpawn(ax, ay)) {
                this.placeEntity(ax, ay, 'M', 'unit-attacker', 'Marauder (Attacker)');
                placedAttackers++;
            }
        }

        // Deploy Defenders
        const defenderRoll = this.rand(1, 3);
        const defenderCount = this.currentScenario.defender.count === 'D3+5' ? defenderRoll + 5 : (this.currentScenario.defender.count || defenderRoll + 2);
        this.log(`DEFENDER STRENGTH: ${defenderCount} detected.`);

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

    deployConveyerUnits() {
        // Deploy defenders ON the platform
        const defenderCount = 10;
        let placedDefenders = 0;
        let attempts = 0;

        const cx = this.platform.centerX;
        const cy = this.platform.centerY;
        const r = this.platform.radius;

        while (placedDefenders < defenderCount && attempts < 200) {
            attempts++;

            // Random position within platform radius
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * r;

            const x = Math.round(cx + Math.cos(angle) * distance);
            const y = Math.round(cy + Math.sin(angle) * distance);

            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                const cell = this.mapData[y][x];
                if (cell.onPlatform && (cell.type === 'floor' || cell.type === 'rubble')) {
                    const defender = { type: 'unit', char: 'G', css: 'unit-defender', desc: 'Garrison (Defender)', onPlatform: true };
                    this.mapData[y][x] = defender;
                    placedDefenders++;
                }
            }
        }

        this.log(`DEFENDERS: ${placedDefenders} deployed on platform.`);

        // Deploy attackers around the platform (16" away = ~16 cells)
        const attackerCount = 10;
        let placedAttackers = 0;
        attempts = 0;

        while (placedAttackers < attackerCount && attempts < 200) {
            attempts++;

            const angle = Math.random() * Math.PI * 2;
            const distance = r + 16 + Math.random() * 5; // 16-21 cells from center

            const x = Math.round(cx + Math.cos(angle) * distance);
            const y = Math.round(cy + Math.sin(angle) * distance);

            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                const cell = this.mapData[y][x];
                if (!cell.onPlatform && (cell.type === 'floor' || cell.type === 'rubble')) {
                    this.placeEntity(x, y, 'M', 'unit-attacker', 'Marauder (Attacker)');
                    placedAttackers++;
                }
            }
        }

        this.log(`ATTACKERS: ${placedAttackers} deployed around perimeter.`);
    }

    smoothMap() {
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                let walls = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (this.mapData[y + dy][x + dx].type === 'wall') walls++;
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
        let spawned = 0;
        let attempts = 0;

        this.log(`REINFORCEMENTS REQUESTED. INCOMING: ${count}`);

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
            this.updateLog(`Success: ${spawned} units entered the sector.`);
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
        this.log(`<span style="color: #ff3333; font-weight: bold;">*** DETONATION! BOMB ${bombIndex + 1} ***</span>`);

        // Update marker
        const marker = this.mapData[bomb.y][bomb.x];
        marker.char = '✸';
        marker.css = 'terrain-hazard';
        marker.desc = 'DETONATED';

        // Check for units in blast radius (simplified - 3 cell radius)
        const blastRadius = 3;
        for (let dy = -blastRadius; dy <= blastRadius; dy++) {
            for (let dx = -blastRadius; dx <= blastRadius; dx++) {
                const tx = bomb.x + dx;
                const ty = bomb.y + dy;
                if (tx >= 0 && tx < this.width && ty >= 0 && ty < this.height) {
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist <= blastRadius) {
                        const cell = this.mapData[ty][tx];
                        if (cell.type === 'unit') {
                            this.log(`Unit at [${tx},${ty}] caught in blast! (Str 6, D3 damage)`);
                            // In a full implementation, would handle injury here
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
        this.log(`<br>--- END OF ROUND ${this.round} ---`);

        // Call scenario's end phase
        if (this.currentScenario && this.currentScenario.endPhase) {
            this.currentScenario.endPhase(this);
        }

        // Reinforcements
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
            this.log(`<br><span style="color: #33ff00; font-weight: bold;">${result.message}</span>`);
        }
    }

    // Box Drawing Logic
    getWallChar(x, y) {
        let mask = 0;
        const isWall = (tx, ty) => {
            if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) return false;
            return this.mapData[ty][tx].type === 'wall';
        };

        if (isWall(x, y - 1)) mask |= 1; // North
        if (isWall(x + 1, y)) mask |= 2; // East
        if (isWall(x, y + 1)) mask |= 4; // South
        if (isWall(x - 1, y)) mask |= 8; // West

        // Single line box drawing
        const chars = {
            0: '●',
            1: '║', 2: '═', 3: '╚', 4: '║',
            5: '║', 6: '╔', 7: '╠', 8: '═',
            9: '╝', 10: '═', 11: '╩', 12: '┐',
            13: '┤', 14: '┬', 15: '╬'
        };
        return chars[mask] || '#';
    }

    render() {
        this.container.style.gridTemplateColumns = `repeat(${this.width}, 1ch)`;
        this.container.innerHTML = '';

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let cellData = this.mapData[y][x];

                // Calculate display char (dynamic visuals)
                let displayChar = cellData.char;

                // If it is a wall, calculate schematic connection
                if (cellData.type === 'wall') {
                    displayChar = this.getWallChar(x, y);
                }

                const span = document.createElement('span');
                span.textContent = displayChar;
                span.className = `cell ${cellData.css}`;
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

        // Handle bomb site interactions
        if (cell.type === 'objective' && typeof cell.bombIndex !== 'undefined') {
            if (this.selectedUnit) {
                const unit = this.selectedUnit.data;
                const bomb = this.bombs[cell.bombIndex];
                const dist = Math.sqrt(Math.pow(x - this.selectedUnit.x, 2) + Math.pow(y - this.selectedUnit.y, 2));

                if (dist <= 1.5) { // Adjacent or on same cell
                    if (unit.char === 'M' && !bomb.planted) {
                        // Attacker plants bomb
                        this.currentScenario.actions.plantBomb.effect(this, unit, cell.bombIndex);
                        this.render();
                    } else if (unit.char === 'M' && bomb.planted && !bomb.armed) {
                        // Attacker rearms bomb
                        this.currentScenario.actions.rearmBomb.effect(this, unit, cell.bombIndex);
                        this.render();
                    } else if (unit.char === 'G' && bomb.planted && bomb.armed) {
                        // Defender disarms bomb
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
                    this.log(`Selection updated to [${x},${y}].`);
                    this.render();
                } else {
                    this.log("Movement blocked.");
                }
                return;
            }
        } else {
            if (cell.type === 'unit') {
                this.selectedUnit = { x, y, data: cell };
                this.log(`Unit selected at [${x},${y}].`);
                this.render();
            }
        }
    }

    moveUnit(fx, fy, tx, ty) {
        const unit = this.mapData[fy][fx];
        this.mapData[fy][fx] = { type: 'floor', char: '·', css: 'terrain-floor', desc: 'Open Ground' };
        this.mapData[ty][tx] = unit;
        this.log(`Moving to coordinate [${tx},${ty}].`);
    }

    showInfo(data, x, y) {
        let info = `GRID [${x},${y}]<br>`;
        info += `TYPE: ${data.desc}<br>`;

        if (data.type === 'unit') {
            const status = this.selectedUnit && this.selectedUnit.x === x && this.selectedUnit.y === y ? "ACTIVE" : "IDLE";
            info += `STATUS: ${status}<br>`;
            info += `LOADOUT: ${this.getRandomWeapon(data.char)}`;
        } else if (data.type === 'hazard') {
            info += `DANGER LEVEL: CRITICAL<br>`;
        } else if (data.type === 'wall') {
            info += `MATERIAL: PLASTEEL<br>`;
        } else if (data.type === 'objective' && typeof data.bombIndex !== 'undefined') {
            const bomb = this.bombs[data.bombIndex];
            if (bomb.exploded) {
                info += `STATUS: DETONATED<br>`;
            } else if (bomb.planted && bomb.armed) {
                info += `STATUS: ARMED<br>COUNTER: ${bomb.counter}<br>`;
                info += `DETONATION: ${7 - bomb.counter}+ to explode<br>`;
            } else if (bomb.planted && !bomb.armed) {
                info += `STATUS: DISARMED<br>`;
            } else {
                info += `STATUS: Not planted<br>`;
                info += `ACTION: Attacker can plant (Double)`;
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

    // The Conveyer scenario methods
    regenerateLevel() {
        this.log("Regenerating environment around platform...");

        // Keep platform cells and units on platform
        const platformCells = [];
        const platformUnits = [];

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.mapData[y][x];
                if (cell.onPlatform) {
                    platformCells.push({ x, y, cell: { ...cell } });
                    if (cell.type === 'unit') {
                        platformUnits.push({ x, y, unit: { ...cell } });
                    }
                }
            }
        }

        // Regenerate entire map
        this.mapData = [];
        for (let y = 0; y < this.height; y++) {
            let row = [];
            for (let x = 0; x < this.width; x++) {
                // Default terrain generation
                const noise = Math.random();
                if (noise < this.terrainDensity) {
                    row.push({ type: 'wall', char: '#', css: 'terrain-wall', desc: 'Bulkhead' });
                } else if (noise < this.terrainDensity + this.rubbleDensity) {
                    row.push({ type: 'rubble', char: '▒', css: 'terrain-rubble', desc: 'Industrial Detritus' });
                } else if (noise < this.terrainDensity + this.rubbleDensity + this.hazardDensity) {
                    row.push({ type: 'hazard', char: '≈', css: 'terrain-hazard', desc: 'Sump Spill' });
                } else {
                    row.push({ type: 'floor', char: '·', css: 'terrain-floor', desc: 'Metal Grating' });
                }
            }
            this.mapData.push(row);
        }

        this.smoothMap();

        // Restore platform area
        platformCells.forEach(({ x, y, cell }) => {
            this.mapData[y][x] = cell;
        });

        // Place new loot caskets
        this.lootCaskets = this.lootCaskets.filter(c => c.onPlatform);

        const cx = this.platform.centerX;
        const cy = this.platform.centerY;
        const r = this.platform.radius;

        let placedCaskets = 0;
        let attempts = 0;
        while (placedCaskets < 4 && attempts < 100) {
            attempts++;

            const angle = Math.random() * Math.PI * 2;
            const distance = r + 3 + Math.random() * 9;

            const x = Math.round(cx + Math.cos(angle) * distance);
            const y = Math.round(cy + Math.sin(angle) * distance);

            if (x >= 1 && x < this.width - 1 && y >= 1 && y < this.height - 1) {
                const cell = this.mapData[y][x];
                if ((cell.type === 'floor' || cell.type === 'rubble') && !cell.onPlatform) {
                    this.lootCaskets.push({
                        x: x,
                        y: y,
                        onPlatform: false,
                        recovered: false
                    });

                    this.mapData[y][x] = {
                        type: 'loot',
                        char: '◆',
                        css: 'obj-marker',
                        desc: 'Loot Casket',
                        casketIndex: this.lootCaskets.length - 1
                    };

                    placedCaskets++;
                }
            }
        }

        this.log(`New level: ${placedCaskets} loot caskets placed.`);
        this.render();
    }

    redeployAttackers() {
        // Find attackers not on platform and redeploy them
        const attackersToRedeploy = [];

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.mapData[y][x];
                if (cell.type === 'unit' && cell.char === 'M' && !cell.onPlatform) {
                    attackersToRedeploy.push({ ...cell });
                    // Clear from map
                    this.mapData[y][x] = { type: 'floor', char: '·', css: 'terrain-floor', desc: 'Metal Grating' };
                }
            }
        }

        // Redeploy within 12 cells of platform
        const cx = this.platform.centerX;
        const cy = this.platform.centerY;
        const maxDist = this.platform.radius + 12;

        attackersToRedeploy.forEach(attacker => {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 50) {
                attempts++;

                const angle = Math.random() * Math.PI * 2;
                const distance = this.platform.radius + 2 + Math.random() * 10;

                const x = Math.round(cx + Math.cos(angle) * distance);
                const y = Math.round(cy + Math.sin(angle) * distance);

                if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                    const cell = this.mapData[y][x];
                    if ((cell.type === 'floor' || cell.type === 'rubble') && !cell.onPlatform) {
                        this.mapData[y][x] = attacker;
                        placed = true;
                    }
                }
            }
        });

        this.log(`${attackersToRedeploy.length} attackers redeployed around new platform.`);
        this.render();
    }

    // Fungal Horror scenario methods
    markOvergrownArea(marker) {
        const cx = marker.x;
        const cy = marker.y;
        const r = marker.radius;

        for (let y = cy - r; y <= cy + r; y++) {
            for (let x = cx - r; x <= cx + r; x++) {
                if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                    const dist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
                    if (dist <= r) {
                        const cell = this.mapData[y][x];
                        cell.overgrown = true;
                        cell.fungalMarker = marker;

                        // Visual indicator - add to description
                        if (!cell.desc.includes('[OVERGROWN]')) {
                            cell.desc += ' [OVERGROWN]';
                        }

                        // Change appearance for overgrown floor
                        if (cell.type === 'floor') {
                            cell.css = 'terrain-fungal';
                            cell.char = '▓';
                        }
                    }
                }
            }
        }
    }

    applyFungalHazard() {
        // Check all units for overgrown areas
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.mapData[y][x];
                if (cell.type === 'unit' && cell.overgrown) {
                    // Simulate Blaze effect (simplified)
                    const roll = this.rand(1, 6);
                    if (roll <= 3) {
                        this.log(`${cell.desc} at [${x},${y}] coated in flesh-eating spores! (Roll: ${roll})`);
                        // In full game, would apply damage and potentially remove unit
                    }
                }
            }
        }
    }
}

// Initialize the map system
export const mapSystem = new TacticalMap(50, 25);
if (typeof window !== 'undefined') {
    window.mapSystem = mapSystem;
}

// Auto-generate map on load
if (typeof window !== 'undefined') {
    window.onload = () => {
        setTimeout(() => {
            mapSystem.generate();
        }, 1000);
    };
}
