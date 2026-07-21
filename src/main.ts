import './stars';
import './style.css';
import { Wire, CompositeGate, NandGate, Simulator } from './engine';
import { NotGate, AndGate, OrGate, XorGate } from './gates';

const root = document.getElementById('root')!;
root.innerHTML = `
  <div class="min-h-screen bg-transparent text-gray-300 font-sans flex flex-col lg:flex-row overflow-hidden">
    <div class="w-full lg:w-1/3 p-6 lg:p-10 overflow-y-auto border-r border-white/10 bg-black/40 custom-scrollbar">
      <h1 class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-neon-cyan to-blue-500 mb-6 tracking-tight drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]">Stellar-16</h1>
      <div class="space-y-6 text-sm leading-relaxed text-gray-400">
        <p>
          Welcome to <strong class="text-neon-cyan font-bold">Stellar-16</strong>, a 16-bit CPU built entirely from scratch inside the browser.
        </p>
        <div class="p-5 bg-gray-900/50 border border-white/10 rounded-xl shadow-lg">
          <h3 class="text-lg font-bold text-white mb-2 flex items-center gap-2">
            The Rules of the Universe
          </h3>
          <ul class="list-disc pl-5 space-y-2">
            <li>The <strong>NAND</strong> gate is the only physical component that exists.</li>
            <li>Every abstraction (NOT, AND, OR, XOR, Memory, ALU) is literally just NAND gates wired together.</li>
            <li>The logic is evaluated by an Event-Driven Physics Engine. When a wire's voltage changes, it physically propagates electricity to connected gates.</li>
          </ul>
        </div>
        
        <p>
          Click the <strong class="text-neon-cyan">Inputs</strong> on the right to inject electricity into the circuit. Watch how it cascades through the raw NAND components to compute the final output.
        </p>
        <div id="gate-info-container" class="transition-all duration-300"></div>
  
        <a href="/journal.html" class="mt-8 inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            Explore the Physics of Memory
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>
        <a href="/alu.html" class="mt-4 inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-neon-emerald/10 hover:bg-neon-emerald/20 border border-neon-emerald/50 text-neon-emerald font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            Build the Arithmetic Logic Unit
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>
        <a href="/engine.html" class="mt-4 inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/50 text-purple-400 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            How the Simulator Works
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </a>
      </div>
    </div>
    <div class="w-full lg:w-2/3 p-4 lg:p-8 relative flex flex-col justify-center items-center">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.05)_0%,transparent_70%)] pointer-events-none"></div>
      <div class="bg-black/60 border border-white/10 rounded-2xl p-6 w-full max-w-4xl shadow-2xl relative z-10 backdrop-blur-md">
        <div class="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <h2 class="text-2xl font-bold text-white tracking-tight">Interactive Physics Engine</h2>
          <div class="flex gap-2 bg-gray-900/80 p-1.5 rounded-lg border border-white/5">
            <button class="gate-tab px-5 py-1.5 rounded-lg text-sm font-bold bg-neon-cyan/20 text-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all" data-gate="NAND">NAND</button>
            <button class="gate-tab px-5 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300 transition-all" data-gate="NOT">NOT</button>
            <button class="gate-tab px-5 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300 transition-all" data-gate="AND">AND</button>
            <button class="gate-tab px-5 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300 transition-all" data-gate="OR">OR</button>
            <button class="gate-tab px-5 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300 transition-all" data-gate="XOR">XOR</button>
            <button class="gate-tab px-5 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300 transition-all" data-gate="OSC">OSC</button>
          </div>
        </div>
        <div class="w-full bg-gray-900/50 rounded-xl border border-white/5 p-8 flex flex-col items-center justify-center min-h-[250px]">
          <svg id="schematic-svg" viewBox="-40 -10 380 140" class="w-full max-w-lg transition-all duration-500">
            <defs>
              <g id="nand-icon">
                <path d="M 0 0 L 15 0 A 15 15 0 0 1 15 30 L 0 30 Z" fill="#1e293b" stroke="#475569" stroke-width="2" />
                <circle cx="34" cy="15" r="4" fill="#1e293b" stroke="#475569" stroke-width="2" />
              </g>
              <g id="not-icon">
                <path d="M 0 0 L 25 15 L 0 30 Z" fill="#1e293b" stroke="#475569" stroke-width="2" />
                <circle cx="29" cy="15" r="4" fill="#1e293b" stroke="#475569" stroke-width="2" />
              </g>
            </defs>
            <g id="schematic-content"></g>
          </svg>
          <div id="osc-controls" class="hidden w-full max-w-sm mt-8 flex flex-col items-center gap-3">
             <label class="text-sm font-bold text-gray-400 flex justify-between w-full">
               <span>Propagation Delay</span>
               <span id="osc-speed-label" class="text-neon-cyan drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">500ms</span>
             </label>
             <input type="range" id="osc-speed" min="16" max="1000" step="16" value="500" class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer">
          </div>
        </div>
        <div class="mt-6 flex justify-between items-center text-sm font-mono text-gray-400">
          <span>Engine: <span class="text-neon-cyan">Stabilized</span></span>
          <span>Evaluated Gates: <span id="eval-count" class="text-white font-bold">0</span></span>
        </div>
      </div>
    </div>
  </div>
`;

