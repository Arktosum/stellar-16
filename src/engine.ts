export class Simulator {
    private static evalQueue: Set<Gate> = new Set();
    private static dffs: any[] = [];
    public static clockState: boolean = false;
    public static onClockTick?: (state: boolean) => void;
    
    /**
     * Add a gate to be evaluated.
     */
    static schedule(gate: Gate) {
        this.evalQueue.add(gate);
    }
    
    /**
     * Register a DFF primitive with the simulator.
     */
    static registerDFF(dff: any) {
        this.dffs.push(dff);
    }

    /**
     * Latch inputs into all DFFs (rising edge)
     */
    static tick() {
        this.clockState = true;
        for (const dff of this.dffs) {
            dff.latch();
        }
        if (this.onClockTick) this.onClockTick(this.clockState);
    }

    /**
     * Commit outputs from all DFFs (falling edge) and stabilize
     */
    static tock() {
        this.clockState = false;
        for (const dff of this.dffs) {
            dff.commit();
        }
        if (this.onClockTick) this.onClockTick(this.clockState);
        this.stabilize();
    }
    
    /**
     * Runs the simulation loop until all signals have propagated and the circuit is stable.
     */
    static stabilize() {
        const maxIterations = 10000; // Prevent infinite loops from oscillating circuits (e.g., ring oscillators)
        let iterations = 0;
        
        while (this.evalQueue.size > 0) {
            if (iterations++ > maxIterations) {
                throw new Error("Circuit failed to stabilize (possible unclocked oscillation or feedback loop).");
            }
            
            // Snapshot the current queue and clear it.
            // Gates evaluated in this pass might schedule new gates for the *next* pass.
            const currentQueue = Array.from(this.evalQueue);
            this.evalQueue.clear();
            
            for (const gate of currentQueue) {
                gate.evaluate();
            }
        }
    }
}

export class Wire {
    private _state: boolean = false;
    private listeners: Gate[] = [];
    public name: string;

    constructor(name: string = "wire") {
        this.name = name;
    }

    get state(): boolean {
        return this._state;
    }

    /**
     * Setting the state of a wire instantly updates it and schedules connected gates.
     * In a physical circuit, this represents voltage being applied to a trace.
     */
    set state(newState: boolean) {
        if (this._state !== newState) {
            this._state = newState;
            // Signal propagation: notify downstream gates to re-evaluate
            for (const gate of this.listeners) {
                Simulator.schedule(gate);
            }
        }
    }

    /**
     * Connect a gate to listen to this wire.
     */
    connect(gate: Gate) {
        this.listeners.push(gate);
        // Initially schedule the gate to evaluate the current state of the wire
        Simulator.schedule(gate);
    }
}

export class Bus {
    public wires: Wire[];
    public name: string;
    public size: number;

    constructor(size: number = 16, name: string = "bus") {
        this.size = size;
        this.name = name;
        this.wires = [];
        for (let i = 0; i < size; i++) {
            this.wires.push(new Wire(`${name}[${i}]`));
        }
    }

    /**
     * Sets the state of the bus using an integer value (LSB at index 0)
     */
    setValue(value: number) {
        for (let i = 0; i < this.size; i++) {
            this.wires[i].state = ((value >> i) & 1) === 1;
        }
    }

    /**
     * Reads the state of the bus as an integer value
     */
    getValue(): number {
        let value = 0;
        for (let i = 0; i < this.size; i++) {
            if (this.wires[i].state) {
                value |= (1 << i);
            }
        }
        return value;
    }
}

export abstract class Gate {
    public name: string;
    // Map of input wires/buses and output wires/buses for UI inspection
    public inputs: Record<string, Wire | Bus> = {};
    public outputs: Record<string, Wire | Bus> = {};
    
    constructor(name: string = "Gate") {
        this.name = name;
    }
    
    /**
     * Computes the output based on inputs and updates output wires.
     */
    abstract evaluate(): void;
}
