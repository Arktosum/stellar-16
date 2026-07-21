import './stars';
import './style.css';
import { Wire, Bus, Simulator } from './engine';
import { MuxGate } from './gates';
import { HalfAdder, FullAdder, Add16, ALU } from './arithmetic';

const root = document.getElementById('root')!;
root.innerHTML = `
  <div class="min-h-screen bg-transparent text-gray-300 font-sans flex flex-col xl:flex-row overflow-x-hidden">
    <!-- Left Pane: Explanations -->
    <div class="w-full xl:w-1/4 xl:max-w-sm p-6 lg:p-10 border-b xl:border-b-0 xl:border-r border-white/10 bg-black/40 backdrop-blur-sm z-10">
      <h1 class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-neon-emerald to-blue-500 mb-6 tracking-tight drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">The ALU</h1>
      
      <div class="space-y-6 text-sm leading-relaxed text-gray-400">
        <p>
          Welcome to the <strong class="text-neon-emerald font-bold">Arithmetic Logic Unit</strong>. Before we can build the 16-bit calculator that drives the CPU, we must prove we can build its subcomponents using the gates we've already derived!
        </p>
        
        <div id="alu-info-container" class="transition-all duration-300"></div>

        <div class="mt-8 space-y-4">
            <a href="/" class="flex items-center justify-center gap-2 w-full py-3 px-4 bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Back to Physics Engine
            </a>
        </div>
      </div>
    </div>
    
    <!-- Right Pane: Interactive Schematic -->
    <div class="w-full xl:flex-1 p-4 lg:p-8 relative flex flex-col justify-start items-center z-10 overflow-x-hidden">
      <div class="bg-black/60 border border-white/10 rounded-2xl p-6 w-full max-w-7xl shadow-2xl backdrop-blur-md">
        
        <div class="flex items-center justify-between mb-8">
            <div>
                <h1 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-emerald to-neon-cyan drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">ALU ARCHITECTURE</h1>
                <p class="text-gray-400 mt-2 text-sm max-w-2xl">
                    The Arithmetic Logic Unit is the heart of the CPU. Explore how complex operations are built from simple gates through progressive layers of abstraction.
                </p>
            </div>
            
            <a href="/" class="px-4 py-2 bg-gray-800/80 hover:bg-gray-700 text-white rounded-lg border border-white/10 transition-colors font-mono text-sm">
                ← Back to Dashboard
            </a>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <h2 class="text-2xl font-bold text-white tracking-tight">Arithmetic Progression</h2>
          <div class="flex gap-2 bg-gray-900/80 p-1.5 rounded-lg border border-white/5">
            <button class="alu-tab px-5 py-1.5 rounded-lg text-sm font-bold bg-neon-emerald/20 text-neon-emerald shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all" data-tab="MUX">MUX</button>
            <button class="alu-tab px-5 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300 transition-all" data-tab="HALF">HALF-ADDER</button>
            <button class="alu-tab px-5 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300 transition-all" data-tab="FULL">FULL-ADDER</button>
            <button class="alu-tab px-5 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300 transition-all" data-tab="ADD4">4-BIT ADDER</button>
            <button class="alu-tab px-5 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300 transition-all" data-tab="ADD16">16-BIT ADDER</button>
            <button class="alu-tab px-5 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300 transition-all" data-tab="ALU">16-BIT ALU</button>
          </div>
        </div>

        <div id="interactive-container" class="w-full bg-gray-900/50 rounded-xl border border-white/5 p-8 flex flex-col items-center justify-center min-h-[350px]">
          <!-- Injected SVG or DOM goes here -->
        </div>
        
        <div class="mt-6 flex justify-between items-center text-sm font-mono text-gray-400">
          <span>Engine: <span class="text-neon-emerald">Stabilized</span></span>
          <span>Evaluated Gates: <span id="eval-count" class="text-white font-bold">0</span></span>
        </div>
      </div>
    </div>
  </div>
`;

const COLOR_OFF = '#374151'; 
const COLOR_ON = '#10b981'; // Emerald for ALU page
const COLOR_OUT_ON = '#00f0ff'; 

const drawInput = (id: string, x: number, y: number, label: string) => `
    <g id="btn-toggle-${id}" class="cursor-pointer group">
      <circle id="node-${id}" cx="${x}" cy="${y}" r="8" fill="${COLOR_OFF}" class="transition-all duration-300 group-hover:stroke-white group-hover:stroke-2" />
      <text x="${x-15}" y="${y+4}" fill="#9ca3af" font-family="monospace" font-size="12" font-weight="bold" text-anchor="end">${label}</text>
    </g>
`;
const drawWire = (id: string, d: string) => `
    <path id="wire-${id}" d="${d}" fill="none" stroke="${COLOR_OFF}" stroke-width="3" class="transition-all duration-300" />
`;
const drawOutput = (id: string, x: number, y: number, label: string = 'OUT') => `
    <g id="glow-${id}">
      <circle id="node-${id}" cx="${x}" cy="${y}" r="8" fill="${COLOR_OFF}" class="transition-all duration-300" />
      <text id="text-${id}" x="${x+15}" y="${y+4}" fill="${COLOR_OFF}" font-family="monospace" font-size="12" font-weight="bold" text-anchor="start">${label}: 0</text>
    </g>
`;
const drawBus = (id: string, d: string, labelX: number, labelY: number, width: string = '16', valId: string = '') => `
    <path id="bus-${id}" d="${d}" fill="none" stroke="${COLOR_OFF}" stroke-width="4" class="transition-all duration-300" />
    <path d="M ${labelX-4} ${labelY+6} L ${labelX+4} ${labelY-6}" stroke="${COLOR_OFF}" stroke-width="2" />
    <text x="${labelX}" y="${labelY-10}" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">${width}</text>
    ${valId ? '<text id="' + valId + '" x="' + (labelX) + '" y="' + (labelY+20) + '" fill="#00f0ff" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">0</text>' : ''}
`;
const drawBox = (x: number, y: number, w: number, h: number, label: string) => `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1e293b" stroke="#475569" stroke-width="2" rx="4" />
    <text x="${x+w/2}" y="${y+h/2+4}" fill="#e2e8f0" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">${label}</text>
`;

// --- Global Wires ---
const wireA = new Wire("A");
const wireB = new Wire("B");
const wireC = new Wire("C");
const wireOut = new Wire("Out");
const wireCarry = new Wire("Carry");

// --- ALU Wires & Buses ---
const busX = new Bus(16, "X");
const busY = new Bus(16, "Y");
const busOut = new Bus(16, "Out");

const wZx = new Wire("zx");
const wNx = new Wire("nx");
const wZy = new Wire("zy");
const wNy = new Wire("ny");
const wF = new Wire("f");
const wNo = new Wire("no");

const wZr = new Wire("zr");
const wNg = new Wire("ng");

let currentActiveTab = "MUX";

