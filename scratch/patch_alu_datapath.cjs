const fs = require('fs');

const aluPagePath = 'src/alu-page.ts';
let code = fs.readFileSync(aluPagePath, 'utf8');

const newAluSvg = `
                <div class="w-full overflow-x-auto bg-black/60 rounded-lg border border-white/5 relative flex justify-center items-center py-4">
                    <svg viewBox="-40 0 800 250" class="min-w-[800px] h-auto">
                        <!-- X Input -->
                        <text x="-20" y="45" fill="#9ca3af" font-family="monospace" font-size="12" font-weight="bold">X</text>
                        \${drawBus('alu-in-x', 'M -10 40 L 40 40', 15, 40)}
                        
                        <!-- ZX: 16-bit MUX -->
                        <rect id="box-zx" x="40" y="25" width="70" height="30" rx="4" fill="#1e293b" stroke="#475569" stroke-width="2" class="transition-all duration-300" />
                        <text x="75" y="44" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">16-BIT MUX</text>
                        <text x="75" y="15" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">zx</text>
                        \${drawWire('w-ctrl-zx', 'M 75 20 L 75 25')}
                        
                        \${drawBus('alu-x1', 'M 110 40 L 140 40', 125, 40)}
                        
                        <!-- NX: 16-bit NOT + MUX -->
                        <rect id="box-nx" x="140" y="10" width="110" height="60" rx="4" fill="#1e293b" stroke="#475569" stroke-width="2" class="transition-all duration-300" />
                        <text x="195" y="30" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">16-BIT NOT</text>
                        <text x="195" y="45" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">↓</text>
                        <text x="195" y="60" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">16-BIT MUX</text>
                        <text x="195" y="5" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">nx</text>
                        \${drawWire('w-ctrl-nx', 'M 195 5 L 195 10')}

                        \${drawBus('alu-x2', 'M 250 40 L 320 40 L 320 80 L 350 80', 285, 40)}

                        <!-- Y Input -->
                        <text x="-20" y="165" fill="#9ca3af" font-family="monospace" font-size="12" font-weight="bold">Y</text>
                        \${drawBus('alu-in-y', 'M -10 160 L 40 160', 15, 160)}
                        
                        <!-- ZY: 16-bit MUX -->
                        <rect id="box-zy" x="40" y="145" width="70" height="30" rx="4" fill="#1e293b" stroke="#475569" stroke-width="2" class="transition-all duration-300" />
                        <text x="75" y="164" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">16-BIT MUX</text>
                        <text x="75" y="190" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">zy</text>
                        \${drawWire('w-ctrl-zy', 'M 75 180 L 75 175')}

                        \${drawBus('alu-y1', 'M 110 160 L 140 160', 125, 160)}
                        
                        <!-- NY: 16-bit NOT + MUX -->
                        <rect id="box-ny" x="140" y="130" width="110" height="60" rx="4" fill="#1e293b" stroke="#475569" stroke-width="2" class="transition-all duration-300" />
                        <text x="195" y="150" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">16-BIT NOT</text>
                        <text x="195" y="165" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">↓</text>
                        <text x="195" y="180" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">16-BIT MUX</text>
                        <text x="195" y="200" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">ny</text>
                        \${drawWire('w-ctrl-ny', 'M 195 190 L 195 190')}

                        \${drawBus('alu-y2', 'M 250 160 L 320 160 L 320 120 L 350 120', 285, 160)}

                        <!-- f: Function (Add/And + Mux) -->
                        <rect id="box-f" x="350" y="50" width="120" height="100" rx="4" fill="#1e293b" stroke="#475569" stroke-width="2" class="transition-all duration-300" />
                        <text x="410" y="70" fill="#00f0ff" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">16-BIT ADDER</text>
                        <text x="410" y="90" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">||</text>
                        <text x="410" y="110" fill="#00f0ff" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">16-BIT AND</text>
                        <text x="410" y="125" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">↓</text>
                        <text x="410" y="140" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">16-BIT MUX</text>
                        
                        <text x="410" y="165" fill="#00f0ff" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">f</text>
                        \${drawWire('w-ctrl-f', 'M 410 155 L 410 150')}
                        
                        \${drawBus('alu-fout', 'M 470 100 L 510 100', 490, 100)}

                        <!-- NO: 16-bit NOT + MUX -->
                        <rect id="box-no" x="510" y="70" width="110" height="60" rx="4" fill="#1e293b" stroke="#475569" stroke-width="2" class="transition-all duration-300" />
                        <text x="565" y="90" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">16-BIT NOT</text>
                        <text x="565" y="105" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">↓</text>
                        <text x="565" y="120" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">16-BIT MUX</text>
                        <text x="565" y="145" fill="#9ca3af" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">no</text>
                        
                        \${drawBus('alu-out', 'M 620 100 L 680 100', 650, 100)}
                        <text x="700" y="105" fill="#9ca3af" font-family="monospace" font-size="12" font-weight="bold">OUT</text>
                    </svg>
                </div>
`;

code = code.replace(
    /<div class="w-full xl:w-\[600px\] bg-black\/60 rounded-lg overflow-hidden border border-white\/5 relative flex justify-center items-center py-4">[\s\S]*?<\/div>\s*<\/div>/,
    newAluSvg + `\n            </div>`
);

fs.writeFileSync(aluPagePath, code);
console.log('Successfully patched ALU Datapath in alu-page.ts!');
