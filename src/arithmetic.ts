import { Bus, Gate, Wire } from './engine';
import { AndGate, OrGate, XorGate, NotGate } from './gates';
import { Mux16, And16, Not16 } from './bus_gates';

export class HalfAdder extends Gate {
    public xorGate: XorGate;
    public andGate: AndGate;

    constructor(inA: Wire, inB: Wire, sum: Wire, carry: Wire, name: string = "HalfAdder") {
        super(name);
        this.inputs = { a: inA, b: inB };
        this.outputs = { sum: sum, carry: carry };

        this.xorGate = new XorGate(inA, inB, sum);
        this.andGate = new AndGate(inA, inB, carry);
    }
    evaluate() {}
}

export class FullAdder extends Gate {
    public halfAdder1: HalfAdder;
    public halfAdder2: HalfAdder;
    public orGate: OrGate;

    public tempSum: Wire;
    public tempCarry1: Wire;
    public tempCarry2: Wire;

    constructor(inA: Wire, inB: Wire, inC: Wire, sum: Wire, carry: Wire, name: string = "FullAdder") {
        super(name);
        this.inputs = { a: inA, b: inB, c: inC };
        this.outputs = { sum: sum, carry: carry };

        this.tempSum = new Wire("tempSum");
        this.tempCarry1 = new Wire("tempCarry1");
        this.tempCarry2 = new Wire("tempCarry2");

        this.halfAdder1 = new HalfAdder(inA, inB, this.tempSum, this.tempCarry1);
        this.halfAdder2 = new HalfAdder(this.tempSum, inC, sum, this.tempCarry2);
        this.orGate = new OrGate(this.tempCarry1, this.tempCarry2, carry);
    }
    evaluate() {}
}

export class Add16 extends Gate {
    public fullAdders: FullAdder[] = [];

    constructor(aBus: Bus, bBus: Bus, outBus: Bus, name: string = "Add16") {
        super(name);
        this.inputs = { a: aBus, b: bBus };
        this.outputs = { out: outBus };

        let carryIn = new Wire("carryIn0"); // Unconnected wire defaults to false (ground)
        for (let i = 0; i < aBus.size; i++) {
            let carryOut = new Wire(`carryOut${i}`);
            this.fullAdders.push(new FullAdder(aBus.wires[i], bBus.wires[i], carryIn, outBus.wires[i], carryOut));
            carryIn = carryOut;
        }
    }
    evaluate() {}
}

export class ALU extends Gate {
    public falseBus: Bus;
    
    public x1: Bus; public notX1: Bus; public x2: Bus;
    public y1: Bus; public notY1: Bus; public y2: Bus;
    
    public andXY: Bus; public addXY: Bus; public fOut: Bus;
    public notFOut: Bus;
    
    // Components
    public zxMux: Mux16; public nxNot: Not16; public nxMux: Mux16;
    public zyMux: Mux16; public nyNot: Not16; public nyMux: Mux16;
    public fAnd: And16; public fAdd: Add16; public fMux: Mux16;
    public noNot: Not16; public noMux: Mux16;
    
    public zrOrs: OrGate[] = [];
    public notZr: NotGate;

    constructor(x: Bus, y: Bus, zx: Wire, nx: Wire, zy: Wire, ny: Wire, f: Wire, no: Wire, out: Bus, zr: Wire, ng: Wire, name: string = "ALU") {
        super(name);
        this.inputs = { x, y, zx, nx, zy, ny, f, no };
        this.outputs = { out, zr, ng };

        this.falseBus = new Bus(16, "falseBus"); // Defaults to all 0s
        
        // 1. zx (zero x)
        this.x1 = new Bus(16, "x1");
        this.zxMux = new Mux16(x, this.falseBus, zx, this.x1);
        
        // 2. nx (negate x)
        this.notX1 = new Bus(16, "notX1");
        this.x2 = new Bus(16, "x2");
        this.nxNot = new Not16(this.x1, this.notX1);
        this.nxMux = new Mux16(this.x1, this.notX1, nx, this.x2);
        
        // 3. zy (zero y)
        this.y1 = new Bus(16, "y1");
        this.zyMux = new Mux16(y, this.falseBus, zy, this.y1);
        
        // 4. ny (negate y)
        this.notY1 = new Bus(16, "notY1");
        this.y2 = new Bus(16, "y2");
        this.nyNot = new Not16(this.y1, this.notY1);
        this.nyMux = new Mux16(this.y1, this.notY1, ny, this.y2);
        
        // 5. f (function: 1 for ADD, 0 for AND)
        this.andXY = new Bus(16, "andXY");
        this.addXY = new Bus(16, "addXY");
        this.fOut = new Bus(16, "fOut");
        
        this.fAnd = new And16(this.x2, this.y2, this.andXY);
        this.fAdd = new Add16(this.x2, this.y2, this.addXY);
        this.fMux = new Mux16(this.andXY, this.addXY, f, this.fOut); // if f=0 -> AND, if f=1 -> ADD
        
        // 6. no (negate output)
        this.notFOut = new Bus(16, "notFOut");
        this.noNot = new Not16(this.fOut, this.notFOut);
        this.noMux = new Mux16(this.fOut, this.notFOut, no, out);
        
        // 7. ng (negative flag) - just the MSB of the output (index 15)
        // Wait, ng is a Wire, out.wires[15] is a Wire. We can just use out.wires[15] directly, 
        // but since we need it as a separate output, we can tie them together with an OrGate (out[15] OR out[15] -> ng).
        new OrGate(out.wires[15], out.wires[15], ng); // acts as a simple buffer/pass-through
        
        // 8. zr (zero flag) - true iff out == 0
        // We cascade 15 OR gates across the 16 bits of the output bus
        let currentOrOut = out.wires[0];
        for (let i = 1; i < 16; i++) {
            let nextOrOut = new Wire(`zrOr${i}`);
            this.zrOrs.push(new OrGate(currentOrOut, out.wires[i], nextOrOut));
            currentOrOut = nextOrOut;
        }
        this.notZr = new NotGate(currentOrOut, zr);
    }
    evaluate() {}
}
