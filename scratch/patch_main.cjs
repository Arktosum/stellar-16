const fs = require('fs');

let code = fs.readFileSync('src/main.ts', 'utf8');

// 1. Add <div id="gate-info-container"></div> to the left pane
code = code.replace(
  /<p>\s*Click the <strong class="text-neon-cyan">Inputs<\/strong> on the right to inject electricity into the circuit\. Watch how it cascades through the raw NAND components to compute the final output\.\s*<\/p>/,
  `
        <p>
          Click the <strong class="text-neon-cyan">Inputs</strong> on the right to inject electricity into the circuit. Watch how it cascades through the raw NAND components to compute the final output.
        </p>
        <div id="gate-info-container" class="transition-all duration-300"></div>
  `
);

// 2. Define the gate infos
const gateInfos = `
const gateInfoData: Record<string, string> = {
    "NAND": \`
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
    \`,
    "NOT": \`
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
    \`,
    "AND": \`
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
    \`,
    "OR": \`
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
    \`,
    "XOR": \`
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
    \`,
    "OSC": \`
        <div class="p-5 bg-gray-900/50 border border-neon-cyan/20 rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.05)]">
            <h3 class="text-lg font-bold text-white mb-2">Ring Oscillator</h3>
            <p class="mb-3 text-gray-400">By chaining an odd number of NOT gates in a loop, the signal is constantly trying to invert itself, creating an infinite oscillation! Our physics engine prevents the browser from freezing by throttling this loop.</p>
        </div>
    \`
};
`;

// Insert it right before loadGate function
code = code.replace(/function loadGate\(/, gateInfos + '\nfunction loadGate(');

// 3. Inject it in loadGate
code = code.replace(/activeGateType = gateType;/, `activeGateType = gateType;
    const infoContainer = document.getElementById('gate-info-container');
    if (infoContainer) {
        infoContainer.innerHTML = gateInfoData[gateType] || '';
    }
`);

// 4. Highlight the truth table row in updateUI
const updateTruthTableCode = `
    // Truth table highlighting
    document.querySelectorAll('tr[id^="tt-"]').forEach(el => el.classList.remove('bg-neon-cyan/20', 'font-bold', 'text-white'));
    
    if (activeGateType === 'NOT') {
        const a = wireA.state ? 1 : 0;
        document.getElementById(\`tt-not-\${a}\`)?.classList.add('bg-neon-cyan/20', 'font-bold', 'text-white');
    } else if (activeGateType !== 'OSC') {
        const a = wireA.state ? 1 : 0;
        const b = wireB.state ? 1 : 0;
        document.getElementById(\`tt-\${activeGateType.toLowerCase()}-\${a}\${b}\`)?.classList.add('bg-neon-cyan/20', 'font-bold', 'text-white');
    }
`;

code = code.replace(/function updateUI\(\) \{/, `function updateUI() {\n${updateTruthTableCode}`);

fs.writeFileSync('src/main.ts', code);
console.log('Main.ts patched!');
