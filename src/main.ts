import './style.css';
import { Wire, Simulator, Bus } from './engine';
import { CPU } from './cpu';
import { ROM32K } from './memory';
import { Assembler } from './assembler';

// Global event to tell all testbenches to refresh their UI
window.addEventListener('refreshUI', () => {
    // handled by individual testbenches
});

// Removed createGateTestbench

const root = document.getElementById('root')!;
root.innerHTML = `
    <h1 class="app-title">Stellar-16 Architecture</h1>
    <div class="nav-bar">
        <button id="tab-journal" class="tab tab-active">The Journal</button>
        <button id="tab-testbench" class="tab">The Testbench</button>
    </div>
    <div id="view-journal" class="view view-active">
        <div class="journal-container">
            <div class="journal-chapter">
                <h1>Chapter 1: The Primitive</h1>
                <p>Welcome to Stellar-16. We are embarking on a journey to build a complete 16-bit computer entirely from scratch. But when we say "scratch", what do we mean?</p>
                <p>In our physical universe, everything is built from fundamental particles. In the digital universe, everything is built from logical primitives. Our chosen primitive is the <strong>NAND gate</strong> (Not-AND). It is computationally universal, meaning any computable function can be expressed using only NAND gates.</p>
                <p>Our physics engine perfectly simulates the physical world. If you wire a gate improperly, or create an unclocked feedback loop, the simulator will detect the oscillation—just as a real circuit would burn out or freeze. From this single NAND gate, we derived the NOT, AND, OR, and XOR gates.</p>
            </div>
            <div class="journal-chapter">
                <h1>Chapter 2: Combinational Logic</h1>
                <p>Once we had basic logic gates, we needed to make them wider. A single wire carries one bit, but a computer operates on <strong>Buses</strong>—bundles of parallel wires.</p>
                <p>We built 16-bit versions of our gates (Not16, And16, Or16, Mux16) by laying down 16 individual logic gates side-by-side.</p>
                <p>With these, we constructed the <strong>Arithmetic Logic Unit (ALU)</strong>. The ALU is the masterpiece of combinational logic. It takes two 16-bit numbers and, using just 6 control bits, can compute addition, subtraction, bitwise AND, and negation. Amazingly, the ALU contains zero IF statements—it computes every possible outcome simultaneously and uses Multiplexers to route the correct answer to the output!</p>
            </div>
            <div class="journal-chapter">
                <h1>Chapter 3: Sequential Logic</h1>
                <p>Combinational circuits are brilliant, but they have amnesia. The moment their inputs change, their outputs change. A computer needs memory to "remember" state.</p>
                <p>To achieve this, we introduced the <strong>Clock</strong>. A clock generates a continuous train of alternating signals: Tick (high) and Tock (low). We also introduced the <strong>Data Flip-Flop (DFF)</strong>, a component that captures its input exactly when the clock ticks, and holds it steady regardless of what happens next.</p>
                <p>By combining a DFF with a Multiplexer, we built a <strong>Bit Register</strong>. If the <span style="font-family: monospace;">load</span> wire is high, it captures the input. If it's low, it feeds its own output back into its input, remembering the bit forever. We stacked 16 of these together to form our first <strong>16-bit Register</strong>.</p>
            </div>
            <div class="journal-chapter">
                <h1>Chapter 4: The RISC Instruction Set Architecture</h1>
                <p>A CPU is just a bunch of wires unless it knows what to do. We have completely redesigned the architecture to use a <strong>16-bit RISC Load/Store Architecture</strong> with an 8-register file (R0-R7).</p>
                <p>There are two types of instructions: LDI (Load Immediate) and EXEC (Execute).</p>
                
                <div class="isa-viewer">
                    <h3>Type 0: LDI (Load Immediate)</h3>
                    <div class="isa-bits">
                        <div class="bit-box bit-op"><span>TYPE</span>0</div>
                        <div class="bit-box bit-d" style="flex:3;"><span>DEST (3)</span>REG</div>
                        <div class="bit-box bit-j" style="flex:12;"><span>IMM (12)</span>VALUE</div>
                    </div>
                    <p style="text-align:center; color:#94a3b8; font-size:0.9rem; margin-top:-10px;">Loads a 12-bit immediate value into DEST.</p>

                    <h3 style="margin-top:30px;">Type 1: EXECUTE (ALU & Branch)</h3>
                    <div class="isa-bits">
                        <div class="bit-box bit-op"><span>TYPE</span>1</div>
                        <div class="bit-box bit-op" style="flex:4;"><span>OP (4)</span>OPC</div>
                        <div class="bit-box bit-d" style="flex:3;"><span>DEST (3)</span>REG</div>
                        <div class="bit-box bit-a" style="flex:3;"><span>SRCA (3)</span>REG</div>
                        <div class="bit-box bit-c" style="flex:3;"><span>SRCB (3)</span>REG</div>
                        <div class="bit-box" style="flex:2;"><span>- (2)</span>N/A</div>
                    </div>
                    
                    <div class="isa-tables">
                        <div class="isa-table-container comp">
                            <h3>OPCODES</h3>
                            <table class="isa-table">
                                <tr><th>OP (4)</th><th>Inst</th><th>Operation</th></tr>
                                <tr><td>0000</td><td>ADD</td><td>DEST = A + B</td></tr>
                                <tr><td>0001</td><td>SUB</td><td>DEST = A - B</td></tr>
                                <tr><td>0010</td><td>AND</td><td>DEST = A & B</td></tr>
                                <tr><td>0011</td><td>OR</td><td>DEST = A | B</td></tr>
                                <tr><td>0100</td><td>NOT</td><td>DEST = ~A</td></tr>
                                <tr><td>0101</td><td>XOR</td><td>DEST = A ^ B</td></tr>
                                <tr><td>0110</td><td>SHL</td><td>DEST = A &lt;&lt; 1</td></tr>
                                <tr><td>0111</td><td>SHR</td><td>DEST = A &gt;&gt; 1</td></tr>
                                <tr><td>1000</td><td>LD</td><td>DEST = RAM[A]</td></tr>
                                <tr><td>1001</td><td>ST</td><td>RAM[A] = B</td></tr>
                                <tr><td>1010</td><td>BEQ</td><td>if A==B, PC = PC+1+Imm</td></tr>
                                <tr><td>1011</td><td>BNE</td><td>if A!=B, PC = PC+1+Imm</td></tr>
                                <tr><td>1100</td><td>JMP</td><td>PC = A</td></tr>
                            </table>
                        </div>
                        <div class="isa-table-container dest">
                            <h3>REGISTERS</h3>
                            <table class="isa-table">
                                <tr><th>Code</th><th>Reg</th></tr>
                                <tr><td>000</td><td>R0 (Zero)</td></tr>
                                <tr><td>001</td><td>R1</td></tr>
                                <tr><td>010</td><td>R2</td></tr>
                                <tr><td>011</td><td>R3</td></tr>
                                <tr><td>100</td><td>R4</td></tr>
                                <tr><td>101</td><td>R5</td></tr>
                                <tr><td>110</td><td>R6</td></tr>
                                <tr><td>111</td><td>R7 (SP)</td></tr>
                            </table>
                        </div>
                        <div class="isa-table-container jump">
                            <h3 style="color:#f8fafc">Notes</h3>
                            <p style="font-size:0.9rem; color:#cbd5e1; padding:10px; text-align:left;">
                                <strong>R0</strong> is hardwired to 0. Writing to it is ignored.<br><br>
                                <strong>ST (Store)</strong> ignores DEST.<br><br>
                                <strong>BEQ/BNE</strong> will be expanded with pipeline support. Currently, they use immediate offsets in the future, but our 16-bit encoding has no room for Imm in EXEC instructions! <em>(Wait, we'll need to figure this out before OS)</em>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="view-testbench" class="view">
        <div class="ide-container">
            <div class="ide-panel ide-editor">
                <h2>Assembly Editor</h2>
                <textarea id="asm-editor" spellcheck="false">// --- Hello World Counter ---
LDI R1, 0      // Counter
LDI R2, 1      // Increment
LDI R3, 5      // Target
LDI R4, LOOP   // Loop Start
LDI R5, HALT   // Halt Address

LOOP:
SUB R6, R1, R3 // R6 = R1 - 5
BEQZ R6, R5    // if R6==0, jump to HALT
ADD R1, R1, R2 // R1++
JMP R4         // jump to LOOP

HALT:
JMP R5         // Infinite loop</textarea>
                <div class="ide-controls">
                    <button id="btn-assemble" class="btn">Assemble & Flash ROM</button>
                </div>
            </div>

            <div class="ide-panel ide-motherboard">
                <h2>Motherboard</h2>
                <div id="mb-container" style="position:relative; flex:1; overflow:hidden;">
                    <canvas id="mb-canvas" style="display: block; width: 100%; height: 100%; cursor: grab;"></canvas>
                </div>
                <div id="clock-panel" class="clock-panel-small">
                    <!-- Clock injected here -->
                </div>
            </div>

            <div class="ide-panel ide-state">
                <h2>System State</h2>
                <div class="state-table">
                    <h3>Registers</h3>
                    <table>
                        <tr><th>PC</th><td id="st-pc">0</td></tr>
                        <tr><th>R0</th><td id="st-r0">0</td></tr>
                        <tr><th>R1</th><td id="st-r1">0</td></tr>
                        <tr><th>R2</th><td id="st-r2">0</td></tr>
                        <tr><th>R3</th><td id="st-r3">0</td></tr>
                        <tr><th>R4</th><td id="st-r4">0</td></tr>
                        <tr><th>R5</th><td id="st-r5">0</td></tr>
                        <tr><th>R6</th><td id="st-r6">0</td></tr>
                        <tr><th>R7</th><td id="st-r7">0</td></tr>
                    </table>
                    <h3>Data RAM</h3>
                    <table>
                        <tr><th>0</th><td id="st-m0">0</td></tr>
                        <tr><th>1</th><td id="st-m1">0</td></tr>
                        <tr><th>2</th><td id="st-m2">0</td></tr>
                        <tr><th>3</th><td id="st-m3">0</td></tr>
                    </table>
                </div>
            </div>
        </div>
    </div>
`;