const aluInfoData: Record<string, string> = {
    "MUX": `
        <div class="p-5 bg-gray-900/50 border border-neon-emerald/20 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.05)]">
            <h3 class="text-lg font-bold text-white mb-2">Multiplexer (MUX)</h3>
            <p class="mb-3 text-gray-400">A digital switch. If SEL=0, it outputs A. If SEL=1, it outputs B.</p>
            <div class="overflow-hidden rounded-lg border border-neon-emerald/20">
            <table class="w-full text-left text-xs font-mono">
                <thead class="bg-neon-emerald/10 text-neon-emerald">
                <tr><th class="px-3 py-2">SEL</th><th class="px-3 py-2">A</th><th class="px-3 py-2">B</th><th class="px-3 py-2">OUT</th></tr>
                </thead>
                <tbody class="divide-y divide-neon-emerald/10">
                <tr id="tt-mux-000"><td class="px-3 py-2">0</td><td class="px-3 py-2">0</td><td class="px-3 py-2">0</td><td class="px-3 py-2 text-red-400">0</td></tr>
                <tr id="tt-mux-001"><td class="px-3 py-2">0</td><td class="px-3 py-2">0</td><td class="px-3 py-2">1</td><td class="px-3 py-2 text-red-400">0</td></tr>
                <tr id="tt-mux-010"><td class="px-3 py-2">0</td><td class="px-3 py-2">1</td><td class="px-3 py-2">0</td><td class="px-3 py-2 text-neon-cyan">1</td></tr>
                <tr id="tt-mux-011"><td class="px-3 py-2">0</td><td class="px-3 py-2">1</td><td class="px-3 py-2">1</td><td class="px-3 py-2 text-neon-cyan">1</td></tr>
                <tr id="tt-mux-100"><td class="px-3 py-2">1</td><td class="px-3 py-2">0</td><td class="px-3 py-2">0</td><td class="px-3 py-2 text-red-400">0</td></tr>
                <tr id="tt-mux-101"><td class="px-3 py-2">1</td><td class="px-3 py-2">0</td><td class="px-3 py-2">1</td><td class="px-3 py-2 text-neon-cyan">1</td></tr>
                <tr id="tt-mux-110"><td class="px-3 py-2">1</td><td class="px-3 py-2">1</td><td class="px-3 py-2">0</td><td class="px-3 py-2 text-red-400">0</td></tr>
                <tr id="tt-mux-111"><td class="px-3 py-2">1</td><td class="px-3 py-2">1</td><td class="px-3 py-2">1</td><td class="px-3 py-2 text-neon-cyan">1</td></tr>
                </tbody>
            </table>
            </div>
        </div>
    `,
    "HALF": `
        <div class="p-5 bg-gray-900/50 border border-neon-emerald/20 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.05)]">
            <h3 class="text-lg font-bold text-white mb-2">Half-Adder</h3>
            <p class="mb-3 text-gray-400">Adds two bits together. It uses an XOR gate for the Sum, and an AND gate for the Carry!</p>
            <div class="overflow-hidden rounded-lg border border-neon-emerald/20">
            <table class="w-full text-left text-xs font-mono">
                <thead class="bg-neon-emerald/10 text-neon-emerald">
                <tr><th class="px-3 py-2">A</th><th class="px-3 py-2">B</th><th class="px-3 py-2">SUM</th><th class="px-3 py-2">CARRY</th></tr>
                </thead>
                <tbody class="divide-y divide-neon-emerald/10">
                <tr id="tt-half-00"><td class="px-3 py-2">0</td><td class="px-3 py-2">0</td><td class="px-3 py-2 text-red-400">0</td><td class="px-3 py-2 text-red-400">0</td></tr>
                <tr id="tt-half-01"><td class="px-3 py-2">0</td><td class="px-3 py-2">1</td><td class="px-3 py-2 text-neon-cyan">1</td><td class="px-3 py-2 text-red-400">0</td></tr>
                <tr id="tt-half-10"><td class="px-3 py-2">1</td><td class="px-3 py-2">0</td><td class="px-3 py-2 text-neon-cyan">1</td><td class="px-3 py-2 text-red-400">0</td></tr>
                <tr id="tt-half-11"><td class="px-3 py-2">1</td><td class="px-3 py-2">1</td><td class="px-3 py-2 text-red-400">0</td><td class="px-3 py-2 text-neon-cyan">1</td></tr>
                </tbody>
            </table>
            </div>
        </div>
    `,
    "FULL": `
        <div class="p-5 bg-gray-900/50 border border-neon-emerald/20 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.05)]">
            <h3 class="text-lg font-bold text-white mb-2">Full-Adder</h3>
            <p class="mb-3 text-gray-400">Adds three bits (A, B, and a Carry-In). Built by chaining two Half-Adders and an OR gate. Essential for chaining additions across 16-bits.</p>
            <div class="overflow-hidden rounded-lg border border-neon-emerald/20">
            <table class="w-full text-left text-xs font-mono">
                <thead class="bg-neon-emerald/10 text-neon-emerald">
                <tr><th class="px-3 py-2">A</th><th class="px-3 py-2">B</th><th class="px-3 py-2">CIN</th><th class="px-3 py-2">SUM</th><th class="px-3 py-2">CARRY</th></tr>
                </thead>
                <tbody class="divide-y divide-neon-emerald/10">
                <tr id="tt-full-000"><td class="px-3 py-2">0</td><td class="px-3 py-2">0</td><td class="px-3 py-2">0</td><td class="px-3 py-2">0</td><td class="px-3 py-2">0</td></tr>
                <tr id="tt-full-001"><td class="px-3 py-2">0</td><td class="px-3 py-2">0</td><td class="px-3 py-2">1</td><td class="px-3 py-2 text-neon-cyan">1</td><td class="px-3 py-2">0</td></tr>
                <tr id="tt-full-010"><td class="px-3 py-2">0</td><td class="px-3 py-2">1</td><td class="px-3 py-2">0</td><td class="px-3 py-2 text-neon-cyan">1</td><td class="px-3 py-2">0</td></tr>
                <tr id="tt-full-011"><td class="px-3 py-2">0</td><td class="px-3 py-2">1</td><td class="px-3 py-2">1</td><td class="px-3 py-2">0</td><td class="px-3 py-2 text-neon-cyan">1</td></tr>
                <tr id="tt-full-100"><td class="px-3 py-2">1</td><td class="px-3 py-2">0</td><td class="px-3 py-2">0</td><td class="px-3 py-2 text-neon-cyan">1</td><td class="px-3 py-2">0</td></tr>
                <tr id="tt-full-101"><td class="px-3 py-2">1</td><td class="px-3 py-2">0</td><td class="px-3 py-2">1</td><td class="px-3 py-2">0</td><td class="px-3 py-2 text-neon-cyan">1</td></tr>
                <tr id="tt-full-110"><td class="px-3 py-2">1</td><td class="px-3 py-2">1</td><td class="px-3 py-2">0</td><td class="px-3 py-2">0</td><td class="px-3 py-2 text-neon-cyan">1</td></tr>
                <tr id="tt-full-111"><td class="px-3 py-2">1</td><td class="px-3 py-2">1</td><td class="px-3 py-2">1</td><td class="px-3 py-2 text-neon-cyan">1</td><td class="px-3 py-2 text-neon-cyan">1</td></tr>
                </tbody>
            </table>
            </div>
        </div>
    `,
    "ADD4": `
        <div class="p-5 bg-gray-900/50 border border-neon-emerald/20 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.05)]">
            <h3 class="text-lg font-bold text-white mb-2">4-Bit Ripple Carry Adder</h3>
            <p class="mb-3 text-gray-400">By chaining 4 Full-Adders together, we can add two 4-bit numbers! The Carry-Out of bit 0 feeds directly into the Carry-In of bit 1, rippling all the way to bit 3.</p>
            <p class="text-gray-400">Notice how the wires cross boundaries: each FA takes A[i], B[i] and outputs SUM[i], but passes the Carry sideways to the next FA block!</p>
        </div>
    `,
    "ADD16": `
        <div class="p-5 bg-gray-900/50 border border-neon-emerald/20 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.05)]">
            <h3 class="text-lg font-bold text-white mb-2">16-Bit Ripple Carry Adder</h3>
            <p class="mb-3 text-gray-400">Instead of drawing 16 individual Full-Adders, we can build the 16-bit adder by chaining <strong>four 4-Bit Adders</strong> together!</p>
            <p class="text-gray-400">The Carry-Out of the first 4-bit block feeds into the Carry-In of the next 4-bit block. This demonstrates the power of abstraction in hardware design.</p>
        </div>
    `,
    "ALU": `
        <div class="p-5 bg-gray-900/50 border border-neon-emerald/20 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.05)]">
            <h3 class="text-lg font-bold text-white mb-2">16-Bit ALU</h3>
            <p class="mb-3 text-gray-400">The calculator of the CPU. It computes mathematical operations on two 16-bit numbers based on 6 control bits. Look closely at the hardware blocks:</p>
            <ul class="text-xs text-gray-400 mb-3 space-y-2 ml-4 list-disc">
                <li><strong>zx / zy</strong>: 16-Bit Multiplexers that select between the input and all 0s.</li>
                <li><strong>nx / ny</strong>: A 16-Bit NOT gate and a MUX that allows negating the input.</li>
                <li><strong>f</strong>: A 16-Bit ADDER and a 16-Bit AND gate run in parallel, and a MUX selects which result to use.</li>
                <li><strong>no</strong>: A final 16-Bit NOT + MUX to optionally negate the output.</li>
            </ul>
            <div class="mt-4">
                <p class="text-gray-400 mb-2 font-bold text-xs uppercase tracking-wider">Control Bit Reference</p>
                <div class="overflow-x-auto rounded-lg border border-white/10">
                    <table class="w-full text-left text-xs font-mono">
                        <thead class="bg-gray-800/80 text-gray-400 border-b border-white/10">
                            <tr>
                                <th class="py-2 px-3">zx</th>
                                <th class="py-2 px-3">nx</th>
                                <th class="py-2 px-3">zy</th>
                                <th class="py-2 px-3">ny</th>
                                <th class="py-2 px-3">f</th>
                                <th class="py-2 px-3">no</th>
                                <th class="py-2 px-3 text-neon-emerald">OUT</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-white/5 text-gray-300 bg-black/30">
                            <tr class="hover:bg-white/5"><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3 text-white">0</td></tr>
                            <tr class="hover:bg-white/5"><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3 text-white">1</td></tr>
                            <tr class="hover:bg-white/5"><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3 text-white">X</td></tr>
                            <tr class="hover:bg-white/5"><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3 text-white">Y</td></tr>
                            <tr class="hover:bg-white/5"><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3 text-white">!X</td></tr>
                            <tr class="hover:bg-white/5"><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3 text-white">!Y</td></tr>
                            <tr class="hover:bg-white/5"><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3 text-white">X & Y</td></tr>
                            <tr class="hover:bg-white/5"><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3 text-white">X | Y</td></tr>
                            <tr class="hover:bg-white/5"><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3 text-white">X + Y</td></tr>
                            <tr class="hover:bg-white/5"><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3 text-white">X - Y</td></tr>
                            <tr class="hover:bg-white/5"><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">0</td><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3">1</td><td class="py-1.5 px-3 text-white">Y - X</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
`
};

