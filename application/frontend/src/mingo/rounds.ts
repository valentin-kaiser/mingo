import { Deck, Exercise } from "./exercise";

export class Round {
    private timestamp: Date;
    private exercises: Exercise[] = [];
    private deck: Deck;
    bingo: boolean = false;

    constructor(timestamp: Date = new Date(), exercises: Exercise[] = [], deck: Deck = new Deck(), bingo: boolean = false) {
        this.timestamp = timestamp;
        this.exercises = exercises;
        this.deck = deck;
        this.bingo = bingo;
    }

    name(): string {
        return this.timestamp.toLocaleString('de-DE', {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    new(): Exercise | null {
        let exercise = this.deck.next();
        if (!exercise) {
            return null;
        }
        this.exercises.push(exercise);
        return exercise;
    }

    last(): Exercise | null {
        return this.exercises.length ? this.exercises[this.exercises.length - 1] : null;
    }

    remaining(): number {
        return this.deck.remaining();
    }

    list(): Exercise[] {
        return this.exercises;
    }

    length(): number {
        return this.exercises.length;
    }
}
