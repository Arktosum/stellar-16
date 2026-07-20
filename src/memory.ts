import { Wire, CompositeGate, NandGate } from './engine';
import { NotGate } from './gates';

/**
 * The SR-Latch (Set-Reset Latch).
 * The fundamental atomic unit of memory, built from 2 cross-coupled NAND gates.
 * Active Low: 
 * Set_bar = 0 -> Q = 1
 * Reset_bar = 0 -> Q = 0
 * Both 1 -> Hold State
 * Both 0 -> Invalid (Race condition)
 */
export class SrLatchActiveLow extends CompositeGate {
    constructor(inSBar: Wire, inRBar: Wire, outQ: Wire, outQBar: Wire, name: string = "SrLatch_AL") {
        super(name);
        this.inputs = { inSBar, inRBar };
        this.outputs = { outQ, outQBar };

        this.addGate(new NandGate(inSBar, outQBar, outQ, `${name}_Nand_Q`));
        this.addGate(new NandGate(inRBar, outQ, outQBar, `${name}_Nand_QBar`));
    }
}

/**
 * The SR-Latch (Set-Reset Latch).
 * Active High: 
 * Set = 1 -> Q = 1
 * Reset = 1 -> Q = 0
 */
export class SrLatch extends CompositeGate {
    constructor(inS: Wire, inR: Wire, outQ: Wire, outQBar: Wire, name: string = "SrLatch") {
        super(name);
        this.inputs = { inS, inR };
        this.outputs = { outQ, outQBar };

        const wireSBar = new Wire(`${name}_SBar`);
        const wireRBar = new Wire(`${name}_RBar`);

        this.addGate(new NotGate(inS, wireSBar, `${name}_NotS`));
        this.addGate(new NotGate(inR, wireRBar, `${name}_NotR`));
        this.addGate(new SrLatchActiveLow(wireSBar, wireRBar, outQ, outQBar, `${name}_Core`));
    }
}

/**
 * The D-Latch (Data Latch).
 * Built hierarchically using 1 SR-Latch, and input steering gates.
 * When Enable is high, Q follows Data.
 * When Enable is low, Q holds its previous value.
 */
export class DLatch extends CompositeGate {
    constructor(inD: Wire, inE: Wire, outQ: Wire, outQBar: Wire, name: string = "DLatch") {
        super(name);
        this.inputs = { inD, inE };
        this.outputs = { outQ, outQBar };

        const wireDBar = new Wire(`${name}_DBar`);
        const wireSBar = new Wire(`${name}_SBar`);
        const wireRBar = new Wire(`${name}_RBar`);

        // Invert D
        this.addGate(new NotGate(inD, wireDBar, `${name}_NotD`));

        // Input Steering logic
        this.addGate(new NandGate(inD, inE, wireSBar, `${name}_Nand_S`));
        this.addGate(new NandGate(wireDBar, inE, wireRBar, `${name}_Nand_R`));

        // Core Memory Unit
        this.addGate(new SrLatchActiveLow(wireSBar, wireRBar, outQ, outQBar, `${name}_SRCore`));
    }
}

/**
 * The Master-Slave D-Flip-Flop.
 * Built hierarchically from two D-Latches and one NOT gate.
 * It is edge-triggered. The Master loads data when Clock is High.
 * The Slave outputs data when Clock falls to Low.
 * This prevents the unstable race conditions of a transparent latch.
 */
export class DFlipFlop extends CompositeGate {
    constructor(inD: Wire, inClock: Wire, outQ: Wire, outQBar: Wire, name: string = "DFF") {
        super(name);
        this.inputs = { inD, inClock };
        this.outputs = { outQ, outQBar };

        const clockBar = new Wire(`${name}_ClockBar`);
        const masterQ = new Wire(`${name}_MasterQ`);
        const masterQBar = new Wire(`${name}_MasterQBar`);

        // Invert the clock for the Slave latch
        this.addGate(new NotGate(inClock, clockBar, `${name}_NotClock`));

        // Master Latch (transparent when Clock is HIGH)
        this.addGate(new DLatch(inD, inClock, masterQ, masterQBar, `${name}_Master`));

        // Slave Latch (transparent when Clock is LOW)
        this.addGate(new DLatch(masterQ, clockBar, outQ, outQBar, `${name}_Slave`));
    }
}
