import { Exercise } from "./exercise";

export const elements = {
  expression: $('#expression'),
  note: $('#note'),
  list: $('#list'),
  bingo: $button('#bingo'),
  next: $button('#next'),
  new: $button('#new'),
  continue: $button('#continue'),
  reset: $button('#reset'),
  controls: $('#controls'),
  board: $('#board'),
  celebration: $('#celebration'),
  progress: $('#progress'),
  rounds: {
    dialog: $dialog('#roundsDialog'),
    open: $button('#roundsOpen'),
    close: $button('#roundsClose'),
    list: $('#roundsList'),
  },
  settings: {
    dialog: $dialog('#settings'),
    open: $button('#settingsOpen'),
    close: $button('#settingsClose'),
    save: $button('#settingsSave'),
    inputs: {
      addition: $input('#op-addition'),
      subtraction: $input('#op-subtraction'),
      multiplication: $input('#op-multiplication'),
      division: $input('#op-division'),
      maxRange: $input('#max-range'),
      noNegative: $input('#no-negative'),
      wholeDivision: $input('#whole-division'),
      duplicates: $input('#allow-duplicates'),
    },
    labels: {
      maxRange: $('#max-range-label'),
    },
  },
};


export function showExercise(exercise: Exercise | null) {
  if (!exercise) return;
  elements.expression.textContent = exercise.expression;
  elements.expression.dataset.answer = exercise.answer.toString();
  elements.expression.classList.remove('placeholder');
  elements.note.textContent = 'Auf „Bingo!“ drücken, wenn ihr fertig seid – oder „Weiter“ für die nächste Aufgabe.';
}

export function showPlaceholder() {
  elements.expression.textContent = '? ? ?';
  elements.expression.removeAttribute('data-answer');
  elements.expression.classList.add('placeholder');
}


function $(selector: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

function $input(selector: string): HTMLInputElement {
  const el = document.querySelector<HTMLInputElement>(selector);
  if (!el) throw new Error(`Input not found: ${selector}`);
  return el;
}

function $button(selector: string): HTMLButtonElement {
  const el = document.querySelector<HTMLButtonElement>(selector);
  if (!el) throw new Error(`Button not found: ${selector}`);
  return el;
}

function $dialog(selector: string): HTMLDialogElement {
  const el = document.querySelector<HTMLDialogElement>(selector);
  if (!el) throw new Error(`Dialog not found: ${selector}`);
  return el;
}
