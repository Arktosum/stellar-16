import { Gate, Wire } from './engine';

export class NandGate extends Gate {
    constructor(inA: Wire, inB: Wire, out: Wire, name: string = "NAND") {
        super(name);
        this.inputs = { a: inA, b: inB };
        this.outputs = { out: out };

        // Connect input wires to this gate so it knows when to evaluate
        inA.connect(this);
        inB.connect(this);
    }

    evaluate() {
        // STRICT HARDWARE RULE:
        // This is the ONLY place in the entire hardware simulation where we use 
        // native TypeScript logic operators (!, &&). Everything else must be built from this gate.
        const a = (this.inputs.a as Wire).state;
        const b = (this.inputs.b as Wire).state;

        // NAND logic: false only if both inputs are true
        (this.outputs.out as Wire).state = !(a && b);
    }
}

export class NotGate extends Gate {
    public internalNand: NandGate;

    constructor(inWire: Wire, outWire: Wire, name: string = "NOT") {
        super(name);
        this.inputs = { in: inWire };
        this.outputs = { out: outWire };

        // A NOT gate is just a NAND gate where both inputs are tied to the same signal
        this.internalNand = new NandGate(inWire, inWire, outWire);
    }

    evaluate() {
        // Structural gates don't have their own logic; they just wire up internal components.
    }
}

export class AndGate extends Gate {
    public nand: NandGate;
    public not: NotGate;
    public tempWire: Wire;

    constructor(inA: Wire, inB: Wire, outWire: Wire, name: string = "AND") {
        super(name);
        this.inputs = { a: inA, b: inB };
        this.outputs = { out: outWire };

        this.tempWire = new Wire("temp");

        // AND is a NAND followed by a NOT
        this.nand = new NandGate(inA, inB, this.tempWire);
        this.not = new NotGate(this.tempWire, outWire);
    }

    evaluate() { }
}

export class OrGate extends Gate {
    public notA: NotGate;
    public notB: NotGate;
    public nand: NandGate;

    public tempA: Wire;
    public tempB: Wire;

    constructor(inA: Wire, inB: Wire, outWire: Wire, name: string = "OR") {
        super(name);
        this.inputs = { a: inA, b: inB };
        this.outputs = { out: outWire };

        this.tempA = new Wire("tempA");
        this.tempB = new Wire("tempB");

        // OR logic using De Morgan's Law: (A OR B) == NOT(NOT A AND NOT B) == NAND(NOT A, NOT B)
        this.notA = new NotGate(inA, this.tempA);
        this.notB = new NotGate(inB, this.tempB);
        this.nand = new NandGate(this.tempA, this.tempB, outWire);
    }

    evaluate() { }
}

export class XorGate extends Gate {
    public nand1: NandGate;
    public nand2: NandGate;
    public nand3: NandGate;
    public nand4: NandGate;

    public temp1: Wire;
    public temp2: Wire;
    public temp3: Wire;

    constructor(inA: Wire, inB: Wire, outWire: Wire, name: string = "XOR") {
        super(name);
        this.inputs = { a: inA, b: inB };
        this.outputs = { out: outWire };

        this.temp1 = new Wire("temp1");
        this.temp2 = new Wire("temp2");
        this.temp3 = new Wire("temp3");

        // Optimized XOR using 4 NAND gates:
        // temp1 = A NAND B
        // temp2 = A NAND temp1
        // temp3 = B NAND temp1
        // out = temp2 NAND temp3
        this.nand1 = new NandGate(inA, inB, this.temp1);
        this.nand2 = new NandGate(inA, this.temp1, this.temp2);
        this.nand3 = new NandGate(inB, this.temp1, this.temp3);
        this.nand4 = new NandGate(this.temp2, this.temp3, outWire);
    }

    evaluate() { }
}

export class MuxGate extends Gate {
    public notSel: NotGate;
    public and1: AndGate;
    public and2: AndGate;
    public or: OrGate;

    public notSelWire: Wire;
    public and1Wire: Wire;
    public and2Wire: Wire;

