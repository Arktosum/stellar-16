import { Bus, Gate, Wire } from './engine';
import { RegisterFile, PC } from './memory';
import { ALU } from './arithmetic';
import { Mux4Way16 } from './bus_gates';

/**
 * Extracts fields from the 16-bit instruction bus.
 */
export class InstructionDecoder extends Gate {
    constructor(
        instruction: Bus, 
        dest: Bus, srcA: Bus, srcB: Bus, imm: Bus,
        name: string = "InstDecoder"
    ) {
        super(name);
        this.inputs = { instruction };
        this.outputs = { dest, srcA, srcB, imm };
        instruction.wires.forEach(w => w.connect(this));
    }
    evaluate() {
        const inst = (this.inputs.instruction as Bus).getValue();
        (this.outputs.dest as Bus).setValue((inst >> 8) & 0x7); // Bits 8-10
        (this.outputs.srcA as Bus).setValue((inst >> 5) & 0x7); // Bits 5-7
        (this.outputs.srcB as Bus).setValue((inst >> 2) & 0x7); // Bits 2-4
        (this.outputs.imm as Bus).setValue(inst & 0x0FFF);      // Bits 0-11
    }
}

/**
 * The Control Unit is the brain of the CPU.
 * It decodes the instruction and outputs control signals.
 */
export class ControlUnit extends Gate {
    constructor(
        instruction: Bus, zr: Wire, ng: Wire,
        regWrite: Wire, memWrite: Wire, regWriteSrc: Bus,
        branchOut: Wire, 
        zx: Wire, nx: Wire, zy: Wire, ny: Wire, f: Wire, no: Wire,
        name: string = "ControlUnit"
    ) {
        super(name);
        this.inputs = { instruction, zr, ng };
        this.outputs = { regWrite, memWrite, regWriteSrc, branchOut, zx, nx, zy, ny, f, no };
        
        instruction.wires.forEach(w => w.connect(this));
        zr.connect(this);
        ng.connect(this);
    }
    
    evaluate() {
        const inst = (this.inputs.instruction as Bus).getValue();
        const zr = (this.inputs.zr as Wire).state;
        const ng = (this.inputs.ng as Wire).state;
        
        const type = (inst >> 15) & 1; // Bit 15
        
        let rw = false;
        let mw = false;
        let rws = 0; // 0 = ALU, 1 = RAM, 2 = Imm
        let br = false;
        
        let c_zx = false, c_nx = false, c_zy = false, c_ny = false, c_f = true, c_no = false; // default ADD
        
        if (type === 0) {
            // LDI: Load Immediate (Type 0)
            rw = true;
            rws = 2; // Imm
        } else {
            // Execute: ALU / Mem / Branch (Type 1)
            const opcode = (inst >> 11) & 0xF;
            
            // RegWrite: ADD(0), SUB(1), AND(2), OR(3), NOT(4), LD(5)
            if (opcode <= 5) rw = true;
            
            // MemWrite: ST(6)
            if (opcode === 6) mw = true;
            
            // RegWriteSrc: LD(5) -> 1(RAM), else 0(ALU)
            if (opcode === 5) rws = 1;
            else rws = 0;
            
            // Branch Logic
            // JMP(7), BEQZ(8), BNEZ(9), BLTZ(10), BGTZ(11)
            if (opcode === 7) br = true;
            else if (opcode === 8 && zr) br = true;
            else if (opcode === 9 && !zr) br = true;
            else if (opcode === 10 && ng) br = true;
            else if (opcode === 11 && !ng && !zr) br = true;
            
            // ALU Control
            if (opcode === 0) { // ADD
                c_zx = false; c_nx = false; c_zy = false; c_ny = false; c_f = true; c_no = false;
            } else if (opcode === 1) { // SUB
                c_zx = false; c_nx = true; c_zy = false; c_ny = false; c_f = true; c_no = false;
            } else if (opcode === 2) { // AND
                c_zx = false; c_nx = false; c_zy = false; c_ny = false; c_f = false; c_no = false;
            } else if (opcode === 3) { // OR
                c_zx = false; c_nx = true; c_zy = false; c_ny = true; c_f = false; c_no = true;
            } else if (opcode === 4) { // NOT (SrcA)
                c_zx = false; c_nx = true; c_zy = true; c_ny = true; c_f = false; c_no = false;
            } else if (opcode >= 8 && opcode <= 11) {
                // For Branches, we just want to test SrcA against 0.
                // We pass SrcA through ALU by doing SrcA + 0. (zy=1 zeroes out Y).
                c_zx = false; c_nx = false; c_zy = true; c_ny = false; c_f = true; c_no = false;
            }
        }
        
        (this.outputs.regWrite as Wire).state = rw;
        (this.outputs.memWrite as Wire).state = mw;
        (this.outputs.regWriteSrc as Bus).setValue(rws);
        (this.outputs.branchOut as Wire).state = br;
        
        (this.outputs.zx as Wire).state = c_zx;
        (this.outputs.nx as Wire).state = c_nx;
        (this.outputs.zy as Wire).state = c_zy;
        (this.outputs.ny as Wire).state = c_ny;
        (this.outputs.f as Wire).state = c_f;
        (this.outputs.no as Wire).state = c_no;
    }
}