const tabLayouts: Record<string, { render: () => string, setup: () => void }> = {
    "MUX": {
        setup: () => new MuxGate(wireA, wireB, wireC, wireOut, "Test_MUX"),
        render: () => `
          <svg viewBox="-40 -20 380 180" class="w-full max-w-lg transition-all duration-500">
            ${drawInput('c', 20, 25, 'SEL')}
            ${drawInput('a', 20, 80, 'A')}
            ${drawInput('b', 20, 130, 'B')}
            
            ${drawBox(80, 10, 40, 30, 'NOT')}
            ${drawBox(160, 45, 40, 30, 'AND')}
            ${drawBox(160, 115, 40, 30, 'AND')}
            ${drawBox(240, 80, 40, 30, 'OR')}
            
            ${drawWire('w-sel-not', 'M 20 25 L 80 25')}
            ${drawWire('w-not-and1', 'M 120 25 L 140 25 L 140 55 L 160 55')}
            ${drawWire('w-a-and1', 'M 20 80 L 140 80 L 140 65 L 160 65')}
            
            ${drawWire('w-sel-and2', 'M 40 25 L 40 140 L 160 140')}
            ${drawWire('w-b-and2', 'M 20 130 L 160 130')}
            
            ${drawWire('w-and1-or', 'M 200 60 L 220 60 L 220 90 L 240 90')}
            ${drawWire('w-and2-or', 'M 200 130 L 220 130 L 220 100 L 240 100')}
            
            ${drawWire('w-out', 'M 280 95 L 320 95')}
            ${drawOutput('out', 320, 95, 'OUT')}
          </svg>
        `
    },
    "HALF": {
        setup: () => new HalfAdder(wireA, wireB, wireOut, wireCarry, "Test_HALF"),
        render: () => `
          <svg viewBox="-40 -20 400 140" class="w-full max-w-lg transition-all duration-500">
            ${drawInput('a', 20, 35, 'A')}
            ${drawInput('b', 20, 85, 'B')}
            
            ${drawBox(140, 20, 40, 30, 'XOR')}
            ${drawBox(140, 70, 40, 30, 'AND')}
            
            ${drawWire('w-a-xor', 'M 20 35 L 140 35')}
            ${drawWire('w-b-xor', 'M 40 85 L 40 45 L 140 45')}
            
            ${drawWire('w-a-and', 'M 60 35 L 60 75 L 140 75')}
            ${drawWire('w-b-and', 'M 20 85 L 140 85')}
            
            ${drawWire('w-sum', 'M 180 35 L 280 35')}
            ${drawOutput('out', 280, 35, 'SUM')}
            
            ${drawWire('w-carry', 'M 180 85 L 280 85')}
            ${drawOutput('carry', 280, 85, 'CARRY')}
          </svg>
        `
    },
    "FULL": {
        setup: () => new FullAdder(wireA, wireB, wireC, wireOut, wireCarry, "Test_FULL"),
        render: () => `
          <svg viewBox="-40 -20 400 180" class="w-full max-w-lg transition-all duration-500">
            ${drawInput('a', 20, 35, 'A')}
            ${drawInput('b', 20, 75, 'B')}
            ${drawInput('c', 20, 135, 'CIN')}
            
            ${drawBox(100, 35, 60, 40, 'HALF')}
            ${drawBox(180, 75, 60, 40, 'HALF')}
            ${drawBox(260, 115, 40, 30, 'OR')}
            
            ${drawWire('w-a-h1', 'M 20 35 L 100 45')}
            ${drawWire('w-b-h1', 'M 20 75 L 100 65')}
            
            ${drawWire('w-h1-sum', 'M 160 45 L 170 45 L 170 85 L 180 85')}
            ${drawWire('w-c-h2', 'M 20 135 L 170 135 L 170 105 L 180 105')}
            
            ${drawWire('w-h1-cry', 'M 160 65 L 160 120 L 260 120')}
            ${drawWire('w-h2-cry', 'M 240 105 L 250 105 L 250 135 L 260 135')}
            
            ${drawWire('w-sum', 'M 240 85 L 320 85')}
            ${drawOutput('out', 320, 85, 'SUM')}
            
            ${drawWire('w-carry', 'M 300 130 L 320 130')}
            ${drawOutput('carry', 320, 130, 'CARRY')}
          </svg>
        `
    },
    "ADD4": {
        setup: () => new Add16(busX, busY, busOut, "Test_ADD4"),
        render: () => `
          <div class="flex flex-col w-full gap-6">
            <div class="flex gap-4 w-full">
                <div class="flex-1 bg-gray-800/50 p-4 rounded-xl border border-white/5">
                    <label class="text-xs font-bold text-gray-500 mb-2 block">A Input (4-bit, 0-15)</label>
                    <input type="number" id="add4-a" value="0" min="0" max="15" class="w-full bg-black/50 border border-neon-emerald/30 text-neon-emerald font-mono p-2 rounded focus:outline-none focus:border-neon-emerald" />
                    <div id="add4-a-bin" class="text-[10px] text-gray-500 font-mono mt-2 tracking-widest text-right">0000</div>
                </div>
                <div class="flex-1 bg-gray-800/50 p-4 rounded-xl border border-white/5">
                    <label class="text-xs font-bold text-gray-500 mb-2 block">B Input (4-bit, 0-15)</label>
                    <input type="number" id="add4-b" value="0" min="0" max="15" class="w-full bg-black/50 border border-neon-emerald/30 text-neon-emerald font-mono p-2 rounded focus:outline-none focus:border-neon-emerald" />
                    <div id="add4-b-bin" class="text-[10px] text-gray-500 font-mono mt-2 tracking-widest text-right">0000</div>
                </div>
            </div>
            
            <div class="w-full overflow-x-auto bg-black/60 rounded-lg border border-white/5 relative py-4 px-4 text-center">
                <svg viewBox="-40 0 700 230" class="min-w-[700px] h-auto">
                    <!-- Full Adder 0 -->
                    ${drawBox(40, 80, 80, 80, 'FULL ADD')}
                    ${drawWire('w-a0', 'M 60 20 L 60 80')}
                    <text id="add4-val-a0" x="60" y="15" fill="#00f0ff" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">0</text>
                    ${drawWire('w-b0', 'M 100 20 L 100 80')}
                    <text id="add4-val-b0" x="100" y="15" fill="#00f0ff" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">0</text>
                    
                    <text x="10" y="124" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold">CIN</text>
                    ${drawWire('w-cin0', 'M -20 120 L 40 120')}
                    <text x="95" y="124" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold">CRY</text>
                    
                    ${drawWire('s0', 'M 80 160 L 80 200')}
                    <text id="add4-val-s0" x="80" y="215" fill="#00f0ff" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">0</text>
                    
                    <!-- Full Adder 1 -->
                    ${drawBox(180, 80, 80, 80, 'FULL ADD')}
                    ${drawWire('w-a1', 'M 200 20 L 200 80')}
                    <text id="add4-val-a1" x="200" y="15" fill="#00f0ff" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">0</text>
                    ${drawWire('w-b1', 'M 240 20 L 240 80')}
                    <text id="add4-val-b1" x="240" y="15" fill="#00f0ff" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">0</text>

                    ${drawWire('w-cry1', 'M 120 120 L 180 120')}
                    <text x="235" y="124" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold">CRY</text>
                    
                    ${drawWire('s1', 'M 220 160 L 220 200')}
                    <text id="add4-val-s1" x="220" y="215" fill="#00f0ff" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">0</text>

                    <!-- Full Adder 2 -->
                    ${drawBox(320, 80, 80, 80, 'FULL ADD')}
                    ${drawWire('w-a2', 'M 340 20 L 340 80')}
                    <text id="add4-val-a2" x="340" y="15" fill="#00f0ff" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">0</text>
                    ${drawWire('w-b2', 'M 380 20 L 380 80')}
                    <text id="add4-val-b2" x="380" y="15" fill="#00f0ff" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">0</text>

                    ${drawWire('w-cry2', 'M 260 120 L 320 120')}
                    <text x="375" y="124" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold">CRY</text>
                    
                    ${drawWire('s2', 'M 360 160 L 360 200')}
                    <text id="add4-val-s2" x="360" y="215" fill="#00f0ff" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">0</text>
                    
                    <!-- Full Adder 3 -->
                    ${drawBox(460, 80, 80, 80, 'FULL ADD')}
                    ${drawWire('w-a3', 'M 480 20 L 480 80')}
                    <text id="add4-val-a3" x="480" y="15" fill="#00f0ff" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">0</text>
                    ${drawWire('w-b3', 'M 520 20 L 520 80')}
                    <text id="add4-val-b3" x="520" y="15" fill="#00f0ff" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">0</text>

                    ${drawWire('w-cry3', 'M 400 120 L 460 120')}
                    <text x="515" y="124" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold">CRY</text>
                    ${drawWire('w-cryout', 'M 540 120 L 600 120')}
                    <text x="610" y="124" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold">COUT</text>
                    
                    ${drawWire('s3', 'M 500 160 L 500 200')}
                    <text id="add4-val-s3" x="500" y="215" fill="#00f0ff" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">0</text>
                </svg>
            </div>
            
            <div class="bg-black p-6 rounded-xl border border-neon-cyan/50 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
                <label class="text-xs font-bold text-gray-500 mb-2 block">Output (4-bit)</label>
                <div id="add4-out" class="text-4xl text-neon-cyan font-mono tracking-wider text-right drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">0</div>
                <div id="add4-out-bin" class="text-xs text-gray-400 font-mono mt-3 tracking-[0.3em] text-right">0000</div>
            </div>
          </div>
        `
    },
    "ADD16": {
        setup: () => new Add16(busX, busY, busOut, "Test_ADD16"),
        render: () => `
          <div class="flex flex-col w-full gap-6">
            <div class="flex gap-4 w-full">
                <div class="flex-1 bg-gray-800/50 p-4 rounded-xl border border-white/5">
                    <label class="text-xs font-bold text-gray-500 mb-2 block">A Input (16-bit)</label>
                    <input type="text" id="add16-a" value="0" class="w-full bg-black/50 border border-neon-emerald/30 text-neon-emerald font-mono p-2 rounded focus:outline-none focus:border-neon-emerald" />
                    <div id="add16-a-bin" class="text-[10px] text-gray-500 font-mono mt-2 tracking-widest text-right">0000000000000000</div>
                </div>
                <div class="flex-1 bg-gray-800/50 p-4 rounded-xl border border-white/5">
                    <label class="text-xs font-bold text-gray-500 mb-2 block">B Input (16-bit)</label>
                    <input type="text" id="add16-b" value="0" class="w-full bg-black/50 border border-neon-emerald/30 text-neon-emerald font-mono p-2 rounded focus:outline-none focus:border-neon-emerald" />
                    <div id="add16-b-bin" class="text-[10px] text-gray-500 font-mono mt-2 tracking-widest text-right">0000000000000000</div>
                </div>
            </div>
            
            <div class="w-full overflow-x-auto bg-black/60 rounded-lg border border-white/5 relative py-4 px-4 text-center">
                <svg viewBox="-40 0 700 230" class="min-w-[700px] h-auto">
                    <!-- ADD4 0 -->
                    ${drawBox(40, 80, 80, 80, '4-BIT ADDER')}
                    ${drawBus('in-a0', 'M 60 20 L 60 80', 60, 40, '4', 'val-a0')}
                    ${drawBus('in-b0', 'M 100 20 L 100 80', 100, 40, '4', 'val-b0')}
                    
                    <text x="10" y="124" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold">CIN</text>
                    ${drawWire('w-cin0', 'M -20 120 L 40 120')}
                    
                    ${drawBus('out0', 'M 80 160 L 80 200', 80, 180, '4', 'val-out0')}
                    
                    <!-- ADD4 1 -->
                    ${drawBox(180, 80, 80, 80, '4-BIT ADDER')}
                    ${drawBus('in-a1', 'M 200 20 L 200 80', 200, 40, '4', 'val-a1')}
                    ${drawBus('in-b1', 'M 240 20 L 240 80', 240, 40, '4', 'val-b1')}

                    ${drawWire('w-cry1', 'M 120 120 L 180 120')}
                    <text x="150" y="115" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">CRY</text>
                    
                    ${drawBus('out1', 'M 220 160 L 220 200', 220, 180, '4', 'val-out1')}

                    <!-- ADD4 2 -->
                    ${drawBox(320, 80, 80, 80, '4-BIT ADDER')}
                    ${drawBus('in-a2', 'M 340 20 L 340 80', 340, 40, '4', 'val-a2')}
                    ${drawBus('in-b2', 'M 380 20 L 380 80', 380, 40, '4', 'val-b2')}

                    ${drawWire('w-cry2', 'M 260 120 L 320 120')}
                    <text x="290" y="115" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">CRY</text>
                    
                    ${drawBus('out2', 'M 360 160 L 360 200', 360, 180, '4', 'val-out2')}
                    
                    <!-- ADD4 3 -->
                    ${drawBox(460, 80, 80, 80, '4-BIT ADDER')}
                    ${drawBus('in-a3', 'M 480 20 L 480 80', 480, 40, '4', 'val-a3')}
                    ${drawBus('in-b3', 'M 520 20 L 520 80', 520, 40, '4', 'val-b3')}

                    ${drawWire('w-cry3', 'M 400 120 L 460 120')}
                    <text x="430" y="115" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">CRY</text>
                    ${drawWire('w-cryout', 'M 540 120 L 600 120')}
                    <text x="570" y="115" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">COUT</text>
                    
                    ${drawBus('out3', 'M 500 160 L 500 200', 500, 180, '4', 'val-out3')}
                </svg>
            </div>
            
            <div class="bg-black p-6 rounded-xl border border-neon-cyan/50 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
                <label class="text-xs font-bold text-gray-500 mb-2 block">Output (16-bit)</label>
                <div id="add16-out" class="text-4xl text-neon-cyan font-mono tracking-wider text-right drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">0</div>
                <div id="add16-out-bin" class="text-xs text-gray-400 font-mono mt-3 tracking-[0.3em] text-right">0000000000000000</div>
            </div>
          </div>
        `
    },
    "ALU": {
        setup: () => new ALU(busX, busY, wZx, wNx, wZy, wNy, wF, wNo, busOut, wZr, wNg, "Test_ALU"),
        render: () => `
          <div class="flex flex-col w-full gap-6">
            <div class="flex gap-4 w-full">
                <div class="flex-1 bg-gray-800/50 p-4 rounded-xl border border-white/5">
                    <label class="text-xs font-bold text-gray-500 mb-2 block">X Input (16-bit)</label>
                    <input type="text" id="alu-x" value="0" class="w-full bg-black/50 border border-neon-emerald/30 text-neon-emerald font-mono p-2 rounded focus:outline-none focus:border-neon-emerald" />
                    <div id="alu-x-bin" class="text-[10px] text-gray-500 font-mono mt-2 tracking-widest text-right">0000000000000000</div>
                </div>
                <div class="flex-1 bg-gray-800/50 p-4 rounded-xl border border-white/5">
                    <label class="text-xs font-bold text-gray-500 mb-2 block">Y Input (16-bit)</label>
                    <input type="text" id="alu-y" value="0" class="w-full bg-black/50 border border-neon-emerald/30 text-neon-emerald font-mono p-2 rounded focus:outline-none focus:border-neon-emerald" />
                    <div id="alu-y-bin" class="text-[10px] text-gray-500 font-mono mt-2 tracking-widest text-right">0000000000000000</div>
                </div>
            </div>
            
            <div class="bg-gray-800/50 p-4 rounded-xl border border-white/5 flex flex-col gap-6">
                <div class="w-full max-w-lg mx-auto flex flex-col justify-center">
                    <div class="flex justify-between items-center mb-4">
                        <label class="text-xs font-bold text-gray-500 uppercase tracking-widest">Presets</label>
                        <div class="flex flex-wrap gap-2.5 justify-end">
                            <button class="alu-preset-btn px-3 py-1.5 bg-gray-900/80 hover:bg-neon-cyan/10 text-gray-400 hover:text-neon-cyan text-xs font-bold font-mono rounded-lg border border-white/5 hover:border-neon-cyan/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all duration-300" data-bits="000010">X+Y</button>
                            <button class="alu-preset-btn px-3 py-1.5 bg-gray-900/80 hover:bg-neon-cyan/10 text-gray-400 hover:text-neon-cyan text-xs font-bold font-mono rounded-lg border border-white/5 hover:border-neon-cyan/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all duration-300" data-bits="010011">X-Y</button>
                            <button class="alu-preset-btn px-3 py-1.5 bg-gray-900/80 hover:bg-neon-cyan/10 text-gray-400 hover:text-neon-cyan text-xs font-bold font-mono rounded-lg border border-white/5 hover:border-neon-cyan/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all duration-300" data-bits="000111">Y-X</button>
                            <button class="alu-preset-btn px-3 py-1.5 bg-gray-900/80 hover:bg-neon-cyan/10 text-gray-400 hover:text-neon-cyan text-xs font-bold font-mono rounded-lg border border-white/5 hover:border-neon-cyan/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all duration-300" data-bits="000000">X&Y</button>
                            <button class="alu-preset-btn px-3 py-1.5 bg-gray-900/80 hover:bg-neon-cyan/10 text-gray-400 hover:text-neon-cyan text-xs font-bold font-mono rounded-lg border border-white/5 hover:border-neon-cyan/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all duration-300" data-bits="010101">X|Y</button>
                            <button class="alu-preset-btn px-3 py-1.5 bg-gray-900/80 hover:bg-neon-cyan/10 text-gray-400 hover:text-neon-cyan text-xs font-bold font-mono rounded-lg border border-white/5 hover:border-neon-cyan/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all duration-300" data-bits="001101">!X</button>
                            <button class="alu-preset-btn px-3 py-1.5 bg-gray-900/80 hover:bg-neon-cyan/10 text-gray-400 hover:text-neon-cyan text-xs font-bold font-mono rounded-lg border border-white/5 hover:border-neon-cyan/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all duration-300" data-bits="110001">!Y</button>
                            <button class="alu-preset-btn px-3 py-1.5 bg-gray-900/80 hover:bg-neon-cyan/10 text-gray-400 hover:text-neon-cyan text-xs font-bold font-mono rounded-lg border border-white/5 hover:border-neon-cyan/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all duration-300" data-bits="111111">1</button>
                            <button class="alu-preset-btn px-3 py-1.5 bg-gray-900/80 hover:bg-neon-cyan/10 text-gray-400 hover:text-neon-cyan text-xs font-bold font-mono rounded-lg border border-white/5 hover:border-neon-cyan/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all duration-300" data-bits="101010">0</button>
                        </div>
                    </div>
                    <div class="flex justify-between">
                        <div class="flex flex-col items-center gap-2"><span class="text-xs font-bold font-mono text-gray-400">zx</span><button id="btn-zx" class="w-10 h-10 rounded-lg bg-gray-700 text-white font-bold font-mono transition-colors">0</button></div>
                        <div class="flex flex-col items-center gap-2"><span class="text-xs font-bold font-mono text-gray-400">nx</span><button id="btn-nx" class="w-10 h-10 rounded-lg bg-gray-700 text-white font-bold font-mono transition-colors">0</button></div>
                        <div class="flex flex-col items-center gap-2"><span class="text-xs font-bold font-mono text-gray-400">zy</span><button id="btn-zy" class="w-10 h-10 rounded-lg bg-gray-700 text-white font-bold font-mono transition-colors">0</button></div>
                        <div class="flex flex-col items-center gap-2"><span class="text-xs font-bold font-mono text-gray-400">ny</span><button id="btn-ny" class="w-10 h-10 rounded-lg bg-gray-700 text-white font-bold font-mono transition-colors">0</button></div>
                        <div class="flex flex-col items-center gap-2"><span class="text-xs font-bold font-mono text-neon-cyan drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">f</span><button id="btn-f" class="w-10 h-10 rounded-lg bg-gray-700 text-white font-bold font-mono transition-colors">0</button></div>
                        <div class="flex flex-col items-center gap-2"><span class="text-xs font-bold font-mono text-gray-400">no</span><button id="btn-no" class="w-10 h-10 rounded-lg bg-gray-700 text-white font-bold font-mono transition-colors">0</button></div>
                    </div>
                </div>
                
                
                <div class="w-full overflow-x-auto bg-black/60 rounded-lg border border-white/5 relative py-4 px-4 text-center">
                    <svg viewBox="-40 -20 1100 320" class="min-w-[1100px] h-auto">
                        <!-- X Input -->
                        <text x="-20" y="50" fill="#9ca3af" font-family="monospace" font-size="12" font-weight="bold">X</text>
                        ${drawBus('alu-in-x', 'M -10 45 L 60 45', 15, 45, '16', 'val-alu-in-x')}
                        
                        <text x="20" y="74" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold">0</text>
                        ${drawBus('alu-zero-x', 'M 30 70 L 60 70', 45, 70)}
                        
                        <!-- ZX: 16-bit MUX -->
                        ${drawBox(60, 30, 80, 50, '16-BIT MUX')}
                        <text x="55" y="42" fill="#64748b" font-family="monospace" font-size="10" font-weight="bold">0</text>
                        <text x="55" y="67" fill="#64748b" font-family="monospace" font-size="10" font-weight="bold">1</text>
                        <text x="100" y="20" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">zx</text>
                        ${drawWire('w-ctrl-zx', 'M 100 25 L 100 30')}
                        
                        ${drawBus('alu-x1', 'M 140 55 L 200 55', 160, 55, '16', 'val-alu-x1')}
                        ${drawBus('alu-x1-a', 'M 200 55 L 200 45 L 300 45', 250, 45)}
                        ${drawBus('alu-x1-b', 'M 200 55 L 200 70 L 220 70', 210, 70)}
                        
                        <!-- NX: 16-bit NOT + MUX -->
                        ${drawBox(220, 60, 60, 20, 'NOT')}
                        ${drawBus('alu-xnot', 'M 280 70 L 300 70', 290, 70)}
                        
                        ${drawBox(300, 30, 80, 50, '16-BIT MUX')}
                        <text x="295" y="42" fill="#64748b" font-family="monospace" font-size="10" font-weight="bold">0</text>
                        <text x="295" y="67" fill="#64748b" font-family="monospace" font-size="10" font-weight="bold">1</text>
                        <text x="340" y="20" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">nx</text>
                        ${drawWire('w-ctrl-nx', 'M 340 25 L 340 30')}

                        ${drawBus('alu-x2', 'M 380 55 L 465 55', 410, 55, '16', 'val-alu-x2')}

                        <!-- Y Input -->
                        <text x="-20" y="210" fill="#9ca3af" font-family="monospace" font-size="12" font-weight="bold">Y</text>
                        ${drawBus('alu-in-y', 'M -10 205 L 60 205', 15, 205, '16', 'val-alu-in-y')}
                        
                        <text x="20" y="234" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold">0</text>
                        ${drawBus('alu-zero-y', 'M 30 230 L 60 230', 45, 230)}
                        
                        <!-- ZY: 16-bit MUX -->
                        ${drawBox(60, 190, 80, 50, '16-BIT MUX')}
                        <text x="55" y="202" fill="#64748b" font-family="monospace" font-size="10" font-weight="bold">0</text>
                        <text x="55" y="227" fill="#64748b" font-family="monospace" font-size="10" font-weight="bold">1</text>
                        <text x="100" y="255" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">zy</text>
                        ${drawWire('w-ctrl-zy', 'M 100 245 L 100 240')}
                        
                        ${drawBus('alu-y1', 'M 140 215 L 200 215', 160, 215, '16', 'val-alu-y1')}
                        ${drawBus('alu-y1-a', 'M 200 215 L 200 205 L 300 205', 250, 205)}
                        ${drawBus('alu-y1-b', 'M 200 215 L 200 230 L 220 230', 210, 230)}
                        
                        <!-- NY: 16-bit NOT + MUX -->
                        ${drawBox(220, 220, 60, 20, 'NOT')}
                        ${drawBus('alu-ynot', 'M 280 230 L 300 230', 290, 230)}
                        
                        ${drawBox(300, 190, 80, 50, '16-BIT MUX')}
                        <text x="295" y="202" fill="#64748b" font-family="monospace" font-size="10" font-weight="bold">0</text>
                        <text x="295" y="227" fill="#64748b" font-family="monospace" font-size="10" font-weight="bold">1</text>
                        <text x="340" y="255" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">ny</text>
                        ${drawWire('w-ctrl-ny', 'M 340 245 L 340 240')}

                        ${drawBus('alu-y2', 'M 380 215 L 475 215', 410, 215, '16', 'val-alu-y2')}

                        <!-- f: Function (Add/And + Mux) -->
                        ${drawBus('alu-x2-add', 'M 465 55 L 465 75 L 480 75', 465, 65)}
                        ${drawBus('alu-x2-and', 'M 465 55 L 465 165 L 480 165', 465, 120)}
                        
                        ${drawBus('alu-y2-add', 'M 475 215 L 475 105 L 480 105', 475, 150)}
                        ${drawBus('alu-y2-and', 'M 475 215 L 475 195 L 480 195', 475, 205)}

                        ${drawBox(480, 60, 80, 60, 'ADDER')}
                        ${drawBox(480, 150, 80, 60, 'AND')}
                        
                        ${drawBus('alu-out-add', 'M 560 90 L 610 90 L 610 145 L 620 145', 585, 90, '16', 'val-alu-outAdd')}
                        ${drawBus('alu-out-and', 'M 560 180 L 600 180 L 600 125 L 620 125', 580, 180, '16', 'val-alu-outAnd')}

                        ${drawBox(620, 110, 80, 50, '16-BIT MUX')}
                        <text x="615" y="122" fill="#64748b" font-family="monospace" font-size="10" font-weight="bold">0</text>
                        <text x="615" y="142" fill="#64748b" font-family="monospace" font-size="10" font-weight="bold">1</text>
                        <text x="660" y="100" fill="#00f0ff" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">f</text>
                        ${drawWire('w-ctrl-f', 'M 660 105 L 660 110')}
                        
                        ${drawBus('alu-fout', 'M 700 135 L 770 135', 735, 135, '16', 'val-alu-fout')}

                        <!-- NO: 16-bit NOT + MUX -->
                        ${drawBus('alu-fout-a', 'M 770 135 L 770 125 L 870 125', 810, 125)}
                        ${drawBus('alu-fout-b', 'M 770 135 L 770 145 L 790 145', 780, 145)}
                        
                        ${drawBox(790, 135, 60, 20, 'NOT')}
                        ${drawBus('alu-fout-not', 'M 850 145 L 870 145', 860, 145)}
                        
                        ${drawBox(870, 110, 80, 50, '16-BIT MUX')}
                        <text x="865" y="122" fill="#64748b" font-family="monospace" font-size="10" font-weight="bold">0</text>
                        <text x="865" y="142" fill="#64748b" font-family="monospace" font-size="10" font-weight="bold">1</text>
                        <text x="910" y="100" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">no</text>
                        ${drawWire('w-ctrl-no', 'M 910 105 L 910 110')}
                        
                        ${drawBus('alu-out', 'M 950 135 L 1000 135', 965, 135, '16', 'val-alu-out')}
                        <text x="1010" y="140" fill="#9ca3af" font-family="monospace" font-size="12" font-weight="bold">OUT</text>

                        <!-- Flags -->
                        ${drawBus('alu-out-to-ng', 'M 960 135 L 960 85 L 980 85', 970, 85, '16')}
                        ${drawBox(980, 70, 40, 30, 'MSB')}
                        ${drawWire('w-flag-ng', 'M 1020 85 L 1050 85')}
                        <text x="1055" y="89" fill="#9ca3af" font-family="monospace" font-size="12" font-weight="bold">ng</text>

                        ${drawBus('alu-out-to-zr', 'M 960 135 L 960 180 L 980 180', 970, 180, '16')}
                        ${drawBox(980, 165, 40, 30, '== 0')}
                        ${drawWire('w-flag-zr', 'M 1020 180 L 1050 180')}
                        <text x="1055" y="184" fill="#9ca3af" font-family="monospace" font-size="12" font-weight="bold">zr</text>
                    </svg>
                </div>

            </div>
            
            <div class="bg-black p-6 rounded-xl border border-neon-cyan/50 shadow-[0_0_20px_rgba(0,240,255,0.1)] relative overflow-hidden">
                <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.05)_0%,transparent_70%)] pointer-events-none"></div>
                <label class="text-xs font-bold text-gray-500 mb-2 block">Output (16-bit)</label>
                <div id="alu-out" class="text-4xl text-neon-cyan font-mono tracking-wider text-right drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">0</div>
                <div id="alu-out-bin" class="text-xs text-gray-400 font-mono mt-3 tracking-[0.3em] text-right">0000000000000000</div>
                
                <div class="flex justify-end gap-6 mt-6 border-t border-white/5 pt-4">
                    <div class="flex items-center gap-3">
                        <span class="text-xs font-bold font-mono text-gray-500">ZR (Zero)</span>
                        <div id="flag-zr" class="w-4 h-4 rounded-full bg-gray-700 transition-colors duration-300"></div>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="text-xs font-bold font-mono text-gray-500">NG (Neg)</span>
                        <div id="flag-ng" class="w-4 h-4 rounded-full bg-gray-700 transition-colors duration-300"></div>
                    </div>
                </div>
            </div>
          </div>
        `
    }
};

