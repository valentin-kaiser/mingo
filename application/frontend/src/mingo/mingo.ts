import { elements, showExercise, showPlaceholder } from "./dom";
import { Exercise } from "./exercise";
import { Round } from "./rounds";
import { settings, Settings } from "./settings";
import { generateSheet, GridSize } from "./sheet";
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
        this.setup();
    }

    setup() {
        this.load();
        this.updateBingoButton();
        this.updateProgress();
        if (this.current) {
            this.current.bingo ? this.bingo() : showExercise(this.current.last());
            this.list();
        }

        elements.next.addEventListener('click', () => this.next());
        elements.new.addEventListener('click', () => this.new());
        elements.continue.addEventListener('click', () => this.continue());
        elements.bingo.addEventListener('click', () => this.bingo());
        elements.reset.addEventListener('click', () => this.reset());
        elements.rounds.open.addEventListener('click', () => this.history());
        elements.rounds.close.addEventListener('click', () => elements.rounds.dialog.close());
        elements.sheet.open.addEventListener('click', () => this.openSheet());
        elements.sheet.close.addEventListener('click', () => elements.sheet.dialog.close());
        elements.sheet.gridSize.addEventListener('change', () => this.refreshSheetPreview());
        elements.sheet.regenerate.addEventListener('click', () => this.refreshSheetPreview());
        elements.sheet.print.addEventListener('click', () => this.printSheet());
        elements.sheet.showLogo.addEventListener('change', () => this.refreshSheetPreview());
        elements.sheet.showInstructions.addEventListener('change', () => this.refreshSheetPreview());
        elements.sheet.copies.addEventListener('change', () => this.refreshSheetPreview());
        elements.settings.open.addEventListener('click', () => elements.settings.dialog.showModal());
        elements.settings.close.addEventListener('click', () => elements.settings.dialog.close());
        elements.settings.save.addEventListener('click', () => {
            if (!confirm('Einstellungen speichern? Die laufende Runde wird zurückgesetzt.')) return;
            storage.saveSettings(this.settings);
            this.current = new Round();
            this.updateBingoButton();
            this.updateProgress();
            showPlaceholder();
            this.list();
            this.save();
            elements.settings.dialog.close();
        });

        elements.settings.inputs.maxRange.addEventListener('input', (e: Event) => {
            const target = e.currentTarget as HTMLInputElement;
            elements.settings.labels.maxRange.textContent = `1–${target.value}`;
        });
        elements.settings.labels.maxRange.textContent = `1–${elements.settings.inputs.maxRange.value}`;

        window.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                this.next();
            }
        });
    }

    // Load state from localStorage.
    load() {
        this.current = storage.loadCurrentRound();
        this.rounds = storage.loadRounds();
        // Apply saved settings to the DOM via the singleton setters so that both
        // the game (which reads settings.* directly) and the sheet generator see
        // the correct values. Keep this.settings pointing at the live singleton.
        const saved = storage.loadSettings();
        settings.operations  = saved.operations;
        settings.maxRange    = saved.maxRange;
        settings.noNegative  = saved.noNegative;
        settings.wholeDivision = saved.wholeDivision;
        settings.duplicates  = saved.duplicates;
    }

    // Save state to localStorage.
    save() {
        storage.saveCurrentRound(this.current);
        storage.saveRounds(this.rounds);
        storage.saveSettings(this.settings);
    }

    // Generate and show the next exercise.
    next() {
        let exercise = this.current?.new();
        if (!exercise) {
            elements.note.textContent = 'Keine weiteren Aufgaben verfügbar. Drücke „Bingo!“, um die Runde zu beenden.';
            elements.board.style.display = 'none';
            elements.bingo.style.display = 'block';
            elements.next.style.display = 'none';
            elements.new.hidden = false;
            elements.continue.hidden = true;
            this.updateBingoButton();
            this.updateProgress();
            this.save();
            return;
        }
        showExercise(exercise!);
        this.list();
        this.updateBingoButton();
        this.updateProgress();
        this.save();
    }

    // List all exercises, optionally showing results.
    list(results: boolean = false) {
        if (!this.current) return;
        if (!this.current.length()) {
            elements.list.style.display = 'none';
            elements.note.textContent = 'Noch keine Aufgaben. Klicke „Weiter“, um die erste zu erstellen.';
            return;
        }

        elements.list.style.display = 'block';
        const rows = this.current.list().map((e: Exercise, i: number) =>
            `<tr>
            <td style="width:42px; opacity:.7">${i + 1}</td>
            <td>${e.expression}</td>
            <td style="width:24px; text-align:center">=</td>
            <td><strong>${results ? e.answer : '✱'}</strong></td>
            </tr>`
        ).slice().reverse().join('');

        elements.list.innerHTML = `<table><tbody>${rows}</tbody></table>`;
    }

    // Mark the round as complete, show all results, and celebrate.
    bingo() {
        if (!this.current) return;
        this.current.bingo = true;
        this.list(true);
        elements.note.textContent = '🎉 Bingo! Alle Lösungen unten sichtbar.';
        elements.board.style.display = 'none';
        elements.bingo.style.display = 'none';
        elements.next.style.display = 'none';
        elements.new.hidden = false;
        elements.continue.hidden = false;
        this.celebrate();
        this.save();
    }

    // Bingo not yet achieved; continue the current round.
    continue() {
        if (!this.current) return;
        this.current.bingo = false;
        showExercise(this.current.last());
        elements.note.textContent = 'Auf „Bingo!“ drücken, wenn ihr fertig seid – oder „Weiter“ für die nächste Aufgabe.';
        elements.board.style.display = 'block';
        elements.bingo.style.display = 'block';
        elements.next.style.display = 'block';
        elements.new.hidden = true;
        elements.continue.hidden = true;
        this.updateBingoButton();
        this.updateProgress();
        this.list();
        this.save();
    }

    // Enable or disable the Bingo button based on current round state.
    updateBingoButton() {
        elements.bingo.disabled = !(this.current && this.current.length() >= 4);
    }

    updateProgress() {
        if (!this.current) return;
        elements.progress.style.display = this.current.remaining() ? 'grid' : 'none';
        elements.progress.textContent = `${this.current.length()} / ${this.current.length() + this.current.remaining()}`;
    }

    // Start a new round, saving the current one if it exists.
    new() {
        if (!this.current) return null;
        this.rounds.push(this.current);
        this.current = new Round();
        elements.note.textContent = 'Auf „Bingo!“ drücken, wenn ihr fertig seid – oder „Weiter“ für die nächste Aufgabe.';
        elements.board.style.display = 'block';
        elements.bingo.style.display = 'block';
        elements.next.style.display = 'block';
        elements.new.hidden = true;
        elements.continue.hidden = true;
        showPlaceholder();
        this.updateProgress();
        this.updateBingoButton();
        this.list();
        this.save();
    }

    // Show a balloon celebration animation.
    celebrate(count: number = 32): void {
        elements.celebration.innerHTML = '';
        const W = window.innerWidth;
        for (let i = 0; i < count; i++) {
            const b = document.createElement('span');
            b.className = 'balloon';
            b.textContent = '🎈';
            const startX = Math.random() * W;
            const drift = (Math.random() * 2 - 1) * (W * 0.35);
            const dur = (1 + Math.random() * 3).toFixed(2) + 's';
            const delay = (Math.random() * 0.8).toFixed(2) + 's';
            (b.style as CSSStyleDeclaration).left = startX + 'px';
            b.style.setProperty('--rise-duration', dur);
            b.style.setProperty('--rise-x', drift + 'px');
            (b.style as CSSStyleDeclaration).animationDelay = delay;
            elements.celebration.appendChild(b);
        }
        elements.board.classList.add('winner-glow');
        setTimeout(() => elements.board.classList.remove('winner-glow'), 1300);
        setTimeout(() => elements.celebration.innerHTML = '', 9000);
        if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
    }

    // Reset the entire application state, clearing localStorage and reloading the page.
    reset() {
        if (!confirm('Alle gespeicherten Runden und Einstellungen löschen?')) return;
        this.current = new Round();
        this.rounds = [];
        settings.operations    = ['+', '-', '*', '/'];
        settings.maxRange      = 10;
        settings.noNegative    = true;
        settings.wholeDivision = true;
        settings.duplicates    = false;
        this.list();
        storage.saveCurrentRound(this.current);
        storage.saveRounds(this.rounds);
        storage.saveSettings(this.settings);
        location.reload();
    }

    openSheet() {
        this.refreshSheetPreview();
        elements.sheet.dialog.showModal();
    }

    // Builds the HTML for a single bingo sheet document (header + instructions + grid).
    // Returns null if the answer pool is too small.
    private buildSheetHtml(gridSize: GridSize): string | null {
        const result = generateSheet(gridSize, this.settings);
        if (!result.ok) return null;

        const showLogo = elements.sheet.showLogo.checked;
        const showInstructions = elements.sheet.showInstructions.checked;

        const headerHtml = showLogo
            ? `<div class="sheet-doc-header">
                <div class="sheet-doc-logo">M</div>
                <div>
                    <p class="sheet-doc-title">Mathe-Bingo</p>
                    <p class="sheet-doc-subtitle">Mingo &ndash; Kleines Einmaleins &amp; Grundrechenarten</p>
                </div>
               </div>`
            : '';

        const instructionsHtml = showInstructions
            ? `<ol class="sheet-instructions">
                <li>Löse die angezeigte Aufgabe im Kopf.</li>
                <li>Findest du das Ergebnis auf deinem Zettel? Kreise es ein.</li>
                <li>Eine volle Reihe (waagerecht, senkrecht oder diagonal)? Ruf laut: <strong>BINGO!</strong></li>
               </ol>`
            : '';

        const gridHtml = result.grid
            .map(row =>
                row.map(cell => `<div class="sheet-cell">${cell.answer}</div>`).join('')
            ).join('');

        return `<div class="sheet-document">
            ${headerHtml}
            ${instructionsHtml}
            <div class="sheet-grid" style="--cols:${gridSize}">${gridHtml}</div>
        </div>`;
    }

    refreshSheetPreview() {
        const gridSize = parseInt(elements.sheet.gridSize.value) as GridSize;

        // Validate pool size with a dry run
        const probe = generateSheet(gridSize, this.settings);
        if (!probe.ok) {
            elements.sheet.error.textContent = probe.error;
            elements.sheet.error.classList.remove('hidden');
            elements.sheet.preview.innerHTML = '';
            elements.sheet.print.disabled = true;
            return;
        }

        elements.sheet.error.classList.add('hidden');
        elements.sheet.print.disabled = false;

        const copies = Math.max(1, parseInt(elements.sheet.copies.value) || 1);

        const pages: string[] = [];
        for (let i = 0; i < copies; i++) {
            const html = this.buildSheetHtml(gridSize);
            if (!html) break;
            const label = copies > 1
                ? `<p class="sheet-copies-badge">Version ${i + 1} von ${copies}</p>`
                : '';
            pages.push(`<div class="sheet-preview-page">${label}${html}</div>`);
        }

        elements.sheet.preview.innerHTML = pages.join('');
    }

    printSheet() {
        const gridSize = parseInt(elements.sheet.gridSize.value) as GridSize;
        const copies = Math.max(1, parseInt(elements.sheet.copies.value) || 1);

        const pages: string[] = [];
        for (let i = 0; i < copies; i++) {
            const html = this.buildSheetHtml(gridSize);
            if (!html) return;
            pages.push(`<div class="sheet-page">${html}</div>`);
        }

        const printCss = `
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: system-ui, -apple-system, sans-serif; background: #fff; color: #000; }
            @page { size: A4; margin: 12mm 14mm; }
            .sheet-page { page-break-after: always; break-after: page; }
            .sheet-page:last-child { page-break-after: avoid; break-after: avoid; }
            .sheet-document { width: 100%; }
            .sheet-doc-header {
                display: flex; align-items: center; gap: 8pt;
                margin-bottom: 8pt; padding-bottom: 6pt;
                border-bottom: 0.5pt solid #ccc;
            }
            .sheet-doc-logo {
                width: 26pt; height: 26pt; border-radius: 4pt;
                border: 1.5pt solid #333; display: flex;
                align-items: center; justify-content: center;
                font-weight: 900; font-size: 13pt; flex-shrink: 0;
            }
            .sheet-doc-title { font-size: 14pt; font-weight: 700; color: #111; }
            .sheet-doc-subtitle { font-size: 8pt; color: #666; margin-top: 2pt; }
            .sheet-instructions {
                font-size: 9pt; color: #444;
                margin: 0 0 8pt; padding-left: 14pt; line-height: 1.7;
            }
            .sheet-instructions strong { color: #000; font-weight: 700; }
            .sheet-grid {
                display: grid;
                grid-template-columns: repeat(var(--cols), 1fr);
                gap: 1.5mm;
                width: 100%;
            }
            .sheet-cell {
                aspect-ratio: 1;
                display: flex; align-items: center; justify-content: center;
                border: 1pt solid #888;
                font-weight: 700; font-size: 16pt; color: #000;
            }
        `;

        const fullHtml = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>Bingo-Zettel</title>
<style>${printCss}</style>
</head>
<body>${pages.join('')}</body>
</html>`;

        const win = window.open('', '_blank');
        if (!win) return;
        win.document.open();
        win.document.write(fullHtml);
        win.document.close();
        win.focus();
        win.print();
        win.close();
    }

    history() {
        elements.rounds.dialog.showModal()

        if (!this.rounds.length) {
            elements.rounds.list.innerHTML = '<p>Noch keine gespeicherten Runden.</p>';
            return;
        }

        const roundsHtml = this.rounds.map((round, index) => {
            const date = round.name();
            const exercisesHtml = round.list().map((e, i) =>
                `<tr>
                <td style="width:42px; opacity:.7">${i + 1}</td>
                <td>${e.expression}</td>
                <td style="width:24px; text-align:center">=</td>
                <td><strong>${e.answer}</strong></td>
                </tr>`
            ).join('');
            return `<div class="round">
                <h3>Runde ${index + 1} <small>(${date})</small></h3>
                <table><tbody>${exercisesHtml}</tbody></table>
            </div>`;
        }).join('<hr/>');

        elements.rounds.list.innerHTML = `<div class="rounds-history">${roundsHtml}</div>`;
    }
}