import { Deck, Exercise } from "./exercise";
import { Round } from "./rounds";
import { settings, Settings } from "./settings";

const STORAGE_CURRENT_ROUND_KEY = 'mingo_current_round';
const STORAGE_SETTINGS_KEY = 'mingo_settings';
const STORAGE_ROUNDS_KEY = 'mingo_rounds';

export function saveCurrentRound(round: Round | null): void {
    localStorage.setItem(STORAGE_CURRENT_ROUND_KEY, JSON.stringify(round));
}

export function loadCurrentRound(): Round | null {
    const data = localStorage.getItem(STORAGE_CURRENT_ROUND_KEY);
    const round = data ? JSON.parse(data) as { timestamp: string; exercises: any[], deck: {collection: Exercise[]}; bingo: boolean } : null;
    return new Round(round?.timestamp ? new Date(round.timestamp) : new Date(), round?.exercises ?? [], new Deck(round?.deck.collection ?? []), round?.bingo ?? false);
}

export function saveSettings(settings: Settings): void {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
}

export function loadSettings(): Settings {
    const data = localStorage.getItem(STORAGE_SETTINGS_KEY);
    return data ? JSON.parse(data) as Settings : settings;
}

export function saveRounds(rounds: Round[]): void {
    localStorage.setItem(STORAGE_ROUNDS_KEY, JSON.stringify(rounds));
}

export function loadRounds(): Round[] {
    const data = localStorage.getItem(STORAGE_ROUNDS_KEY);
    const rounds = data ? JSON.parse(data) as { timestamp: string; exercises: Exercise[], deck: {collection: Exercise[]}; bingo: boolean }[] : [];
    return rounds.map(r => new Round(r.timestamp ? new Date(r.timestamp) : new Date(), r.exercises ?? [], new Deck(r.deck.collection ?? []), r.bingo ?? false));
}