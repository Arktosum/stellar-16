import { CompositeGate, NandGate, Wire } from './engine';

export class NotGate extends CompositeGate {
    constructor(inWire: Wire, outWire: Wire, name: string = "NOT") {
        super(name);
        this.inputs = { in: inWire };
        this.outputs = { out: outWire };
        this.addGate(new NandGate(inWire, inWire, outWire, `${name}_NAND`));
    }
}

export class AndGate extends CompositeGate {
    constructor(inA: Wire, inB: Wire, outWire: Wire, name: string = "AND") {
        super(name);
        this.inputs = { a: inA, b: inB };
        this.outputs = { out: outWire };

        const tempWire = new Wire(`${name}_temp`);
        this.addGate(new NandGate(inA, inB, tempWire, `${name}_NAND`));
        this.addGate(new NotGate(tempWire, outWire, `${name}_NOT`));
    }
}

export class OrGate extends CompositeGate {
    constructor(inA: Wire, inB: Wire, outWire: Wire, name: string = "OR") {
        super(name);
        this.inputs = { a: inA, b: inB };
        this.outputs = { out: outWire };

        const tempA = new Wire(`${name}_tempA`);
        const tempB = new Wire(`${name}_tempB`);

        this.addGate(new NotGate(inA, tempA, `${name}_NOT_A`));
        this.addGate(new NotGate(inB, tempB, `${name}_NOT_B`));
        this.addGate(new NandGate(tempA, tempB, outWire, `${name}_NAND`));
    }
}

export class XorGate extends CompositeGate {
    constructor(inA: Wire, inB: Wire, outWire: Wire, name: string = "XOR") {
        super(name);
        this.inputs = { a: inA, b: inB };
        this.outputs = { out: outWire };

        const temp1 = new Wire(`${name}_t1`);
        const temp2 = new Wire(`${name}_t2`);
        const temp3 = new Wire(`${name}_t3`);

        this.addGate(new NandGate(inA, inB, temp1, `${name}_NAND1`));
        this.addGate(new NandGate(inA, temp1, temp2, `${name}_NAND2`));
        this.addGate(new NandGate(inB, temp1, temp3, `${name}_NAND3`));
        this.addGate(new NandGate(temp2, temp3, outWire, `${name}_NAND4`));
    }
}

export class MuxGate extends CompositeGate {
    constructor(inA: Wire, inB: Wire, sel: Wire, outWire: Wire, name: string = "MUX") {
        super(name);
        this.inputs = { a: inA, b: inB, sel: sel };
        this.outputs = { out: outWire };
        
        const notSelWire = new Wire(`${name}_notSel`);
        const and1Wire = new Wire(`${name}_and1`);
        const and2Wire = new Wire(`${name}_and2`);
        
        this.addGate(new NotGate(sel, notSelWire, `${name}_NOT_SEL`));
        this.addGate(new AndGate(inA, notSelWire, and1Wire, `${name}_AND1`));
        this.addGate(new AndGate(inB, sel, and2Wire, `${name}_AND2`));
        this.addGate(new OrGate(and1Wire, and2Wire, outWire, `${name}_OR`));
    }
}

export class DMuxGate extends CompositeGate {
    constructor(inWire: Wire, sel: Wire, outA: Wire, outB: Wire, name: string = "DMUX") {
        super(name);
        this.inputs = { in: inWire, sel: sel };
        this.outputs = { a: outA, b: outB };
        
        const notSelWire = new Wire(`${name}_notSel`);
        
        this.addGate(new NotGate(sel, notSelWire, `${name}_NOT_SEL`));
        this.addGate(new AndGate(inWire, notSelWire, outA, `${name}_AND_A`));
        this.addGate(new AndGate(inWire, sel, outB, `${name}_AND_B`));
    }
}

export class DMux4Way extends CompositeGate {
    constructor(inWire: Wire, sel0: Wire, sel1: Wire, outA: Wire, outB: Wire, outC: Wire, outD: Wire, name: string = "DMUX4WAY") {
        super(name);
        this.inputs = { in: inWire, sel0, sel1 };
        this.outputs = { a: outA, b: outB, c: outC, d: outD };
        
        const tempA = new Wire(`${name}_tA`);
        const tempB = new Wire(`${name}_tB`);
        
        this.addGate(new DMuxGate(inWire, sel1, tempA, tempB, `${name}_SEL1`));
        this.addGate(new DMuxGate(tempA, sel0, outA, outB, `${name}_SEL0A`));
        this.addGate(new DMuxGate(tempB, sel0, outC, outD, `${name}_SEL0B`));
    }
}

export class DMux8Way extends CompositeGate {
    constructor(inWire: Wire, sel0: Wire, sel1: Wire, sel2: Wire, outA: Wire, outB: Wire, outC: Wire, outD: Wire, outE: Wire, outF: Wire, outG: Wire, outH: Wire, name: string = "DMUX8WAY") {
        super(name);
        this.inputs = { in: inWire, sel0, sel1, sel2 };
        this.outputs = { a: outA, b: outB, c: outC, d: outD, e: outE, f: outF, g: outG, h: outH };
        
        const tempA = new Wire(`${name}_tA`);
        const tempB = new Wire(`${name}_tB`);
        
        this.addGate(new DMuxGate(inWire, sel2, tempA, tempB, `${name}_SEL2`));
        this.addGate(new DMux4Way(tempA, sel0, sel1, outA, outB, outC, outD, `${name}_4WAY_A`));
        this.addGate(new DMux4Way(tempB, sel0, sel1, outE, outF, outG, outH, `${name}_4WAY_B`));
    }
}
