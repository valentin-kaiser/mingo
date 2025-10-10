import { settings } from "./settings";

export type Operator = '+' | '-' | '*' | '/';

export interface Task {
    expression: string;
    answer: string;
    operation: Operator;
    a: number;
    b: number;
    timestamp: number;
}

const random = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export function generate(): Task {
    const operations: Operator[] = settings.operations;

    let task: Task = {
        expression: '',
        answer: '',
        operation: '+',
        a: 0,
        b: 0,
        timestamp: Date.now(),
    };

    switch (operations[random(0, operations.length - 1)]) {
        case '+':
            task.operation = '+';
            task.a = random(1, settings.maxRange);
            task.b = random(1, settings.maxRange);
            task.answer = (task.a + task.b).toString();
            task.expression = `${task.a} + ${task.b}`;
            break;
        case '-':
            task.operation = '-';
            task.a = random(1, settings.maxRange);
            task.b = random(1, settings.maxRange);
            if (settings.noNegative && task.b > task.a) [task.a, task.b] = [task.b, task.a];
            task.answer = (task.a - task.b).toString();
            task.expression = `${task.a} - ${task.b}`;
            break;
        case '*':
            task.operation = '*';
            task.a = random(1, settings.maxRange);
            task.b = random(1, settings.maxRange);
            task.answer = (task.a * task.b).toString();
            task.expression = `${task.a} × ${task.b}`;
            break;
        case '/':
            task.operation = '/';
            task.b = random(1, settings.maxRange);
            task.a = settings.wholeDivision ? random(1, settings.maxRange) : task.b * random(1, settings.maxRange);
            task.answer = (task.a / task.b).toString();
            task.expression = `${task.a} ÷ ${task.b}`;
            break;
    }

    return task;
}