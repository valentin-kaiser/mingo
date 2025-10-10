
export const elements = {
  expression: $('#expression'),
  note: $('#note'),
  list: $('#list'),
  bingo: $button('#bingo'),
  next: $button('#next'),
  reset: $button('#reset'),
  controls: $('#controls'),
  board: $('#board'),
  settings: {
    dialog: $dialog('#settings'),
    inputs: {
      addition: $input('#op-addition'),
      subtraction: $input('#op-subtraction'),
      multiplication: $input('#op-multiplication'),
      division: $input('#op-division'),
      maxRange: $input('#max-range'),
      noNegative: $input('#no-negative'),
      wholeDivision: $input('#whole-division'),
    }
  },
};

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
