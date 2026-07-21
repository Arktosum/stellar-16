const fs = require('fs');

const aluPagePath = 'src/alu-page.ts';
let code = fs.readFileSync(aluPagePath, 'utf8');

// 1. Imports
code = code.replace(
    /import \{ HalfAdder, FullAdder, ALU \} from '\.\/arithmetic';/,
    `import { HalfAdder, FullAdder, Add16, ALU } from './arithmetic';`
);

// 2. Tabs
code = code.replace(
    /<button class="alu-tab px-5 py-1\.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300 transition-all" data-tab="FULL">FULL-ADDER<\/button>\s*<button class="alu-tab px-5 py-1\.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300 transition-all" data-tab="ALU">16-BIT ALU<\/button>/,
    `<button class="alu-tab px-5 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300 transition-all" data-tab="FULL">FULL-ADDER</button>
            <button class="alu-tab px-5 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300 transition-all" data-tab="ADD16">16-BIT ADDER</button>
            <button class="alu-tab px-5 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300 transition-all" data-tab="ALU">16-BIT ALU</button>`
);

// 3. Info Data
code = code.replace(
    /"ALU": `/,
    `"ADD16": \`
        <div class="p-5 bg-gray-900/50 border border-neon-emerald/20 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.05)]">
            <h3 class="text-lg font-bold text-white mb-2">16-Bit Ripple Carry Adder</h3>
            <p class="mb-3 text-gray-400">By chaining 16 Full-Adders together, we can add two 16-bit numbers! The Carry-Out of bit 0 feeds directly into the Carry-In of bit 1, rippling all the way to bit 15.</p>
            <p class="text-gray-400">Instead of drawing 16 individual wires, we use <strong>Bus notation</strong>: a single wire with a slash and a '16' above it indicates a bundle of 16 wires!</p>
        </div>
    \`,
    "ALU": \``
);

// 4. Tab Layouts & SVG Drawing Helpers
// We need to inject drawBus function before tabLayouts
code = code.replace(
    /const drawBox = \(x: number, y: number, w: number, h: number, label: string\) => `/g,
    `const drawBus = (id: string, d: string, labelX: number, labelY: number) => \`
    <path id="bus-\${id}" d="\${d}" fill="none" stroke="\${COLOR_OFF}" stroke-width="4" class="transition-all duration-300" />
    <path d="M \${labelX-4} \${labelY+6} L \${labelX+4} \${labelY-6}" stroke="\${COLOR_OFF}" stroke-width="2" />
    <text x="\${labelX}" y="\${labelY-10}" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">16</text>
\`;
const drawBox = (x: number, y: number, w: number, h: number, label: string) => \``
);

const add16Layout = `
    "ADD16": {
        setup: () => new Add16(busX, busY, busOut, "Test_ADD16"),
        render: () => \`
          <div class="flex flex-col w-full max-w-3xl gap-6">
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
            
            <div class="w-full flex justify-center my-4">
                <svg viewBox="0 0 400 150" class="w-full max-w-md">
                    \${drawBox(140, 40, 120, 70, '16-BIT ADDER')}
                    
                    <text x="30" y="55" fill="#9ca3af" font-family="monospace" font-size="12" font-weight="bold">A</text>
                    \${drawBus('in-a', 'M 40 50 L 140 50', 90, 50)}
                    
                    <text x="30" y="105" fill="#9ca3af" font-family="monospace" font-size="12" font-weight="bold">B</text>
                    \${drawBus('in-b', 'M 40 100 L 140 100', 90, 100)}
                    
                    \${drawBus('out', 'M 260 75 L 360 75', 310, 75)}
                    <text x="370" y="80" fill="#9ca3af" font-family="monospace" font-size="12" font-weight="bold">SUM</text>
                </svg>
            </div>
            
            <div class="bg-black p-6 rounded-xl border border-neon-cyan/50 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
                <label class="text-xs font-bold text-gray-500 mb-2 block">Output (16-bit)</label>
                <div id="add16-out" class="text-4xl text-neon-cyan font-mono tracking-wider text-right drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">0</div>
                <div id="add16-out-bin" class="text-xs text-gray-400 font-mono mt-3 tracking-[0.3em] text-right">0000000000000000</div>
            </div>
          </div>
        \`
    },
`;

