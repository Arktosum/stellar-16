const fs = require('fs');

const aluPagePath = 'src/alu-page.ts';
let code = fs.readFileSync(aluPagePath, 'utf8');

const updateUIAdd4Out = `
    if (currentActiveTab === 'ADD4') {
        const outVal = busGetValue(busOut) & 15; // 4-bit mask
        let outStr = outVal.toString(10);
        if ((outVal >> 3) === 1) { // 4-bit 2's complement negative
            outStr = (outVal - 16).toString(10);
        }
        document.getElementById('add4-out')!.innerText = outStr;
        document.getElementById('add4-out-bin')!.innerText = outVal.toString(2).padStart(4, '0');
        
        // Highlight wires
        updateColor('wire-w-a0', (busGetValue(busX) & 1) !== 0, true);
        updateColor('wire-w-b0', (busGetValue(busY) & 1) !== 0, true);
        // We can just skip highlighting all internal wires to keep it simple, or we can try
    }
    if (currentActiveTab === 'ADD16') {
`;

code = code.replace(
    /if \(currentActiveTab === 'ADD16'\) \{/,
    updateUIAdd4Out.trim()
);

fs.writeFileSync(aluPagePath, code);
console.log("Patched updateUI for ADD4!");
