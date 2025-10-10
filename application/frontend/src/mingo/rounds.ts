import { Task } from "./task";

export type Round = {
    id: string;
    tasks: Task[];
    timestamp: number;
};
