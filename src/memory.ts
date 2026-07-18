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