const COLOR_OFF = '#374151'; 
const COLOR_ON = '#00f0ff'; 
const COLOR_OUT_ON = '#10b981'; 

const drawInput = (id: string, x: number, y: number, label: string) => `
    <g id="btn-toggle-${id}" class="cursor-pointer group">
      <circle id="node-${id}" cx="${x}" cy="${y}" r="8" fill="${COLOR_OFF}" class="transition-all duration-300 group-hover:stroke-white group-hover:stroke-2" />
      <text x="${x-15}" y="${y+5}" fill="#9ca3af" font-family="monospace" font-size="12" font-weight="bold" text-anchor="end">${label}</text>
    </g>
`;
const drawWire = (id: string, d: string) => `
    <path id="wire-${id}" d="${d}" fill="none" stroke="${COLOR_OFF}" stroke-width="3" class="transition-all duration-300" />
`;
const drawNand = (x: number, y: number) => `
    <use href="#nand-icon" x="${x}" y="${y}" />
`;
const drawNot = (x: number, y: number) => `
    <use href="#not-icon" x="${x}" y="${y}" />
`;
const drawOutput = (x: number, y: number) => `
    <g id="glow-out">
      <circle id="node-out" cx="${x}" cy="${y}" r="8" fill="${COLOR_OFF}" class="transition-all duration-300" />
      <text id="text-out" x="${x+15}" y="${y+5}" fill="${COLOR_OFF}" font-family="monospace" font-size="12" font-weight="bold" text-anchor="start">0</text>
    </g>
`;

const wireA = new Wire("A");
const wireB = new Wire("B");
const wireOut = new Wire("Out");

let currentActiveGate: CompositeGate | NandGate | NotGate | AndGate | OrGate | XorGate;
let activeGateType = "NAND";

