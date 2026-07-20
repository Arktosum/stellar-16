import './style.css';
import { Wire, Simulator } from './engine';
import { DLatch, DFlipFlop } from './memory';

const root = document.getElementById('root')!;
root.innerHTML = `
  <div class="min-h-screen bg-[#0B0F19] text-gray-300 font-sans flex overflow-hidden">
    <!-- Left: The Journal -->
    <div class="w-1/2 p-12 overflow-y-auto border-r border-white/10 bg-black/40 custom-scrollbar">
      <a href="/" class="inline-flex items-center gap-2 text-neon-cyan hover:text-white transition-colors mb-8 font-bold">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Back to Logic Gates
      </a>
      
      <h1 class="text-5xl font-extrabold text-white mb-6 tracking-tight">The Physics of Memory</h1>
      
      <div class="space-y-6 text-lg leading-relaxed text-gray-400">
        <p>
          Up until now, our gates have been <strong class="text-neon-emerald">Combinational</strong>. This means electricity flows in one direction: from inputs to outputs. If you change an input, the output instantly changes. The circuit has no concept of time, and no memory of what happened a microsecond ago.
        </p>
        <p>
          To build a computer, we need <strong class="text-neon-cyan">Sequential Logic</strong>—a way to trap an electrical signal in a loop so it remembers its state indefinitely. 
        </p>
        
        <div class="p-6 bg-gray-900/50 border border-neon-cyan/20 rounded-xl my-8 shadow-[0_0_15px_rgba(0,240,255,0.05)]">
          <h3 class="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <svg class="w-5 h-5 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            1. The D-Latch
          </h3>
          <p class="text-sm mb-4">
            By cross-coupling two NAND gates (feeding their outputs into each other's inputs), we create a bistable feedback loop. We add two more NAND gates to steer the input. 
            <br/><br/>
            When <strong class="text-white">Enable (E) is HIGH</strong>, the latch becomes "transparent", and the output <strong class="text-white">Q</strong> follows the <strong class="text-white">Data (D)</strong> pin. When Enable is LOW, the loop is locked, ignoring Data entirely!
          </p>
        </div>

        <div class="p-6 bg-gray-900/50 border border-neon-emerald/20 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.05)]">
          <h3 class="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <svg class="w-5 h-5 text-neon-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            2. The Master-Slave D-Flip-Flop
          </h3>
          <p class="text-sm">
            The D-Latch has a fatal flaw: if Enable is HIGH, a spike in Data immediately crashes through to the output, causing chaos in a complex CPU (race conditions).
            <br/><br/>
            We solve this by chaining <strong>two D-Latches</strong> together into a Master-Slave configuration. The Master listens when the Clock is HIGH. The Slave outputs when the Clock falls LOW. Data only moves forward on the <em>falling edge</em> of the clock pulse, keeping the CPU perfectly synchronized!
          </p>
        </div>
      </div>
    </div>

    <!-- Right: The Interactive Tester -->
    <div class="w-1/2 p-8 relative flex flex-col justify-center items-center">
      <!-- Background Glow -->
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.05)_0%,transparent_70%)] pointer-events-none"></div>

      <div class="bg-black/60 border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl relative z-10 backdrop-blur-md">
        
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold text-white tracking-tight">Interactive Tester</h2>
          <div class="flex gap-2 bg-gray-900/80 p-1.5 rounded-lg border border-white/5">
            <button id="btn-dlatch" class="tester-tab px-4 py-1.5 rounded-md text-sm font-bold bg-neon-cyan/20 text-neon-cyan transition-all">D-Latch</button>
            <button id="btn-dff" class="tester-tab px-4 py-1.5 rounded-md text-sm font-bold text-gray-500 hover:text-gray-300 transition-all">D-Flip-Flop</button>
          </div>
        </div>

        <div class="flex justify-between items-center mb-10 px-4">
          <!-- Inputs -->
          <div class="flex flex-col gap-6">
            <button id="btn-in-d" class="group relative flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center text-lg font-bold text-gray-400 transition-all shadow-inner group-hover:border-white">
                0
              </div>
              <span class="text-gray-400 font-mono font-bold tracking-widest">DATA (D)</span>
            </button>
            <button id="btn-in-clk" class="group relative flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center text-lg font-bold text-gray-400 transition-all shadow-inner group-hover:border-white">
                0
              </div>
              <span id="clk-label" class="text-gray-400 font-mono font-bold tracking-widest">ENABLE</span>
            </button>
          </div>

          <!-- Schematic Abstraction (SVG) -->
          <div class="flex-1 flex justify-center px-4">
            <svg viewBox="0 0 100 100" class="w-32 h-32 drop-shadow-lg">
              <rect x="10" y="10" width="80" height="80" rx="10" fill="#1e293b" stroke="#475569" stroke-width="4" />
              <!-- D pin -->
              <line x1="0" y1="30" x2="10" y2="30" stroke="#475569" stroke-width="4" />
              <text x="20" y="35" fill="#9ca3af" font-family="monospace" font-size="14" font-weight="bold">D</text>
              <!-- CLK/E pin -->
              <line x1="0" y1="70" x2="10" y2="70" stroke="#475569" stroke-width="4" />
              <path d="M 10 60 L 20 70 L 10 80" fill="none" stroke="#9ca3af" stroke-width="2" /> <!-- Clock triangle -->
              <!-- Q pin -->
              <line x1="90" y1="30" x2="100" y2="30" stroke="#475569" stroke-width="4" />
              <text x="75" y="35" fill="#9ca3af" font-family="monospace" font-size="14" font-weight="bold">Q</text>
              <!-- QBar pin -->
              <line x1="90" y1="70" x2="100" y2="70" stroke="#475569" stroke-width="4" />
              <circle cx="94" cy="70" r="3" fill="#1e293b" stroke="#9ca3af" stroke-width="2" /> <!-- Inversion bubble -->
              <text x="60" y="75" fill="#9ca3af" font-family="monospace" font-size="14" font-weight="bold">!Q</text>
            </svg>
          </div>

          <!-- Outputs -->
          <div class="flex flex-col gap-6 items-end">
            <div class="flex items-center gap-4">
              <span class="text-neon-emerald font-mono font-bold tracking-widest">Q</span>
              <div id="out-q" class="w-12 h-12 rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center text-lg font-bold text-gray-400 transition-all shadow-inner">
                0
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-gray-500 font-mono font-bold tracking-widest">Q_BAR</span>
              <div id="out-qbar" class="w-12 h-12 rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center text-lg font-bold text-gray-400 transition-all shadow-inner">
                1
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-900/50 p-4 rounded-xl border border-white/5 flex justify-between items-center text-sm font-mono text-gray-400">
          <span>Engine: <span class="text-neon-cyan">Stabilized</span></span>
          <span>Evaluated Gates: <span id="eval-count" class="text-white font-bold">0</span></span>
        </div>
      </div>
    </div>
  </div>
`;

