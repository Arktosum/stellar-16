export class Assembler {
    static opcodes: Record<string, number> = {
        'ADD': 0,
        'SUB': 1,
        'AND': 2,
        'OR': 3,
        'NOT': 4,
        'LD': 5,
        'ST': 6,
        'JMP': 7,
        'BEQZ': 8,
        'BNEZ': 9,
        'BLTZ': 10,
        'BGTZ': 11
    };

    static parseRegister(regStr: string): number {
        if (!regStr.startsWith('R')) throw new Error(`Invalid register: ${regStr}`);
        const num = parseInt(regStr.substring(1));
        if (num < 0 || num > 7) throw new Error(`Register out of bounds: ${regStr}`);
        return num;
    }

    static assemble(source: string): number[] {
        const lines = source.split('\n');
        const instructions: string[] = [];
        const labels: Record<string, number> = {};

        // Pass 1: Clean up and find labels
        let address = 0;
        for (let line of lines) {
            // Remove comments
            let code = line.split('//')[0].trim();
            if (code === '') continue;

            // Check for label
            if (code.endsWith(':')) {
                const labelName = code.substring(0, code.length - 1).trim();
                labels[labelName] = address;
                continue;
            }
            
            // If label is inline (e.g. "LOOP: ADD R1, R2")
            if (code.includes(':')) {
                const parts = code.split(':');
                const labelName = parts[0].trim();
                labels[labelName] = address;
                code = parts[1].trim();
                if (code === '') continue;
            }

            instructions.push(code);
            address++;
        }

        // Pass 2: Assemble instructions
        const machineCode: number[] = [];
        
        for (let i = 0; i < instructions.length; i++) {
            const code = instructions[i];
            const parts = code.replace(/,/g, ' ').split(/\s+/).filter(p => p.length > 0);
            
            const mnemonic = parts[0].toUpperCase();
            
            if (mnemonic === 'LDI') {
                // Type 0: LDI Dest, Imm
                if (parts.length !== 3) throw new Error(`Line ${i}: LDI expects 2 arguments`);
                const dest = this.parseRegister(parts[1]);
                let imm = 0;
                
                // Is the immediate a label or a number?
                if (labels[parts[2]] !== undefined) {
                    imm = labels[parts[2]];
                } else {
                    imm = parseInt(parts[2]);
                    if (isNaN(imm)) throw new Error(`Line ${i}: Invalid immediate value ${parts[2]}`);
                }
                
                // [0] [Dest:3] [Imm:12]
                const inst = (0 << 15) | (dest << 12) | (imm & 0x0FFF);
                machineCode.push(inst);
                
            } else if (this.opcodes[mnemonic] !== undefined) {
                // Type 1: EXEC
                const op = this.opcodes[mnemonic];
                let dest = 0, srcA = 0, srcB = 0;
                
                // Arity depends on opcode
                if (['ADD', 'SUB', 'AND', 'OR'].includes(mnemonic)) {
                    // OP Dest, SrcA, SrcB
                    if (parts.length !== 4) throw new Error(`Line ${i}: ${mnemonic} expects 3 arguments`);
                    dest = this.parseRegister(parts[1]);
                    srcA = this.parseRegister(parts[2]);
                    srcB = this.parseRegister(parts[3]);
                } else if (['NOT', 'LD'].includes(mnemonic)) {
                    // OP Dest, SrcA
                    if (parts.length !== 3) throw new Error(`Line ${i}: ${mnemonic} expects 2 arguments`);
                    dest = this.parseRegister(parts[1]);
                    srcA = this.parseRegister(parts[2]);
                } else if (['ST'].includes(mnemonic)) {
                    // ST SrcA, SrcB (store SrcB into RAM[SrcA])
                    if (parts.length !== 3) throw new Error(`Line ${i}: ST expects 2 arguments (AddrReg, DataReg)`);
                    srcA = this.parseRegister(parts[1]);
                    srcB = this.parseRegister(parts[2]);
                } else if (['BEQZ', 'BNEZ', 'BLTZ', 'BGTZ'].includes(mnemonic)) {
                    // BRANCH SrcA, SrcB(TargetReg)
                    if (parts.length !== 3) throw new Error(`Line ${i}: ${mnemonic} expects 2 arguments`);
                    srcA = this.parseRegister(parts[1]);
                    srcB = this.parseRegister(parts[2]);
                } else if (['JMP'].includes(mnemonic)) {
                    // JMP SrcA
                    if (parts.length !== 2) throw new Error(`Line ${i}: JMP expects 1 argument`);
                    srcA = this.parseRegister(parts[1]);
                }
                
                // [1] [Op:4] [Dest:3] [SrcA:3] [SrcB:3] [Unused:2]
                const inst = (1 << 15) | (op << 11) | (dest << 8) | (srcA << 5) | (srcB << 2) | 0;
                machineCode.push(inst);
                
            } else {
                throw new Error(`Line ${i}: Unknown mnemonic ${mnemonic}`);
            }
        }
        
        return machineCode;
    }
}