// Tab Logic
const tabJournal = document.getElementById('tab-journal')!;
const tabTestbench = document.getElementById('tab-testbench')!;
const viewJournal = document.getElementById('view-journal')!;
const viewTestbench = document.getElementById('view-testbench')!;

tabJournal.onclick = () => {
    tabJournal.classList.add('tab-active');
    tabTestbench.classList.remove('tab-active');
    viewJournal.classList.add('view-active');
    viewTestbench.classList.remove('view-active');
};
tabTestbench.onclick = () => {
    tabTestbench.classList.add('tab-active');
    tabJournal.classList.remove('tab-active');
    viewTestbench.classList.add('view-active');
    viewJournal.classList.remove('view-active');
};

// Removed grid
const clockPanel = document.getElementById('clock-panel')!;

// --- Clock UI ---
clockPanel.innerHTML = `
    <div class="clock-controls" style="margin:0; padding:0;">
        <div id="clock-led" class="led led-off" style="width: 16px; height: 16px; margin-right: 10px;"></div>
        <span id="clock-status" style="width: 40px; font-weight: bold; font-size:12px;">LOW</span>
        <canvas id="clock-wave" width="100" height="30" style="margin-right: 15px;"></canvas>
        <button id="btn-tick" class="btn btn-sm">Tick ↗</button>
        <button id="btn-tock" class="btn btn-sm">Tock ↘</button>
        <button id="btn-pulse" class="btn btn-sm">Pulse ↗↘</button>
        <div class="auto-clock" style="margin-left:15px; font-size:12px;">
            <label>Auto:</label>
            <input type="checkbox" id="auto-clock-toggle">
            <input type="range" id="clock-speed" min="50" max="1000" value="500" style="width:60px;">
            <span id="speed-label">500ms</span>
        </div>
    </div>
`;

