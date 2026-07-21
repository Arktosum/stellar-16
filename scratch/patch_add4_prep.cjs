const fs = require('fs');

const aluPagePath = 'src/alu-page.ts';
let code = fs.readFileSync(aluPagePath, 'utf8');

// 1. Add ADD4 button
code = code.replace(
    /<button class="alu-tab px-5 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300 transition-all" data-tab="FULL">FULL-ADDER<\/button>/,
    `<button class="alu-tab px-5 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300 transition-all" data-tab="FULL">FULL-ADDER</button>\n            <button class="alu-tab px-5 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-300 transition-all" data-tab="ADD4">4-BIT ADDER</button>`
);

// 2. Add ADD4 to aluInfoData
code = code.replace(
    /"FULL": `[\s\S]*?`,/,
    `"FULL": \`
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
    \`,
    "ADD4": \`
        <div class="p-5 bg-gray-900/50 border border-neon-emerald/20 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.05)]">
            <h3 class="text-lg font-bold text-white mb-2">4-Bit Ripple Carry Adder</h3>
            <p class="mb-3 text-gray-400">By chaining 4 Full-Adders together, we can add two 4-bit numbers! The Carry-Out of bit 0 feeds directly into the Carry-In of bit 1, rippling all the way to bit 3.</p>
            <p class="text-gray-400">Notice how the wires cross boundaries: each FA takes A[i], B[i] and outputs SUM[i], but passes the Carry sideways to the next FA block!</p>
        </div>
    \`,`
);

// 3. Add ADD4 to tabLayouts
// wait, I also need to provide setup and render for ADD4. 
// For this I need the engine wires. 
// Do I have engine wires for ADD4? I only created variables for ADD16 earlier...
// Let's look at how ADD16 is defined in tabLayouts.
