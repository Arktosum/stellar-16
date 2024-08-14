import { HexDisplay4 } from "./hexDisplay";
import { MEMORY } from "./memory";
import Numeric from "./number";
import { Counter, Register } from "./sequential";

let clock = false;
const CLOCK_FREQUENCY = 1 // Hz
const CLOCK_SPEED = 1000 / CLOCK_FREQUENCY // ms
const ON_TIME = 4

let inputA = false;
let inputB = false;
let inputC = false;

const PC_DISPLAY = new HexDisplay4("Program Counter");
const MAR_DISPLAY = new HexDisplay4("Memory Address Register");
const MDR_DISPLAY = new HexDisplay4("Memory Data Register");
const A_DISPLAY = new HexDisplay4("A REGISTER");
const B_DISPLAY = new HexDisplay4("B REGISTER");
const IR_DISPLAY = new HexDisplay4("C REGISTER");

const btnElementA = document.createElement('button');
btnElementA.innerText = 'STEP PULSE'



btnElementA.addEventListener('click', (() => {
    inputA = !inputA;
    btnElementA.style.backgroundColor = inputA ? 'green' : "red";
}))


btnElementA.addEventListener('click', wave_pulse);

document.body.appendChild(btnElementA);

const registerFile = document.createElement('div');

registerFile.appendChild(PC_DISPLAY.container);
registerFile.appendChild(MAR_DISPLAY.container);
registerFile.appendChild(MDR_DISPLAY.container);
registerFile.appendChild(A_DISPLAY.container);
registerFile.appendChild(B_DISPLAY.container);
registerFile.appendChild(IR_DISPLAY.container);

document.body.appendChild(registerFile);


class Bus {
    data: boolean[];
    constructor(bitLength: number) {
        this.data = [];
        for (let i = 0; i < bitLength; i++) {
            this.data.push(false);
        }
    }
    read() {
        return this.data;
    }
    write(data: boolean[]) {
        this.data = data;
    }
}

const ADDRESS_BUS = new Bus(16);
const DATA_BUS = new Bus(16);

const A_REGISTER = new Register(16, 'A');
const B_REGISTER = new Register(16, 'B');
const PROGRAM_COUNTER = new Counter(16, 'PC');
const memory = new MEMORY(16)

function displayItems() {
    console.log('-- display -- ')
    PC_DISPLAY.display(PROGRAM_COUNTER.read(true));
    A_DISPLAY.display(A_REGISTER.read(true));
    console.log('-- display -- ')
}

// Counter EN
// Counter Read
// Counter Write
// A Read
// A Write

function resetMicro() {
    A_REGISTER.READ_ENABLE = false;
    A_REGISTER.WRITE_ENABLE = false;

    B_REGISTER.READ_ENABLE = false;
    B_REGISTER.WRITE_ENABLE = false;

    PROGRAM_COUNTER.ENABLE_COUNTER = false;
    PROGRAM_COUNTER.READ_ENABLE = false;
    PROGRAM_COUNTER.WRITE_ENABLE = false;

    memory.READ_ENABLE = false;
    memory.WRITE_ENABLE = false;
}
const INSTRUCTION = [
    () => {

    },
    () => {
    },
    () => {
    },
    () => {
    },
    () => {
    },
    () => {
    },
    () => {
    },
    () => { },
    () => { },
    () => { },
    () => { },
    () => { },
    () => { },
    () => { },
    () => { },
    () => { },
]

displayItems();
let instruction_count = 0;
function pulse() {
    console.log(`-------------- PULSE START -----------------------`)
    const pc_value = PROGRAM_COUNTER.read();

    ADDRESS_BUS.write(pc_value); // AB <- PC
    PROGRAM_COUNTER.runSync(clock, ADDRESS_BUS.read(), false); // PC <- AB
    memory.run(clock, ADDRESS_BUS.read(), DATA_BUS.read()); // MEMORY R/W
    DATA_BUS.write(memory.output); // DB <- MEMORY
    A_REGISTER.run(clock, DATA_BUS.read()); // A <- DB
    DATA_BUS.write(A_REGISTER.read()); // DB <- A
    displayItems();
    console.log("-------------- PULSE END -----------------------")
}

function log_wave_start() {
    console.log('----------- CYCLE START ------------------')
    resetMicro();
    INSTRUCTION[instruction_count]()
}

function log_wave_end() {
    console.log('----------- CYCLE END ------------------')
    instruction_count++;
    // Update then display.
}

function wave_pulse() {
    log_wave_start();
    // Low level;
    console.log("-------- LOW LEVEL -------------");
    clock = false;
    for (let i = 0; i < ON_TIME; i++) {
        pulse();
    }
    console.log("--------------------------------");
    console.log("-------- POSITIVE EDGE -------------");
    // low to high (POSITIVE EDGE)
    clock = true;
    for (let i = 0; i < ON_TIME; i++) {
        pulse();
    }
    console.log("--------------------------------");
    console.log("-------- HIGH LEVEL -------------");
    // high level
    clock = true;
    for (let i = 0; i < ON_TIME; i++) {
        pulse();
    }
    console.log("--------------------------------");
    console.log("-------- NEGATIVE EDGE -------------");
    // high to low (NEGATIVE EDGE)
    clock = false;
    for (let i = 0; i < ON_TIME; i++) {
        pulse();
    }
    console.log("--------------------------------");
    log_wave_end();
}

// setInterval(wave_pulse, CLOCK_SPEED);