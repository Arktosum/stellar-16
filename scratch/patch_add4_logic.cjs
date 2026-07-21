const fs = require('fs');

const aluPagePath = 'src/alu-page.ts';
let code = fs.readFileSync(aluPagePath, 'utf8');

const add4TabObj = `
    "ADD4": {
        setup: () => new Add16(busX, busY, busOut, "Test_ADD4"),
        render: () => \`
          <div class="flex flex-col w-full max-w-4xl gap-6">
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
            
            <div class="w-full overflow-x-auto bg-black/60 rounded-lg border border-white/5 relative flex justify-center items-center py-4">
                <svg viewBox="-40 0 700 230" class="min-w-[700px] h-auto">
                    <!-- Full Adder 0 -->
                    \${drawBox(40, 80, 80, 80, 'FULL ADD')}
                    \${drawWire('w-a0', 'M 60 20 L 60 80')}
                    <text x="60" y="15" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">A[0]</text>
                    \${drawWire('w-b0', 'M 100 20 L 100 80')}
                    <text x="100" y="15" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">B[0]</text>
                    
                    <text x="10" y="124" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold">CIN</text>
                    \${drawWire('w-cin0', 'M -20 120 L 40 120')}
                    <text x="95" y="124" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold">CRY</text>
                    
                    \${drawWire('s0', 'M 80 160 L 80 200')}
                    <text x="80" y="215" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">SUM[0]</text>
                    
                    <!-- Full Adder 1 -->
                    \${drawBox(180, 80, 80, 80, 'FULL ADD')}
                    \${drawWire('w-a1', 'M 200 20 L 200 80')}
                    <text x="200" y="15" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">A[1]</text>
                    \${drawWire('w-b1', 'M 240 20 L 240 80')}
                    <text x="240" y="15" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">B[1]</text>

                    \${drawWire('w-cry1', 'M 120 120 L 180 120')}
                    <text x="235" y="124" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold">CRY</text>
                    
                    \${drawWire('s1', 'M 220 160 L 220 200')}
                    <text x="220" y="215" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">SUM[1]</text>

                    <!-- Full Adder 2 -->
                    \${drawBox(320, 80, 80, 80, 'FULL ADD')}
                    \${drawWire('w-a2', 'M 340 20 L 340 80')}
                    <text x="340" y="15" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">A[2]</text>
                    \${drawWire('w-b2', 'M 380 20 L 380 80')}
                    <text x="380" y="15" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">B[2]</text>

                    \${drawWire('w-cry2', 'M 260 120 L 320 120')}
                    <text x="375" y="124" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold">CRY</text>
                    
                    \${drawWire('s2', 'M 360 160 L 360 200')}
                    <text x="360" y="215" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">SUM[2]</text>
                    
                    <!-- Full Adder 3 -->
                    \${drawBox(460, 80, 80, 80, 'FULL ADD')}
                    \${drawWire('w-a3', 'M 480 20 L 480 80')}
                    <text x="480" y="15" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">A[3]</text>
                    \${drawWire('w-b3', 'M 520 20 L 520 80')}
                    <text x="520" y="15" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">B[3]</text>

                    \${drawWire('w-cry3', 'M 400 120 L 460 120')}
                    <text x="515" y="124" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold">CRY</text>
                    \${drawWire('w-cryout', 'M 540 120 L 600 120')}
                    <text x="610" y="124" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold">COUT</text>
                    
                    \${drawWire('s3', 'M 500 160 L 500 200')}
                    <text x="500" y="215" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">SUM[3]</text>
                </svg>
            </div>
            
            <div class="bg-black p-6 rounded-xl border border-neon-cyan/50 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
                <label class="text-xs font-bold text-gray-500 mb-2 block">Output (4-bit)</label>
                <div id="add4-out" class="text-4xl text-neon-cyan font-mono tracking-wider text-right drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">0</div>
                <div id="add4-out-bin" class="text-xs text-gray-400 font-mono mt-3 tracking-[0.3em] text-right">0000</div>
            </div>
          </div>
        \`
    },
`;

code = code.replace(
    /"ADD16": \{/,
    add4TabObj + '\n    "ADD16": {'
);

// Now update bindUIEvents
const bindUIEventsAdd4 = `
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
`;

code = code.replace(
    /if \(currentActiveTab === 'ADD16'\) \{/,
    bindUIEventsAdd4.trim()
);

// We need to also add updateUI logic for ADD4 outputs
const updateUIAdd4Out = `
    if (currentActiveTab === 'ADD4') {
        const val = busGetValue(busOut) & 15;
        document.getElementById('add4-out')!.innerText = val.toString();
        document.getElementById('add4-out-bin')!.innerText = val.toString(2).padStart(4, '0');
    }
    else if (currentActiveTab === 'ADD16') {
`;

code = code.replace(
    /if \(currentActiveTab === 'ADD16'\) \{/g, // This would match bindUIEvents too, let's be more specific
    function(match, offset, original) {
        // If we find it inside updateUI
        if (original.substring(offset - 50, offset).includes('updateUI')) {
            return updateUIAdd4Out.trim();
        }
        return match;
    }
);

fs.writeFileSync(aluPagePath, code);
console.log("Patched tabLayouts and bindUIEvents for ADD4!");
