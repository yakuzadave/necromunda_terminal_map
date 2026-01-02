import { SCENARIOS } from "./scenarios.js";
import { rng } from "./src/rng.js";
import { LOS } from "./src/los.js";
import { StateManager } from "./src/state-manager.js";
import { SectorMechanicusGenerator } from "./src/map-generator-sector-mechanicus.js";

export class TacticalMap {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.mapData = [];
    this.currentZoom = 1.0;
    
    // Drag/Pan State
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.translateX = 0;
    this.translateY = 0;

    if (typeof document !== "undefined") {
      this.container = document.getElementById("battle-map");
      if (!this.container) {
        console.warn(
          "TacticalMap: 'battle-map' element not found. Rendering will be disabled.",
        );
        this.container = { style: {}, innerHTML: "", appendChild: () => {} };
      } else {
        console.log("TacticalMap constructor: container is", this.container);
      }
    } else {
      this.container = { style: {}, innerHTML: "", appendChild: () => {} };
    }

    if (typeof document !== "undefined") {
      this.statusDisplay = document.getElementById("status-text");
      if (!this.statusDisplay) {
        console.warn(
          "TacticalMap: 'status-text' element not found. Logging will be disabled.",
        );
        this.statusDisplay = {
          innerHTML: "",
          classList: { remove: () => {}, add: () => {} },
          offsetWidth: 0,
        };
      }
    } else {
        this.statusDisplay = {
          innerHTML: "",
          classList: { remove: () => {}, add: () => {} },
          offsetWidth: 0,
        };
    }

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
    this.round = 0;
    this.defenderReinforcements = true;

    // Visibility System
    try {
      this.los = new LOS(width, height);
    } catch (e) {
      console.error("Failed to initialize LOS system:", e);
      this.los = null;
      this.los = null;
    }
    this.auspexMode = false; // "Global Auspex" mode