function parseNum(val: string): number {
    let n = parseInt(val, 10);
    if (val.startsWith('0x')) n = parseInt(val, 16);
    else if (val.startsWith('0b')) n = parseInt(val, 2);
    if (isNaN(n)) return 0;
    return n & 0xFFFF; // 16-bit
}

function numToBinStr(n: number): string {
    return (n & 0xFFFF).toString(2).padStart(16, '0');
}

function busSetValue(bus: Bus, val: number) {
    for (let i = 0; i < 16; i++) {
        bus.wires[i].state = ((val >> i) & 1) === 1;
    }
}

function busGetValue(bus: Bus): number {
    let val = 0;
    for (let i = 0; i < 16; i++) {
        if (bus.wires[i].state) {
            val |= (1 << i);
        }
    }
    return val;
}

function loadTab(tabId: string) {
    currentActiveTab = tabId;
    Simulator.clearQueue();
    wireA.disconnectAll();
    wireB.disconnectAll();
    wireC.disconnectAll();
    wireOut.disconnectAll();
    wireCarry.disconnectAll();
    busX.disconnectAll();
    busY.disconnectAll();
    busOut.disconnectAll();
    
    document.getElementById('interactive-container')!.innerHTML = tabLayouts[tabId].render();
    
    document.querySelectorAll('.alu-tab').forEach(tab => {
        if (tab.getAttribute('data-tab') === tabId) {
            tab.className = "alu-tab px-5 py-1.5 rounded-lg text-sm font-bold bg-neon-emerald/20 text-neon-emerald shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all";
        } else {
            tab.className = "alu-tab px-5 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300 transition-all";
        }
    });

    const infoContainer = document.getElementById('alu-info-container');
    if (infoContainer) {
        infoContainer.innerHTML = aluInfoData[tabId] || '';
    }

    tabLayouts[tabId].setup();
    Simulator.stabilize();
    
    bindUIEvents();
    updateUI();
}