const gateLayouts: Record<string, { render: () => string, setup: () => void }> = {
    "NAND": {
        setup: () => currentActiveGate = new NandGate(wireA, wireB, wireOut, "Test_NAND"),
        render: () => `
            ${drawInput('a', 20, 25, 'A')}
            ${drawInput('b', 20, 95, 'B')}
            ${drawWire('in-a', 'M 34 25 L 120 25 L 120 50 L 150 50')}
            ${drawWire('in-b', 'M 34 95 L 120 95 L 120 70 L 150 70')}
            ${drawNand(150, 45)}
            ${drawWire('out', 'M 188 60 L 260 60')}
            ${drawOutput(260, 60)}
        `
    },
    "NOT": {
        setup: () => currentActiveGate = new NotGate(wireA, wireOut, "Test_NOT"),
        render: () => `
            ${drawInput('a', 30, 60, 'IN')}
            ${drawWire('in-a', 'M 30 60 L 90 60 L 90 50 L 120 50 M 90 60 L 90 70 L 120 70')}
            ${drawNand(120, 45)}
            ${drawWire('out', 'M 158 60 L 230 60')}
            ${drawOutput(230, 60)}
        `
    },
    "AND": {
        setup: () => currentActiveGate = new AndGate(wireA, wireB, wireOut, "Test_AND"),
        render: () => `
            ${drawInput('a', 30, 40, 'A')}
            ${drawInput('b', 30, 80, 'B')}
            ${drawWire('in-a', 'M 30 40 L 70 40 L 70 50 L 90 50')}
            ${drawWire('in-b', 'M 30 80 L 70 80 L 70 70 L 90 70')}
            ${drawNand(90, 45)} <!-- NAND 1 -->
            ${drawWire('mid', 'M 128 60 L 140 60 L 140 50 L 160 50 M 140 60 L 140 70 L 160 70')}
            ${drawNand(160, 45)} <!-- NAND 2 (NOT) -->
            ${drawWire('out', 'M 198 60 L 250 60')}
            ${drawOutput(250, 60)}
        `
    },
    "OR": {
        setup: () => currentActiveGate = new OrGate(wireA, wireB, wireOut, "Test_OR"),
        render: () => `
            ${drawInput('a', 30, 35, 'A')}
            ${drawInput('b', 30, 85, 'B')}
            
            <!-- NOT A -->
            ${drawWire('in-a', 'M 30 35 L 50 35 L 50 25 L 70 25 M 50 35 L 50 45 L 70 45')}
            ${drawNand(70, 20)}
            
            <!-- NOT B -->
            ${drawWire('in-b', 'M 30 85 L 50 85 L 50 75 L 70 75 M 50 85 L 50 95 L 70 95')}
            ${drawNand(70, 70)}
            
            <!-- NAND -->
            ${drawWire('mid-a', 'M 108 35 L 125 35 L 125 50 L 150 50')}
            ${drawWire('mid-b', 'M 108 85 L 125 85 L 125 70 L 150 70')}
            ${drawNand(150, 45)}
            
            ${drawWire('out', 'M 188 60 L 250 60')}
            ${drawOutput(250, 60)}
        `
    },
    "XOR": {
        setup: () => currentActiveGate = new XorGate(wireA, wireB, wireOut, "Test_XOR"),
        render: () => `
            ${drawInput('a', 20, 25, 'A')}
            ${drawInput('b', 20, 95, 'B')}
            
            <!-- NAND 1 (center) -->
            ${drawWire('in-a-1', 'M 20 25 L 70 25 L 70 50 L 90 50')}
            ${drawWire('in-b-1', 'M 20 95 L 70 95 L 70 70 L 90 70')}
            ${drawNand(90, 45)}
            
            <!-- NAND 2 (top) -->
            ${drawWire('in-a-2', 'M 40 25 L 40 15 L 130 15')}
            ${drawWire('mid-1-top', 'M 128 60 L 128 35 L 130 35')}
            ${drawNand(130, 10)}
            
            <!-- NAND 3 (bottom) -->
            ${drawWire('in-b-3', 'M 40 95 L 40 105 L 120 105 L 120 95 L 130 95')}
            ${drawWire('mid-1-bot', 'M 128 60 L 128 75 L 130 75')}
            ${drawNand(130, 70)}
            
            <!-- NAND 4 (final) -->
            ${drawWire('mid-2', 'M 168 25 L 180 25 L 180 50 L 190 50')}
            ${drawWire('mid-3', 'M 168 85 L 180 85 L 180 70 L 190 70')}
            ${drawNand(190, 45)}
            
            ${drawWire('out', 'M 228 60 L 260 60')}
            ${drawOutput(260, 60)}
        `
    },
    "OSC": {
        setup: () => {
            currentActiveGate = new CompositeGate("Test_OSC");
            const n1 = new NotGate(wireOut, wireA, "N1");
            const n2 = new NotGate(wireA, wireB, "N2");
            const n3 = new NotGate(wireB, wireOut, "N3");
            currentActiveGate.addGate(n1);
            currentActiveGate.addGate(n2);
            currentActiveGate.addGate(n3);
            wireOut.state = false; // Kickstart the instability
        },
        render: () => `
            <text x="145" y="15" fill="#9ca3af" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">RING OSCILLATOR</text>
            ${drawWire('w3', 'M 223 60 L 250 60 L 250 100 L 40 100 L 40 60 L 50 60')}
            ${drawNot(50, 45)} <!-- N1 -->
            ${drawWire('w1', 'M 83 60 L 110 60')}
            ${drawNot(110, 45)} <!-- N2 -->
            ${drawWire('w2', 'M 143 60 L 170 60')}
            ${drawNot(170, 45)} <!-- N3 -->
            
            ${drawOutput(280, 60)}
            ${drawWire('out', 'M 203 60 L 280 60')}
        `
    }
};

