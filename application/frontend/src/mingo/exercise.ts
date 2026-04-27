import { settings } from "./settings";

export type Operator = '+' | '-' | '*' | '/';

export interface Exercise {
    expression: string;
    operation: Operator;
    answer: number;
    a: number;
    b: number;
    timestamp: number;
}

export class Deck {
    private collection: Exercise[] = [];

    constructor(collection: Exercise[] = []) {
        if (collection.length) {
            this.collection = collection;
            return;
        }
        this.build();
    }

    // Deals a random exercise from the deck, or null if the deck is empty
    next(): Exercise | null {
        if (this.collection.length === 0) return null;
        return this.collection.pop()!;
    }

    remaining(): number {
        return this.collection.length;
    }

    // Generates a complete deck with all possibles exercises based on current settings
    // If settings.duplicates is true, the deck will contain duplicates
    private build() {
        console.log('Building deck with settings:', settings);
        const all = [];
        for (let a = 1; a <= settings.maxRange; a++) {
            for (let b = 1; b <= settings.maxRange; b++) {
                for (const op of settings.operations as Operator[]) {
                    let ans: number | undefined;

                    switch (op) {
                        case '+':
                            ans = a + b;
                            break;
                        case '-':
                            if (settings.noNegative && b > a) continue;
                            ans = a - b;
                            break;
                        case '*':
                            ans = a * b;
                            break;
                        case '/':
                            if (settings.wholeDivision && a % b !== 0) continue;
                            ans = Math.round((a / b) * 100) / 100;
                            break;
                    }

                    if (ans === undefined) continue;

                    all.push({
                        expression: `${a} ${op === '*' ? '×' : op === '/' ? '÷' : op} ${b}`,
                        operation: op,
                        answer: ans,
                        a,
                        b,
                        timestamp: Date.now(),
                    });
                }
            }
        }

        let collection = all;        
        if (!settings.duplicates) {
            // Group by answer and pick ONE random exercise per distinct result
            const byAnswer = new Map<number, Exercise[]>();
            for (const ex of all) {
                const arr = byAnswer.get(ex.answer) ?? [];
                arr.push(ex);
                byAnswer.set(ex.answer, arr);
            }

            collection = [];
            for (const [, arr] of byAnswer) {
                const pick = arr[Math.floor(Math.random() * arr.length)];
                collection.push(pick);
            }
        }

        // Fisher–Yates shuffle for final ordering
        for (let i = collection.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [collection[i], collection[j]] = [collection[j], collection[i]];
        }

        this.collection = collection;
        console.log(`Deck built with ${this.collection.length} exercises.`);
    }
}