const aluRender = `
        setup: () => new ALU(busX, busY, wZx, wNx, wZy, wNy, wF, wNo, busOut, wZr, wNg, "Test_ALU"),
        render: () => \`
          <div class="flex flex-col w-full max-w-4xl gap-6">
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
            
            <div class="bg-gray-800/50 p-4 rounded-xl border border-white/5 flex flex-col xl:flex-row gap-6">
                <div class="flex-1 flex flex-col justify-center">
                    <div class="flex justify-between items-center mb-4">
                        <label class="text-xs font-bold text-gray-500">Control Bits</label>
                        <select id="alu-preset" class="bg-black/50 border border-white/10 text-gray-300 font-mono text-xs p-1 rounded">
                            <option value="custom">Custom</option>
                            <option value="x+y" data-bits="000010">X + Y</option>
                            <option value="x-y" data-bits="010011">X - Y</option>
                            <option value="y-x" data-bits="000111">Y - X</option>
                            <option value="x&y" data-bits="000000">X & Y</option>
                            <option value="x|y" data-bits="010101">X | Y</option>
                            <option value="!x" data-bits="001101">!X</option>
                            <option value="1" data-bits="111111">1</option>
                            <option value="0" data-bits="101010">0</option>
                        </select>
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
                
                <div class="w-full xl:w-[600px] bg-black/60 rounded-lg overflow-hidden border border-white/5 relative flex justify-center items-center py-4">
                    <svg viewBox="0 0 600 200" class="w-full h-auto">
                        <text x="20" y="45" fill="#9ca3af" font-family="monospace" font-size="12" font-weight="bold">X</text>
                        \${drawBus('alu-in-x', 'M 30 40 L 80 40', 55, 40)}
                        <rect id="box-zx" x="80" y="25" width="40" height="30" rx="4" fill="#1e293b" stroke="#475569" stroke-width="2" class="transition-all duration-300" />
                        <text x="100" y="44" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">ZX</text>
                        \${drawBus('alu-x1', 'M 120 40 L 160 40', 140, 40)}
                        <rect id="box-nx" x="160" y="25" width="40" height="30" rx="4" fill="#1e293b" stroke="#475569" stroke-width="2" class="transition-all duration-300" />
                        <text x="180" y="44" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">NX</text>
                        \${drawBus('alu-x2', 'M 200 40 L 300 40 L 300 70 L 320 70', 250, 40)}

                        <text x="20" y="165" fill="#9ca3af" font-family="monospace" font-size="12" font-weight="bold">Y</text>
                        \${drawBus('alu-in-y', 'M 30 160 L 80 160', 55, 160)}
                        <rect id="box-zy" x="80" y="145" width="40" height="30" rx="4" fill="#1e293b" stroke="#475569" stroke-width="2" class="transition-all duration-300" />
                        <text x="100" y="164" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">ZY</text>
                        \${drawBus('alu-y1', 'M 120 160 L 160 160', 140, 160)}
                        <rect id="box-ny" x="160" y="145" width="40" height="30" rx="4" fill="#1e293b" stroke="#475569" stroke-width="2" class="transition-all duration-300" />
                        <text x="180" y="164" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">NY</text>
                        \${drawBus('alu-y2', 'M 200 160 L 300 160 L 300 130 L 320 130', 250, 160)}

                        <rect id="box-f" x="320" y="60" width="60" height="80" rx="4" fill="#1e293b" stroke="#475569" stroke-width="2" class="transition-all duration-300" />
                        <text x="350" y="104" fill="#00f0ff" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">f (+/&)</text>
                        
                        \${drawBus('alu-fout', 'M 380 100 L 440 100', 410, 100)}

                        <rect id="box-no" x="440" y="85" width="40" height="30" rx="4" fill="#1e293b" stroke="#475569" stroke-width="2" class="transition-all duration-300" />
                        <text x="460" y="104" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">NO</text>
                        
                        \${drawBus('alu-out', 'M 480 100 L 550 100', 515, 100)}
                        <text x="560" y="105" fill="#9ca3af" font-family="monospace" font-size="12" font-weight="bold">OUT</text>
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
        \``;