    constructor(inA: Wire, inB: Wire, sel: Wire, outWire: Wire, name: string = "MUX") {
        super(name);
        this.inputs = { a: inA, b: inB, sel: sel };
        this.outputs = { out: outWire };
        
        this.notSelWire = new Wire("not_sel");
        this.and1Wire = new Wire("and1_out");
        this.and2Wire = new Wire("and2_out");
        
        // Mux logic: (A AND (NOT SEL)) OR (B AND SEL)
        this.notSel = new NotGate(sel, this.notSelWire);
        this.and1 = new AndGate(inA, this.notSelWire, this.and1Wire);
        this.and2 = new AndGate(inB, sel, this.and2Wire);
        this.or = new OrGate(this.and1Wire, this.and2Wire, outWire);
    }
    
    evaluate() { }
}

export class DMuxGate extends Gate {
    public notSel: NotGate;
    public andA: AndGate;
    public andB: AndGate;

    public notSelWire: Wire;

    constructor(inWire: Wire, sel: Wire, outA: Wire, outB: Wire, name: string = "DMUX") {
        super(name);
        this.inputs = { in: inWire, sel: sel };
        this.outputs = { a: outA, b: outB };
        
        this.notSelWire = new Wire("not_sel");
        
        // DMux logic: 
        // A = IN AND (NOT SEL)
        // B = IN AND SEL
        this.notSel = new NotGate(sel, this.notSelWire);
        this.andA = new AndGate(inWire, this.notSelWire, outA);
        this.andB = new AndGate(inWire, sel, outB);
    }
    
    evaluate() { }
}

export class DMux4Way extends Gate {
    public dmuxSel1: DMuxGate;
    public dmuxSel0A: DMuxGate;
    public dmuxSel0B: DMuxGate;
    
    public tempA: Wire;
    public tempB: Wire;

    constructor(inWire: Wire, sel0: Wire, sel1: Wire, outA: Wire, outB: Wire, outC: Wire, outD: Wire, name: string = "DMUX4WAY") {
        super(name);
        this.inputs = { in: inWire, sel0, sel1 };
        this.outputs = { a: outA, b: outB, c: outC, d: outD };
        
        this.tempA = new Wire("tempA");
        this.tempB = new Wire("tempB");
        
        // 1st layer using sel1: splits to (A,B) vs (C,D)
        this.dmuxSel1 = new DMuxGate(inWire, sel1, this.tempA, this.tempB);
        // 2nd layer using sel0: splits tempA to A,B and tempB to C,D
        this.dmuxSel0A = new DMuxGate(this.tempA, sel0, outA, outB);
        this.dmuxSel0B = new DMuxGate(this.tempB, sel0, outC, outD);
    }
    evaluate() {}
}

export class DMux8Way extends Gate {
    public dmuxSel2: DMuxGate;
    public dmux4WayA: DMux4Way;
    public dmux4WayB: DMux4Way;
    
    public tempA: Wire;
    public tempB: Wire;

    constructor(inWire: Wire, sel0: Wire, sel1: Wire, sel2: Wire, outA: Wire, outB: Wire, outC: Wire, outD: Wire, outE: Wire, outF: Wire, outG: Wire, outH: Wire, name: string = "DMUX8WAY") {
        super(name);
        this.inputs = { in: inWire, sel0, sel1, sel2 };
        this.outputs = { a: outA, b: outB, c: outC, d: outD, e: outE, f: outF, g: outG, h: outH };
        
        this.tempA = new Wire("tempA");
        this.tempB = new Wire("tempB");
        
        // 1st layer using sel2
        this.dmuxSel2 = new DMuxGate(inWire, sel2, this.tempA, this.tempB);
        // 2nd layer using sel1, sel0 via DMux4Way
        this.dmux4WayA = new DMux4Way(this.tempA, sel0, sel1, outA, outB, outC, outD);
        this.dmux4WayB = new DMux4Way(this.tempB, sel0, sel1, outE, outF, outG, outH);
    }
    evaluate() {}
}
