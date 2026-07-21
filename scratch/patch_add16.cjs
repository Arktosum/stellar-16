const fs = require('fs');

const aluPagePath = 'src/alu-page.ts';
let code = fs.readFileSync(aluPagePath, 'utf8');

// Update ADD16 Info Data
code = code.replace(
    /<h3 class="text-lg font-bold text-white mb-2">16-Bit Ripple Carry Adder<\/h3>[\s\S]*?<\/div>/,
    `<h3 class="text-lg font-bold text-white mb-2">16-Bit Ripple Carry Adder</h3>
            <p class="mb-3 text-gray-400">By chaining 16 Full-Adders together, we can add two 16-bit numbers! But drawing 16 blocks is messy. Instead, we use <strong>Abstraction</strong>.</p>
            <p class="mb-3 text-gray-400">First, we chain 4 Full-Adders to make a <strong>4-Bit Adder</strong> block. Then, we just chain four of those 4-Bit Adders together to make a 16-Bit Adder!</p>
            <p class="text-gray-400">Notice how the <strong>Carry-Out</strong> (CRY) of one block ripples directly into the <strong>Carry-In</strong> (CIN) of the next!</p>
        </div>`
);

// Update ADD16 SVG
const newAdd16Svg = `
                <div class="overflow-x-auto w-full pb-4">
                <svg viewBox="0 0 700 200" class="w-[700px] h-auto mx-auto">
                    <!-- 4-Bit Adder 1 (Bits 0-3) -->
                    \${drawBox(100, 60, 80, 80, '4-BIT ADD')}
                    \${drawBus('a0-3', 'M 140 20 L 140 60', 125, 40)}
                    <text x="140" y="15" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">A[0..3]</text>
                    \${drawBus('b0-3', 'M 140 180 L 140 140', 125, 160)}
                    <text x="140" y="190" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">B[0..3]</text>
                    <text x="75" y="105" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold">CIN</text>
                    \${drawWire('w-cin0', 'M 50 100 L 100 100')}
                    <text x="155" y="105" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold">CRY</text>
                    
                    <!-- 4-Bit Adder 2 (Bits 4-7) -->
                    \${drawBox(240, 60, 80, 80, '4-BIT ADD')}
                    \${drawBus('a4-7', 'M 280 20 L 280 60', 265, 40)}
                    <text x="280" y="15" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">A[4..7]</text>
                    \${drawBus('b4-7', 'M 280 180 L 280 140', 265, 160)}
                    <text x="280" y="190" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">B[4..7]</text>
                    \${drawWire('w-cry1', 'M 180 100 L 240 100')}
                    <text x="295" y="105" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold">CRY</text>

                    <!-- 4-Bit Adder 3 (Bits 8-11) -->
                    \${drawBox(380, 60, 80, 80, '4-BIT ADD')}
                    \${drawBus('a8-11', 'M 420 20 L 420 60', 405, 40)}
                    <text x="420" y="15" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">A[8..11]</text>
                    \${drawBus('b8-11', 'M 420 180 L 420 140', 405, 160)}
                    <text x="420" y="190" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">B[8..11]</text>
                    \${drawWire('w-cry2', 'M 320 100 L 380 100')}
                    <text x="435" y="105" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold">CRY</text>
                    
                    <!-- 4-Bit Adder 4 (Bits 12-15) -->
                    \${drawBox(520, 60, 80, 80, '4-BIT ADD')}
                    \${drawBus('a12-15', 'M 560 20 L 560 60', 545, 40)}
                    <text x="560" y="15" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">A[12..15]</text>
                    \${drawBus('b12-15', 'M 560 180 L 560 140', 545, 160)}
                    <text x="560" y="190" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">B[12..15]</text>
                    \${drawWire('w-cry3', 'M 460 100 L 520 100')}
                    <text x="575" y="105" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold">CRY</text>
                    \${drawWire('w-cryout', 'M 600 100 L 650 100')}
                    
                    <!-- Sum Output Bus combining all 4 -->
                    \${drawBus('sum-all', 'M 140 100 L 140 110 L 280 110 L 280 100 M 420 100 L 420 110 L 560 110 L 560 100', 0, -1000)} <!-- hidden labels -->
                    <path d="M 140 120 L 140 135 L 560 135 L 560 120 M 350 135 L 350 160" fill="none" stroke="#475569" stroke-width="4" stroke-dasharray="4" />
                    <!-- Actually we shouldn't make the bus too complex, let's just point them down -->
                </svg>
                </div>
`;