const clockLed = document.getElementById('clock-led')!;
const clockStatus = document.getElementById('clock-status')!;
const canvas = document.getElementById('clock-wave') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Oscilloscope state
const waveHistory: boolean[] = new Array(150).fill(false);
let currentClockState = false;

function drawWave() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    
    const stepX = canvas.width / waveHistory.length;
    for (let i = 0; i < waveHistory.length; i++) {
        const x = i * stepX;
        const y = waveHistory[i] ? 10 : 30; // 10 is HIGH, 30 is LOW
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            // Draw square wave transitions
            if (waveHistory[i] !== waveHistory[i-1]) {
                ctx.lineTo(x, waveHistory[i-1] ? 10 : 30);
                ctx.lineTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
    }
    ctx.stroke();
}

// Update wave history at 60fps regardless of clock ticks
setInterval(() => {
    waveHistory.shift();
    waveHistory.push(currentClockState);
    drawWave();
}, 1000 / 60);

Simulator.onClockTick = (state: boolean) => {
    currentClockState = state;
    clockLed.className = `led ${state ? 'led-on' : 'led-off'}`;
    clockStatus.innerText = state ? 'HIGH' : 'LOW';
    window.dispatchEvent(new Event('refreshUI'));
};

document.getElementById('btn-tick')!.onclick = () => Simulator.tick();
document.getElementById('btn-tock')!.onclick = () => Simulator.tock();
document.getElementById('btn-pulse')!.onclick = () => {
    Simulator.tick();
    setTimeout(() => Simulator.tock(), 100);
};

