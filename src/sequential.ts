import { ADDER_N_BIT, MUX_4_TO_1_NUMERIC } from "./combinational";
import { AND, NOR, NOT } from "./gate";
import Numeric from "./Numeric";

export class Latch {
    Q: boolean;
    Q_: boolean
    constructor() {
        this.Q = Math.random() < 0.5;  // Random initial state
        this.Q_ = !this.Q;
    }

    private runSR(S: boolean, R: boolean) {

        // Run till stable.
        let prev_Q = this.Q;
        let prev_Q_ = this.Q_;

        do {
            prev_Q = this.Q;
            prev_Q_ = this.Q_;
            this.Q = NOR(R, this.Q_);
            this.Q_ = NOR(S, this.Q);
        } while (this.Q !== prev_Q || this.Q_ !== prev_Q_);
    }

    displayState(): string {
        return `Q: ${this.Q ? 1 : 0}, Q_: ${this.Q_ ? 1 : 0}`;
    }

    runSREnable(S: boolean, R: boolean, EN: boolean) {
        this.runSR(AND(S, EN), AND(R, EN));
    }

    runD(D: boolean, EN: boolean) {
        this.runSREnable(D, NOT(D), EN);
    }
}


export class FlipFlop {
    Q: boolean;
    Q_: boolean
    master_dlatch: Latch;
    slave_dlatch: Latch;
    constructor() {
        this.master_dlatch = new Latch();
        this.slave_dlatch = new Latch();

        this.Q = this.slave_dlatch.Q;
        this.Q_ = this.slave_dlatch.Q_;
    }

    runDFF(D: boolean, CLOCK: boolean) {
        // Negative edge triggered D Flip Flop using Master-Slave D Latch
        this.master_dlatch.runD(D, CLOCK);
        this.slave_dlatch.runD(this.master_dlatch.Q, NOT(CLOCK));

        this.Q = this.slave_dlatch.Q;
        this.Q_ = this.slave_dlatch.Q_;
    }
    displayState(): string {
        return `Q: ${this.Q ? 1 : 0}, Q_: ${this.Q_ ? 1 : 0}`;
    }
}

export class Register {
    flipflops: FlipFlop[];
    constructor(bit_size: number) {
        this.flipflops = [];
        for (let i = 0; i < bit_size; i++) {
            this.flipflops.push(new FlipFlop());
        }
    }

    run(D: Numeric, CLOCK: boolean) {
        if (D.bit_size !== this.flipflops.length) {
            throw new Error("Bit size of D must match the register size");
        }
        for (let i = 0; i < this.flipflops.length; i++) {
            this.flipflops[i].runDFF(D.boolean_array[i], CLOCK);
        }
    }
    displayState(): string {
        return this.flipflops.map((ff) => ff.displayState()).join(' | ');
    }
}

export class ProgramCounter {
    register: Register;
    constructor(bit_size: number) {
        this.register = new Register(bit_size);
    }
    run(LOAD: boolean, INCREMENT: boolean, D: Numeric, CLOCK: boolean) {
        let current_value_array: boolean[] = this.register.flipflops.map(ff => ff.Q);
        let current_value = Numeric.fromBooleanArray(current_value_array);

        // LOAD INCREMENT | Y
        // 0     0      | Y_prev
        // 1    0       | D
        // 0   1        | Y_prev + 1
        // 1  1        | Y_prev

        let next_value = MUX_4_TO_1_NUMERIC(
            current_value,
            D,
            ADDER_N_BIT(current_value, new Numeric(1, current_value.bit_size)).SUM,
            current_value,
            LOAD,
            INCREMENT
        );
        this.register.run(next_value, CLOCK);
    }
    displayState(): string {
        return this.register.displayState();
    }
}



// 16 bit ALU
// 16 bit Program Counter
// 16 bit Register File (8 registers)
// 16 bit Instruction Register
// RAM (65536 locations of 16 bits each) 1 MB


// ROM (65536 locations of number_of_control_signals bits each)


// Memory Mapping
// 512 x 512 pixels, 8 bit per pixel = 262144 bytes = 256 KB