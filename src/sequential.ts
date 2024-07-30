import { AND, AND3, NOR, NOT, OR } from "./gates";

export class Latch {
    Q: boolean;
    Q_: boolean;
    constructor() {
        this.Q = false;
        this.Q_ = true;
    }
    SET() {
        this.Q = true;
        this.Q_ = false;
    }
    CLEAR() {
        this.Q = false;
        this.Q_ = true;
    }
    RSNOR(R: boolean, S: boolean) {
        this.Q = NOR(this.Q_, R);
        this.Q_ = NOR(this.Q, S);
    }
    RSNOREN(R: boolean, CLOCK: boolean, S: boolean) {
        this.RSNOR(AND(R, CLOCK), AND(S, CLOCK));
    }
    DLatch(D: boolean, CLOCK: boolean) {
        this.RSNOREN(NOT(D), CLOCK, D);
    }
    JKLatch(K: boolean, CLOCK: boolean, J: boolean) {
        const reset = AND3(K, CLOCK, this.Q);
        const set = AND3(J, CLOCK, this.Q_);
        this.RSNOR(reset, set);
    }
}

export class FlipFlop extends Latch {
    master: Latch;
    slave: Latch;
    // The memory units here are only considered FlipFlops since they implement negative-edge triggering.
    constructor() {
        super();
        this.master = new Latch();
        this.slave = new Latch();

        // Initialize Latches
        this.master.SET();
        this.slave.CLEAR();
    }

    MSDFF(D: boolean, CLOCK: boolean) {

        this.master.DLatch(D, CLOCK);
        this.slave.DLatch(this.master.Q, NOT(CLOCK));

        this.Q = this.slave.Q
        this.Q_ = this.slave.Q_
    }
    MSJKFF(K: boolean, CLOCK: boolean, J: boolean) {
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


function MUX2_1(A: boolean, B: boolean, select0: boolean): boolean {
    // select0 ? A : B
    return OR(AND(A, select0), AND(B, NOT(select0)));
}

export class Counter {
    flipflops: FlipFlop[];
    constructor(bitLength: number) {
        this.flipflops = [];
        for (let i = 0; i < bitLength; i++) {
            this.flipflops.push(new FlipFlop());
        }
    }
    read(Q: boolean = true): boolean[] {
        // True will return Q and false will return Q_
        const result = [];
        // Reads the value of the counter,
        for (let flipflop of this.flipflops) {
            const value = MUX2_1(flipflop.Q, flipflop.Q_, Q);
            result.push(value);
        }
        return result;
    }

    SYNC(T: boolean, CLOCK: boolean) {
        this.flipflops.reverse();
        let ripple_T = T;
        for (let flipflop of this.flipflops) {
            flipflop.TFF(ripple_T, CLOCK);
            ripple_T = AND(ripple_T, flipflop.Q);
        }
        this.flipflops.reverse();
    }

    ASYNC_RIPPLE(T: boolean, CLOCK: boolean) {
        this.flipflops.reverse();
        let ripple_clock = CLOCK;
        for (let flipflop of this.flipflops) {
            flipflop.TFF(T, ripple_clock);
            ripple_clock = flipflop.Q;
        }
        this.flipflops.reverse();
    }
}