let clockInterval: any = null;
const autoToggle = document.getElementById('auto-clock-toggle') as HTMLInputElement;
const speedSlider = document.getElementById('clock-speed') as HTMLInputElement;
const speedLabel = document.getElementById('speed-label')!;

function updateAutoClock() {
    if (clockInterval) clearInterval(clockInterval);
    if (autoToggle.checked) {
        let isHigh = false;
        clockInterval = setInterval(() => {
            isHigh = !isHigh;
            if (isHigh) Simulator.tick();
            else Simulator.tock();
        }, parseInt(speedSlider.value) / 2);
    }
}
autoToggle.onchange = updateAutoClock;
speedSlider.oninput = () => {
    speedLabel.innerText = `${speedSlider.value}ms`;
    updateAutoClock();
};

// --- Build the Circuits ---
const inM = new Bus(16, "inM");
const instruction = new Bus(16, "instruction");
const reset = new Wire("reset");
const outM = new Bus(16, "outM");
const writeM = new Wire("writeM");
const addressM = new Bus(16, "addressM");
const pcOutput = new Bus(16, "pc");

const rom = new ROM32K(pcOutput, instruction, "ROM");
const cpu = new CPU(inM, instruction, reset, outM, writeM, addressM, pcOutput);

const mbCanvas = document.getElementById('mb-canvas') as HTMLCanvasElement;
const mbCtx = mbCanvas.getContext('2d')!;
const container = document.getElementById('mb-container')!;

// Assembler Logic
document.getElementById('btn-assemble')!.onclick = () => {
    const code = (document.getElementById('asm-editor') as HTMLTextAreaElement).value;
    try {
        const machineCode = Assembler.assemble(code);
        rom.loadProgram(machineCode);
        
        // Reset PC
        reset.state = true;
        Simulator.tick();
        Simulator.tock();
        reset.state = false;
        
        Simulator.stabilize();
        window.dispatchEvent(new Event('refreshUI'));
        
        // Log to console for debugging
        console.log("Assembled:", machineCode.map(x => x.toString(16).padStart(4, '0')));
    } catch (e: any) {
        alert("Assembler Error:\n" + e.message);
    }
};

// Setup High DPI Canvas
function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    mbCanvas.width = rect.width * dpr;
    mbCanvas.height = rect.height * dpr;
    mbCtx.setTransform(dpr, 0, 0, dpr, 0, 0); // reset scale to dpr
}
window.addEventListener('resize', () => {
    resizeCanvas();
    drawMotherboard();
});
resizeCanvas();

// Panning and Zooming State
let mbScale = 0.3; // start zoomed out to see the massive board
let mbPanX = 100;
let mbPanY = 100;
let isPanning = false;
let startPanX = 0;
let startPanY = 0;

