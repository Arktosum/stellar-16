import { Bus, Gate, Simulator, Wire } from './engine';
import { MuxGate, DMux8Way, OrGate } from './gates';
import { Mux8Way16, Mux16 } from './bus_gates';
import { Add16 } from './arithmetic';

export class DFF extends Gate {
    private nextState: boolean = false;

    constructor(inWire: Wire, outWire: Wire, name: string = "DFF") {
        super(name);
        this.inputs = { in: inWire };
        this.outputs = { out: outWire };
        
        // Register this primitive with the Simulator for clock sync
        Simulator.registerDFF(this);
    }

    /**
     * DFFs don't evaluate combinationally. They ignore input changes until the clock ticks.
     */
    evaluate() {}

    /**
     * Called by Simulator on clock tick (rising edge)
     */
    latch() {
        this.nextState = (this.inputs.in as Wire).state;
    }

    /**
     * Called by Simulator on clock tock (falling edge)
     */
    commit() {
        (this.outputs.out as Wire).state = this.nextState;
    }
}

export class Bit extends Gate {
    public mux: MuxGate;
    public dff: DFF;
    
    public dffOutWire: Wire;
    public muxOutWire: Wire;

    constructor(inWire: Wire, load: Wire, outWire: Wire, name: string = "Bit") {
        super(name);
        this.inputs = { in: inWire, load: load };
        this.outputs = { out: outWire };

        this.dffOutWire = new Wire("dffOut");
        this.muxOutWire = new Wire("muxOut");

        // Correct wiring:
        this.mux = new MuxGate(outWire, inWire, load, this.muxOutWire);
        this.dff = new DFF(this.muxOutWire, outWire);
    }

    evaluate() {}
}

export class Register extends Gate {
    public bits: Bit[] = [];

    constructor(inBus: Bus, load: Wire, outBus: Bus, name: string = "Register") {
        super(name);
        this.inputs = { in: inBus, load: load };
        this.outputs = { out: outBus };

        for (let i = 0; i < inBus.size; i++) {
            this.bits.push(new Bit(inBus.wires[i], load, outBus.wires[i]));
        }
    }

    evaluate() {}
}

export class RAM8 extends Gate {
    public registers: Register[] = [];
    public dmux: DMux8Way;
    public mux: Mux8Way16;

    public loadWires: Wire[] = [];
    public regOutBuses: Bus[] = [];

    constructor(inBus: Bus, load: Wire, address: Bus, outBus: Bus, name: string = "RAM8") {
        super(name);
        this.inputs = { in: inBus, load: load, address: address };
        this.outputs = { out: outBus };

        for (let i = 0; i < 8; i++) {
            this.loadWires.push(new Wire(`load${i}`));
            this.regOutBuses.push(new Bus(inBus.size, `regOut${i}`));
        }

        // 1. Demultiplex the load bit to the correct register
        this.dmux = new DMux8Way(
            load, 
            address.wires[0], address.wires[1], address.wires[2], 
            this.loadWires[0], this.loadWires[1], this.loadWires[2], this.loadWires[3],
            this.loadWires[4], this.loadWires[5], this.loadWires[6], this.loadWires[7]
        );

        // 2. Create the 8 registers
        for (let i = 0; i < 8; i++) {
            this.registers.push(new Register(inBus, this.loadWires[i], this.regOutBuses[i], `Reg${i}`));
        }

        // 3. Multiplex the output of the selected register to outBus
        this.mux = new Mux8Way16(
            this.regOutBuses[0], this.regOutBuses[1], this.regOutBuses[2], this.regOutBuses[3],
            this.regOutBuses[4], this.regOutBuses[5], this.regOutBuses[6], this.regOutBuses[7],
            address.wires[0], address.wires[1], address.wires[2],
            outBus
        );
    }
    evaluate() {}
}

export class PC extends Gate {
    public register: Register;
    public adder: Add16;
    public muxInc: Mux16;
    public muxLoad: Mux16;
    public muxReset: Mux16;

    public orLoadInc: OrGate;
    public orRegLoad: OrGate;

    public incOut: Bus;
    public postInc: Bus;
    public postLoad: Bus;
    public nextOut: Bus;
    public trueBus: Bus;
    public falseBus: Bus;

    public loadInc: Wire;
    public regLoad: Wire;

