import './stars';
import './style.css';
import { Wire, Simulator, CompositeGate } from './engine';
import { SrLatch, DLatch, DFlipFlop } from './memory';

const root = document.getElementById('root')!;
root.innerHTML = `
  
  <div class="min-h-screen bg-transparent text-gray-300 font-sans flex flex-col lg:flex-row overflow-hidden">
    <!-- Left: The Journal -->
    <div class="w-full lg:w-1/3 p-6 lg:p-10 overflow-y-auto border-r border-white/10 bg-black/40 custom-scrollbar">
      
      <h1 class="text-4xl font-extrabold text-white mb-6 tracking-tight">The Physics of Memory</h1>
      
      <div class="space-y-6 text-sm leading-relaxed text-gray-400">
        <p>
          Up until now, our gates have been <strong class="text-neon-emerald">Combinational</strong>. The circuit has no concept of time, and no memory of what happened a microsecond ago. To build a computer, we need <strong class="text-neon-cyan">Sequential Logic</strong>—a way to trap an electrical signal in a loop.
        </p>
        
        <div class="p-5 bg-gray-900/50 border border-white/10 rounded-xl shadow-lg">
          <h3 class="text-lg font-bold text-white mb-2 flex items-center gap-2">
            1. The SR-Latch (The Foundation)
          </h3>
          <p class="mb-4">
            By cross-coupling two NAND gates, we create a bistable feedback loop. This is the atomic unit of memory. Pulling <strong class="text-white">SET</strong> High traps a '1' in the loop. Pulling <strong class="text-white">RESET</strong> High traps a '0'. Setting both High is <em>invalid</em> as it forces both outputs High, breaking the Q/Q̅ rule.
          </p>
          <div class="overflow-hidden rounded-lg border border-white/10">
            <table class="w-full text-left text-xs font-mono">
              <thead class="bg-black/50 text-gray-400">
                <tr><th class="px-3 py-2">SET</th><th class="px-3 py-2">RESET</th><th class="px-3 py-2">Q</th><th class="px-3 py-2">Q̅</th><th class="px-3 py-2">Action</th></tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr id="tt-sr-00" class="transition-colors duration-300"><td class="px-3 py-2">0</td><td class="px-3 py-2">0</td><td class="px-3 py-2">Latch</td><td class="px-3 py-2">Latch</td><td class="px-3 py-2 text-gray-500">Hold State</td></tr>
                <tr id="tt-sr-01" class="transition-colors duration-300"><td class="px-3 py-2">0</td><td class="px-3 py-2">1</td><td class="px-3 py-2 text-red-400">0</td><td class="px-3 py-2 text-neon-emerald">1</td><td class="px-3 py-2 text-red-400">Reset</td></tr>
                <tr id="tt-sr-10" class="transition-colors duration-300"><td class="px-3 py-2">1</td><td class="px-3 py-2">0</td><td class="px-3 py-2 text-neon-emerald">1</td><td class="px-3 py-2 text-red-400">0</td><td class="px-3 py-2 text-neon-emerald">Set</td></tr>
                <tr id="tt-sr-11" class="transition-colors duration-300"><td class="px-3 py-2">1</td><td class="px-3 py-2">1</td><td class="px-3 py-2 text-neon-emerald">1</td><td class="px-3 py-2 text-neon-emerald">1</td><td class="px-3 py-2 text-yellow-500">Invalid</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="p-5 bg-gray-900/50 border border-neon-cyan/20 rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.05)]">
          <h3 class="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <svg class="w-4 h-4 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            2. The D-Latch (Level-Triggered)
          </h3>
          <p class="mb-4">
            We abstract the SR-Latch into a single module and add Input Steering gates. When <strong class="text-white">Enable (E) is HIGH</strong>, the latch is "transparent" and output <strong class="text-white">Q</strong> follows <strong class="text-white">Data (D)</strong>. When Enable is LOW, the SR-Latch locks and ignores Data entirely, preventing invalid states!
          </p>
          <div class="overflow-hidden rounded-lg border border-neon-cyan/20">
            <table class="w-full text-left text-xs font-mono">
              <thead class="bg-neon-cyan/10 text-neon-cyan">
                <tr><th class="px-3 py-2">E</th><th class="px-3 py-2">D</th><th class="px-3 py-2">Q</th><th class="px-3 py-2">Q̅</th><th class="px-3 py-2">Action</th></tr>
              </thead>
              <tbody class="divide-y divide-neon-cyan/10">
                <tr id="tt-dl-00" class="transition-colors duration-300"><td class="px-3 py-2">0</td><td class="px-3 py-2">0</td><td class="px-3 py-2">Latch</td><td class="px-3 py-2">Latch</td><td class="px-3 py-2 text-gray-500">Hold State</td></tr>
                <tr id="tt-dl-01" class="transition-colors duration-300"><td class="px-3 py-2">0</td><td class="px-3 py-2">1</td><td class="px-3 py-2">Latch</td><td class="px-3 py-2">Latch</td><td class="px-3 py-2 text-gray-500">Hold State</td></tr>
                <tr id="tt-dl-10" class="transition-colors duration-300"><td class="px-3 py-2">1</td><td class="px-3 py-2">0</td><td class="px-3 py-2 text-red-400">0</td><td class="px-3 py-2 text-neon-emerald">1</td><td class="px-3 py-2 text-red-400">Reset</td></tr>
                <tr id="tt-dl-11" class="transition-colors duration-300"><td class="px-3 py-2">1</td><td class="px-3 py-2">1</td><td class="px-3 py-2 text-neon-emerald">1</td><td class="px-3 py-2 text-red-400">0</td><td class="px-3 py-2 text-neon-emerald">Set</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="p-5 bg-gray-900/50 border border-neon-emerald/20 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.05)]">
          <h3 class="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <svg class="w-4 h-4 text-neon-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            3. The D-Flip-Flop (Edge-Triggered)
          </h3>
          <p class="mb-4">
            The D-Latch's flaw: if Enable is HIGH, a spike in Data crashes through. We solve this by chaining two D-Latches. The Master reads Data when Clock is LOW. The Slave outputs it on the <em>rising edge</em> (or falling edge, depending on design) of the clock pulse, keeping CPUs synchronized!
          </p>
          <div class="overflow-hidden rounded-lg border border-neon-emerald/20">
            <table class="w-full text-left text-xs font-mono">
              <thead class="bg-neon-emerald/10 text-neon-emerald">
                <tr><th class="px-3 py-2">CLK</th><th class="px-3 py-2">D</th><th class="px-3 py-2">Q</th><th class="px-3 py-2">Q̅</th><th class="px-3 py-2">Action</th></tr>
              </thead>
              <tbody class="divide-y divide-neon-emerald/10">
                <tr id="tt-dff-00" class="transition-colors duration-300"><td class="px-3 py-2">0</td><td class="px-3 py-2">X</td><td class="px-3 py-2">Latch</td><td class="px-3 py-2">Latch</td><td class="px-3 py-2 text-gray-500">Hold State</td></tr>
                <tr id="tt-dff-10" class="transition-colors duration-300"><td class="px-3 py-2">1</td><td class="px-3 py-2">X</td><td class="px-3 py-2">Latch</td><td class="px-3 py-2">Latch</td><td class="px-3 py-2 text-gray-500">Hold State</td></tr>
                <tr id="tt-dff-rise0" class="transition-colors duration-300"><td class="px-3 py-2">↑</td><td class="px-3 py-2">0</td><td class="px-3 py-2 text-red-400">0</td><td class="px-3 py-2 text-neon-emerald">1</td><td class="px-3 py-2 text-red-400">Reset</td></tr>
                <tr id="tt-dff-rise1" class="transition-colors duration-300"><td class="px-3 py-2">↑</td><td class="px-3 py-2">1</td><td class="px-3 py-2 text-neon-emerald">1</td><td class="px-3 py-2 text-red-400">0</td><td class="px-3 py-2 text-neon-emerald">Set</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div class="mt-8 space-y-4">
          <a href="/" class="flex items-center justify-center gap-2 w-full py-3 px-4 bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to Physics Engine
          </a>
          <a href="/alu.html" class="flex items-center justify-center gap-2 w-full py-3 px-4 bg-neon-emerald/10 hover:bg-neon-emerald/20 border border-neon-emerald/50 text-neon-emerald font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              Next: The Arithmetic Logic Unit
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </a>
      </div>
    </div>

    <!-- Right: The Interactive Tester -->
    <div class="w-full lg:w-2/3 p-4 lg:p-8 relative flex flex-col justify-center items-center">
      <!-- Background Glow -->
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.05)_0%,transparent_70%)] pointer-events-none"></div>

      <div class="bg-black/60 border border-white/10 rounded-2xl p-6 w-full max-w-4xl shadow-2xl relative z-10 backdrop-blur-md">
        
        <div class="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <h2 class="text-2xl font-bold text-white tracking-tight">Interactive Tester</h2>
          <div class="flex gap-2 bg-gray-900/80 p-1.5 rounded-lg border border-white/5">
            <button id="btn-srlatch" class="tester-tab px-4 py-1.5 rounded-md text-sm font-bold text-gray-500 hover:text-gray-300 transition-all">SR-Latch</button>
            <button id="btn-dlatch" class="tester-tab px-4 py-1.5 rounded-md text-sm font-bold bg-neon-cyan/20 text-neon-cyan transition-all">D-Latch</button>
            <button id="btn-dff" class="tester-tab px-4 py-1.5 rounded-md text-sm font-bold text-gray-500 hover:text-gray-300 transition-all">D-Flip-Flop</button>
          </div>
        </div>

        <div class="flex flex-col mb-4 items-center gap-4">
           <button id="btn-auto-clock" class="px-6 py-2 rounded-full border border-gray-600 text-gray-400 font-bold hover:bg-gray-800 transition-all text-sm flex items-center gap-2">
             <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             <span id="btn-auto-text">Auto-Pulse Enable</span>
           </button>
        </div>

        <!-- Schematic Abstraction (SVG) -->
        <div class="w-full flex justify-center mb-6">
          <svg id="schematic-svg" viewBox="-60 -20 480 170" class="w-full transition-all duration-500 overflow-visible">
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
        </div>

        <!-- Timing Diagram (Smooth Canvas) -->
        <div class="bg-gray-900/50 p-4 rounded-xl border border-white/5 mb-6">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-bold text-gray-400 tracking-wider uppercase">Oscilloscope (Real-Time)</span>
          </div>
          <div class="relative w-full h-32 bg-black/40 rounded-lg border border-gray-800 overflow-hidden">
             <!-- Canvas Overlays for Labels -->
             <div class="absolute left-2 text-[10px] text-gray-400 font-mono" style="top: 14px;" id="label-top">D</div>
             <div class="absolute left-2 text-[10px] text-neon-cyan font-mono" style="top: 58px;" id="label-mid">E</div>
             <div class="absolute left-2 text-[10px] text-neon-emerald font-mono" style="top: 102px;" id="label-bot">Q</div>
             <canvas id="timing-canvas" width="1000" height="128" class="absolute inset-0 w-full h-full"></canvas>
          </div>
        </div>

        <div class="flex justify-between items-center text-sm font-mono text-gray-400">
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

const drawWire = (id: string, d: string) => `
    <path id="wire-${id}" d="${d}" fill="none" stroke="${COLOR_OFF}" stroke-width="2" class="transition-all duration-300" stroke-linejoin="round" />
