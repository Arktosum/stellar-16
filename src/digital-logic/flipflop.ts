import { FULL_ADDER_N } from "./combinational";
import { AND, AND3, NOR, NOT, OR, XOR } from "./gates";
import Numeric, { boolean_to_hex } from "./number";

export class Latch {
    Q: boolean;
    Q_: boolean;
    constructor() {
        this.Q = false;
        this.Q_ = true;
    }
    RSNOR(RESET: boolean, SET: boolean) {
        // At the start, RSNOR latch goes into a racing problem.
        // Running this at least twice make sure the latch is properly initialized.
        for (let i = 0; i < 2; i++) {
            this.Q = NOR(RESET, this.Q_);
            this.Q_ = NOR(SET, this.Q);
        }
    }
    RSNORENABLE(RESET: boolean, ENABLE: boolean, SET: boolean) {
        this.RSNOR(AND(RESET, ENABLE), AND(SET, ENABLE))
    }
    DLATCH(ENABLE: boolean, DATA: boolean) {
        this.RSNORENABLE(NOT(DATA), ENABLE, DATA);
    }
}


export class Register {
    flipflops: DFlipFlop[];
    size: number;
    description: string;
    OUTPUT_ENABLE: boolean = false;
    WRITE_ENABLE: boolean = false;
    constructor(bitLength: number, description: string, positive_trigger: boolean) {
        this.flipflops = [];
        this.size = bitLength;
        this.description = description;
        for (let i = 0; i < this.size; i++) {
            this.flipflops.push(new DFlipFlop(positive_trigger));
        }

    }
    reset_control() {
        this.OUTPUT_ENABLE = false;
        this.WRITE_ENABLE = false;
    }
    read() {
        const result = [];
        for (let i = 0; i < this.flipflops.length; i++) {
            const data = this.flipflops[i].Q
            result.push(data);
        }
        return result;
    }
    write(CLOCK: boolean, DATA: boolean[]) {
        // If WRITE ENABLE IS ON,WRITES INCOMING DATA, ELSE , IT WRITES PREVIOUS DATA ONTO ITSELF.
        for (let i = 0; i < this.flipflops.length; i++) {
            const ff = this.flipflops[i];
            const write_data = MUX2_1(DATA[i], ff.Q, this.WRITE_ENABLE);
            ff.MSDFF(CLOCK, write_data);
        }
        if (this.WRITE_ENABLE) {
            console.log(`${this.description} <- ${Numeric.fromBinary(DATA).toHex(4)}`)
            console.log(`READ-CHECK`, boolean_to_hex(this.read()))
        }
    }
}


export function MUX2_1(A: boolean, B: boolean, SELECT: boolean) {
    // SELECT ? A : B
    return OR(AND(A, SELECT), AND(B, NOT(SELECT)));
}

export class DFlipFlop extends Latch {
    master: Latch;
    slave: Latch;
    positive_trigger: boolean;
    constructor(positive_trigger: boolean) {
        super();
        this.master = new Latch();
        this.slave = new Latch();
        this.positive_trigger = positive_trigger;
    }
    MSDFF(CLOCK: boolean, DATA: boolean) {
        if (this.positive_trigger) {
            CLOCK = NOT(CLOCK); // POSITIVE EDGE TRIGGERING
        }
        this.master.DLATCH(CLOCK, DATA);
        this.slave.DLATCH(NOT(CLOCK), this.master.Q);

        this.Q = this.slave.Q;
        this.Q_ = this.slave.Q_;
    }
}



export class JKFlipFlop extends Latch {
    master: Latch;
    slave: Latch;
    positive_trigger: boolean;
    constructor(positive_trigger: boolean) {
        super();
        this.master = new Latch();
        this.slave = new Latch();
        this.positive_trigger = positive_trigger;

        // Initialize JK flip flop to zero by simulating a negative edge.
        //  OR
        // the master latch needs to be true and slave latch needs to be false

        // Set the master latch true intially
        this.master.Q = true;
        this.master.Q_ = false;
    }
    MSJKFF(J: boolean, CLOCK: boolean, K: boolean) {
        if (this.positive_trigger) {
            CLOCK = NOT(CLOCK); // POSITIVE EDGE TRIGGERING
        }
        const masterR = AND3(J, CLOCK, this.Q_);
        const masterS = AND3(K, CLOCK, this.Q);

        this.master.RSNOR(masterR, masterS);

        const slaveR = AND(this.master.Q, NOT(CLOCK));
        const slaveS = AND(this.master.Q_, NOT(CLOCK));
        this.slave.RSNOR(slaveR, slaveS);

        this.Q = this.slave.Q;
        this.Q_ = this.slave.Q_;
    }
    TFF(T: boolean, CLOCK: boolean) {
        this.MSJKFF(T, CLOCK, T);
    }
}

export class RegisterBuffer {
    size: number;
    description: string;
    latches: Latch[];
    OUTPUT_ENABLE: boolean;
    WRITE_ENABLE: boolean;
    constructor(bitLength: number, description: string) {
        this.size = bitLength;
        this.description = description;
        this.latches = [];
        for (let i = 0; i < this.size; i++) {
            this.latches.push(new Latch());
        }
        this.OUTPUT_ENABLE = false;
        this.WRITE_ENABLE = false;
    }
    read() {
        const result = [];
        for (let i = 0; i < this.latches.length; i++) {
            result.push(this.latches[i].Q);
        }
        return result;
    }
    write(data: boolean[]) {
        for (let i = 0; i < this.latches.length; i++) {
            this.latches[i].DLATCH(this.WRITE_ENABLE, data[i]);
        }
    }
}

export class DFFCounter {
    flipflops: DFlipFlop[];
    size: number;
    description: string;
    OUTPUT_ENABLE: boolean = false;
    MODE: boolean = false;
    ENABLE: boolean = false;
    positive_trigger: boolean;
    constructor(bitLength: number, description: string, positive_trigger: boolean) {


        this.flipflops = [];
        this.size = bitLength;
        this.description = description;
        this.positive_trigger = positive_trigger
        for (let i = 0; i < this.size; i++) {
            this.flipflops.push(new DFlipFlop(positive_trigger));
        }
    }
    reset_control() {
        this.ENABLE = false;
        this.MODE = false;
        this.OUTPUT_ENABLE = false;
    }
    read() {
        const result = [];
        for (let i = 0; i < this.flipflops.length; i++) {
            const data = this.flipflops[i].Q;
            result.push(data);
        }
        return result;
    }
    run(CLOCK: boolean, DATA: boolean[]) {
        // MODE = 0 - Increment By 1
        // MODE = 1 - Absolute ( coming from DATA )
        const FIXED_ONE = new Numeric(1).toBinary(this.size);
        const [inc_data, carry] = FULL_ADDER_N(this.read(), FIXED_ONE, false);

        for (let i = 0; i < this.flipflops.length; i++) {
            const ff = this.flipflops[i];
            const new_data = MUX2_1(DATA[i], inc_data[i], this.MODE);
            const data = MUX2_1(new_data, ff.Q, this.ENABLE);
            ff.MSDFF(CLOCK, data);
        }

    }
}