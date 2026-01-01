/**
 * State Manager
 * Handles serialization/deserialization to LocalStorage
 */

export class StateManager {
    constructor(prefix = "necro_terminal_") {
        this.prefix = prefix;
    }

    saveGame(slotName, data) {
        try {
            const key = this.prefix + slotName;
            const json = JSON.stringify(data);
            localStorage.setItem(key, json);
            console.log(`[StateManager] Saved to slot: ${slotName}`);
            return true;
        } catch (e) {
            console.error("[StateManager] Save failed:", e);
            return false;
        }
    }

    loadGame(slotName) {
        try {
            const key = this.prefix + slotName;
            const json = localStorage.getItem(key);
            if (!json) {
                console.warn(`[StateManager] No save found in slot: ${slotName}`);
                return null;
            }
            return JSON.parse(json);
        } catch (e) {
            console.error("[StateManager] Load failed:", e);
            return null;
        }
    }

    listSaves() {
        const saves = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                saves.push(key.substring(this.prefix.length));
            }
        }
        return saves;
    }
    
    deleteSave(slotName) {
         localStorage.removeItem(this.prefix + slotName);
    }
}