function bindUIEvents() {
    if (currentActiveTab === 'ADD4') {
        const inpA = document.getElementById('add4-a') as HTMLInputElement;
        const inpB = document.getElementById('add4-b') as HTMLInputElement;
        const updateAddInputs = () => {
            busSetValue(busX, parseNum(inpA.value) & 15);
            busSetValue(busY, parseNum(inpB.value) & 15);
            document.getElementById('add4-a-bin')!.innerText = (parseNum(inpA.value) & 15).toString(2).padStart(4, '0');
            document.getElementById('add4-b-bin')!.innerText = (parseNum(inpB.value) & 15).toString(2).padStart(4, '0');
            Simulator.stabilize();
            updateUI();
        };
        inpA.addEventListener('input', updateAddInputs);
        inpB.addEventListener('input', updateAddInputs);
    }
    else if (currentActiveTab === 'ADD16') {
        const inpA = document.getElementById('add16-a') as HTMLInputElement;
        const inpB = document.getElementById('add16-b') as HTMLInputElement;
        const updateAddInputs = () => {
            busSetValue(busX, parseNum(inpA.value));
            busSetValue(busY, parseNum(inpB.value));
            document.getElementById('add16-a-bin')!.innerText = numToBinStr(parseNum(inpA.value));
            document.getElementById('add16-b-bin')!.innerText = numToBinStr(parseNum(inpB.value));
            Simulator.stabilize();
            updateUI();
        };
        inpA.addEventListener('input', updateAddInputs);
        inpB.addEventListener('input', updateAddInputs);
    }
    else if (currentActiveTab === 'ALU') {
        const inpX = document.getElementById('alu-x') as HTMLInputElement;
        const inpY = document.getElementById('alu-y') as HTMLInputElement;
        const ctrls = ['zx', 'nx', 'zy', 'ny', 'f', 'no'];
        
        const updateAluInputs = () => {
            busSetValue(busX, parseNum(inpX.value));
            busSetValue(busY, parseNum(inpY.value));
            
            document.getElementById('alu-x-bin')!.innerText = numToBinStr(parseNum(inpX.value));
            document.getElementById('alu-y-bin')!.innerText = numToBinStr(parseNum(inpY.value));
            
            Simulator.stabilize();
            updateUI();
        };
        
        inpX.addEventListener('input', updateAluInputs);
        inpY.addEventListener('input', updateAluInputs);
        
        const wires = { zx: wZx, nx: wNx, zy: wZy, ny: wNy, f: wF, no: wNo };
        
        ctrls.forEach(c => {
            const btn = document.getElementById(`btn-${c}`);
            if (btn) {
                btn.onclick = () => {
                    wires[c as keyof typeof wires].state = !wires[c as keyof typeof wires].state;
                    btn.innerText = wires[c as keyof typeof wires].state ? "1" : "0";
                    if (wires[c as keyof typeof wires].state) {
                        btn.classList.add('bg-neon-emerald', 'text-black');
                        btn.classList.remove('bg-gray-700', 'text-white');
                    } else {
                        btn.classList.remove('bg-neon-emerald', 'text-black');
                        btn.classList.add('bg-gray-700', 'text-white');
                    }
                    Simulator.stabilize();
                    updateUI();
                };
            }
        });
        
        const presetBtns = document.querySelectorAll('.alu-preset-btn');
        presetBtns.forEach(btn => {
            (btn as HTMLButtonElement).onclick = () => {
                const bits = btn.getAttribute('data-bits')!;
                wZx.state = bits[0] === '1';
                wNx.state = bits[1] === '1';
                wZy.state = bits[2] === '1';
                wNy.state = bits[3] === '1';
                wF.state = bits[4] === '1';
                wNo.state = bits[5] === '1';
                
                ctrls.forEach(c => {
                    const cbtn = document.getElementById(`btn-${c}`)!;
                    const st = wires[c as keyof typeof wires].state;
                    cbtn.innerText = st ? "1" : "0";
                    if (st) {
                        cbtn.classList.add('bg-neon-emerald', 'text-black');
                        cbtn.classList.remove('bg-gray-700', 'text-white');
                    } else {
                        cbtn.classList.remove('bg-neon-emerald', 'text-black');
                        cbtn.classList.add('bg-gray-700', 'text-white');
                    }
                });
                
                Simulator.stabilize();
                updateUI();
            };
        });
    } else {
        ['a', 'b', 'c'].forEach(id => {
            const btn = document.getElementById(`btn-toggle-${id}`);
            if (btn) {
                btn.onclick = () => {
                    if (id === 'a') wireA.state = !wireA.state;
                    if (id === 'b') wireB.state = !wireB.state;
                    if (id === 'c') wireC.state = !wireC.state;
                    Simulator.stabilize();
                    updateUI();
                };
            }
        });
    }
}

