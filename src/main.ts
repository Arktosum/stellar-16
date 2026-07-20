import './style.css';
import { Wire, Simulator, NandGate } from './engine';
import { NotGate, AndGate, OrGate, XorGate } from './gates';

const root = document.getElementById('root')!;
root.innerHTML = `
  <div class="w-full max-w-5xl p-8 relative mx-auto">
    <!-- Abstract Background glow -->
    <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[100px] pointer-events-none"></div>
    <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-emerald/10 rounded-full blur-[100px] pointer-events-none"></div>

    <div class="relative z-10 glass-panel p-10">
      <header class="text-center mb-10 border-b border-white/10 pb-6">
        <h1 class="text-4xl font-extrabold tracking-tight mb-2 text-white">
          The <span class="neon-text-cyan">Fractal</span> Architecture
        </h1>
        <p class="text-gray-400 font-medium mb-6">Phase 6: True NAND-Level Physics</p>
        <a href="/journal.html" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-neon-emerald/20 text-neon-emerald border border-neon-emerald/30 hover:bg-neon-emerald/30 font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          Next Chapter: The Physics of Memory
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>
      </header>

      <div class="bg-black/40 border border-white/5 rounded-xl p-8 shadow-inner">
        <!-- SLEEK TAB SELECTOR -->
        <div class="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <h2 class="text-xl font-bold text-gray-200 flex items-center gap-3">
            <svg class="w-5 h-5 text-neon-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            Internal Schematic Viewer
          </h2>
          
          <div id="tab-container" class="flex items-center gap-1 bg-gray-900/60 p-1.5 rounded-xl border border-white/5 shadow-inner">
            <button data-gate="NAND" class="gate-tab px-5 py-1.5 rounded-lg text-sm font-bold bg-neon-cyan/20 text-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all">NAND</button>
            <button data-gate="NOT" class="gate-tab px-5 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300 transition-all">NOT</button>
            <button data-gate="AND" class="gate-tab px-5 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300 transition-all">AND</button>
            <button data-gate="OR" class="gate-tab px-5 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300 transition-all">OR</button>
            <button data-gate="XOR" class="gate-tab px-5 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300 transition-all">XOR</button>
          </div>
        </div>

        <!-- FRACTAL SVG CANVAS -->
        <div class="flex justify-center items-center py-10 min-h-[350px]">
          <svg id="schematic-svg" viewBox="0 0 280 120" class="w-full max-w-2xl drop-shadow-2xl overflow-visible transition-all duration-500">
            <defs>
              <g id="nand-icon">
                <path d="M 0 0 L 15 0 A 15 15 0 0 1 15 30 L 0 30 Z" fill="#1e293b" stroke="#475569" stroke-width="2" />
                <circle cx="34" cy="15" r="4" fill="#1e293b" stroke="#475569" stroke-width="2" />
              </g>
            </defs>
            <g id="schematic-content">
              <!-- Dynamic SVG content injected here -->
            </g>
          </svg>
        </div>

        <div class="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
          <div class="flex items-center gap-3 text-sm text-gray-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            <span>Physics Engine</span>
          </div>
          <div class="font-mono bg-black/50 px-4 py-2 rounded-lg border border-white/5 text-gray-300">
            <span id="eval-count" class="text-neon-cyan font-bold">0</span> gates evaluated
          </div>
        </div>
      </div>
    </div>
  </div>
`;

const wireA = new Wire("A");
const wireB = new Wire("B");
const wireOut = new Wire("Out");
let currentActiveGate: any = null;
let activeGateType: string = "NAND";

const COLOR_OFF = '#374151'; 
const COLOR_ON = '#00f0ff'; 
const COLOR_OUT_ON = '#10b981'; 

// Render Helpers
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
const drawOutput = (x: number, y: number) => `
    <g id="glow-out">
      <circle id="node-out" cx="${x}" cy="${y}" r="8" fill="${COLOR_OFF}" class="transition-all duration-300" />
      <text id="text-out" x="${x+15}" y="${y+5}" fill="${COLOR_OFF}" font-family="monospace" font-size="12" font-weight="bold" text-anchor="start">0</text>
    </g>
`;