    // State Manager
    this.stateManager = new StateManager();
    this.currentMapType = "zm"; // Default: Zone Mortalis
  }

  rand(min, max) {
    // Deprecated: use rng.range(min, max)
    return rng.range(min, max);
  }

  validateScenario(scenario) {
    if (!scenario) return false;
    const required = ["name", "attacker", "defender"];
    const missing = required.filter((prop) => !scenario[prop]);

    if (missing.length > 0) {
      console.error(
        `Invalid scenario: Missing properties [${missing.join(", ")}]`,
      );
      return false;
    }

    // Normalize victory check method name if needed
    if (scenario.victory && !scenario.checkVictory) {
      console.warn(
        `Scenario '${scenario.name}' uses deprecated 'victory' method. Mapping to 'checkVictory'.`,
      );
      scenario.checkVictory = scenario.victory;
    }

    return true;
  }

  /**
   * Generate the map and scenario
   * @param {string|null} scenarioKey - The key of the scenario to load
   */
  generate(scenarioKey = null) {
    this.mapData = [];
    this.entities = [];
    this.selectedUnit = null;
    this.bombs = [];
    this.round = 0;
    if (this.container.innerHTML !== undefined) {
      this.container.innerHTML = "";
    }
    
    // Ensure drag is initialized once
    if (!this.dragInitialized) {
        this.initDrag();
        this.dragInitialized = true;
    }

    // Load Map Type from UI
    if (typeof document !== "undefined") {
      const selector = document.getElementById("map-type");
      if (selector) {
        this.currentMapType = selector.value;
      }
    }
    console.log(`Generating Map: ${this.currentMapType}`);

    // Load scenario
    let scenario = null;
    if (scenarioKey && SCENARIOS[scenarioKey]) {
      scenario = SCENARIOS[scenarioKey];
    } else {
      // Default to random ambush scenario
      const ambushScenarios = ["bushwhack", "scrag", "mayhem"];
      scenarioKey = ambushScenarios[this.rand(0, ambushScenarios.length - 1)];
      scenario = SCENARIOS[scenarioKey];
    }

    if (this.validateScenario(scenario)) {
      this.currentScenario = scenario;
    } else {
      console.error("Failed to load valid scenario. Aborting generation.");
      return;
    }

    this.log(
      `<br>=== ${this.currentScenario.name.toUpperCase()} ===<br>${this.currentScenario.description}`,
    );

    // 1. Generate Terrain based on Map Type
    if (this.currentMapType === "sm") {
        const generator = new SectorMechanicusGenerator(this.width, this.height);
        this.mapData = generator.generate();
    } else {
        // Default: Zone Mortalis
        // 1. Fill with base floor
        for (let y = 0; y < this.height; y++) {
        let row = [];
        for (let x = 0; x < this.width; x++) {
            // Outer Walls
            if (
            x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1
            ) {
            // Leave gaps for entry points
            if ((x === 0 || x === this.width - 1) && y > 10 && y < 15) {
                row.push({
                type: "floor",
                char: "·",
                css: "terrain-floor",
                desc: "Access Point",
                });
            } else if ((y === 0 || y === this.height - 1) && x > 20 && x < 30) {
                row.push({
                type: "floor",
                char: "·",
                css: "terrain-floor",
                desc: "Access Point",
                });
            } else {
                row.push({
                type: "floor",
                char: "·",
                css: "terrain-floor",
                desc: "Sector Perimeter",
                });
            }
            } else {
            // Procedural Noise for Zone Mortalis
            const noise = rng.random();
            if (noise < this.terrainDensity) {
                // Create blocks rather than noise
                if (x % 4 === 0 || y % 4 === 0) {
                row.push({
                    type: "wall",
                    char: "#",
                    css: "terrain-wall",
                    desc: "Structural Column",
                });
                } else {
                row.push({
                    type: "wall",
                    char: "#",
                    css: "terrain-wall",
                    desc: "Bulkhead",
                });
                }
            } else if (noise < this.terrainDensity + this.rubbleDensity) {
                row.push({
                type: "rubble",
                char: "▒",
                css: "terrain-rubble",
                desc: "Industrial Detritus",
                });
            } else if (
                noise <
                this.terrainDensity + this.rubbleDensity + this.hazardDensity
            ) {
                row.push({
                type: "hazard",
                char: "≈",
                css: "terrain-hazard",
                desc: "Sump Spill",
                });
            } else {
                row.push({
                type: "floor",
                char: "·",
                css: "terrain-floor",
                desc: "Metal Grating",
                });
            }
            }
        }
        this.mapData.push(row);
        }

        // Cleanup: Cellular Automata to open paths
        this.smoothMap();
    }

    // 2. Run scenario-specific setup
    if (this.currentScenario.setup) {
      this.currentScenario.setup(this);
    }

    // 3. Deploy Units based on scenario
    this.deployUnits();

    this.computeVisibility();
    this.render();
  }

  deployUnits() {
    // Special deployment for The Conveyer
    if (this.currentScenario.name === "The Conveyer") {
      this.deployConveyerUnits();
      return;
    }

    // Deploy Attackers
    const attackerCount = this.currentScenario.attacker.count === "custom"
      ? 6
      : (this.currentScenario.attacker.count || 6);
    let placedAttackers = 0;
    let attempts = 0;
    while (placedAttackers < attackerCount && attempts < 100) {
      attempts++;
      let ax = this.rand(2, this.width - 3);
      let ay = this.rand(this.height - 6, this.height - 2);
      if (this.isValidSpawn(ax, ay)) {
        this.placeEntity(ax, ay, "M", "unit-attacker", "Marauder (Attacker)");
        placedAttackers++;
      }
    }

    // Deploy Defenders
    const defenderRoll = this.rand(1, 3);
    let defenderCount = 6; // Default
    const countConfig = this.currentScenario.defender.count;

    if (countConfig === "D3+5") {
      defenderCount = defenderRoll + 5;
    } else if (countConfig === "D3+2") {
      defenderCount = defenderRoll + 2;
    } else if (typeof countConfig === "number") {
      defenderCount = countConfig;
    } else {
      defenderCount = defenderRoll + 2;
    }
    this.log(`DEFENDER STRENGTH: ${defenderCount} detected.`);

    let placedDefenders = 0;
    attempts = 0;
    while (placedDefenders < defenderCount && attempts < 100) {
      attempts++;
      let dx = this.rand(2, this.width - 3);
      let dy = this.rand(2, Math.floor(this.height / 2));
      if (this.isValidSpawn(dx, dy)) {
        this.placeEntity(
          dx,
          dy,
          "G",
          "unit-defender",
          "Garrison Sentry (Defender)",
        );
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
      const angle = rng.random() * Math.PI * 2;
      const distance = rng.random() * r;

      const x = Math.round(cx + Math.cos(angle) * distance);
      const y = Math.round(cy + Math.sin(angle) * distance);

      if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        const cell = this.mapData[y][x];
        if (
          cell.onPlatform && (cell.type === "floor" || cell.type === "rubble")
        ) {
          const defender = {
            type: "unit",
            char: "G",
            css: "unit-defender",
            desc: "Garrison (Defender)",
            onPlatform: true,
          };
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

      const angle = rng.random() * Math.PI * 2;
      const distance = r + 16 + rng.random() * 5; // 16-21 cells from center

      const x = Math.round(cx + Math.cos(angle) * distance);
      const y = Math.round(cy + Math.sin(angle) * distance);

      if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        const cell = this.mapData[y][x];
        if (
          !cell.onPlatform && (cell.type === "floor" || cell.type === "rubble")
        ) {
          this.placeEntity(x, y, "M", "unit-attacker", "Marauder (Attacker)");
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
            if (this.mapData[y + dy][x + dx].type === "wall") walls++;
          }
        }
        if (this.mapData[y][x].type === "wall" && walls < 3) {
          this.mapData[y][x] = {
            type: "floor",
            char: "·",
            css: "terrain-floor",
            desc: "Corridor",
          };
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
      if (rng.chance(0.5)) {
        ry = rng.chance(0.5) ? 1 : this.height - 2;
        // Place somewhere along width
        rx = rng.range(1, this.width - 2);
      } else {
        // Left/Right edge
        rx = rng.chance(0.5) ? 1 : this.width - 2;
        ry = this.rand(1, this.height - 2);
      }

      if (this.isValidSpawn(rx, ry) && this.isSafeFromAttackers(rx, ry)) {
        this.placeEntity(rx, ry, "G", "unit-defender", "Reinforcement Unit");
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
        if (cell.type === "unit" && cell.char === "M") {
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
    return cell.type !== "wall" && cell.type !== "unit" &&
      cell.type !== "hazard" && cell.type !== "objective";
  }

  placeEntity(x, y, char, css, desc) {
    this.mapData[y][x] = { type: "unit", char: char, css: css, desc: desc };
  }

  getUnitsByType(char) {
    const units = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.mapData[y][x];
        if (cell.type === "unit" && cell.char === char) {
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
    this.log(
      `<span style="color: #ff3333; font-weight: bold;">*** DETONATION! BOMB ${
        bombIndex + 1
      } ***</span>`,
    );

    // Update marker
    const marker = this.mapData[bomb.y][bomb.x];
    marker.char = "✸";
    marker.css = "terrain-hazard";
    marker.desc = "DETONATED";

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
            if (cell.type === "unit") {
              this.log(
                `Unit at [${tx},${ty}] caught in blast! (Str 6, D3 damage)`,
              );
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
      this.log(
        `<br><span style="color: #33ff00; font-weight: bold;">${result.message}</span>`,
      );
    }
  }

  toggleOverlay() {
    this.visMode = !this.visMode;
    this.render();
    this.log(`Overlay Mode: ${this.visMode ? "ON" : "OFF"}`);
  }

  toggleAuspex() {
    this.computeVisibility();
    this.auspexMode = !this.auspexMode;
    const btn = document.getElementById("btn-auspex");
    if (btn) {
      btn.innerText = `AUSPEX: ${this.auspexMode ? "ON" : "OFF"}`;
      btn.style.color = this.auspexMode ? "#adff2f" : "#444";
      btn.style.borderColor = this.auspexMode ? "#adff2f" : "#444";
    }
    this.updateLog(`Auspex Scan: ${this.auspexMode ? "ACTIVE" : "STANDBY"}`);
    this.render();
  }

  computeVisibility() {
    if (!this.los) return;

    // Reset visibility
    for (const row of this.mapData) {
      for (const cell of row) {
        delete cell.visible;
      }
    }

    if (!this.auspexMode) return;

    // Calculate visibility for all "attacker" units (assuming player is attacker for now)
    // Or just all units if we want a global view
    // For this batch, let's say we see what "G" (Defenders) see IF we are playing them,
    // but the prompt implies we are mostly just viewing.
    // Let's make it reveal what ALL units see for now (Global Auspex).

    const allUnits = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.mapData[y][x].type === "unit") {
          allUnits.push({ x, y });
        }
      }
    }

    // Include selected unit if any
    // if (this.selectedUnit) {
    //   allUnits.push({ x: this.selectedUnit.x, y: this.selectedUnit.y });
    // }

    // Combine visibility sets
    allUnits.forEach((u) => {
      // Vision radius 12 cells approx
      const visibleSet = this.los.calculateVisibility(this.mapData, u.x, u.y, 12);
      for (const key of visibleSet) {
        const [vx, vy] = key.split(",").map(Number);
        if (this.mapData[vy] && this.mapData[vy][vx]) {
          this.mapData[vy][vx].visible = true;
        }
      }
    });
  }

  // State Management
  serialize() {
    return {
      version: 1,
      width: this.width,
      height: this.height,
      rngSeed: rng.getSeed(),
      round: this.round,
       scenarioKey: this.currentScenario ? Object.keys(SCENARIOS).find(key => SCENARIOS[key] === this.currentScenario) : null,
       mapType: this.currentMapType,
       bombs: this.bombs,
       mapData: this.mapData.map(row => row.map(cell => {
         // Simplify cell data to avoid circular refs or bloated HTML elements
         // We only need the data properties, not the DOM nodes or methods
         const { x, y, type, char, css, desc, onPlatform, isBridge, isRiver, isDebris, bombIndex, planted, armed } = cell;
         return { x, y, type, char, css, desc, onPlatform, isBridge, isRiver, isDebris, bombIndex, planted, armed };
       })),
       auspexMode: this.auspexMode
    };
  }

  deserialize(data) {
    if (!data) return false;
    
    // Restore Config
    this.width = data.width;
    this.height = data.height;
    this.round = data.round;
    this.bombs = data.bombs || [];
    this.auspexMode = data.auspexMode || false;
    this.currentMapType = data.mapType || "zm";

    // Restore RNG
    if (data.rngSeed) {
      rng.setSeed(data.rngSeed);
    }

    // Restore Scenario
    if (data.scenarioKey && SCENARIOS[data.scenarioKey]) {
      this.currentScenario = SCENARIOS[data.scenarioKey];
    }

    // Restore Map Data
    this.mapData = data.mapData;

    // Re-initialize container
    if (this.container.innerHTML !== undefined) {
      this.container.innerHTML = "";
    }
    this.render();
    this.log("Game Loaded Successfully.");
    this.updateLog(`Round: ${this.round}`);
    
    // Restore UI state
    if (this.auspexMode) {
        this.toggleAuspex(); 
        // toggleAuspex flips the boolean, so we might need to sync it. 
        // Actually toggleAuspex does this.auspexMode = !this.auspexMode.
        // If we set this.auspexMode = true above, calling toggleAuspex makes it false.
        // Let's manually sync the button instead.
        if (typeof document !== "undefined") {
          const btn = document.getElementById("btn-auspex");
          if (btn) {
              btn.innerText = "AUSPEX: ON";
              btn.style.color = "#adff2f";
              btn.style.borderColor = "#adff2f";
          }
        }
        this.computeVisibility();
        this.render();
    }
    
    // Sync UI Selector if available
    if (typeof document !== "undefined") {
      const selector = document.getElementById("map-type");
      if (selector) {
        selector.value = this.currentMapType;
      }
    }
    
    return true;
  }

  saveGame(slot = "quicksave") {
    const data = this.serialize();
    if (this.stateManager.saveGame(slot, data)) {
        this.log(`Game Saved to '${slot}'`);
    } else {
        this.log("Save Failed!");
    }
  }

  loadGame(slot = "quicksave") {
    const data = this.stateManager.loadGame(slot);
    if (data) {
        this.deserialize(data);
    } else {
        this.log(`Load Failed: No data in '${slot}'`);
    }
  }

  quickSave() { this.saveGame("quicksave"); }
  quickLoad() { this.loadGame("quicksave"); }

  // Box Drawing Logic
  getWallChar(x, y) {
    let mask = 0;
    const isWall = (tx, ty) => {
      if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) {
        return false;
      }
      return this.mapData[ty][tx].type === "wall";
    };

    if (isWall(x, y - 1)) mask |= 1; // North
    if (isWall(x + 1, y)) mask |= 2; // East
    if (isWall(x, y + 1)) mask |= 4; // South
    if (isWall(x - 1, y)) mask |= 8; // West

    // Single line box drawing
    const chars = {
      0: "●",
      1: "║",
      2: "═",
      3: "╚",
      4: "║",
      5: "║",
      6: "╔",
      7: "╠",
      8: "═",
      9: "╝",
      10: "═",
      11: "╩",
      12: "┐",
      13: "┤",
      14: "┬",
      15: "╬",
    };
    return chars[mask] || "#";
  }

  render() {
    if (!this.mapData || this.mapData.length === 0) return;

    this.container.style.gridTemplateColumns = `repeat(${this.width}, 1ch)`;
    this.container.innerHTML = "";

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let cellData = this.mapData[y][x];

        // Calculate display char (dynamic visuals)
        let displayChar = cellData.char;
        let cssClasses = `cell ${cellData.css}`;

        if (this.auspexMode && !cellData.visible) {
          cssClasses += " shrouded";
        } else if (this.auspexMode && cellData.visible) {
          cssClasses += " visible";
        }

        // If it is a wall, calculate schematic connection
        if (cellData.type === "wall") {
          displayChar = this.getWallChar(x, y);
        }

        const span = document.createElement("span");
        span.textContent = displayChar;
        span.className = cssClasses;
        span.dataset.x = x;
        span.dataset.y = y;

        if (
          this.selectedUnit && this.selectedUnit.x === x &&
          this.selectedUnit.y === y
        ) {
          span.classList.add("selected");
        }

        span.addEventListener("mouseenter", () => {
          this.showInfo(cellData, x, y);
        });

        span.addEventListener("click", () => {
          this.handleCellClick(x, y);
        });

        this.container.appendChild(span);
      }
    }
  }

  handleCellClick(x, y) {
    const cell = this.mapData[y][x];

    // Handle bomb site interactions
    if (cell.type === "objective" && typeof cell.bombIndex !== "undefined") {
      if (this.selectedUnit) {
        const unit = this.selectedUnit.data;
        const bomb = this.bombs[cell.bombIndex];
        const dist = Math.sqrt(
          Math.pow(x - this.selectedUnit.x, 2) +
            Math.pow(y - this.selectedUnit.y, 2),
        );

        if (dist <= 1.5) { // Adjacent or on same cell
          if (unit.char === "M" && !bomb.planted) {
            // Attacker plants bomb
            this.currentScenario.actions.plantBomb.effect(
              this,
              unit,
              cell.bombIndex,
            );
            this.render();
            this.computeVisibility();
          } else if (unit.char === "M" && bomb.planted && !bomb.armed) {
            // Attacker rearms bomb
            this.currentScenario.actions.rearmBomb.effect(
              this,
              unit,
              cell.bombIndex,
            );
            this.render();
            this.computeVisibility();
          } else if (unit.char === "G" && bomb.planted && bomb.armed) {
            // Defender disarms bomb
            this.currentScenario.actions.disarmBomb.effect(
              this,
              unit,
              cell.bombIndex,
            );
            this.render();
            this.computeVisibility();
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
        this.computeVisibility();
        return;
      }

      if (cell.type === "floor" || cell.type === "rubble") {
        this.moveUnit(this.selectedUnit.x, this.selectedUnit.y, x, y);
        this.selectedUnit = null;
        this.render();
        this.computeVisibility();
        return;
      }

      if (
        cell.type === "wall" || cell.type === "unit" || cell.type === "hazard"
      ) {
        if (cell.type === "unit") {
          this.selectedUnit = { x, y, data: cell };
          this.log(`Selection updated to [${x},${y}].`);
          this.render();
          this.computeVisibility();
        } else {
          this.log("Movement blocked.");
        }
        return;
      }
    } else {
      if (cell.type === "unit") {
        this.selectedUnit = { x, y, data: cell };
        this.log(`Unit selected at [${x},${y}].`);
        this.render();
        this.computeVisibility();
      }
    }
  }

  moveUnit(fx, fy, tx, ty) {
    const unit = this.mapData[fy][fx];
    const target = this.mapData[ty][tx];

    // Handle Toxic River
    if (target.isRiver && !target.isBridge) {
      if (target.isDebris) {
        this.log(
          `Unit leaps onto Debris at [${tx},${ty}]. Testing stability...`,
        );
        // Simple check: 1/6 chance to fall in (representing failed Initiative)
        if (this.rand(1, 6) === 1) {
          this.log(`...Debris capsizes! Unit falls into Toxic River! GONE!`);
          this.mapData[fy][fx] = {
            type: "floor",
            char: "·",
            css: "terrain-floor",
            desc: "Open Ground",
          };
          return; // Unit dies, do not place at target
        }
      } else {
        this.log(`Unit falls into Toxic River at [${tx},${ty}]! GONE!`);
        this.mapData[fy][fx] = {
          type: "floor",
          char: "·",
          css: "terrain-floor",
          desc: "Open Ground",
        };
        return; // Unit dies
      }
    }

    // Restore previous tile at origin (assuming it was floor/ground for now, or we should track it)
    // Ideally we'd pop the unit off a stack, but for now we reset to floor.
    // If the unit was on a bridge, we should restore the bridge.
    if (unit.isBridge) {
      this.mapData[fy][fx] = {
        type: "floor",
        char: "≡",
        css: "terrain-floor",
        desc: "Toll Bridge",
        isBridge: true,
        isRiver: true,
      };
    } else if (unit.isDebris) {
      this.mapData[fy][fx] = {
        type: "rubble",
        char: "O",
        css: "terrain-rubble",
        desc: "Flotsam (Debris)",
        isDebris: true,
        isRiver: true,
      };
    } else {
      this.mapData[fy][fx] = {
        type: "floor",
        char: "·",
        css: "terrain-floor",
        desc: "Open Ground",
      };
    }

    // Move unit to target
    // Preserve terrain flags on the unit so we know where it is standing
    const newUnit = { ...unit };
    if (target.isBridge) {
      newUnit.isBridge = true;
      newUnit.isRiver = true; // Bridge is over river
    } else {
      delete newUnit.isBridge;
    }

    if (target.isDebris) {
      newUnit.isDebris = true;
      newUnit.isRiver = true;
    } else {
      delete newUnit.isDebris;
    }

    if (target.isRiver && !target.isBridge && !target.isDebris) {
      // Should have been caught above, but just in case
      newUnit.isRiver = true;
    }

    this.mapData[ty][tx] = newUnit;
    this.log(`Moving to coordinate [${tx},${ty}].`);
  }

  showInfo(data, x, y) {
    let html = `<div class="info-block">
        <div class="info-title">GRID [${x},${y}]</div>`;
        html += `<div class="stat-row"><span class="stat-label">TYPE</span><span class="stat-val">${data.desc}</span></div>`;
    
    if (this.auspexMode) {
      const vis = data.visible ? "CLEAR" : "SHROUDED";
      const color = data.visible ? "#adff2f" : "#555";
      html += `<div class="stat-row"><span class="stat-label">AUSPEX</span><span class="stat-val" style="color:${color}">${vis}</span></div>`;
    }
    
    if (data.type === "unit") {
      const isSelected = this.selectedUnit && this.selectedUnit.x === x && this.selectedUnit.y === y;
      const statusClass = isSelected ? "status-active" : "status-idle";
      const statusText = isSelected ? "ACTIVE" : "IDLE";
      
      html += `<div class="stat-row"><span class="stat-label">UNIT</span><span class="stat-val">${data.char}</span></div>`;
      html += `<div class="status-badge ${statusClass}">${statusText}</div>`;
      html += `<div class="stat-row" style="margin-top:4px"><span class="stat-label">LOADOUT</span></div>`;
      html += `<div style="font-size:0.8rem; color:#aaa">${this.getRandomWeapon(data.char)}</div>`;
    } else if (data.type === "hazard") {
        html += `<div class="status-badge status-danger">HAZARD LEVEL 5</div>`;
    } else if (data.type === "wall") {
        html += `<div class="status-badge status-idle">STRUCTURAL (T7 W4)</div>`;
    } else if (data.type === "objective" && typeof data.bombIndex !== "undefined") {
       const bomb = this.bombs[data.bombIndex];
       if (bomb.exploded) {
           html += `<div class="status-badge status-danger">DETONATED</div>`;
       } else if (bomb.planted && bomb.armed) {
           html += `<div class="status-badge status-warn">ARMED (${bomb.counter})</div>`;
           html += `<div style="font-size:0.8rem; color:#f00">Detonates on ${7-bomb.counter}+</div>`;
       } else if (bomb.planted && !bomb.armed) {
           html += `<div class="status-badge status-idle">PLANTED (DISARMED)</div>`;
       } else {
            html += `<div class="stat-row"><span class="stat-label">STATUS</span><span class="stat-val">INACTIVE</span></div>`;
            html += `<div style="font-size:0.8rem; color:#adff2f">Action: Plant Bomb (Double)</div>`;
       }
    }
    
    html += `</div>`; // Close info-block
    this.updateLog(html);
  }

  getRandomWeapon(char) {
    const weapons = [
      "Bolter",
      "Lasgun",
      "Power Sword",
      "Stub Gun",
      "Chainsword",
      "Shotgun",
    ];
    return rng.pick(weapons);
  }

  updateLog(html) {
    this.statusDisplay.innerHTML = html;
    this.statusDisplay.classList.remove("typing-cursor");
    void this.statusDisplay.offsetWidth;
    this.statusDisplay.classList.add("typing-cursor");
  }

  log(text) {
    const current = this.statusDisplay.innerHTML;
    this.statusDisplay.innerHTML = text + "<br><br>" + current;
  }

  toggleOverlay() {
    this.visMode = !this.visMode;
    const els = document.querySelectorAll(".terrain-floor");
    els.forEach((el) => {
      el.style.opacity = this.visMode ? "0.1" : "0.5";
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
          if (cell.type === "unit") {
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
        const noise = rng.random();
        if (noise < this.terrainDensity) {
          row.push({
            type: "wall",
            char: "#",
            css: "terrain-wall",
            desc: "Bulkhead",
          });
        } else if (noise < this.terrainDensity + this.rubbleDensity) {
          row.push({
            type: "rubble",
            char: "▒",
            css: "terrain-rubble",
            desc: "Industrial Detritus",
          });
        } else if (
          noise < this.terrainDensity + this.rubbleDensity + this.hazardDensity
        ) {
          row.push({
            type: "hazard",
            char: "≈",
            css: "terrain-hazard",
            desc: "Sump Spill",
          });
        } else {
          row.push({
            type: "floor",
            char: "·",
            css: "terrain-floor",
            desc: "Metal Grating",
          });
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
    this.lootCaskets = this.lootCaskets.filter((c) => c.onPlatform);

    const cx = this.platform.centerX;
    const cy = this.platform.centerY;
    const r = this.platform.radius;

    let placedCaskets = 0;
    let attempts = 0;
    while (placedCaskets < 4 && attempts < 100) {
      attempts++;

      const angle = rng.random() * Math.PI * 2;
      const distance = r + 3 + rng.random() * 9;

      const x = Math.round(cx + Math.cos(angle) * distance);
      const y = Math.round(cy + Math.sin(angle) * distance);

      if (x >= 1 && x < this.width - 1 && y >= 1 && y < this.height - 1) {
        const cell = this.mapData[y][x];
        if (
          (cell.type === "floor" || cell.type === "rubble") && !cell.onPlatform
        ) {
          this.lootCaskets.push({
            x: x,
            y: y,
            onPlatform: false,
            recovered: false,
          });

          this.mapData[y][x] = {
            type: "loot",
            char: "◆",
            css: "obj-marker",
            desc: "Loot Casket",
            casketIndex: this.lootCaskets.length - 1,
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
        if (cell.type === "unit" && cell.char === "M" && !cell.onPlatform) {
          attackersToRedeploy.push({ ...cell });
          // Clear from map
          this.mapData[y][x] = {
            type: "floor",
            char: "·",
            css: "terrain-floor",
            desc: "Metal Grating",
          };
        }
      }
    }

    // Redeploy within 12 cells of platform
    const cx = this.platform.centerX;
    const cy = this.platform.centerY;
    const maxDist = this.platform.radius + 12;

    attackersToRedeploy.forEach((attacker) => {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 50) {
        attempts++;

        const angle = rng.random() * Math.PI * 2;
        const distance = this.platform.radius + 2 + rng.random() * 10;

        const x = Math.round(cx + Math.cos(angle) * distance);
        const y = Math.round(cy + Math.sin(angle) * distance);

        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
          const cell = this.mapData[y][x];
          if (
            (cell.type === "floor" || cell.type === "rubble") &&
            !cell.onPlatform
          ) {
            this.mapData[y][x] = attacker;
            placed = true;
          }
        }
      }
    });

    this.log(
      `${attackersToRedeploy.length} attackers redeployed around new platform.`,
    );
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
            if (!cell.desc.includes("[OVERGROWN]")) {
              cell.desc += " [OVERGROWN]";
            }

            // Change appearance for overgrown floor
            if (cell.type === "floor") {
              cell.css = "terrain-fungal";
              cell.char = "▓";
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
        if (cell.type === "unit" && cell.overgrown) {
          // Simulate Blaze effect (simplified)
          const roll = this.rand(1, 6);
          if (roll <= 3) {
            this.log(
              `${cell.desc} at [${x},${y}] coated in flesh-eating spores! (Roll: ${roll})`,
            );
            // In full game, would apply damage and potentially remove unit
          }
        }
      }
    }
  }
  // Toll Bridge scenario methods
  generateTollBridge() {
    this.log("Constructing Toxic River and Toll Bridge...");

    // 1. Create Toxic River (Vertical strip in center)
    const riverStart = Math.floor(this.width / 2) - 3;
    const riverEnd = Math.floor(this.width / 2) + 3;

    for (let y = 0; y < this.height; y++) {
      for (let x = riverStart; x <= riverEnd; x++) {
        this.mapData[y][x] = {
          type: "hazard",
          char: "≈",
          css: "terrain-hazard",
          desc: "Toxic River (Out of Action on entry)",
          isRiver: true,
        };
      }
    }

    // 2. Create Bridge (Horizontal strip across river)
    const bridgeY = Math.floor(this.height / 2);
    const bridgeWidth = 3; // 3 cells wide

    this.bridge = {
      orientation: "horizontal",
      cells: [],
    };

    for (let y = bridgeY - 1; y <= bridgeY + 1; y++) {
      for (let x = riverStart - 1; x <= riverEnd + 1; x++) {
        this.mapData[y][x] = {
          type: "floor",
          char: "≡",
          css: "terrain-floor",
          desc: "Toll Bridge",
          isBridge: true,
        };
        this.bridge.cells.push({ x, y });
      }
    }

    // 3. Place Debris (Flotsam)
    const debrisCount = 8;
    let placedDebris = 0;
    let attempts = 0;

    while (placedDebris < debrisCount && attempts < 100) {
      attempts++;
      const x = this.rand(riverStart, riverEnd);
      const y = this.rand(0, this.height - 1);

      const cell = this.mapData[y][x];
      if (cell.isRiver && !cell.isBridge) {
        this.mapData[y][x] = {
          type: "rubble", // Treat as rubble for movement (difficult terrain?) or special
          char: "O",
          css: "terrain-rubble",
          desc: "Flotsam (Debris)",
          isDebris: true,
        };
        placedDebris++;
      }
    }

    this.log("Bridge secured. River toxic levels critical.");
    this.render();
  }

  pivotBridge(direction) {
    this.log(`WARNING: Bridge pivoting ${direction.toUpperCase()}!`);

    const center = {
      x: Math.floor(this.width / 2),
      y: Math.floor(this.height / 2),
    };
    const riverStart = Math.floor(this.width / 2) - 3;
    const riverEnd = Math.floor(this.width / 2) + 3;

    // Determine new orientation
    const newOrientation = this.bridge.orientation === "horizontal"
      ? "vertical"
      : "horizontal";

    // Clear old bridge cells (revert to river or floor based on location)
    // Actually, we should revert to what was there.
    // If it was over river, it becomes river. If over land, it becomes floor.

    // Simplified: Just regenerate the river and then draw bridge in new pos.
    // But we need to handle units on the bridge.

    const unitsOnBridge = [];
    this.bridge.cells.forEach((pos) => {
      const cell = this.mapData[pos.y][pos.x];
      if (cell.type === "unit") {
        unitsOnBridge.push({ ...cell, x: pos.x, y: pos.y });
      }
    });

    // 1. Restore River/Bank under old bridge
    this.bridge.cells.forEach((pos) => {
      if (pos.x >= riverStart && pos.x <= riverEnd) {
        this.mapData[pos.y][pos.x] = {
          type: "hazard",
          char: "≈",
          css: "terrain-hazard",
          desc: "Toxic River",
          isRiver: true,
        };
      } else {
        this.mapData[pos.y][pos.x] = {
          type: "floor",
          char: "·",
          css: "terrain-floor",
          desc: "Ground",
        };
      }
    });

    // 2. Calculate new bridge cells
    this.bridge.cells = [];
    this.bridge.orientation = newOrientation;

    if (newOrientation === "vertical") {
      // Vertical bridge along the river center
      // Let's say length is same as width of river + overlap?
      // Original length was river width (7) + 2 = 9.
      // So vertical length should be 9 centered at center.
      const halfLen = 4;
      const halfWidth = 1; // Width 3 -> +/- 1

      for (let y = center.y - halfLen; y <= center.y + halfLen; y++) {
        for (let x = center.x - halfWidth; x <= center.x + halfWidth; x++) {
          this.bridge.cells.push({ x, y });
        }
      }
    } else {
      // Horizontal
      const halfLen = 4;
      const halfWidth = 1;

      for (let y = center.y - halfWidth; y <= center.y + halfWidth; y++) {
        for (let x = center.x - halfLen; x <= center.x + halfLen; x++) {
          this.bridge.cells.push({ x, y });
        }
      }
    }

    // 3. Draw new bridge
    this.bridge.cells.forEach((pos) => {
      if (
        pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height
      ) {
        // Check if unit is here (unlikely unless they were flying, but we overwrite)
        this.mapData[pos.y][pos.x] = {
          type: "floor",
          char: "≡",
          css: "terrain-floor",
          desc: "Toll Bridge",
          isBridge: true,
        };
      }
    });

    // 4. Handle Units
    unitsOnBridge.forEach((unit) => {
      // Rotate unit position 90 degrees around center
      // (x, y) -> (-y, x) relative to center
      const relX = unit.x - center.x;
      const relY = unit.y - center.y;

      let newRelX, newRelY;
      if (direction === "right") { // Clockwise
        newRelX = -relY;
        newRelY = relX;
      } else { // Counter-clockwise
        newRelX = relY;
        newRelY = -relX;
      }

      const newX = center.x + newRelX;
      const newY = center.y + newRelY;

      // Check if new position is on the new bridge
      const onNewBridge = this.bridge.cells.some((c) =>
        c.x === newX && c.y === newY
      );

      if (onNewBridge) {
        // Unit rotates with bridge
        this.placeEntity(newX, newY, unit.char, unit.css, unit.desc);
        this.log(`Unit moved with bridge to [${newX},${newY}]`);
      } else {
        // Unit fell off!
        // Check if over river
        if (newX >= riverStart && newX <= riverEnd) {
          this.log(`Unit fell into Toxic River at [${newX},${newY}]! GONE!`);
          // Unit lost (don't place it)
        } else {
          this.placeEntity(
            newX,
            newY,
            unit.char,
            unit.css,
            unit.desc + " (Prone)",
          );
          this.log(`Unit fell onto shore at [${newX},${newY}]!`);
        }
      }
    });

    this.render();
  }
  // Drag/Pan Logic
  initDrag() {
    if (typeof document === "undefined") return;

    const frame = document.querySelector(".map-frame");
    if (!frame) return;

    frame.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.startX = e.clientX - this.translateX;
      this.startY = e.clientY - this.translateY;
      frame.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      e.preventDefault();
      this.translateX = e.clientX - this.startX;
      this.translateY = e.clientY - this.startY;
      this.applyTransform();
    });

    document.addEventListener("mouseup", () => {
      if (this.isDragging) {
        this.isDragging = false;
        frame.style.cursor = "grab";
      }
    });
  }

  applyTransform() {
    const container = document.querySelector(".crt-container");
    if (container) {
      container.style.transform =
        `translate(${this.translateX}px, ${this.translateY}px) scale(${this.currentZoom})`;
    }
  }

  resetView() {
    this.currentZoom = 1.0;
    this.translateX = 0;
    this.translateY = 0;
    this.applyTransform();
  }
}

// Global hook for reset
if (typeof window !== "undefined") {
    window.resetView = () => {
        if (window.mapSystem) {
            window.mapSystem.resetView();
        }
    }
}
export const mapSystem = new TacticalMap(50, 25);
if (typeof window !== "undefined") {
  globalThis.mapSystem = mapSystem;
}

// Auto-generate map on load
if (typeof window !== "undefined") {
  globalThis.onload = () => {
    setTimeout(() => {
      // Check if mapSystem exists before generating
      if (globalThis.mapSystem) {
        mapSystem.generate();
      }
    }, 1000);
  };
}