    constructor(inBus: Bus, inc: Wire, load: Wire, reset: Wire, outBus: Bus, name: string = "PC") {
        super(name);
        this.inputs = { in: inBus, inc, load, reset };
        this.outputs = { out: outBus };

        this.incOut = new Bus(16, "incOut");
        this.postInc = new Bus(16, "postInc");
        this.postLoad = new Bus(16, "postLoad");
        this.nextOut = new Bus(16, "nextOut");

        this.trueBus = new Bus(16, "trueBus");
        this.trueBus.setValue(1); // 0x0001
        
        this.falseBus = new Bus(16, "falseBus");
        this.falseBus.setValue(0); // 0x0000

        this.loadInc = new Wire("loadInc");
        this.regLoad = new Wire("regLoad");

        // Reg load = inc | load | reset
        this.orLoadInc = new OrGate(inc, load, this.loadInc);
        this.orRegLoad = new OrGate(this.loadInc, reset, this.regLoad);

        // incOut = currentOut + 1
        this.adder = new Add16(outBus, this.trueBus, this.incOut);

        // Mux cascade
        // if (inc) postInc = incOut else postInc = currentOut
        this.muxInc = new Mux16(outBus, this.incOut, inc, this.postInc);

        // if (load) postLoad = in else postLoad = postInc
        this.muxLoad = new Mux16(this.postInc, inBus, load, this.postLoad);

        // if (reset) nextOut = 0 else nextOut = postLoad
        this.muxReset = new Mux16(this.postLoad, this.falseBus, reset, this.nextOut);
        
        this.register = new Register(this.nextOut, this.regLoad, outBus, "PC_Reg");
    }
    evaluate() {}
}

export class RegisterFile extends Gate {
    public registers: Register[] = [];
    public dmuxWrite: DMux8Way;
    public muxRead1: Mux8Way16;
    public muxRead2: Mux8Way16;

    public loadWires: Wire[] = [];
    public regOutBuses: Bus[] = [];

    constructor(
        inBus: Bus, load: Wire, writeAddress: Bus, 
        readAddress1: Bus, readAddress2: Bus,
        outBus1: Bus, outBus2: Bus,
        name: string = "RegisterFile"
    ) {
        super(name);
        this.inputs = { in: inBus, load, writeAddress, readAddress1, readAddress2 };
        this.outputs = { out1: outBus1, out2: outBus2 };

        for (let i = 0; i < 8; i++) {
            this.loadWires.push(new Wire(`loadReg${i}`));
            this.regOutBuses.push(new Bus(inBus.size, `regOut${i}`));
        }

        // 1. Demultiplex the load bit to the correct register using writeAddress
        this.dmuxWrite = new DMux8Way(
            load, 
            writeAddress.wires[0], writeAddress.wires[1], writeAddress.wires[2], 
            this.loadWires[0], this.loadWires[1], this.loadWires[2], this.loadWires[3],
            this.loadWires[4], this.loadWires[5], this.loadWires[6], this.loadWires[7]
        );

        // 2. Create the 8 registers
        for (let i = 0; i < 8; i++) {
            this.registers.push(new Register(inBus, this.loadWires[i], this.regOutBuses[i], `R${i}`));
        }

        // 3. Multiplex for Read Port 1
        this.muxRead1 = new Mux8Way16(
            this.regOutBuses[0], this.regOutBuses[1], this.regOutBuses[2], this.regOutBuses[3],
            this.regOutBuses[4], this.regOutBuses[5], this.regOutBuses[6], this.regOutBuses[7],
            readAddress1.wires[0], readAddress1.wires[1], readAddress1.wires[2],
            outBus1
        );

        // 4. Multiplex for Read Port 2
        this.muxRead2 = new Mux8Way16(
            this.regOutBuses[0], this.regOutBuses[1], this.regOutBuses[2], this.regOutBuses[3],
            this.regOutBuses[4], this.regOutBuses[5], this.regOutBuses[6], this.regOutBuses[7],
            readAddress2.wires[0], readAddress2.wires[1], readAddress2.wires[2],
            outBus2
        );
    }
    evaluate() {}
}

/**
 * 32K Instruction ROM (Read-Only Memory)
 * Outputs the 16-bit value stored at the given 15-bit address.
 * No clock needed; outputs instantly when address changes.
 */
export class ROM32K extends Gate {
    public memory: number[] = new Array(32768).fill(0);

    constructor(address: Bus, out: Bus, name: string = "ROM32K") {
        super(name);
        this.inputs = { address };
        this.outputs = { out };
        
        address.wires.forEach(w => w.connect(this));
    }

    /**
     * Loads an array of instructions into the ROM.
     */
    loadProgram(program: number[]) {
        for (let i = 0; i < program.length && i < this.memory.length; i++) {
            this.memory[i] = program[i];
        }
        // Fill the rest with 0 (LDI R0, 0)
        for (let i = program.length; i < this.memory.length; i++) {
            this.memory[i] = 0;
        }
        // Trigger a re-evaluation
        this.evaluate();
    }

    evaluate() {
        const addr = (this.inputs.address as Bus).getValue();
        (this.outputs.out as Bus).setValue(this.memory[addr % this.memory.length]);
    }
}