let oscFrame: number;
let lastOscTime = 0;
let oscDelay = 500;

function tickOscillator(timestamp: number) {
    if (activeGateType === 'OSC') {
        if (!lastOscTime) lastOscTime = timestamp;
        if (timestamp - lastOscTime >= oscDelay) {
            Simulator.step(1);
            updateUI();
            lastOscTime = timestamp;
        }
        oscFrame = requestAnimationFrame(tickOscillator);
    }
}


const gateInfoData: Record<string, string> = {
    "NAND": `
        <div class="p-5 bg-gray-900/50 border border-neon-cyan/20 rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.05)]">
            <h3 class="text-lg font-bold text-white mb-2">NAND (Not-AND)</h3>
            <p class="mb-3 text-gray-400">Outputs 1 unless both inputs are 1. It is a <em>universal</em> gate, meaning every other gate in existence can be derived from it!</p>
            <div class="overflow-hidden rounded-lg border border-neon-cyan/20">
            <table class="w-full text-left text-xs font-mono">
                <thead class="bg-neon-cyan/10 text-neon-cyan">
                <tr><th class="px-3 py-2">A</th><th class="px-3 py-2">B</th><th class="px-3 py-2">OUT</th></tr>
                </thead>
                <tbody class="divide-y divide-neon-cyan/10">
                <tr id="tt-nand-00"><td class="px-3 py-2">0</td><td class="px-3 py-2">0</td><td class="px-3 py-2 text-neon-emerald">1</td></tr>
                <tr id="tt-nand-01"><td class="px-3 py-2">0</td><td class="px-3 py-2">1</td><td class="px-3 py-2 text-neon-emerald">1</td></tr>
                <tr id="tt-nand-10"><td class="px-3 py-2">1</td><td class="px-3 py-2">0</td><td class="px-3 py-2 text-neon-emerald">1</td></tr>
                <tr id="tt-nand-11"><td class="px-3 py-2">1</td><td class="px-3 py-2">1</td><td class="px-3 py-2 text-red-400">0</td></tr>
                </tbody>
            </table>
            </div>
        </div>
    `,
    "NOT": `
        <div class="p-5 bg-gray-900/50 border border-neon-cyan/20 rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.05)]">
            <h3 class="text-lg font-bold text-white mb-2">NOT (Inverter)</h3>
            <p class="mb-3 text-gray-400">Simply inverts the input. It is built by tying both inputs of a NAND gate together!</p>
            <div class="overflow-hidden rounded-lg border border-neon-cyan/20">
            <table class="w-full text-left text-xs font-mono">
                <thead class="bg-neon-cyan/10 text-neon-cyan">
                <tr><th class="px-3 py-2">IN</th><th class="px-3 py-2">OUT</th></tr>
                </thead>
                <tbody class="divide-y divide-neon-cyan/10">
                <tr id="tt-not-0"><td class="px-3 py-2">0</td><td class="px-3 py-2 text-neon-emerald">1</td></tr>
                <tr id="tt-not-1"><td class="px-3 py-2">1</td><td class="px-3 py-2 text-red-400">0</td></tr>
                </tbody>
            </table>
            </div>
        </div>
    `,
    "AND": `
        <div class="p-5 bg-gray-900/50 border border-neon-cyan/20 rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.05)]">
            <h3 class="text-lg font-bold text-white mb-2">AND</h3>
            <p class="mb-3 text-gray-400">Outputs 1 only if BOTH inputs are 1. Built by passing a NAND gate's output through a NOT gate.</p>
            <div class="overflow-hidden rounded-lg border border-neon-cyan/20">
            <table class="w-full text-left text-xs font-mono">
                <thead class="bg-neon-cyan/10 text-neon-cyan">
                <tr><th class="px-3 py-2">A</th><th class="px-3 py-2">B</th><th class="px-3 py-2">OUT</th></tr>
                </thead>
                <tbody class="divide-y divide-neon-cyan/10">
                <tr id="tt-and-00"><td class="px-3 py-2">0</td><td class="px-3 py-2">0</td><td class="px-3 py-2 text-red-400">0</td></tr>
                <tr id="tt-and-01"><td class="px-3 py-2">0</td><td class="px-3 py-2">1</td><td class="px-3 py-2 text-red-400">0</td></tr>
                <tr id="tt-and-10"><td class="px-3 py-2">1</td><td class="px-3 py-2">0</td><td class="px-3 py-2 text-red-400">0</td></tr>
                <tr id="tt-and-11"><td class="px-3 py-2">1</td><td class="px-3 py-2">1</td><td class="px-3 py-2 text-neon-emerald">1</td></tr>
                </tbody>
            </table>
            </div>
        </div>
    `,
    "OR": `
        <div class="p-5 bg-gray-900/50 border border-neon-cyan/20 rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.05)]">
            <h3 class="text-lg font-bold text-white mb-2">OR</h3>
            <p class="mb-3 text-gray-400">Outputs 1 if EITHER input is 1. Built by negating both inputs before feeding them into a NAND gate (De Morgan's Laws!).</p>
            <div class="overflow-hidden rounded-lg border border-neon-cyan/20">
            <table class="w-full text-left text-xs font-mono">
                <thead class="bg-neon-cyan/10 text-neon-cyan">
                <tr><th class="px-3 py-2">A</th><th class="px-3 py-2">B</th><th class="px-3 py-2">OUT</th></tr>
                </thead>
                <tbody class="divide-y divide-neon-cyan/10">
                <tr id="tt-or-00"><td class="px-3 py-2">0</td><td class="px-3 py-2">0</td><td class="px-3 py-2 text-red-400">0</td></tr>
                <tr id="tt-or-01"><td class="px-3 py-2">0</td><td class="px-3 py-2">1</td><td class="px-3 py-2 text-neon-emerald">1</td></tr>
                <tr id="tt-or-10"><td class="px-3 py-2">1</td><td class="px-3 py-2">0</td><td class="px-3 py-2 text-neon-emerald">1</td></tr>
                <tr id="tt-or-11"><td class="px-3 py-2">1</td><td class="px-3 py-2">1</td><td class="px-3 py-2 text-neon-emerald">1</td></tr>
                </tbody>
            </table>
            </div>
        </div>
    `,
    "XOR": `
        <div class="p-5 bg-gray-900/50 border border-neon-cyan/20 rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.05)]">
            <h3 class="text-lg font-bold text-white mb-2">XOR (Exclusive-OR)</h3>
            <p class="mb-3 text-gray-400">Outputs 1 only if inputs are DIFFERENT. Built with 4 NAND gates. It's the critical building block for mathematical addition!</p>
            <div class="overflow-hidden rounded-lg border border-neon-cyan/20">
            <table class="w-full text-left text-xs font-mono">
                <thead class="bg-neon-cyan/10 text-neon-cyan">
                <tr><th class="px-3 py-2">A</th><th class="px-3 py-2">B</th><th class="px-3 py-2">OUT</th></tr>
                </thead>
                <tbody class="divide-y divide-neon-cyan/10">
                <tr id="tt-xor-00"><td class="px-3 py-2">0</td><td class="px-3 py-2">0</td><td class="px-3 py-2 text-red-400">0</td></tr>
                <tr id="tt-xor-01"><td class="px-3 py-2">0</td><td class="px-3 py-2">1</td><td class="px-3 py-2 text-neon-emerald">1</td></tr>
                <tr id="tt-xor-10"><td class="px-3 py-2">1</td><td class="px-3 py-2">0</td><td class="px-3 py-2 text-neon-emerald">1</td></tr>
                <tr id="tt-xor-11"><td class="px-3 py-2">1</td><td class="px-3 py-2">1</td><td class="px-3 py-2 text-red-400">0</td></tr>
                </tbody>
            </table>
            </div>
        </div>
    `,
    "OSC": `
        <div class="p-5 bg-gray-900/50 border border-neon-cyan/20 rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.05)]">
            <h3 class="text-lg font-bold text-white mb-2">Ring Oscillator</h3>
            <p class="mb-3 text-gray-400">By chaining an odd number of NOT gates in a loop, the signal is constantly trying to invert itself, creating an infinite oscillation! Our physics engine prevents the browser from freezing by throttling this loop.</p>
        </div>
    `
};

