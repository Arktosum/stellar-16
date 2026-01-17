
import { counter } from "./gate";
import { FlipFlop } from "./sequential";
const root = document.getElementById('root')!;

const FF = new FlipFlop();
// Test flip flop and give button for each input and show output visually.
let D = false;
let CLOCK = false;
const D_BUTTON = document.createElement('button');
D_BUTTON.innerText = `D: ${D ? 1 : 0}`;
D_BUTTON.onclick = () => {
    D = !D;
    D_BUTTON.innerText = `D: ${D ? 1 : 0}`;
    FF.runDFF(D, CLOCK);
    updateDisplay();
}
const CLOCK_BUTTON = document.createElement('button');
CLOCK_BUTTON.innerText = `CLOCK: ${CLOCK ? 1 : 0}`;
CLOCK_BUTTON.onclick = () => {
    CLOCK = !CLOCK;
    CLOCK_BUTTON.innerText = `CLOCK: ${CLOCK ? 1 : 0}`;
    FF.runDFF(D, CLOCK);
    updateDisplay();
}
const OUTPUT_DISPLAY = document.createElement('div');
function updateDisplay() {
    OUTPUT_DISPLAY.innerText = `FlipFlop State -> ${FF.displayState()}`;
}

updateDisplay();
root.appendChild(D_BUTTON);
root.appendChild(CLOCK_BUTTON);
root.appendChild(OUTPUT_DISPLAY);