const gateLayouts: Record<string, { render: () => string, setup: () => void }> = {
    "NAND": {
        setup: () => currentActiveGate = new NandGate(wireA, wireB, wireOut, "Test_NAND"),
        render: () => `
            ${drawInput('a', 30, 40, 'A')}
            ${drawInput('b', 30, 80, 'B')}
            ${drawWire('in-a', 'M 30 40 L 100 40 L 100 50 L 120 50')}
            ${drawWire('in-b', 'M 30 80 L 100 80 L 100 70 L 120 70')}
            ${drawNand(120, 45)}
            ${drawWire('out', 'M 158 60 L 230 60')}
            ${drawOutput(230, 60)}
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
            ${drawWire('mid-a', 'M 108 35 L 120 35 L 120 50 L 150 50')}
            ${drawWire('mid-b', 'M 108 85 L 120 85 L 120 70 L 150 70')}
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
            ${drawWire('in-b-3', 'M 40 95 L 40 105 L 130 105 L 130 95')}
            ${drawWire('mid-1-bot', 'M 128 60 L 128 75 L 130 75')}
            ${drawNand(130, 70)}
            
            <!-- NAND 4 (final) -->
            ${drawWire('mid-2', 'M 168 25 L 180 25 L 180 50 L 190 50')}
            ${drawWire('mid-3', 'M 168 85 L 180 85 L 180 70 L 190 70')}
            ${drawNand(190, 45)}
            
            ${drawWire('out', 'M 228 60 L 260 60')}
            ${drawOutput(260, 60)}
        `
    }
};

function loadGate(gateType: string) {
    activeGateType = gateType;
    Simulator.clearQueue();
    wireA.disconnectAll();
    wireB.disconnectAll();
    wireOut.disconnectAll();
    
    // Update SVG
    document.getElementById('schematic-content')!.innerHTML = gateLayouts[gateType].render();
    
    // Update Tabs
    document.querySelectorAll('.gate-tab').forEach(tab => {
        if (tab.getAttribute('data-gate') === gateType) {
            tab.className = "gate-tab px-5 py-1.5 rounded-lg text-sm font-bold bg-neon-cyan/20 text-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all";
        } else {
            tab.className = "gate-tab px-5 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300 transition-all";
        }
    });

    gateLayouts[gateType].setup();
    Simulator.stabilize();
    
    bindUIEvents();
    updateUI();
}

function bindUIEvents() {
    const btnToggleA = document.getElementById('btn-toggle-a');
    const btnToggleB = document.getElementById('btn-toggle-b');

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
    // Inputs
    updateColor('node-a', wireA.state);
    updateColor('wire-in-a', wireA.state);
    
    if (activeGateType === 'XOR') {
        updateColor('wire-in-a-1', wireA.state);
        updateColor('wire-in-a-2', wireA.state);
    }
    
    if (activeGateType !== 'NOT') {
        updateColor('node-b', wireB.state);
        updateColor('wire-in-b', wireB.state);
        if (activeGateType === 'XOR') {
            updateColor('wire-in-b-1', wireB.state);
            updateColor('wire-in-b-3', wireB.state);
        }
    }

    // Internal Wires based on physics state!
    if (activeGateType === 'AND') {
        // subGates[0] is NAND
        const midState = (currentActiveGate as AndGate).subGates[0].outputs.out.state;
        updateColor('wire-mid', midState);
    }
    else if (activeGateType === 'OR') {
        // subGates[0] is NOT A, subGates[1] is NOT B
        const midAState = (currentActiveGate as OrGate).subGates[0].outputs.out.state;
        const midBState = (currentActiveGate as OrGate).subGates[1].outputs.out.state;
        updateColor('wire-mid-a', midAState);
        updateColor('wire-mid-b', midBState);
    }
    else if (activeGateType === 'XOR') {
        // subGates[0] is NAND1 (center), subGates[1] is NAND2 (top), subGates[2] is NAND3 (bottom)
        const mid1State = (currentActiveGate as XorGate).subGates[0].outputs.out.state;
        const mid2State = (currentActiveGate as XorGate).subGates[1].outputs.out.state;
        const mid3State = (currentActiveGate as XorGate).subGates[2].outputs.out.state;
        updateColor('wire-mid-1-top', mid1State);
        updateColor('wire-mid-1-bot', mid1State);
        updateColor('wire-mid-2', mid2State);
        updateColor('wire-mid-3', mid3State);
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