`;
const drawNand = (x: number, y: number, id: string) => `
    <use href="#nand-icon" x="${x}" y="${y}" id="gate-${id}" class="transition-all duration-300" />
`;
const drawNot = (x: number, y: number, id: string) => `
    <use href="#not-icon" x="${x}" y="${y}" id="gate-${id}" class="transition-all duration-300" />
`;
const drawBlock = (id: string, x: number, y: number, w: number, h: number, label: string) => `
    <rect id="${id}" x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#1e293b" stroke="#475569" stroke-width="2" class="transition-all duration-300" />
    <text x="${x + w/2}" y="${y + h/2 + 4}" fill="#9ca3af" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">${label}</text>
`;

const drawInput = (id: string, x: number, y: number, label: string) => `
    <g id="btn-toggle-${id}" class="cursor-pointer group">
      <circle id="node-${id}" cx="${x}" cy="${y}" r="14" fill="${COLOR_OFF}" class="transition-all duration-300 group-hover:stroke-white group-hover:stroke-2" />
      <text id="text-${id}" x="${x}" y="${y+5}" fill="#9ca3af" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">0</text>
      <text x="${x}" y="${y+32}" fill="#9ca3af" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">${label}</text>
    </g>
`;

const drawOutput = (id: string, x: number, y: number, label: string) => `
    <g>
      <circle id="node-${id}" cx="${x}" cy="${y}" r="14" fill="${COLOR_OFF}" class="transition-all duration-300" />
      <text id="text-${id}" x="${x}" y="${y+5}" fill="#9ca3af" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">0</text>
      <text x="${x}" y="${y+32}" fill="#9ca3af" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">${label}</text>
    </g>
