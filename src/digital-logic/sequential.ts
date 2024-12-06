import { DECODERM_2N, FULL_ADDER, FULL_ADDER_N, MUX_2x1, MUX_4x1 } from "./combinational";
import { AND, AND3, NOR, NOT } from "./gates";
import { bool_to_dec, dec_to_bool, Numeric } from "./Numeric";


export class Latch {
    Q: boolean;
    Q_: boolean;
    constructor() {
        this.Q = false;
        this.Q_ = true;
    }
    RSNOR(R: boolean, S: boolean) {
        // Iterative Convergence : Keep applying until convergence.
        let prevQ
        let prevQ_
        let convergenceCount = 0;
        do {
            prevQ = this.Q;
            prevQ_ = this.Q_;
            let newQ = NOR(this.Q_, R);
            let newQ_ = NOR(this.Q, S);
            this.Q = newQ;
            this.Q_ = newQ_;
            convergenceCount++;
        }
        while (this.Q != prevQ || this.Q_ != prevQ_);
        return convergenceCount
    }
    RSNORENABLE(R: boolean, ENABLE: boolean, S: boolean) {
        return this.RSNOR(AND(R, ENABLE), AND(S, ENABLE))
    }
    DLATCH(D: boolean, ENABLE: boolean) {
        return this.RSNORENABLE(NOT(D), ENABLE, D);
    }
}

export class FlipFlop {
    master: Latch;
    slave: Latch;
    Q: boolean;
    Q_: boolean;
    constructor() {
        this.master = new Latch();
        this.slave = new Latch();
        this.Q = false;
        this.Q_ = true;
    }
    MSDFF(D: boolean, CLOCK: boolean) {
        this.master.DLATCH(D, CLOCK);
        this.slave.DLATCH(this.master.Q, NOT(CLOCK));

        this.Q = this.slave.Q;
        this.Q_ = this.slave.Q_;
    }
    MSJKFF(J: boolean, CLOCK: boolean, K: boolean) {
        // Iterative Convergence : Keep applying until convergence.
        // Initialize with J , K and clock as False to get valid state as ON.
        let prevQ
        let prevQ_
        let convergenceCount = 0;
        do {
            prevQ = this.Q;
            prevQ_ = this.Q_;
            let masterR = AND3(J, CLOCK, this.Q_);
            let masterS = AND3(K, CLOCK, this.Q);
            this.master.RSNOR(masterR, masterS);

            let slaveR = AND(this.master.Q, NOT(CLOCK));
            let slaveS = AND(this.master.Q_, NOT(CLOCK));
            this.slave.RSNOR(slaveR, slaveS);

            this.Q = this.slave.Q;
            this.Q_ = this.slave.Q_;
            convergenceCount++;
        }
        while (this.Q != prevQ || this.Q_ != prevQ_);
        return convergenceCount
    }
}



export class Register {
    size: number;
    flipflops: FlipFlop[];
    WRITE_ENABLE: boolean;
    OUTPUT_ENABLE: boolean;
    DATA_BUS: Bus;
    name: string;
    log: boolean;
    constructor(name: string, size: number, DATA_BUS: Bus, log: boolean = false) {
        this.size = size;
        this.name = name;
        this.log = log;
        this.flipflops = [];
        for (let i = 0; i < this.size; i++) {
            this.flipflops.push(new FlipFlop());
        }
        this.WRITE_ENABLE = false;
        this.OUTPUT_ENABLE = false;
        this.DATA_BUS = DATA_BUS;
    }
    read_user() {
        const data: boolean[] = [];
        for (let i = 0; i < this.size; i++) {
            data.push(this.flipflops[i].Q);
        }
        return data
    }
    user_write(data: boolean[]) {
        for (let i = 0; i < this.size; i++) {
            const D = data[i];
            // Simulate stepping.
            this.flipflops[i].MSDFF(D, false);
            this.flipflops[i].MSDFF(D, true);
            this.flipflops[i].MSDFF(D, false);
        }
    }
    run(CLOCK: boolean) {
        const BUS_DATA = this.DATA_BUS.read()

        if (this.WRITE_ENABLE && this.log) {
            console.log(`DATABUS(${bool_to_dec(BUS_DATA)}) -> ${this.name}`)
        }

        // Write to register
        for (let i = 0; i < this.size; i++) {
            const D = MUX_2x1(this.flipflops[i].Q, BUS_DATA[i], this.WRITE_ENABLE);
            this.flipflops[i].MSDFF(D, CLOCK);
        }
        // Reading / Write to bus
        const RESULT = [];
        const FF_DATA = this.read_user();
        console.log(this.name, bool_to_dec(FF_DATA), this.OUTPUT_ENABLE);
        for (let i = 0; i < FF_DATA.length; i++) {
            const value = MUX_2x1(BUS_DATA[i], FF_DATA[i], this.OUTPUT_ENABLE);
            RESULT.push(value);
        }
        this.DATA_BUS.write(RESULT);
        if (this.OUTPUT_ENABLE && this.log) {
            console.log(`${this.name}(${bool_to_dec(RESULT)}) -> DATABUS`)
        }
    }
}


const ZERO = dec_to_bool(0, 16);
const ONE = dec_to_bool(1, 16);