// Nodes Definition
const nodes = [
    { id: 'pc', title: 'Program Counter', x: 100, y: 300, w: 160, h: 80, val: () => (cpu.outputs.pc as Bus).getValue().toString() },
    { id: 'rom', title: 'Instruction ROM', subtitle: '(16-bit)', x: 400, y: 150, w: 200, h: 350, val: () => instruction.getValue().toString(16).padStart(4, '0').toUpperCase() },
    { id: 'decoder', title: 'Instruction Decoder', x: 750, y: 150, w: 350, h: 120, val: () => `D:${cpu.destBus.getValue()} A:${cpu.srcABus.getValue()} B:${cpu.srcBBus.getValue()}` },
    { id: 'control', title: 'Control Unit', x: 750, y: 400, w: 160, h: 100, val: () => `TYPE:${cpu.typeWire.state?1:0} OPC:${cpu.opcBus.getValue()}` },
    { id: 'regfile', title: 'REGFILE', subtitle: '8x16-bit', x: 1300, y: 300, w: 250, h: 400, val: () => `A:${cpu.regAOutBus.getValue()} B:${cpu.regBOutBus.getValue()}` },
    { id: 'alu', title: 'ALU', x: 1800, y: 300, w: 250, h: 250, val: () => (cpu.outputs.outM as Bus).getValue().toString(), flags: () => `ZR:${cpu.zr.state ? 1 : 0} NG:${cpu.ng.state ? 1 : 0}` },
    { id: 'ram', title: 'Data RAM', x: 2300, y: 300, w: 250, h: 400, val: () => '', flags: () => `AddrM: ${(cpu.outputs.addressM as Bus).getValue()}` },
    { id: 'regmux', title: 'WriteSrc Mux', x: 1800, y: 650, w: 150, h: 80, val: () => cpu.regWriteDataBus.getValue().toString() }
];

interface WireDef {
    path: [number, number][];
    label: string;
    labelPos: [number, number];
    active: () => boolean;
    junctions?: [number, number][];
    highlight?: boolean;
    subLabels?: { text: string, pos: [number, number], font?: string }[];
}