export class BusBuffer extends Gate {
    constructor(inBus: Bus, outBus: Bus, name: string = "BusBuffer") {
        super(name);
        this.inputs = { in: inBus };
        this.outputs = { out: outBus };
        inBus.wires.forEach(w => w.connect(this));
    }
    evaluate() {
        const val = (this.inputs.in as Bus).getValue();
        (this.outputs.out as Bus).setValue(val);
    }
}

/**
 * 16-Bit RISC CPU
 * 
 * Instruction Set:
 * Type 0: LDI
 * [0][Dest:3][Imm:12]
 * 
 * Type 1: Execute
 * [1][Opcode:4][Dest:3][SrcA:3][SrcB:3][Unused:2]
 * 
 * Opcodes:
 * 0: ADD, 1: SUB, 2: AND, 3: OR, 4: NOT
 * 5: LD, 6: ST
 * 7: JMP, 8: BEQZ, 9: BNEZ, 10: BLTZ, 11: BGTZ
 */
export class CPU extends Gate {
    public decoder: InstructionDecoder;
    public control: ControlUnit;
    
    public regFile: RegisterFile;
    public alu: ALU;
    public pcChip: PC;

    public destBus: Bus;
    public srcABus: Bus;
    public srcBBus: Bus;
    public immBus: Bus;
    
    public regWriteWire: Wire;
    public memWriteWire: Wire;
    public regWriteSrcBus: Bus;
    public branchWire: Wire;
    
    public zx: Wire;
    public nx: Wire;
    public zy: Wire;
    public ny: Wire;
    public f: Wire;
    public no: Wire;
    public zr: Wire;
    public ng: Wire;

    public aluOutBus: Bus;
    public regAOutBus: Bus;
    public regBOutBus: Bus;
    public regWriteDataBus: Bus;
    
    public regWriteSrcMux: Mux4Way16;
    public dummyFalseBus: Bus; 
    public pcIncWire: Wire;

    constructor(
        inM: Bus, instruction: Bus, reset: Wire,
        outM: Bus, writeM: Wire, addressM: Bus, pc: Bus,
        name: string = "CPU"
    ) {
        super(name);
        this.inputs = { inM, instruction, reset };
        this.outputs = { outM, writeM, addressM, pc };

        // 1. Instruction Decoder
        this.destBus = new Bus(3, "DestBus");
        this.srcABus = new Bus(3, "SrcABus");
        this.srcBBus = new Bus(3, "SrcBBus");
        this.immBus = new Bus(16, "ImmBus");
        
        this.decoder = new InstructionDecoder(instruction, this.destBus, this.srcABus, this.srcBBus, this.immBus, "CPU_InstDecoder");

        // 2. Control Unit
        this.regWriteWire = new Wire("RegWrite");
        this.memWriteWire = writeM; 
        this.regWriteSrcBus = new Bus(2, "RegWriteSrc");
        this.branchWire = new Wire("BranchOut");
        
        this.zx = new Wire("zx"); this.nx = new Wire("nx");
        this.zy = new Wire("zy"); this.ny = new Wire("ny");
        this.f = new Wire("f");   this.no = new Wire("no");
        this.zr = new Wire("zr"); this.ng = new Wire("ng");

        this.control = new ControlUnit(
            instruction, this.zr, this.ng,
            this.regWriteWire, this.memWriteWire, this.regWriteSrcBus, this.branchWire,
            this.zx, this.nx, this.zy, this.ny, this.f, this.no,
            "CPU_ControlUnit"
        );

        // 3. Register File
        this.aluOutBus = new Bus(16, "ALUOut");
        this.regWriteDataBus = new Bus(16, "RegWriteData");
        this.dummyFalseBus = new Bus(16, "DummyFalse");
        
        this.regWriteSrcMux = new Mux4Way16(
            this.aluOutBus, inM, this.immBus, this.dummyFalseBus,
            this.regWriteSrcBus.wires[0], this.regWriteSrcBus.wires[1],
            this.regWriteDataBus, "CPU_RegWriteMux"
        );

        this.regAOutBus = new Bus(16, "RegAOut");
        this.regBOutBus = new Bus(16, "RegBOut");

        this.regFile = new RegisterFile(
            this.regWriteDataBus, this.regWriteWire, this.destBus,
            this.srcABus, this.srcBBus,
            this.regAOutBus, this.regBOutBus,
            "CPU_RegFile"
        );

        new BusBuffer(this.regAOutBus, addressM, "AddrBuffer");
        new BusBuffer(this.regBOutBus, outM, "OutMBuffer");

        // 4. ALU
        this.alu = new ALU(
            this.regAOutBus, this.regBOutBus,
            this.zx, this.nx, this.zy, this.ny, this.f, this.no,
            this.aluOutBus, this.zr, this.ng, "CPU_ALU"
        );

        // 5. Program Counter
        this.pcIncWire = new Wire("PC_Inc");
        this.pcIncWire.state = true;
        
        // Target address for branch is always in SrcB register!
        // We wire RegBOutBus as the target address input to the PC.
        this.pcChip = new PC(this.regBOutBus, this.pcIncWire, this.branchWire, reset, pc, "CPU_PC");
    }

    evaluate() {}
}
