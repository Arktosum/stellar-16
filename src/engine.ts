/**
 * The Event-Driven Physics Engine
 */

export class Wire {
    private _state: boolean = false;
    public listeners: NandGate[] = [];
    public name: string;

    constructor(name: string = "wire") {
        this.name = name;
    }

    get state(): boolean {
        return this._state;
    }

    set state(newState: boolean) {
        if (this._state !== newState) {
            this._state = newState;
            // The voltage changed! Alert all connected gates.
            for (const gate of this.listeners) {
                Simulator.enqueue(gate);
            }
        }
    }

    connect(gate: NandGate) {
        this.listeners.push(gate);
    }

    disconnectAll() {
        this.listeners = [];
    }
}

export class Bus {
    public wires: Wire[];
    public size: number;
    public name: string;

    constructor(size: number, name: string = "bus") {
        this.size = size;
        this.name = name;
        this.wires = [];
        for (let i = 0; i < size; i++) {
            this.wires.push(new Wire(`${name}[${i}]`));
        }
    }

    getValue(): number {
        let val = 0;
        for (let i = 0; i < this.size; i++) {
            if (this.wires[i].state) {
                val |= (1 << i);
            }
        }
        return val;
    }

    setValue(val: number) {
        for (let i = 0; i < this.size; i++) {
            this.wires[i].state = (val & (1 << i)) !== 0;
        }
    }
}

export abstract class Gate {
    public name: string;
    public parent: CompositeGate | null = null;
    
    // We keep inputs/outputs for UI rendering and hierarchical traversal
    public inputs: Record<string, Wire | Bus> = {};
    public outputs: Record<string, Wire | Bus> = {};

    constructor(name: string) {
        this.name = name;
    }
}

/**
 * The ONLY logic primitive in the entire computer.
 */
export class NandGate extends Gate {
    constructor(a: Wire, b: Wire, out: Wire, name: string = "Nand") {
        super(name);
        this.inputs = { a, b };
        this.outputs = { out };

        // Connect the input wires physically to this gate
        a.connect(this);
        b.connect(this);
        
        // Initial evaluation
        Simulator.enqueue(this);
    }

    evaluate() {
        const a = (this.inputs.a as Wire).state;
        const b = (this.inputs.b as Wire).state;
        // The only logical operation in the engine:
        (this.outputs.out as Wire).state = !(a && b);
    }
}

/**
 * Any gate made of multiple sub-gates inherits from this.
 */
export class CompositeGate extends Gate {
    public subGates: Gate[] = [];

    addGate<T extends Gate>(gate: T): T {
        gate.parent = this;
        this.subGates.push(gate);
        return gate;
    }
}

export class Simulator {
    // A Set prevents adding the same gate twice in one tick
    private static eventQueue: Set<NandGate> = new Set();
    
    // Statistics for the UI
    public static gatesEvaluatedThisTick: number = 0;

    static enqueue(gate: NandGate) {
        this.eventQueue.add(gate);
    }

    static clearQueue() {
        this.eventQueue.clear();
    }

    /**
     * Runs the BFS propagation loop until all voltages stabilize.
     */
    static step(count: number = 1) {
        this.gatesEvaluatedThisTick = 0;
        let c = count;
        while (this.eventQueue.size > 0 && c > 0) {
            const gate = this.eventQueue.values().next().value;
            this.eventQueue.delete(gate);
            gate.evaluate();
            this.gatesEvaluatedThisTick++;
            c--;
        }
    }

    static stabilize() {
        this.gatesEvaluatedThisTick = 0;
        
        // Safety mechanism to prevent infinite oscillation (e.g., an unstable ring oscillator)
        let maxIterations = 100000; 
        
        while (this.eventQueue.size > 0 && maxIterations > 0) {
            // Pop a gate
            const gate = this.eventQueue.values().next().value;
            this.eventQueue.delete(gate);
            
            // Evaluate its physical logic
            gate.evaluate();
            
            this.gatesEvaluatedThisTick++;
            maxIterations--;
        }

        if (maxIterations === 0) {
            // Infinite oscillation safely paused.
        }
    }
}
