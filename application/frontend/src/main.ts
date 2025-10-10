import { Boot } from "./mingo/mingo";

try {
    let m = Boot();
    // Set the mingo instance to the window for debugging purposes
    (window as any).mingo = m;
} catch (e) {
    console.error(e);
    localStorage.clear();
    location.reload();
}