export class ProgramCounter extends Register {
    INCREMENT: boolean;
    RESET: boolean;
    DATA_BUS: Bus;
    constructor(name: string, size: number, DATA_BUS: Bus, log: boolean = false) {
        super(name, size, DATA_BUS, log);
        this.INCREMENT = false;
        this.RESET = false;
        // A = 00 = MEMORY
        // B = 01 = INC
        // C = 10 = RESET
        // D = 11 = JUMP
        this.DATA_BUS = DATA_BUS
    }
    run(CLOCK: boolean) {
        const BUS_DATA = this.DATA_BUS.read()
        if (this.WRITE_ENABLE && this.log) {
            console.log(`DATABUS(${bool_to_dec(BUS_DATA)}) -> ${this.name}`)
        }
        if (this.INCREMENT && this.log) {
            console.log(`${this.name}++`)
        }
        if (this.RESET && this.log) {
            console.log(`(RESET 0) -> ${this.name}`)
        }

        const MUXED_DATA = [];
        const PREV_DATA = this.read_user()
        const INCREMENTED_DATA = FULL_ADDER_N(PREV_DATA, ONE, false)[0];
        console.log('incremented data:', bool_to_dec(INCREMENTED_DATA))
        // Multiplex the data signals
        for (let i = 0; i < this.size; i++) {
            MUXED_DATA.push(MUX_4x1(PREV_DATA[i], INCREMENTED_DATA[i], ZERO[i], BUS_DATA[i], this.RESET, this.INCREMENT))
        }
        // Write to FF if WRITE ENABLE is ON
        for (let i = 0; i < this.size; i++) {
            const D = MUX_2x1(this.flipflops[i].Q, MUXED_DATA[i], this.WRITE_ENABLE);
            this.flipflops[i].MSDFF(D, CLOCK);
        }
        // Reading / Write to bus if OUTPUT ENABLE is ON
        const RESULT = [];
        const FF_DATA = this.read_user();
        for (let i = 0; i < FF_DATA.length; i++) {
            const value = MUX_2x1(BUS_DATA[i], FF_DATA[i], this.OUTPUT_ENABLE);
            RESULT.push(value);
        }
        this.DATA_BUS.write(RESULT);

        if (this.OUTPUT_ENABLE && this.log) {
            console.log(`${this.name}(${bool_to_dec(RESULT)}) -> DATABUS`)
        }

    }
}


export class Bus {
    data: boolean[];
    size: number;
    constructor(size: number) {
        this.size = size
        this.data = dec_to_bool(0, this.size);
    }
    read() {
        return this.data.slice();
    }
    reset() {
        this.data = dec_to_bool(0, this.size);
    }
    write(data: boolean[]) {
        this.data = data.slice();
    }
}

export class Memory {
    memory_cells: Register[][];
    size: number;
    address_bus: Bus;
    data_bus: Bus;
    WRITE_ENABLE: boolean;
    OUTPUT_ENABLE: boolean;
    name: string;
    log: boolean;
    constructor(name: string, size: number, ADDRESS_BUS: Bus, DATA_BUS: Bus, log: boolean = false) {
        this.size = size
        this.name = name
        this.log = log
        this.memory_cells = [];
        for (let i = 0; i < this.size * this.size; i++) {
            let row = [];
            for (let j = 0; j < this.size * this.size; j++) {
                row.push(new Register(`Cell : ${i}${j}`, size, DATA_BUS));
            }
            this.memory_cells.push(row);
        }
        this.address_bus = ADDRESS_BUS
        this.data_bus = DATA_BUS
        this.WRITE_ENABLE = false;
        this.OUTPUT_ENABLE = false;
    }
    run(CLOCK: boolean) {
        if (this.WRITE_ENABLE && this.log) {
            console.log(`DATABUS -> ${this.name}`)
        }

        const ADDRESS = this.address_bus.read()
        const DATA = this.data_bus.read();
        const HIGH_ADDRESS = ADDRESS.slice(this.size / 2)
        const LOW_ADDRESS = ADDRESS.slice(this.size / 2, this.size)

        const HIGH_OUTPUT = DECODERM_2N(HIGH_ADDRESS);
        const LOW_OUTPUT = DECODERM_2N(LOW_ADDRESS);

        // This search happens in parallel in actual but of course we can't simulate it parallely.
        let selected = { i: -1, j: -1 }
        for (let i = 0; i < HIGH_OUTPUT.length; i++) {
            for (let j = 0; j < LOW_OUTPUT.length; j++) {
                const IS_SELECTED = AND(HIGH_OUTPUT[i], LOW_OUTPUT[j])
                // One of the exceptions of using IF.
                if (IS_SELECTED) {
                    selected = { i, j }
                    break;
                }
            }
            // One of the exceptions of using IF.
            if (selected.i != -1) {
                // Found memory cell so no longer -1
                break;
            }
        }
        // --------------------------------------------------
        // Effectively selected The memory cell by here.
        const address = selected.i * 256 + selected.j
        console.log(`Selected Address : ${selected.i}x${selected.j} -> ${address}`,);

        console.log(address);
        const memory_cell = this.memory_cells[selected.i][selected.j];
        memory_cell.WRITE_ENABLE = this.WRITE_ENABLE;
        memory_cell.run(CLOCK);
        memory_cell.WRITE_ENABLE = false;

        const read_data = memory_cell.read_user();

        let output_data = [];
        for (let i = 0; i < read_data.length; i++) {
            output_data.push(MUX_2x1(DATA[i], read_data[i], this.OUTPUT_ENABLE))
        }
        this.data_bus.write(output_data);
        if (this.OUTPUT_ENABLE && this.log) {
            console.log(`${this.name} (${bool_to_dec(output_data)}) -> DATABUS`)
        }
    }
}