const inD = new Wire("D");
const inClk = new Wire("CLK");
const outQ = new Wire("Q");
const outQBar = new Wire("QBar");

let currentMode: 'LATCH' | 'DFF' = 'LATCH';

function loadCircuit() {
    Simulator.clearQueue();
    inD.disconnectAll();
    inClk.disconnectAll();
    outQ.disconnectAll();
    outQBar.disconnectAll();

    if (currentMode === 'LATCH') {
        new DLatch(inD, inClk, outQ, outQBar, "Tester_DLatch");
        document.getElementById('clk-label')!.innerText = "ENABLE (E)";
    } else {
        new DFlipFlop(inD, inClk, outQ, outQBar, "Tester_DFF");
        document.getElementById('clk-label')!.innerText = "CLOCK (C)";
    }

    // Force initial state correctly
    // The physics engine needs a kick to stabilize cross-coupled latches from undefined state
    inD.state = false;
    inClk.state = false;
    Simulator.stabilize();
    
    // Quick pulse to set initial state to 0
    inClk.state = true;
    Simulator.stabilize();
    inClk.state = false;
    Simulator.stabilize();

    updateUI();
}

const updateBtn = (id: string, state: boolean, isOut: boolean = false) => {
    const el = document.getElementById(id)!;
    el.innerText = state ? '1' : '0';
    if (state) {
        el.className = `w-12 h-12 rounded-full bg-${isOut ? 'neon-emerald/20' : 'neon-cyan/20'} border-2 border-${isOut ? 'neon-emerald' : 'neon-cyan'} flex items-center justify-center text-lg font-bold text-white transition-all shadow-[0_0_15px_${isOut ? 'rgba(16,185,129,0.4)' : 'rgba(0,240,255,0.4)'}]`;
    } else {
        el.className = `w-12 h-12 rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center text-lg font-bold text-gray-400 transition-all shadow-inner ${!isOut ? 'group-hover:border-white' : ''}`;
    }
};

function updateUI() {
    updateBtn('btn-in-d', inD.state);
    updateBtn('btn-in-clk', inClk.state);
    updateBtn('out-q', outQ.state, true);
    updateBtn('out-qbar', outQBar.state, true);
    document.getElementById('eval-count')!.innerText = Simulator.gatesEvaluatedThisTick.toString();
}

document.getElementById('btn-in-d')!.onclick = () => {
    inD.state = !inD.state;
    Simulator.stabilize();
    updateUI();
};

document.getElementById('btn-in-clk')!.onclick = () => {
    inClk.state = !inClk.state;
    Simulator.stabilize();
    updateUI();
};

document.getElementById('btn-dlatch')!.onclick = (e) => {
    currentMode = 'LATCH';
    document.getElementById('btn-dlatch')!.className = "tester-tab px-4 py-1.5 rounded-md text-sm font-bold bg-neon-cyan/20 text-neon-cyan transition-all";
    document.getElementById('btn-dff')!.className = "tester-tab px-4 py-1.5 rounded-md text-sm font-bold text-gray-500 hover:text-gray-300 transition-all";
    loadCircuit();
};

document.getElementById('btn-dff')!.onclick = (e) => {
    currentMode = 'DFF';
    document.getElementById('btn-dff')!.className = "tester-tab px-4 py-1.5 rounded-md text-sm font-bold bg-neon-cyan/20 text-neon-cyan transition-all";
    document.getElementById('btn-dlatch')!.className = "tester-tab px-4 py-1.5 rounded-md text-sm font-bold text-gray-500 hover:text-gray-300 transition-all";
    loadCircuit();
};

// Init
loadCircuit();
