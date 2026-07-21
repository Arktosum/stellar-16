const fs = require('fs');

const aluPagePath = 'src/alu-page.ts';
let code = fs.readFileSync(aluPagePath, 'utf8');

const newAluInfo = `
        <div class="p-5 bg-gray-900/50 border border-neon-emerald/20 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.05)]">
            <h3 class="text-lg font-bold text-white mb-2">16-Bit ALU</h3>
            <p class="mb-3 text-gray-400">The calculator of the CPU. It computes mathematical operations on two 16-bit numbers based on 6 control bits. Look closely at the hardware blocks:</p>
            <ul class="text-xs text-gray-400 mb-3 space-y-2 ml-4 list-disc">
                <li><strong>zx / zy</strong>: 16-Bit Multiplexers that select between the input and all 0s.</li>
                <li><strong>nx / ny</strong>: A 16-Bit NOT gate and a MUX that allows negating the input.</li>
                <li><strong>f</strong>: A 16-Bit ADDER and a 16-Bit AND gate run in parallel, and a MUX selects which result to use.</li>
                <li><strong>no</strong>: A final 16-Bit NOT + MUX to optionally negate the output.</li>
            </ul>
            <p class="text-gray-400 mb-2"><strong>Control Bits Examples:</strong> zx, nx, zy, ny, f, no</p>
            <ul class="text-xs text-gray-500 font-mono space-y-1 ml-4 list-disc">
                <li><span class="text-white">0 1 0 1 0 1</span> -> X OR Y</li>
                <li><span class="text-white">0 0 0 0 0 0</span> -> X AND Y</li>
                <li><span class="text-white">0 0 0 0 1 0</span> -> X + Y</li>
                <li><span class="text-white">0 1 0 0 1 1</span> -> X - Y</li>
                <li><span class="text-white">1 1 1 1 1 1</span> -> 1</li>
                <li><span class="text-white">1 0 1 0 1 0</span> -> 0</li>
            </ul>
        </div>
`;

code = code.replace(
    /"ALU": `[\s\S]*?`\n\};/,
    `"ALU": \`${newAluInfo}\`\n};`
);

fs.writeFileSync(aluPagePath, code);
console.log('Successfully patched ALU info in alu-page.ts!');
