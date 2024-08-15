import { AND, NOR, NOT } from "./gates";

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