const wires: WireDef[] = [
    // PC Loop
    { path: [[100, 320], [50, 320], [50, 360], [100, 360]], label: '+1 Every tock!', labelPos: [15, 345], active: () => true },
    
    // PC to ROM
    { path: [[260, 340], [400, 340]], label: '16-bit Address', labelPos: [270, 330], active: () => (cpu.outputs.pc as Bus).getValue() !== 0 },
    
    // ROM to Decoder
    { path: [[600, 210], [750, 210]], label: 'Selected Instruction', labelPos: [610, 200], active: () => instruction.getValue() !== 0 },
    
    // Decoder to Control Unit (TYPE & OPC)
    { path: [[780, 270], [780, 400]], label: '', labelPos: [0, 0], active: () => true, subLabels: [
        { text: '1 bit', pos: [780, 290], font: '10px sans-serif' },
        { text: cpu.typeWire.state?'1':'0', pos: [780, 310] },
        { text: 'TYPE', pos: [780, 330] }
    ]},
    { path: [[830, 270], [830, 400]], label: '', labelPos: [0, 0], active: () => true, subLabels: [
        { text: '4 bits', pos: [830, 290], font: '10px sans-serif' },
        { text: cpu.opcBus.getValue().toString(2).padStart(4,'0'), pos: [830, 310] },
        { text: 'OPC', pos: [830, 330] }
    ]},

    // Decoder to RegFile (DEST, SRCA, SRCB)
    { path: [[900, 270], [900, 600], [1300, 600]], label: 'Write Add.', labelPos: [1200, 590], active: () => true, subLabels: [
        { text: '3 bits', pos: [900, 290], font: '10px sans-serif' },
        { text: cpu.destBus.getValue().toString(2).padStart(3,'0'), pos: [900, 310] },
        { text: 'DEST', pos: [900, 330] }
    ]},
    { path: [[960, 270], [960, 400], [1300, 400]], label: 'Read Add. A', labelPos: [1180, 390], active: () => true, subLabels: [
        { text: '3 bits', pos: [960, 290], font: '10px sans-serif' },
        { text: cpu.srcABus.getValue().toString(2).padStart(3,'0'), pos: [960, 310] },
        { text: 'SRCA', pos: [960, 330] }
    ]},
    { path: [[1020, 270], [1020, 500], [1300, 500]], label: 'Read Add. B', labelPos: [1180, 490], active: () => true, subLabels: [
        { text: '3 bits', pos: [1020, 290], font: '10px sans-serif' },
        { text: cpu.srcBBus.getValue().toString(2).padStart(3,'0'), pos: [1020, 310] },
        { text: 'SRCB', pos: [1020, 330] }
    ]},

    // Decoder to Mux (IMM)
    { path: [[1080, 270], [1080, 710], [1800, 710]], label: 'IMM (12-bit)', labelPos: [1100, 700], active: () => cpu.immBus.getValue() !== 0, subLabels: [
        { text: '12 bits', pos: [1080, 290], font: '10px sans-serif' },
        { text: cpu.immBus.getValue().toString(2).padStart(12,'0'), pos: [1080, 310] },
        { text: 'IMM', pos: [1080, 330] }
    ]},

    // Control Unit Outputs
    { path: [[800, 500], [800, 600]], label: 'REGFILE', labelPos: [800, 620], active: () => cpu.regWriteWire.state, highlight: true, subLabels: [
        { text: 'REGWRITE', pos: [800, 520], font: 'bold 12px sans-serif' },
        { text: '↓', pos: [800, 540] }
    ]},
    { path: [[1425, 230], [1425, 300]], label: '', labelPos: [0,0], active: () => cpu.regWriteWire.state, highlight: true, subLabels: [
        { text: 'REGWRITE', pos: [1425, 210], font: 'bold 12px sans-serif' }
    ]},
    { path: [[860, 500], [860, 600]], label: '', labelPos: [0, 0], active: () => cpu.memWriteWire.state, subLabels: [
        { text: 'MEMWRITE', pos: [860, 520] }, { text: '↓', pos: [860, 540] }
    ]},
    { path: [[2425, 230], [2425, 300]], label: '', labelPos: [0,0], active: () => cpu.memWriteWire.state, highlight: true, subLabels: [
        { text: 'MEMWRITE', pos: [2425, 210], font: 'bold 12px sans-serif' }
    ]},
    { path: [[920, 500], [920, 600]], label: 'ALU', labelPos: [920, 620], active: () => true, subLabels: [
        { text: 'ALU CONTROLS', pos: [920, 520], font: 'bold 12px sans-serif' },
        { text: '↓', pos: [920, 540] }
    ]},

    // RegFile to ALU (A & B)
    { path: [[1550, 380], [1800, 380]], label: 'OutA', labelPos: [1650, 370], active: () => cpu.regAOutBus.getValue() !== 0 },
    { path: [[1550, 480], [1800, 480]], label: 'OutB', labelPos: [1650, 470], active: () => cpu.regBOutBus.getValue() !== 0 },

    // RegFile to RAM (Addr & Data)
    { path: [[1680, 380], [1680, 250], [2300, 250]], label: 'AddressM', labelPos: [2000, 240], active: () => cpu.regAOutBus.getValue() !== 0, junctions: [[1680, 380]] },
    { path: [[1730, 480], [1730, 280], [2300, 280]], label: 'Data In', labelPos: [2000, 270], active: () => cpu.regBOutBus.getValue() !== 0, junctions: [[1730, 480]] },

    // ALU to Mux & RAM
    { path: [[2050, 425], [2150, 425], [2150, 670], [1950, 670]], label: 'ALUOut', labelPos: [2080, 550], active: () => (cpu.outputs.outM as Bus).getValue() !== 0 },
    { path: [[2150, 425], [2300, 425]], label: 'Data In (RAM)', labelPos: [2200, 415], active: () => true, junctions: [[2150, 425]] },

    // RAM to Mux
    { path: [[2550, 500], [2600, 500], [2600, 690], [1950, 690]], label: 'MemOut', labelPos: [2610, 600], active: () => inM.getValue() !== 0 },

    // Mux back to RegFile WriteData
    { path: [[1800, 690], [1250, 690], [1250, 650], [1300, 650]], label: 'WriteData', labelPos: [1500, 680], active: () => cpu.regWriteDataBus.getValue() !== 0 }
];