function loadGate(gateType: string) {
    cancelAnimationFrame(oscFrame);
    activeGateType = gateType;
    const infoContainer = document.getElementById('gate-info-container');
    if (infoContainer) {
        infoContainer.innerHTML = gateInfoData[gateType] || '';
    }

    Simulator.clearQueue();
    wireA.disconnectAll();
    wireB.disconnectAll();
    wireOut.disconnectAll();
    
    // Update SVG
    document.getElementById('schematic-content')!.innerHTML = gateLayouts[gateType].render();
    
    // Toggle OSC controls
    const oscControls = document.getElementById('osc-controls');
    if (oscControls) {
        if (gateType === 'OSC') {
            oscControls.classList.remove('hidden');
        } else {
            oscControls.classList.add('hidden');
        }
    }
    
    // Update Tabs
    document.querySelectorAll('.gate-tab').forEach(tab => {
        if (tab.getAttribute('data-gate') === gateType) {
            tab.className = "gate-tab px-5 py-1.5 rounded-lg text-sm font-bold bg-neon-cyan/20 text-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all";
        } else {
            tab.className = "gate-tab px-5 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300 transition-all";
        }
    });

    gateLayouts[gateType].setup();
    
    if (gateType !== 'OSC') {
        Simulator.stabilize();
    }
    
    bindUIEvents();
    updateUI();

    if (gateType === 'OSC') {
        lastOscTime = 0;
        oscFrame = requestAnimationFrame(tickOscillator);
    }
}