function updateColor(id: string, state: boolean, isOutput: boolean = false) {
    const el = document.getElementById(id);
    if (!el) return;
    const color = state ? (isOutput ? COLOR_OUT_ON : COLOR_ON) : COLOR_OFF;
    
    if (el.tagName === 'rect') {
        el.setAttribute('stroke', color);
        if (state) el.style.filter = `drop-shadow(0 0 8px ${color})`;
        else el.style.filter = 'none';
    } else if (el.tagName === 'circle') {
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
    if (currentActiveTab === 'ADD4') {
        const outVal = busGetValue(busOut) & 15; // 4-bit mask
        const xVal = busGetValue(busX) & 15;
        const yVal = busGetValue(busY) & 15;
        let outStr = outVal.toString(10);
        if ((outVal >> 3) === 1) { // 4-bit 2's complement negative
            outStr = (outVal - 16).toString(10);
        }
        document.getElementById('add4-out')!.innerText = outStr;
        document.getElementById('add4-out-bin')!.innerText = outVal.toString(2).padStart(4, '0');
        
        // Highlight wires and set dynamic text
        for (let i = 0; i < 4; i++) {
            const aBit = (xVal >> i) & 1;
            const bBit = (yVal >> i) & 1;
            const sBit = (outVal >> i) & 1;
            
            document.getElementById(`add4-val-a${i}`)!.textContent = aBit.toString();
            document.getElementById(`add4-val-b${i}`)!.textContent = bBit.toString();
            document.getElementById(`add4-val-s${i}`)!.textContent = sBit.toString();
            
            updateColor(`wire-w-a${i}`, aBit === 1, true);
            updateColor(`wire-w-b${i}`, bBit === 1, true);
            updateColor(`wire-s${i}`, sBit === 1, true);
        }
        
        // Carry logic
        let c = 0;
        for (let i = 0; i < 4; i++) {
            const aBit = (xVal >> i) & 1;
            const bBit = (yVal >> i) & 1;
            c = (aBit + bBit + c) > 1 ? 1 : 0;
            if (i < 3) {
                updateColor(`wire-w-cry${i+1}`, c === 1, true);
            } else {
                updateColor(`wire-w-cryout`, c === 1, true);
            }
        }
        updateColor('wire-w-cin0', false, true);
    }
    else if (currentActiveTab === 'ADD16') {
        const outVal = busGetValue(busOut);
        const xVal = busGetValue(busX);
        const yVal = busGetValue(busY);

        // Handle negative rendering properly (16-bit 2's complement)
        let outStr = outVal.toString(10);
        if ((outVal >> 15) === 1) {
            outStr = (outVal - 65536).toString(10);
        }
        document.getElementById('add16-out')!.innerText = outStr;
        document.getElementById('add16-out-bin')!.innerText = numToBinStr(outVal);
        
        // Update 4-bit bus values and colors
        for (let i = 0; i < 4; i++) {
            const shift = i * 4;
            const mask = 15 << shift;
            document.getElementById(`val-a${i}`)!.textContent = ((xVal & mask) >>> shift).toString(2).padStart(4, '0');
            document.getElementById(`val-b${i}`)!.textContent = ((yVal & mask) >>> shift).toString(2).padStart(4, '0');
            document.getElementById(`val-out${i}`)!.textContent = ((outVal & mask) >>> shift).toString(2).padStart(4, '0');
            
            updateColor(`bus-in-a${i}`, (xVal & mask) !== 0, true);
            updateColor(`bus-in-b${i}`, (yVal & mask) !== 0, true);
            updateColor(`bus-out${i}`, (outVal & mask) !== 0, true);
        }

        // Highlight carry wires
        const c1 = ((xVal & 15) + (yVal & 15)) > 15;
        const c2 = ((xVal & 255) + (yVal & 255)) > 255;
        const c3 = ((xVal & 4095) + (yVal & 4095)) > 4095;
        const cout = (xVal + yVal) > 65535;

        updateColor('wire-w-cin0', false, true);
        updateColor('wire-w-cry1', c1, true);
        updateColor('wire-w-cry2', c2, true);
        updateColor('wire-w-cry3', c3, true);
        updateColor('wire-w-cryout', cout, true);
    }
    if (currentActiveTab === 'ALU') {
        const outVal = busGetValue(busOut);
        const xVal = busGetValue(busX);
        const yVal = busGetValue(busY);
        
        // Handle negative rendering properly (16-bit 2's complement)
        let outStr = outVal.toString(10);
        if (wNg.state) {
            outStr = (outVal - 65536).toString(10);
        }
        
        document.getElementById('alu-out')!.innerText = outStr;
        document.getElementById('alu-out-bin')!.innerText = numToBinStr(outVal);
        
        // Highlight active control wires
        updateColor('wire-w-ctrl-zx', wZx.state);
        updateColor('wire-w-ctrl-nx', wNx.state);
        updateColor('wire-w-ctrl-zy', wZy.state);
        updateColor('wire-w-ctrl-ny', wNy.state);
        updateColor('wire-w-ctrl-f', wF.state);
        updateColor('wire-w-ctrl-no', wNo.state);
        
        // Calculate intermediate values for datapath highlighting
        const x1 = wZx.state ? 0 : xVal;
        const x2 = wNx.state ? ((~x1) & 0xFFFF) : x1;
        const y1 = wZy.state ? 0 : yVal;
        const y2 = wNy.state ? ((~y1) & 0xFFFF) : y1;
        const outAdd = (x2 + y2) & 0xFFFF;
        const outAnd = (x2 & y2) & 0xFFFF;
        const fout = wF.state ? outAdd : outAnd;
        const finalOut = wNo.state ? ((~fout) & 0xFFFF) : fout;

        // Set Hex values
        const toHex = (n: number) => '0x' + n.toString(16).toUpperCase().padStart(4, '0');
        const updateHex = (id: string, val: number) => {
            const el = document.getElementById(id);
            if (el) el.textContent = toHex(val);
        };
        
        updateHex('val-alu-in-x', xVal);
        updateHex('val-alu-x1', x1);
        updateHex('val-alu-x2', x2);
        updateHex('val-alu-in-y', yVal);
        updateHex('val-alu-y1', y1);
        updateHex('val-alu-y2', y2);
        updateHex('val-alu-outAdd', outAdd);
        updateHex('val-alu-outAnd', outAnd);
        updateHex('val-alu-fout', fout);
        updateHex('val-alu-out', finalOut);

        // Highlight buses
        updateColor('bus-alu-in-x', xVal !== 0, true);
        updateColor('bus-alu-zero-x', false, true); // Constant 0 is never lit
        updateColor('bus-alu-x1', x1 !== 0, true);
        updateColor('bus-alu-x1-a', x1 !== 0, true);
        updateColor('bus-alu-x1-b', x1 !== 0, true);
        updateColor('bus-alu-xnot', ((~x1) & 0xFFFF) !== 0, true);
        updateColor('bus-alu-x2', x2 !== 0, true);
        updateColor('bus-alu-x2-add', x2 !== 0, true);
        updateColor('bus-alu-x2-and', x2 !== 0, true);

        updateColor('bus-alu-in-y', yVal !== 0, true);
        updateColor('bus-alu-zero-y', false, true);
        updateColor('bus-alu-y1', y1 !== 0, true);
        updateColor('bus-alu-y1-a', y1 !== 0, true);
        updateColor('bus-alu-y1-b', y1 !== 0, true);
        updateColor('bus-alu-ynot', ((~y1) & 0xFFFF) !== 0, true);
        updateColor('bus-alu-y2', y2 !== 0, true);
        updateColor('bus-alu-y2-add', y2 !== 0, true);
        updateColor('bus-alu-y2-and', y2 !== 0, true);

        updateColor('bus-alu-out-add', outAdd !== 0, true);
        updateColor('bus-alu-out-and', outAnd !== 0, true);

        updateColor('bus-alu-fout', fout !== 0, true);
        updateColor('bus-alu-fout-a', fout !== 0, true);
        updateColor('bus-alu-fout-b', fout !== 0, true);
        updateColor('bus-alu-fout-not', ((~fout) & 0xFFFF) !== 0, true);
        
        updateColor('bus-alu-out', finalOut !== 0, true);
        updateColor('bus-alu-out-to-ng', finalOut !== 0, true);
        updateColor('bus-alu-out-to-zr', finalOut !== 0, true);
        
        // Highlight flag output wires
        updateColor('wire-w-flag-ng', wNg.state, true);
        updateColor('wire-w-flag-zr', wZr.state, true);

        
        const zrEl = document.getElementById('flag-zr')!;
        if (wZr.state) zrEl.className = "w-4 h-4 rounded-full bg-neon-cyan drop-shadow-[0_0_8px_rgba(0,240,255,1)] transition-colors duration-300";
        else zrEl.className = "w-4 h-4 rounded-full bg-gray-700 transition-colors duration-300";
        
        const ngEl = document.getElementById('flag-ng')!;
        if (wNg.state) ngEl.className = "w-4 h-4 rounded-full bg-neon-cyan drop-shadow-[0_0_8px_rgba(0,240,255,1)] transition-colors duration-300";
        else ngEl.className = "w-4 h-4 rounded-full bg-gray-700 transition-colors duration-300";
        
    } else {
        updateColor('node-a', wireA.state);
        updateColor('node-b', wireB.state);
        updateColor('node-c', wireC.state);
        
        if (currentActiveTab === 'MUX') {
            updateColor('wire-w-sel-not', wireC.state);
            updateColor('wire-w-sel-and2', wireC.state);
            updateColor('wire-w-a-and1', wireA.state);
            updateColor('wire-w-b-and2', wireB.state);
            // internally evaluated values aren't exposed cleanly here without digging, so we just light up inputs and outputs for schematic.
        } else if (currentActiveTab === 'HALF') {
            updateColor('wire-w-a-xor', wireA.state);
            updateColor('wire-w-b-xor', wireB.state);
            updateColor('wire-w-a-and', wireA.state);
            updateColor('wire-w-b-and', wireB.state);
        } else if (currentActiveTab === 'FULL') {
            updateColor('wire-w-a-h1', wireA.state);
            updateColor('wire-w-b-h1', wireB.state);
            updateColor('wire-w-c-h2', wireC.state);
        }
        
        updateColor('node-out', wireOut.state, true);
        updateColor('wire-w-out', wireOut.state, true);
        updateColor('wire-w-sum', wireOut.state, true);
        const outTxt = document.getElementById('text-out');
        if (outTxt) {
            updateColor('text-out', wireOut.state, true);
            const label = currentActiveTab === 'MUX' ? 'OUT' : 'SUM';
            outTxt.textContent = `${label}: ${wireOut.state ? '1' : '0'}`;
        }

        updateColor('node-carry', wireCarry.state, true);
        updateColor('wire-w-carry', wireCarry.state, true);
        const carryTxt = document.getElementById('text-carry');
        if (carryTxt) {
            updateColor('text-carry', wireCarry.state, true);
            carryTxt.textContent = `CARRY: ${wireCarry.state ? '1' : '0'}`;
        }
        
        // TRUTH TABLE
        document.querySelectorAll('tr[id^="tt-"]').forEach(el => el.classList.remove('bg-neon-emerald/20', 'font-bold', 'text-white'));
        const a = wireA.state ? 1 : 0;
        const b = wireB.state ? 1 : 0;
        const c = wireC.state ? 1 : 0;
        
        if (currentActiveTab === 'MUX') {
            document.getElementById(`tt-mux-${c}${a}${b}`)?.classList.add('bg-neon-emerald/20', 'font-bold', 'text-white');
        } else if (currentActiveTab === 'HALF') {
            document.getElementById(`tt-half-${a}${b}`)?.classList.add('bg-neon-emerald/20', 'font-bold', 'text-white');
        } else if (currentActiveTab === 'FULL') {
            document.getElementById(`tt-full-${a}${b}${c}`)?.classList.add('bg-neon-emerald/20', 'font-bold', 'text-white');
        }
    }
    
    document.getElementById('eval-count')!.innerText = Simulator.gatesEvaluatedThisTick.toString();
}

document.querySelectorAll('.alu-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        loadTab((e.target as HTMLButtonElement).getAttribute('data-tab')!);
    });
});

loadTab('MUX');