function drawArrow(x: number, y: number, angle: number, color: string) {
    mbCtx.save();
    mbCtx.translate(x, y);
    mbCtx.rotate(angle);
    mbCtx.beginPath();
    mbCtx.moveTo(0, 0);
    mbCtx.lineTo(-12, 6);
    mbCtx.lineTo(-12, -6);
    mbCtx.closePath();
    mbCtx.fillStyle = color;
    mbCtx.fill();
    mbCtx.restore();
}

function drawMotherboard() {
    const rect = container.getBoundingClientRect();
    
    mbCtx.save();
    mbCtx.setTransform(1, 0, 0, 1, 0, 0);
    // Fill background with White
    mbCtx.fillStyle = '#ffffff';
    mbCtx.fillRect(0, 0, mbCanvas.width, mbCanvas.height);
    mbCtx.restore();
    
    mbCtx.save();
    mbCtx.translate(mbPanX, mbPanY);
    mbCtx.scale(mbScale, mbScale);
    
    // Draw Grid (Light grey for whiteboard)
    mbCtx.fillStyle = '#f8fafc';
    const gridSize = 40;
    const startX = Math.floor(-mbPanX / mbScale / gridSize) * gridSize - gridSize;
    const startY = Math.floor(-mbPanY / mbScale / gridSize) * gridSize - gridSize;
    const endX = startX + (rect.width / mbScale) + gridSize * 2;
    const endY = startY + (rect.height / mbScale) + gridSize * 2;
    
    for (let x = startX; x < endX; x += gridSize) {
        for (let y = startY; y < endY; y += gridSize) {
            mbCtx.fillRect(x - 1, y - 1, 2, 2);
        }
    }
    
    // Draw Wires
    mbCtx.font = '14px Inter, sans-serif';
    
    for (const wire of wires) {
        const isActive = wire.active();
        mbCtx.lineWidth = isActive ? 3 : 1.5;
        mbCtx.strokeStyle = isActive ? '#000000' : '#cbd5e1';
        mbCtx.fillStyle = mbCtx.strokeStyle;
        
        mbCtx.beginPath();
        const p = wire.path;
        mbCtx.moveTo(p[0][0], p[0][1]);
        for (let i = 1; i < p.length; i++) {
            mbCtx.lineTo(p[i][0], p[i][1]);
        }
        mbCtx.stroke();
        
        // Draw Arrowhead at the end
        if (p.length >= 2) {
            const pLast = p[p.length - 1];
            const pPrev = p[p.length - 2];
            const angle = Math.atan2(pLast[1] - pPrev[1], pLast[0] - pPrev[0]);
            drawArrow(pLast[0], pLast[1], angle, mbCtx.strokeStyle as string);
        }
        
        // Draw Junctions
        if (wire.junctions) {
            for (const j of wire.junctions) {
                mbCtx.beginPath();
                mbCtx.arc(j[0], j[1], isActive ? 5 : 3, 0, Math.PI * 2);
                mbCtx.fill();
            }
        }
        
        // Draw Primary Label
        if (wire.label) {
            mbCtx.textAlign = 'left';
            if (wire.highlight) {
                const metrics = mbCtx.measureText(wire.label);
                mbCtx.fillStyle = '#fef08a'; // Yellow highlight
                mbCtx.fillRect(wire.labelPos[0] - 2, wire.labelPos[1] - 12, metrics.width + 4, 16);
                mbCtx.fillStyle = '#000000';
            }
            mbCtx.fillText(wire.label, wire.labelPos[0], wire.labelPos[1]);
        }
        
        // Draw SubLabels (like the bit extractions)
        if (wire.subLabels) {
            mbCtx.textAlign = 'center';
            for (const sub of wire.subLabels) {
                mbCtx.font = sub.font || '12px Inter, sans-serif';
                if (wire.highlight && sub.text === 'REGWRITE' || sub.text === 'MEMWRITE') {
                    const metrics = mbCtx.measureText(sub.text);
                    mbCtx.fillStyle = '#fef08a';
                    mbCtx.fillRect(sub.pos[0] - metrics.width/2 - 2, sub.pos[1] - 10, metrics.width + 4, 14);
                }
                mbCtx.fillStyle = '#000000';
                mbCtx.fillText(sub.text, sub.pos[0], sub.pos[1]);
            }
            mbCtx.font = '14px Inter, sans-serif'; // reset
        }
    }
    
    // Draw Nodes
    for (const node of nodes) {
        // Box
        mbCtx.fillStyle = '#ffffff';
        mbCtx.strokeStyle = '#000000';
        mbCtx.lineWidth = 2;
        
        mbCtx.beginPath();
        // Use rect instead of roundRect for that hand-drawn feel
        mbCtx.rect(node.x, node.y, node.w, node.h);
        mbCtx.fill();
        mbCtx.stroke();
        
        // Title
        mbCtx.fillStyle = '#000000';
        mbCtx.font = '16px Inter, sans-serif';
        mbCtx.textAlign = 'center';
        mbCtx.fillText(node.title, node.x + node.w / 2, node.y + 30);
        
        if ((node as any).subtitle) {
            mbCtx.font = '14px Inter, sans-serif';
            mbCtx.fillText((node as any).subtitle, node.x + node.w / 2, node.y + 50);
        }
        
        // Value Text (instead of a dark box)
        if (node.id !== 'ram') {
            mbCtx.font = 'bold 16px monospace';
            const valY = (node as any).subtitle ? node.y + 80 : node.y + 60;
            mbCtx.fillText(node.val(), node.x + node.w / 2, valY);
        }
        
        // Flags
        if (node.flags) {
            mbCtx.font = '14px monospace';
            mbCtx.fillText(node.flags(), node.x + node.w / 2, node.y + node.h - 15);
        }
    }
    
    mbCtx.restore();
}

