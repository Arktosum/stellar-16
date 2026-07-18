import './style.css';
import { Bus, Simulator, Wire } from './engine';
import { Register } from './memory';

const root = document.getElementById('root')!;
root.innerHTML = `
    <h1 class="app-title">Stellar-16 Architecture</h1>
    <div class="journal-chapter">
        <h1>Chapter 3: Sequential Logic (Re-established)</h1>
        <p>We have burned the CPU to the ground and returned to our most fundamental memory primitive: the 16-bit Register.</p>
        <div class="ide-panel">
            <h2>16-bit Register Testbench</h2>
            <div style="margin: 20px 0; padding: 15px; background: #1e293b; border-radius: 8px; font-family: monospace;">
                <div>
                    <label>In (16-bit Hex): </label>
                    <input type="text" id="reg-in" value="0000" maxlength="4">
                </div>
                <div style="margin-top: 10px;">
                    <label>Load (1-bit): </label>
                    <input type="checkbox" id="reg-load">
                </div>
                <div style="margin-top: 20px; font-weight: bold; color: #10b981;">
                    <span>Register Out: </span><span id="reg-out">0000</span>
                </div>
            </div>
            <div id="clock-panel"></div>
        </div>
    </div>
`;

const clockPanel = document.getElementById('clock-panel')!;
clockPanel.innerHTML = `
    <div class="clock-controls">
        <div id="clock-led" class="led led-off" style="width: 16px; height: 16px; margin-right: 10px;"></div>
        <span id="clock-status" style="width: 40px; font-weight: bold; font-size:12px;">LOW</span>
        <button id="btn-tick" class="btn btn-sm">Tick ↗</button>
        <button id="btn-tock" class="btn btn-sm">Tock ↘</button>
    </div>
`;

const clockLed = document.getElementById('clock-led')!;
const clockStatus = document.getElementById('clock-status')!;

Simulator.onClockTick = (state: boolean) => {
    clockLed.className = \`led \${state ? 'led-on' : 'led-off'}\`;
    clockStatus.innerText = state ? 'HIGH' : 'LOW';
    updateUI();
};

document.getElementById('btn-tick')!.onclick = () => Simulator.tick();
document.getElementById('btn-tock')!.onclick = () => Simulator.tock();

// Build Register
const inBus = new Bus(16, 'inBus');
const loadWire = new Wire('load');
const outBus = new Bus(16, 'outBus');
const reg = new Register(inBus, loadWire, outBus, 'Reg');

const inInput = document.getElementById('reg-in') as HTMLInputElement;
const loadInput = document.getElementById('reg-load') as HTMLInputElement;
const outDisplay = document.getElementById('reg-out')!;

function updateSim() {
    inBus.setValue(parseInt(inInput.value, 16) || 0);
    loadWire.state = loadInput.checked;
    Simulator.stabilize();
    updateUI();
}

function updateUI() {
    outDisplay.innerText = outBus.getValue().toString(16).padStart(4, '0').toUpperCase();
}

inInput.oninput = updateSim;
loadInput.onchange = updateSim;

updateSim();
