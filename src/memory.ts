import { Wire, Gate, CompositeGate, NandGate, Simulator } from './engine';
import { NotGate } from './gates';

/**
 * The D-Latch (Data Latch).
 * Built entirely from 4 NAND gates.
 * When Enable is high, Q follows Data.
 * When Enable is low, Q holds its previous value.
 */
export class DLatch extends CompositeGate {
    constructor(inD: Wire, inE: Wire, outQ: Wire, outQBar: Wire, name: string = "DLatch") {
        super(name);
        this.inputs = { inD, inE };
        this.outputs = { outQ, outQBar };

        const wireSBar = new Wire(`${name}_SBar`);
        const wireRBar = new Wire(`${name}_RBar`);

        // Input Steering logic
        this.addGate(new NandGate(inD, inE, wireSBar, `${name}_Nand1`));
        this.addGate(new NandGate(wireSBar, inE, wireRBar, `${name}_Nand2`));

        // Cross-coupled SR Latch (Active Low)
        this.addGate(new NandGate(wireSBar, outQBar, outQ, `${name}_Nand3_Q`));
        this.addGate(new NandGate(wireRBar, outQ, outQBar, `${name}_Nand4_QBar`));
    }
}

/**
 * The Master-Slave D-Flip-Flop.
 * Built from two D-Latches and one NOT gate.
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
