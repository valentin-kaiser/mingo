import * as dom from './dom';
import { Operator } from './task';

export type Settings = {
    operations: Operator[];
    maxRange: number;
    noNegative: boolean;
    wholeDivision: boolean;
};

export var settings: Settings = {
    get operations(): Operator[] {
        const ops: Operator[] = [];
        if (dom.elements.settings.inputs.addition.checked) ops.push('+');
        if (dom.elements.settings.inputs.subtraction.checked) ops.push('-');
        if (dom.elements.settings.inputs.multiplication.checked) ops.push('*');
        if (dom.elements.settings.inputs.division.checked) ops.push('/');

        return ops.length ? ops : ['+', '-', '*', '/'];
    },
    set operations(ops: Operator[]) {
        dom.elements.settings.inputs.addition.checked = ops.includes('+');
        dom.elements.settings.inputs.subtraction.checked = ops.includes('-');
        dom.elements.settings.inputs.multiplication.checked = ops.includes('*');
        dom.elements.settings.inputs.division.checked = ops.includes('/');
    },
    get maxRange(): number {
        const value = parseInt(dom.elements.settings.inputs.maxRange.value);
        return isNaN(value) || value < 1 ? 10 : value;
    },
    set maxRange(value: number) {
        dom.elements.settings.inputs.maxRange.value = value.toString();
    },
    get noNegative(): boolean {
        return dom.elements.settings.inputs.noNegative.checked;
    },
    set noNegative(value: boolean) {
        dom.elements.settings.inputs.noNegative.checked = value;
    },
    get wholeDivision(): boolean {
        return dom.elements.settings.inputs.wholeDivision.checked;
    },
    set wholeDivision(value: boolean) {
        dom.elements.settings.inputs.wholeDivision.checked = value;
    }
};