function bindUIEvents() {
    const btnToggleA = document.getElementById('btn-toggle-a');
    const btnToggleB = document.getElementById('btn-toggle-b');
    const oscSpeedSlider = document.getElementById('osc-speed') as HTMLInputElement;

    if (btnToggleA) {
        btnToggleA.onclick = () => {
            wireA.state = !wireA.state;
            Simulator.stabilize();
            updateUI();
        };
    }

    if (btnToggleB) {
        btnToggleB.onclick = () => {
            wireB.state = !wireB.state;
            Simulator.stabilize();
            updateUI();
        };
    }

    if (oscSpeedSlider) {
        oscSpeedSlider.oninput = (e) => {
            oscDelay = parseInt((e.target as HTMLInputElement).value);
            document.getElementById('osc-speed-label')!.innerText = oscDelay + 'ms';
        };
    }
}

function updateColor(id: string, state: boolean, isOutput: boolean = false) {
    const el = document.getElementById(id);
    if (!el) return;
    const color = state ? (isOutput ? COLOR_OUT_ON : COLOR_ON) : COLOR_OFF;
    
    if (el.tagName === 'circle') {
        el.setAttribute('fill', color);
        if (state) el.style.filter = `drop-shadow(0 0 8px ${color})`;
        else el.style.filter = 'none';
    } else if (el.tagName === 'path') {
        el.setAttribute('stroke', color);
    } else if (el.tagName === 'text') {
        el.setAttribute('fill', color);
    }
}

