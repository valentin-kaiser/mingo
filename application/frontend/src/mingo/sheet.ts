import { Operator } from './exercise';
import { Settings } from './settings';

export type GridSize = 3 | 4 | 5;

export type SheetCell = {
    answer: number;
};

export type SheetResult =
    | { ok: true; grid: SheetCell[][] }
    | { ok: false; error: string };

// Collects all unique answers possible under the given settings.
function uniqueAnswers(s: Settings): number[] {
    const answerSet = new Set<number>();
    for (let a = 1; a <= s.maxRange; a++) {
        for (let b = 1; b <= s.maxRange; b++) {
            for (const op of s.operations as Operator[]) {
                let ans: number | undefined;
                switch (op) {
                    case '+':
                        ans = a + b;
                        break;
                    case '-':
                        if (s.noNegative && b > a) continue;
                        ans = a - b;
                        break;
                    case '*':
                        ans = a * b;
                        break;
                    case '/':
                        if (s.wholeDivision && a % b !== 0) continue;
                        ans = Math.round((a / b) * 100) / 100;
                        break;
                }
                if (ans !== undefined && ans !== 0) answerSet.add(ans);
            }
        }
    }
    return Array.from(answerSet);
}

// Fisher–Yates shuffle (in-place).
function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Generates a randomized bingo sheet grid using the given settings.
// Always uses unique answers (one per distinct result), regardless of the
// global duplicates setting. 0 is excluded as a possible answer.
export function generateSheet(gridSize: GridSize, s: Settings): SheetResult {
    const cellCount = gridSize * gridSize;

    const pool = uniqueAnswers(s);
    if (pool.length < cellCount) {
        return {
            ok: false,
            error: `Nicht genug einzigartige Ergebnisse für ein ${gridSize}×${gridSize}-Blatt. Gefunden: ${pool.length}, benötigt: ${cellCount}. Bitte Einstellungen anpassen (z. B. größeren Zahlenbereich oder mehr Operationen).`,
        };
    }

    shuffle(pool);
    const chosen = pool.slice(0, cellCount);

    const grid: SheetCell[][] = [];
    for (let row = 0; row < gridSize; row++) {
        const rowCells: SheetCell[] = [];
        for (let col = 0; col < gridSize; col++) {
            rowCells.push({ answer: chosen[row * gridSize + col], free: false });
        }
        grid.push(rowCells);
    }

    return { ok: true, grid };
}