// Add Pan/Zoom Handlers
container.addEventListener('mousedown', (e) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    isPanning = true;
    startPanX = e.clientX - mbPanX;
    startPanY = e.clientY - mbPanY;
    container.style.cursor = 'grabbing';
});

window.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    mbPanX = e.clientX - startPanX;
    mbPanY = e.clientY - startPanY;
    drawMotherboard();
});

window.addEventListener('mouseup', () => {
    isPanning = false;
    container.style.cursor = 'grab';
});

container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    const wheel = e.deltaY < 0 ? 1 : -1;
    const zoom = Math.exp(wheel * zoomIntensity);
    
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    mbPanX = mouseX - (mouseX - mbPanX) * zoom;
    mbPanY = mouseY - (mouseY - mbPanY) * zoom;
    mbScale *= zoom;
    
    drawMotherboard();
}, { passive: false });

function updateUIState() {
    // Update System State Table
    document.getElementById('st-pc')!.innerText = pcOutput.getValue().toString();
    
    const regVals = [
        cpu.regFile.r0.outBus.getValue(),
        cpu.regFile.r1.outBus.getValue(),
        cpu.regFile.r2.outBus.getValue(),
        cpu.regFile.r3.outBus.getValue(),
        cpu.regFile.r4.outBus.getValue(),
        cpu.regFile.r5.outBus.getValue(),
        cpu.regFile.r6.outBus.getValue(),
        cpu.regFile.r7.outBus.getValue()
    ];
    for (let i = 0; i < 8; i++) {
        document.getElementById(`st-r${i}`)!.innerText = regVals[i].toString();
    }
    
    // We don't have a real RAM chip yet, so we'll just mock it or skip it for now.
    // In reality, cpu.outputs.outM and addressM are exported. 
    
    drawMotherboard();
}

// Hook into global refresh
window.addEventListener('refreshUI', () => {
    updateUIState();
});

// Init
updateUIState();
Simulator.stabilize();
updateUIState();