const newAdd16SvgSimpler = `
                <div class="overflow-x-auto w-full pb-4">
                <svg viewBox="0 0 700 230" class="w-[700px] h-auto mx-auto">
                    <!-- 4-Bit Adder 1 (Bits 0-3) -->
                    \${drawBox(100, 80, 80, 80, '4-BIT ADD')}
                    \${drawBus('a0-3', 'M 120 20 L 120 80', 105, 40)}
                    <text x="120" y="15" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">A[0..3]</text>
                    \${drawBus('b0-3', 'M 160 20 L 160 80', 175, 40)}
                    <text x="160" y="15" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">B[0..3]</text>
                    
                    <text x="70" y="124" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold">CIN</text>
                    \${drawWire('w-cin0', 'M 40 120 L 100 120')}
                    <text x="155" y="124" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold">CRY</text>
                    
                    \${drawBus('s0-3', 'M 140 160 L 140 200', 125, 180)}
                    <text x="140" y="215" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">SUM[0..3]</text>
                    
                    <!-- 4-Bit Adder 2 (Bits 4-7) -->
                    \${drawBox(240, 80, 80, 80, '4-BIT ADD')}
                    \${drawBus('a4-7', 'M 260 20 L 260 80', 245, 40)}
                    <text x="260" y="15" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">A[4..7]</text>
                    \${drawBus('b4-7', 'M 300 20 L 300 80', 315, 40)}
                    <text x="300" y="15" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">B[4..7]</text>

                    \${drawWire('w-cry1', 'M 180 120 L 240 120')}
                    <text x="295" y="124" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold">CRY</text>
                    
                    \${drawBus('s4-7', 'M 280 160 L 280 200', 265, 180)}
                    <text x="280" y="215" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">SUM[4..7]</text>

                    <!-- 4-Bit Adder 3 (Bits 8-11) -->
                    \${drawBox(380, 80, 80, 80, '4-BIT ADD')}
                    \${drawBus('a8-11', 'M 400 20 L 400 80', 385, 40)}
                    <text x="400" y="15" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">A[8..11]</text>
                    \${drawBus('b8-11', 'M 440 20 L 440 80', 455, 40)}
                    <text x="440" y="15" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">B[8..11]</text>

                    \${drawWire('w-cry2', 'M 320 120 L 380 120')}
                    <text x="435" y="124" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold">CRY</text>
                    
                    \${drawBus('s8-11', 'M 420 160 L 420 200', 405, 180)}
                    <text x="420" y="215" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">SUM[8..11]</text>
                    
                    <!-- 4-Bit Adder 4 (Bits 12-15) -->
                    \${drawBox(520, 80, 80, 80, '4-BIT ADD')}
                    \${drawBus('a12-15', 'M 540 20 L 540 80', 525, 40)}
                    <text x="540" y="15" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">A[12..15]</text>
                    \${drawBus('b12-15', 'M 580 20 L 580 80', 595, 40)}
                    <text x="580" y="15" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">B[12..15]</text>

                    \${drawWire('w-cry3', 'M 460 120 L 520 120')}
                    <text x="575" y="124" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold">CRY</text>
                    \${drawWire('w-cryout', 'M 600 120 L 660 120')}
                    
                    \${drawBus('s12-15', 'M 560 160 L 560 200', 545, 180)}
                    <text x="560" y="215" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">SUM[12..15]</text>
                </svg>
                </div>
`;

code = code.replace(
    /<div class="w-full flex justify-center my-4">[\s\S]*?<\/div>/,
    newAdd16SvgSimpler
);

fs.writeFileSync(aluPagePath, code);
console.log('Successfully patched ADD16 in alu-page.ts!');