code = code.replace(
    /setup: \(\) => new ALU\(busX, busY, wZx, wNx, wZy, wNy, wF, wNo, busOut, wZr, wNg, "Test_ALU"\),\s*render: \(\) => `[\s\S]*?`\s*}/,
    add16Layout + aluRender + `
    }`
);

// Add event handlers for ADD16
code = code.replace(
    /function bindUIEvents\(\) \{/,
    `function bindUIEvents() {
    if (currentActiveTab === 'ADD16') {
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
    }`
);
code = code.replace(
    /if \(currentActiveTab === 'ALU'\) \{/,
    `else if (currentActiveTab === 'ALU') {`
);

// Update UI logic
code = code.replace(
    /function updateUI\(\) \{/,
    `function updateUI() {
    if (currentActiveTab === 'ADD16') {
        const outVal = busGetValue(busOut);
        // Handle negative rendering properly (16-bit 2's complement)
        let outStr = outVal.toString(10);
        if ((outVal >> 15) === 1) {
            outStr = (outVal - 65536).toString(10);
        }
        document.getElementById('add16-out')!.innerText = outStr;
        document.getElementById('add16-out-bin')!.innerText = numToBinStr(outVal);
        
        // Highlight buses
        updateColor('bus-in-a', busGetValue(busX) !== 0, true);
        updateColor('bus-in-b', busGetValue(busY) !== 0, true);
        updateColor('bus-out', outVal !== 0, true);
    }`
);

code = code.replace(
    /if \(currentActiveTab === 'ALU'\) \{/,
    `else if (currentActiveTab === 'ALU') {`
);

// Update ALU datapath blocks logic inside ALU condition in updateUI
const aluBlocksLogic = `
        // Highlight active control blocks
        updateColor('box-zx', wZx.state);
        updateColor('box-nx', wNx.state);
        updateColor('box-zy', wZy.state);
        updateColor('box-ny', wNy.state);
        updateColor('box-f', true, true); // f is always active, either + or &
        updateColor('box-no', wNo.state);
        
        // Highlight buses
        // We just highlight them cyan if they are non-zero, or just keep them active.
        updateColor('bus-alu-in-x', busGetValue(busX) !== 0, true);
        updateColor('bus-alu-in-y', busGetValue(busY) !== 0, true);
        
        // Actually, let's just make the buses cyan dynamically if non-zero
        // (Just for visual flair)
        updateColor('bus-alu-out', outVal !== 0, true);
`;

code = code.replace(
    /document\.getElementById\('alu-out-bin'\)!\.innerText = numToBinStr\(outVal\);/,
    `document.getElementById('alu-out-bin')!.innerText = numToBinStr(outVal);
        ${aluBlocksLogic}`
);

// Fix updateColor to handle boxes properly with neon-cyan / gray
code = code.replace(
    /if \(el\.tagName === 'circle'\) \{/,
    `if (el.tagName === 'rect') {
        el.setAttribute('stroke', color);
        if (state) el.style.filter = \`drop-shadow(0 0 8px \${color})\`;
        else el.style.filter = 'none';
    } else if (el.tagName === 'circle') {`
);

fs.writeFileSync(aluPagePath, code);
console.log('Successfully patched alu-page.ts!');
