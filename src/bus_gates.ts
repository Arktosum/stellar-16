import { Bus, Gate, Wire } from "./engine";
import { AndGate, MuxGate, NotGate, OrGate } from "./gates";

export class Not16 extends Gate {
    public notGates: NotGate[] = [];

    constructor(inBus: Bus, outBus: Bus, name: string = "NOT16") {
        super(name);
        this.inputs = { in: inBus };
        this.outputs = { out: outBus };

        for (let i = 0; i < inBus.size; i++) {
            this.notGates.push(new NotGate(inBus.wires[i], outBus.wires[i]));
        }
    }

    evaluate() {}
}

export class And16 extends Gate {
    public andGates: AndGate[] = [];

    constructor(aBus: Bus, bBus: Bus, outBus: Bus, name: string = "AND16") {
        super(name);
        this.inputs = { a: aBus, b: bBus };
        this.outputs = { out: outBus };

        for (let i = 0; i < aBus.size; i++) {
            this.andGates.push(new AndGate(aBus.wires[i], bBus.wires[i], outBus.wires[i]));
        }
    }

    evaluate() {}
}

export class Or16 extends Gate {
    public orGates: OrGate[] = [];

    constructor(aBus: Bus, bBus: Bus, outBus: Bus, name: string = "OR16") {
        super(name);
        this.inputs = { a: aBus, b: bBus };
        this.outputs = { out: outBus };

        for (let i = 0; i < aBus.size; i++) {
            this.orGates.push(new OrGate(aBus.wires[i], bBus.wires[i], outBus.wires[i]));
        }
    }

    evaluate() {}
}

export class Mux16 extends Gate {
    public muxGates: MuxGate[] = [];

    constructor(aBus: Bus, bBus: Bus, sel: Wire, outBus: Bus, name: string = "MUX16") {
        super(name);
        this.inputs = { a: aBus, b: bBus, sel: sel };
        this.outputs = { out: outBus };

        // The exact same 'sel' wire is fed into all 16 Mux gates
        for (let i = 0; i < aBus.size; i++) {
            this.muxGates.push(new MuxGate(aBus.wires[i], bBus.wires[i], sel, outBus.wires[i]));
        }
    }

    evaluate() {}
}

export class Mux4Way16 extends Gate {
    public mux01: Mux16;
    public mux23: Mux16;
    public muxOut: Mux16;

    public tempBus01: Bus;
    public tempBus23: Bus;

    constructor(aBus: Bus, bBus: Bus, cBus: Bus, dBus: Bus, sel0: Wire, sel1: Wire, outBus: Bus, name: string = "MUX4WAY16") {
        super(name);
        this.inputs = { a: aBus, b: bBus, c: cBus, d: dBus, sel0: sel0, sel1: sel1 };
        this.outputs = { out: outBus };

        this.tempBus01 = new Bus(aBus.size, "temp01");
        this.tempBus23 = new Bus(aBus.size, "temp23");

        // First layer of selection using sel0
        this.mux01 = new Mux16(aBus, bBus, sel0, this.tempBus01);
        this.mux23 = new Mux16(cBus, dBus, sel0, this.tempBus23);
        
        // Second layer of selection using sel1
        this.muxOut = new Mux16(this.tempBus01, this.tempBus23, sel1, outBus);
    }

    evaluate() {}
}

export class Mux8Way16 extends Gate {
    public mux4Way0123: Mux4Way16;
    public mux4Way4567: Mux4Way16;
    public muxOut: Mux16;

    public tempBus0123: Bus;
    public tempBus4567: Bus;

    constructor(
        aBus: Bus, bBus: Bus, cBus: Bus, dBus: Bus,
        eBus: Bus, fBus: Bus, gBus: Bus, hBus: Bus,
        sel0: Wire, sel1: Wire, sel2: Wire,
        outBus: Bus, name: string = "MUX8WAY16"
    ) {
        super(name);
        this.inputs = { a: aBus, b: bBus, c: cBus, d: dBus, e: eBus, f: fBus, g: gBus, h: hBus, sel0, sel1, sel2 };
        this.outputs = { out: outBus };

        this.tempBus0123 = new Bus(aBus.size, "temp0123");
        this.tempBus4567 = new Bus(aBus.size, "temp4567");

        this.mux4Way0123 = new Mux4Way16(aBus, bBus, cBus, dBus, sel0, sel1, this.tempBus0123);
        this.mux4Way4567 = new Mux4Way16(eBus, fBus, gBus, hBus, sel0, sel1, this.tempBus4567);
        
        this.muxOut = new Mux16(this.tempBus0123, this.tempBus4567, sel2, outBus);
    }

    evaluate() {}
}
