import { ALU, DECODER_mxn, MUX_2x1, MUX_4x1 } from "./combinational";
import { AND, NOR, NOT } from "./gates";
import { decimalToBooleanArray, split_array } from "./utils";

export class Latch {
    Q: boolean;
    Q_: boolean;
    constructor() {
        this.Q = false;
        this.Q_ = true;
    }
    RSNOR(R: boolean, S: boolean) {
        let newQ = this.Q;
        let newQ_ = this.Q_;

        // Iterate until the outputs stabilize
        while (true) {
            const tempQ = NOR(R, newQ_);
            const tempQ_ = NOR(S, newQ);

            // If the values stabilize, exit the loop
            if (tempQ === newQ && tempQ_ === newQ_) break;

            // Update temporary variables for the next iteration
            newQ = tempQ;
            newQ_ = tempQ_;
        }
        // Assign the stabilized values to the latch
        this.Q = newQ;
        this.Q_ = newQ_;
    }
    RSNORENABLE(R: boolean, S: boolean, ENABLE: boolean) {
        this.RSNOR(AND(R, ENABLE), AND(S, ENABLE))
    }
    D(D: boolean, ENABLE: boolean) {
        this.RSNORENABLE(NOT(D), D, ENABLE);
    }
}

export class FlipFlop extends Latch {
    master: Latch;
    slave: Latch;
    isRisingEdge: boolean;
    constructor(isRisingEdge: boolean) {
        super();
        this.master = new Latch();
        this.slave = new Latch();
        this.isRisingEdge = isRisingEdge;
    }
    MSDFF(D: boolean, CLOCK: boolean) {
        // Negative Edge Triggered by Default
        if (this.isRisingEdge) {
            // Inverting the clock signal to achieve positive edge triggering.
            CLOCK = NOT(CLOCK);
        }
        this.master.D(D, CLOCK);
        this.slave.D(this.master.Q, NOT(CLOCK));

        this.Q = this.slave.Q;
        this.Q_ = this.slave.Q_;
    }
    getState() {
        return { Q: this.Q, Q_: this.Q_ }
    }
}


export class Register {
    flipflops: FlipFlop[];
    width: number;
    WRITE_ENABLE: boolean;
    isRisingEdge: boolean;
    constructor(width: number, isRisingEdge: boolean) {
        this.width = width;
        this.isRisingEdge = isRisingEdge;
        this.flipflops = [];
        for (let i = 0; i < this.width; i++) {
            this.flipflops.push(new FlipFlop(this.isRisingEdge));
        }
        this.WRITE_ENABLE = false;
    }
    run(writeData: boolean[], CLOCK: boolean) {
        if (writeData.length !== this.flipflops.length) {
            throw new Error(`Input width mismatch. Expected ${this.flipflops.length} bits.`);
        }
        for (let i = 0; i < this.flipflops.length; i++) {
            // Write data into flip-flops only if WRITE_ENABLE is true
            const data = MUX_2x1(writeData[i], this.flipflops[i].Q, this.WRITE_ENABLE);
            this.flipflops[i].MSDFF(data, CLOCK);
        }
    }
    read(): boolean[] {
        return this.flipflops.map(ff => ff.Q);
    }
}



export class ProgramCounter {
    flipflops: FlipFlop[];  // Register to hold the current PC value
    width: number;  // Width of the PC (typically 32 or 64 bits)
    RESET: boolean;  // Reset control signal
    WRITE_ENABLE: boolean;
    INCREMENT: boolean;

    constructor(width: number) {
        this.width = width;
        this.flipflops = [];
        for (let i = 0; i < this.width; i++) {
            this.flipflops.push(new FlipFlop(true));
        }
        this.INCREMENT = false;
        this.WRITE_ENABLE = false;
        this.RESET = false;
    }

    run(loadData: boolean[], CLOCK: boolean) {

        //  0 0 = MEMORY
        //  0 1 = INC
        //  1 0 = LOAD
        //  1 1 = RESET

        const INC = ALU(this.read(), decimalToBooleanArray(1, this.width), [true, true, false], this.width);

        for (let i = 0; i < this.flipflops.length; i++) {
            // Write data into flip-flops only if WRITE_ENABLE is true
            const row = [this.flipflops[i].Q, INC[i], loadData[i], false] // false is RESET
            const data = MUX_4x1(row, [this.WRITE_ENABLE, this.INCREMENT]);
            this.flipflops[i].MSDFF(data, CLOCK);
        }
    }
    read(): boolean[] {
        return this.flipflops.map(ff => ff.Q); // Return the current PC value
    }
}






export class Memory {
    cells: Register[][];
    WRITE_ENABLE: boolean;
    constructor() {
        this.cells = [];
        for (let i = 0; i < 256; i++) {
            const row = [];
            for (let j = 0; j < 256; j++) {
                row.push(new Register(16, true));
            }
            this.cells.push(row);
        }
        this.WRITE_ENABLE = false;
    }
    run(ADDRESS: boolean[], DATA: boolean[], CLOCK: boolean) {

        const [HIGH_ADDRESS, LOW_ADDRESS] = split_array(ADDRESS, 8);

        const HIGH_LINES = DECODER_mxn(HIGH_ADDRESS);
        const LOW_LINES = DECODER_mxn(LOW_ADDRESS);

        // Search for the correct memory cell
        let search = { i: -1, j: -1 };
        let found_cell = false;
        for (let i = 0; i < HIGH_LINES.length; i++) {
            if (found_cell) {
                break;
            }
            for (let j = 0; j < LOW_LINES.length; j++) {
                if (AND(HIGH_LINES[i], LOW_LINES[j])) {
                    search = { i, j };
                    found_cell = true;
                    break;
                }
            }
        }
        console.log("Selected cell : ", search)
        const cell = this.cells[search.i][search.j];
        cell.WRITE_ENABLE = this.WRITE_ENABLE;
        cell.run(DATA, CLOCK);
    }
}