function updateUI() {

    // Truth table highlighting
    document.querySelectorAll('tr[id^="tt-"]').forEach(el => el.classList.remove('bg-neon-cyan/20', 'font-bold', 'text-white'));
    
    if (activeGateType === 'NOT') {
        const a = wireA.state ? 1 : 0;
        document.getElementById(`tt-not-${a}`)?.classList.add('bg-neon-cyan/20', 'font-bold', 'text-white');
    } else if (activeGateType !== 'OSC') {
        const a = wireA.state ? 1 : 0;
        const b = wireB.state ? 1 : 0;
        document.getElementById(`tt-${activeGateType.toLowerCase()}-${a}${b}`)?.classList.add('bg-neon-cyan/20', 'font-bold', 'text-white');
    }

    // Inputs
    updateColor('node-a', wireA.state);
    updateColor('wire-in-a', wireA.state);
    
    if (activeGateType === 'XOR') {
        updateColor('wire-in-a-1', wireA.state);
        updateColor('wire-in-a-2', wireA.state);
    }
    
    if (activeGateType !== 'NOT' && activeGateType !== 'OSC') {
        updateColor('node-b', wireB.state);
        updateColor('wire-in-b', wireB.state);
        if (activeGateType === 'XOR') {
            updateColor('wire-in-b-1', wireB.state);
            updateColor('wire-in-b-3', wireB.state);
        }
    }

    // Internal Wires based on physics state!
    if (activeGateType === 'AND') {
        const midState = ((currentActiveGate as AndGate).subGates[0].outputs.out as Wire).state;
        updateColor('wire-mid', midState);
    }
    else if (activeGateType === 'OR') {
        const midAState = ((currentActiveGate as OrGate).subGates[0].outputs.out as Wire).state;
        const midBState = ((currentActiveGate as OrGate).subGates[1].outputs.out as Wire).state;
        updateColor('wire-mid-a', midAState);
        updateColor('wire-mid-b', midBState);
    }
    else if (activeGateType === 'XOR') {
        const mid1State = ((currentActiveGate as XorGate).subGates[0].outputs.out as Wire).state;
        const mid2State = ((currentActiveGate as XorGate).subGates[1].outputs.out as Wire).state;
        const mid3State = ((currentActiveGate as XorGate).subGates[2].outputs.out as Wire).state;
        updateColor('wire-mid-1-top', mid1State);
        updateColor('wire-mid-1-bot', mid1State);
        updateColor('wire-mid-2', mid2State);
        updateColor('wire-mid-3', mid3State);
    }
    else if (activeGateType === 'OSC') {
        updateColor('wire-w3', wireOut.state);
        updateColor('wire-w1', wireA.state);
        updateColor('wire-w2', wireB.state);
    }

    // Output
    const outState = wireOut.state;
    updateColor('wire-out', outState, true);
    updateColor('node-out', outState, true);
    updateColor('text-out', outState, true);
    document.getElementById('text-out')!.textContent = outState ? '1' : '0';
    
    document.getElementById('eval-count')!.innerText = Simulator.gatesEvaluatedThisTick.toString();
}

// Bind tabs
document.querySelectorAll('.gate-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        loadGate((e.target as HTMLButtonElement).getAttribute('data-gate')!);
    });
});

// Initial load
loadGate('NAND');
