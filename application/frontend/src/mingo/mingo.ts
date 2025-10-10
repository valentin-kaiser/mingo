import { Round } from "./rounds";
import { settings, Settings } from "./settings";
import * as storage from "./storage";

var instance: Mingo | null = null;

// Boot returns the Mingo singleton instance.
export function Boot(): Mingo {
    return instance ?? (instance = new Mingo());
}

class Mingo {
    current: Round | null = null;
    rounds: Round[] = [];
    settings: Settings = settings;

    constructor() {
        this.load();
    }

    load() {
        this.current = storage.loadCurrentRound();
        this.rounds = storage.loadRounds();
        this.settings = storage.loadSettings();
    }
    
    save() {
        storage.saveCurrentRound(this.current);
        storage.saveRounds(this.rounds);
        storage.saveSettings(this.settings);
    }
}