`;

const inTop = new Wire("Top");
const inBot = new Wire("Bot");
const outQ = new Wire("Q");
const outQBar = new Wire("QBar");

let currentMode: 'SR' | 'LATCH' | 'DFF' = 'LATCH';
let clockInterval: any = null;
let isAutoClock = false;
let currentCircuit: CompositeGate | null = null;

function renderSVG() {
    let svg = '';
    if (currentMode === 'SR') {
        document.getElementById('schematic-svg')!.setAttribute('viewBox', '0 -10 300 150');
        
        svg += drawNot(70, 0, 'sr_not_r');
        svg += drawNot(70, 70, 'sr_not_s');

        svg += drawNand(140, 10, 'sr_nand_q');
        svg += drawNand(140, 80, 'sr_nand_qbar');
        
        svg += drawWire('sr_q-feedback', `M 178 25 L 190 25 L 190 60 L 120 60 L 120 105 L 140 105`);
        svg += drawWire('sr_qbar-feedback', `M 178 95 L 200 95 L 200 120 L 110 120 L 110 35 L 140 35`);
        
        svg += drawInput('in-top', 20, 15, 'RESET');
        svg += drawWire('in-top-wire', 'M 34 15 L 70 15');
        svg += drawWire('sr-notr-out', 'M 103 15 L 140 15');
        
        svg += drawInput('in-bot', 20, 85, 'SET');
        svg += drawWire('in-bot-wire', 'M 34 85 L 70 85');
        svg += drawWire('sr-nots-out', 'M 103 85 L 140 85');
        
        svg += drawWire('out-q-wire', 'M 178 25 L 240 25');
        svg += drawOutput('out-q', 254, 25, 'Q');
        
        svg += drawWire('out-qbar-wire', 'M 178 95 L 240 95');
        svg += drawOutput('out-qbar', 254, 95, 'Q&#773;');

        document.getElementById('label-top')!.innerText = 'R';
        document.getElementById('label-mid')!.innerText = 'S';
        document.getElementById('btn-auto-text')!.innerText = 'Auto-Pulse SET';
    } 
    else if (currentMode === 'LATCH') {
        document.getElementById('schematic-svg')!.setAttribute('viewBox', '0 -10 360 150');
        
        svg += drawNot(50, 70, 'm_notD');
        svg += drawNand(110, 10, 'm_nand_s');
        svg += drawNand(110, 80, 'm_nand_r');
        
        svg += drawBlock('m_sr', 180, 15, 60, 90, 'SR');
        
        svg += drawInput('in-top', 20, 15, 'D');
        svg += drawWire('in-top-wire', 'M 34 15 L 45 15');
        svg += drawWire('m_d-to-not', `M 45 15 L 45 85 L 50 85 M 45 15 L 110 15`);
        
        svg += drawWire('m_not-to-nand_r', `M 83 85 L 110 85`);
        
        svg += drawWire('m_s-to-sr', `M 148 25 L 180 25`);
        svg += drawWire('m_r-to-sr', `M 148 95 L 180 95`);

        svg += drawInput('in-bot', 20, 105, 'E');
        svg += drawWire('in-bot-wire', 'M 34 105 L 90 105 L 90 35 L 110 35 M 90 105 L 110 105');
        
        svg += drawWire('out-q-wire', 'M 240 25 L 300 25');
        svg += drawOutput('out-q', 314, 25, 'Q');
        
        svg += drawWire('out-qbar-wire', 'M 240 95 L 300 95');
        svg += drawOutput('out-qbar', 314, 95, 'Q&#773;');

        document.getElementById('label-top')!.innerText = 'D';
        document.getElementById('label-mid')!.innerText = 'E';
        document.getElementById('btn-auto-text')!.innerText = 'Auto-Pulse Enable';
    } 
    else {
        document.getElementById('schematic-svg')!.setAttribute('viewBox', '0 -10 540 150');
        
        svg += drawBlock('m_latch', 100, 15, 100, 90, 'MASTER');
        svg += drawNot(230, 90, 'c_not');
        svg += drawBlock('s_latch', 320, 15, 100, 90, 'SLAVE');

        svg += drawInput('in-top', 20, 25, 'D');
        svg += drawWire('in-top-wire', 'M 34 25 L 100 25');
        
        svg += drawInput('in-bot', 20, 105, 'CLOCK');
        svg += drawWire('in-bot-wire', 'M 34 105 L 100 105 M 80 105 L 80 125 L 210 125 L 210 105 L 230 105');
        
        svg += drawWire('master-to-slave', 'M 200 25 L 320 25');
        svg += drawWire('slave-clk', 'M 263 105 L 320 105');

        svg += drawWire('out-q-wire', 'M 420 25 L 480 25');
        svg += drawOutput('out-q', 494, 25, 'Q');
        
        svg += drawWire('out-qbar-wire', 'M 420 95 L 480 95');
        svg += drawOutput('out-qbar', 494, 95, 'Q&#773;');

        document.getElementById('label-top')!.innerText = 'D';
        document.getElementById('label-mid')!.innerText = 'C';
        document.getElementById('btn-auto-text')!.innerText = 'Auto-Pulse Clock';
    }
    document.getElementById('schematic-content')!.innerHTML = svg;

    document.getElementById('btn-toggle-in-top')!.onclick = () => {
        inTop.state = !inTop.state;
        Simulator.stabilize();
        updateUI();
    };

    document.getElementById('btn-toggle-in-bot')!.onclick = () => {
        inBot.state = !inBot.state;
        Simulator.stabilize();
        updateUI();
    };
}

function loadCircuit() {
    Simulator.clearQueue();
    inTop.disconnectAll();
    inBot.disconnectAll();
    outQ.disconnectAll();
    outQBar.disconnectAll();

    renderSVG();

    if (currentMode === 'SR') {
        currentCircuit = new SrLatch(inTop, inBot, outQ, outQBar, "Tester_SR");
        inTop.state = false;
        inBot.state = false;
    } else if (currentMode === 'LATCH') {
        currentCircuit = new DLatch(inTop, inBot, outQ, outQBar, "Tester_DLatch");
        inTop.state = false;
        inBot.state = false;
    } else {
        currentCircuit = new DFlipFlop(inTop, inBot, outQ, outQBar, "Tester_DFF");
        inTop.state = false;
        inBot.state = false;
    }

    Simulator.stabilize();
    
    // Kickstart
    inBot.state = !inBot.state;
    Simulator.stabilize();
    inBot.state = !inBot.state;
    Simulator.stabilize();

    history = [];
    updateUI();
}

const updateNode = (id: string, state: boolean, isOutput: boolean = false) => {
    const color = state ? (isOutput ? COLOR_OUT_ON : COLOR_ON) : COLOR_OFF;
    const textColor = state ? '#0B0F19' : '#9ca3af';
    
    const circle = document.getElementById(`node-${id}`);
    const text = document.getElementById(`text-${id}`);
    
    if (circle) {
        circle.setAttribute('fill', color);
        if (state) {
            circle.style.filter = `drop-shadow(0 0 10px ${color})`;
        } else {
            circle.style.filter = 'none';
        }
    }
    if (text) {
        text.innerHTML = state ? '1' : '0';
        text.setAttribute('fill', textColor);
    }
};

function updateColor(id: string, state: boolean, isOutput: boolean = false) {
    const el = document.getElementById(id);
    if (!el) return;
    const color = state ? (isOutput ? COLOR_OUT_ON : COLOR_ON) : COLOR_OFF;
    if (el.tagName === 'path' || el.tagName === 'rect' || el.tagName === 'use') {
        el.setAttribute('stroke', color);
    }
}


let lastClk = false;
function updateTruthTables() {
    // Reset all row highlights
    document.querySelectorAll('[id^="tt-"]').forEach(el => {
        el.classList.remove('bg-white/10', 'bg-neon-cyan/20', 'bg-neon-emerald/20', 'bg-neon-emerald/40', 'font-bold');
    });

    if (currentMode === 'SR') {
        const s = inBot.state ? 1 : 0;
        const r = inTop.state ? 1 : 0;
        document.getElementById(`tt-sr-${s}${r}`)?.classList.add('bg-white/10');
    } else if (currentMode === 'LATCH') {
        const e = inBot.state ? 1 : 0;
        const d = inTop.state ? 1 : 0;
        document.getElementById(`tt-dl-${e}${d}`)?.classList.add('bg-neon-cyan/20');
    } else {
        const c = inBot.state;
        const d = inTop.state ? 1 : 0;
        
        if (c && !lastClk) {
            // Rising edge!
            const riseRow = document.getElementById(`tt-dff-rise${d}`);
            if (riseRow) {
                riseRow.classList.add('bg-neon-emerald/40', 'font-bold');
                setTimeout(() => {
                    riseRow.classList.remove('bg-neon-emerald/40', 'font-bold');
                }, 800);
            }
        }
        
        // Steady state highlighting
        const rowId = c ? '10' : '00';
        document.getElementById(`tt-dff-${rowId}`)?.classList.add('bg-neon-emerald/20');
        
        lastClk = c;
    }
}

function updateUI() {
    updateTruthTables();
    updateNode('in-top', inTop.state);
    updateNode('in-bot', inBot.state);
    updateNode('out-q', outQ.state, true);
    updateNode('out-qbar', outQBar.state, true);
    document.getElementById('eval-count')!.innerText = Simulator.gatesEvaluatedThisTick.toString();

    updateColor('wire-in-top-wire', inTop.state);
    updateColor('wire-in-bot-wire', inBot.state);
    updateColor('wire-out-q-wire', outQ.state, true);
    updateColor('wire-out-qbar-wire', outQBar.state, true);

    if (currentMode === 'SR') {
        const sr = currentCircuit as SrLatch;
        const notR = (sr.subGates[1].outputs.out as Wire).state;
        const notS = (sr.subGates[0].outputs.out as Wire).state;
        const q = outQ.state;
        const qbar = outQBar.state;

        updateColor('wire-sr-notr-out', notR);
        updateColor('wire-sr-nots-out', notS);
        updateColor('wire-sr_q-feedback', q);
        updateColor('wire-sr_qbar-feedback', qbar);
    } 
    else if (currentMode === 'LATCH') {
        const dl = currentCircuit as DLatch;
        const notD = (dl.subGates[0].outputs.out as Wire).state;
        const sbar = (dl.subGates[1].outputs.out as Wire).state;
        const rbar = (dl.subGates[2].outputs.out as Wire).state;
        
        updateColor('wire-m_d-to-not', inTop.state);
        updateColor('wire-m_d-to-nand_s', inTop.state);
        updateColor('wire-m_not-to-nand_r', notD);
        updateColor('wire-m_s-to-sr', sbar);
        updateColor('wire-m_r-to-sr', rbar);
        
        updateColor('m_sr', outQ.state, true);
    } 
    else {
        const dff = currentCircuit as DFlipFlop;
        const clockBar = (dff.subGates[0].outputs.out as Wire).state;
        const masterQ = ((dff.subGates[1] as DLatch).subGates[3].outputs.outQ as Wire).state;
        
        updateColor('wire-master-to-slave', masterQ);
        updateColor('wire-slave-clk', clockBar);
        updateColor('m_latch', masterQ, true);
        updateColor('s_latch', outQ.state, true);
    }
}

// Smooth Oscilloscope Engine
type DataPoint = { t: number, d: boolean, c: boolean, q: boolean };
let history: DataPoint[] = [];
// animFrame removed
const TIME_WINDOW_MS = 5000;

function startTimingEngine() {
    function loop() {
        const now = Date.now();
        history.push({ t: now, d: inTop.state, c: inBot.state, q: outQ.state });
        history = history.filter(h => now - h.t <= TIME_WINDOW_MS);
        
        drawCanvasOscilloscope(now);
        requestAnimationFrame(loop);
    }
    loop();
}

function drawCanvasOscilloscope(now: number) {
    const canvas = document.getElementById('timing-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    if (history.length === 0) return;

    ctx.lineWidth = 2;
    const yOffsets = [20, 64, 108]; 
    const colors = ['#9ca3af', '#00f0ff', '#10b981'];

    for (let sig = 0; sig < 3; sig++) {
        ctx.strokeStyle = colors[sig];
        ctx.beginPath();
        
        let first = true;
        for (let i = 0; i < history.length; i++) {
            const pt = history[i];
            const state = sig === 0 ? pt.d : sig === 1 ? pt.c : pt.q;
            
            const x = w - ((now - pt.t) / TIME_WINDOW_MS) * w;
            const y = yOffsets[sig] + (state ? -10 : 10);
            
            if (first) {
                ctx.moveTo(x, y);
                first = false;
            } else {
                const prev = history[i-1];
                const prevState = sig === 0 ? prev.d : sig === 1 ? prev.c : prev.q;
                const prevY = yOffsets[sig] + (prevState ? -10 : 10);
                if (state !== prevState) {
                    ctx.lineTo(x, prevY);
                }
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }
}

const setActiveTab = (id: string) => {
    ['btn-srlatch', 'btn-dlatch', 'btn-dff'].forEach(btn => {
        document.getElementById(btn)!.className = btn === id 
            ? "tester-tab px-4 py-1.5 rounded-md text-sm font-bold bg-neon-cyan/20 text-neon-cyan transition-all"
            : "tester-tab px-4 py-1.5 rounded-md text-sm font-bold text-gray-500 hover:text-gray-300 transition-all";
    });
};

document.getElementById('btn-auto-clock')!.onclick = () => {
    isAutoClock = !isAutoClock;
    const btn = document.getElementById('btn-auto-clock')!;
    if (isAutoClock) {
        btn.innerHTML = `<svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path></svg> Stop Auto-Pulse`;
        btn.className = "px-6 py-2 rounded-full border border-red-500/50 text-red-400 font-bold hover:bg-red-900/20 transition-all text-sm flex items-center gap-2";
        clockInterval = setInterval(() => {
            inBot.state = !inBot.state;
            Simulator.stabilize();
            updateUI();
        }, 800);
    } else {
        const text = currentMode === 'SR' ? 'Auto-Pulse SET' : (currentMode === 'LATCH' ? 'Auto-Pulse Enable' : 'Auto-Pulse Clock');
        btn.innerHTML = `<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> ${text}`;
        btn.className = "px-6 py-2 rounded-full border border-gray-600 text-gray-400 font-bold hover:bg-gray-800 transition-all text-sm flex items-center gap-2";
        clearInterval(clockInterval);
    }
};

document.getElementById('btn-srlatch')!.onclick = () => { currentMode = 'SR'; setActiveTab('btn-srlatch'); loadCircuit(); };
document.getElementById('btn-dlatch')!.onclick = () => { currentMode = 'LATCH'; setActiveTab('btn-dlatch'); loadCircuit(); };
document.getElementById('btn-dff')!.onclick = () => { currentMode = 'DFF'; setActiveTab('btn-dff'); loadCircuit(); };

// Init
setActiveTab('btn-dlatch');
loadCircuit();
startTimingEngine();
