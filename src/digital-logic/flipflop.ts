import { AND, AND3, NOR, NOT, OR } from "./gates";

export class Latch {
    Q: boolean;
    Q_: boolean;
    constructor() {
        this.Q = false;
        this.Q_ = true;
    }
    RSNOR(RESET: boolean, SET: boolean) {
        this.Q = NOR(RESET, this.Q_);
        this.Q_ = NOR(SET, this.Q);
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
    constructor(bitLength: number) {
        this.flipflops = [];
        this.size = bitLength;
        for (let i = 0; i < this.size; i++) {
            this.flipflops.push(new DFlipFlop());
        }
    }
    read() {
        const result = [];
        for (let i = 0; i < this.flipflops.length; i++) {
            result.push(this.flipflops[i].Q);
        }
        return result;
    }
    write(CLOCK: boolean, DATA: boolean[]) {
        for (let i = 0; i < this.flipflops.length; i++) {
            const ff = this.flipflops[i];
            ff.MSDFF(CLOCK, DATA[i]);
        }
    }
}

export class Counter {
    flipflops: JKFlipFlop[];
    size: number;
    constructor(bitLength: number) {
        this.flipflops = [];
        this.size = bitLength;
        for (let i = 0; i < this.size; i++) {
            this.flipflops.push(new JKFlipFlop());
        }
    }
    read() {
        const result = [];
        for (let i = 0; i < this.flipflops.length; i++) {
            result.push(this.flipflops[i].Q);
        }
        return result;
    }
    ASYNC(CLOCK: boolean, T: boolean, reverse: boolean) {
        let prev = CLOCK;
        for (let i = this.size - 1; i >= 0; i--) {
            const ff = this.flipflops[i];
            ff.TFF(T, prev);
            prev = MUX2_1(ff.Q_, ff.Q, reverse);
        }
    }
    SYNC(CLOCK: boolean, T: boolean, reverse: boolean) {
        let prev = T;
        for (let i = this.size - 1; i >= 0; i--) {
            const ff = this.flipflops[i];
            ff.TFF(prev, CLOCK);
            prev = AND(prev, MUX2_1(ff.Q_, ff.Q, reverse));
        }
    }
}


export function MUX2_1(A: boolean, B: boolean, SELECT: boolean) {
    return OR(AND(A, SELECT), AND(B, NOT(SELECT)));
}

export class DFlipFlop extends Latch {
    master: Latch;
    slave: Latch;
    constructor() {
        super();
        this.master = new Latch();
        this.slave = new Latch();
    }
    MSDFF(CLOCK: boolean, DATA: boolean) {

        this.master.DLATCH(CLOCK, DATA);
        this.slave.DLATCH(NOT(CLOCK), this.master.Q);

        this.Q = this.slave.Q;
        this.Q_ = this.slave.Q_;
    }
}



export class JKFlipFlop extends Latch {
    master: Latch;
    slave: Latch;
    constructor() {
        super();
        this.master = new Latch();
        this.slave = new Latch();


        // Initialize JK flip flop to zero by simulating a negative edge.
        //  OR
        // the master latch needs to be true and slave latch needs to be false

        // Set the master latch true intially
        this.master.Q = true;
        this.master.Q_ = false;

    }
    MSJKFF(J: boolean, CLOCK: boolean, K: boolean) {
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