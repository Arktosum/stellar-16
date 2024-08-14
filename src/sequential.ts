import { MUX2_1 } from "./combinational";
import { AND, AND3, NOR, NOT, OR } from "./gates";

export class Latch {
    Q: boolean;
    Q_: boolean;
    constructor() {
        this.Q = false;
        this.Q_ = true;
    }
    RSNOR(R: boolean, S: boolean) {
        this.Q = NOR(this.Q_, R);
        this.Q_ = NOR(this.Q, S);
    }
    RSNOREN(R: boolean, ENABLE: boolean, S: boolean) {
        this.RSNOR(AND(R, ENABLE), AND(S, ENABLE));
    }
    DLatch(D: boolean, ENABLE: boolean) {
        this.RSNOREN(NOT(D), ENABLE, D);
    }
    JKLatch(K: boolean, ENABLE: boolean, J: boolean) {
        const reset = AND3(K, ENABLE, this.Q);
        const set = AND3(J, ENABLE, this.Q_);
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
    }

}
export class JKFF extends FlipFlop {
    constructor() {
        super();
        // NOTE : this is a sequence to initialize all the flip flops. first it goes from low to high, then high to low ( negative trigger )
        // It is critical that all three of these operations happen for the flip flops to be reset to zero.
        // Should be revisited later to find the root cause.
        this.TFF(true, false);
        this.TFF(true, false);

        this.TFF(true, true);
        this.TFF(true, true);

        this.TFF(true, false);
        this.TFF(true, false);
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
    TFF_LOAD(CLOCK: boolean, TOGGLE: boolean, LOAD: boolean, DATA: boolean) {
        const k_mux = OR(AND(NOT(LOAD), TOGGLE), AND(LOAD, NOT(DATA)));
        const j_mux = OR(AND(NOT(LOAD), TOGGLE), AND(LOAD, DATA));
        this.MSJKFF(k_mux, CLOCK, j_mux);
    }
}

export class DFF extends FlipFlop {
    constructor() {
        super();
        // NOTE : this is a sequence to initialize all the flip flops. first it goes from low to high, then high to low ( negative trigger )
        // It is critical that all three of these operations happen for the flip flops to be reset to zero.
        // Should be revisited later to find the root cause.
        this.MSDFF(false, false);
        this.MSDFF(false, false);

        this.MSDFF(false, true);
        this.MSDFF(false, true);

        this.MSDFF(false, false);
        this.MSDFF(false, false);
    }
    MSDFF(D: boolean, CLOCK: boolean) {
        this.master.DLatch(D, CLOCK);
        this.slave.DLatch(this.master.Q, NOT(CLOCK));

        this.Q = this.slave.Q
        this.Q_ = this.slave.Q_
    }
}
// ADDRESS LOW 8 bit
// ADDRESS HIGH 8 bit
export class Register {
    size: number;
    flipflops: DFF[];
    name: string;
    READ_ENABLE: boolean;
    WRITE_ENABLE: boolean;
    constructor(registerSize: number, name: string) {
        this.name = name;
        this.size = registerSize;
        this.flipflops = []
        for (let i = 0; i < this.size; i++) {
            this.flipflops.push(new DFF());
        }
        this.READ_ENABLE = false;
        this.WRITE_ENABLE = false;
    }
    read(OVERRIDE: boolean = false) {
        const data = [];
        for (let i = 0; i < this.flipflops.length; i++) {
            const value = AND(this.flipflops[i].Q, OR(this.READ_ENABLE, OVERRIDE))
            data.push(value)
        }
        return data;
    }
    run(CLOCK: boolean, DATA: boolean[]) {
        for (let i = 0; i < this.size; i++) {
            const d_pin = MUX2_1(DATA[i], this.flipflops[i].Q, this.WRITE_ENABLE);
            this.flipflops[i].MSDFF(d_pin, CLOCK);
        }
    }
}


export class Counter {
    size: number;
    flipflops: JKFF[];
    name: string;
    READ_ENABLE: boolean;
    WRITE_ENABLE: boolean;
    ENABLE_COUNTER: boolean;
    constructor(registerSize: number, name: string) {
        this.name = name;
        this.size = registerSize;
        this.flipflops = []
        for (let i = 0; i < this.size; i++) {
            this.flipflops.push(new JKFF());
        }
        this.READ_ENABLE = false;
        this.WRITE_ENABLE = false;
        this.ENABLE_COUNTER = false;
    }
    read(OVERRIDE: boolean = false) {
        const data = [];
        for (let i = 0; i < this.flipflops.length; i++) {
            const value = AND(this.flipflops[i].Q, OR(this.READ_ENABLE, OVERRIDE))
            data.push(value)
        }
        return data;
    }
    runSync(CLOCK: boolean, DATA: boolean[], REVERSE: boolean = false) {
        let prev = this.ENABLE_COUNTER;
        for (let i = this.size - 1; i >= 0; i--) {
            const ff = this.flipflops[i];
            ff.TFF_LOAD(CLOCK, prev, this.WRITE_ENABLE, DATA[i]);
            prev = AND(MUX2_1(ff.Q_, ff.Q, REVERSE), prev);
        }
    }
}
