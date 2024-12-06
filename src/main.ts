
import './style.css';

import { Bus, Memory, ProgramCounter, Register } from "./digital-logic/sequential";
import { bool_to_dec, dec_to_bool } from './digital-logic/Numeric';




interface BitElement extends HTMLDivElement {
    state: boolean
}

function createBitElement(label: string, callback) {
    const bitElement = document.createElement('div') as BitElement;
    bitElement.state = false;
    bitElement.innerHTML = `
    <div class="flex flex-col">
        <div class='bit-element bit-off'></div>
        <div class='bit-label'>${label}</div>
    </div>
    <hr>
    `
    bitElement.addEventListener('click', () => {
        bitElement.state = !bitElement.state
        bitElement.innerHTML =
            `
        <div class="flex flex-col">
            <div class='bit-element ${bitElement.state ? 'bit-on' : 'bit-off'}'></div>
            <div class='bit-label'>${label}</div>
        </div>
        <hr>
    `
        callback();
    });
    return bitElement;
}


const clockBit = createBitElement('CLOCK', () => {

});

const cycle = createBitElement('CYCLE', () => {
    pulse(false)
    pulse(true)
    pulse(false)
});

const display = createBitElement('DISPLAY', () => {
    showData()
});
const stepBit = createBitElement('STEP', () => {
    pulse(clockBit.state)
});

const pcw = createBitElement('PC WE', () => {

});
const pco = createBitElement('PC OE', () => {

});
const pcINC = createBitElement('PC INC', () => {

});

const pcRESET = createBitElement('PC RESET', () => {

});

const marw = createBitElement('MAR WE', () => {

});

const maro = createBitElement('MAR OE', () => {

});

const memw = createBitElement('MEM WE', () => {

});
const memo = createBitElement('MEM OE', () => {

});

const aregw = createBitElement('A REG WE', () => {

});
const arego = createBitElement('A REG OE', () => {

});

document.body.appendChild(clockBit);
document.body.appendChild(cycle);
document.body.appendChild(stepBit);
document.body.appendChild(display);



document.body.appendChild(pcINC);
document.body.appendChild(pcRESET);
document.body.appendChild(pcw);
document.body.appendChild(pco);
document.body.appendChild(marw);
document.body.appendChild(maro);
document.body.appendChild(memw);
document.body.appendChild(memo);
document.body.appendChild(aregw);
document.body.appendChild(arego);

const ADDRESS_BUS = new Bus(16);
const DATA_BUS = new Bus(16);

const PROGRAM_COUNTER = new ProgramCounter('PC', 16, DATA_BUS, true);
const MEMORY_ADDRESS_REGISTER = new Register('MAR', 16, DATA_BUS, true);
const MEMORY = new Memory('MEM', 16, ADDRESS_BUS, DATA_BUS, true);
const A_REGISTER = new Register('A', 16, DATA_BUS, true);


PROGRAM_COUNTER.user_write(dec_to_bool(0x5050, 16));
MEMORY.memory_cells[0x50][0x50].user_write(dec_to_bool(0xA0A0, 16));
function showData() {
    console.log('-----------------------------------------')
    console.log('PC', bool_to_dec(PROGRAM_COUNTER.read_user()));
    console.log('DATA BUS', bool_to_dec(DATA_BUS.read()));
    console.log('MEMORY_ADDRESS_REGISTER', bool_to_dec(MEMORY_ADDRESS_REGISTER.read_user()));
    console.log('ADDRESS_BUS', bool_to_dec(ADDRESS_BUS.read()));
    console.log('A_REGISTER', bool_to_dec(A_REGISTER.read_user()));
    console.log('-----------------------------------------')

}

function setSignals() {
    PROGRAM_COUNTER.INCREMENT = pcINC.state;
    PROGRAM_COUNTER.RESET = pcRESET.state;
    PROGRAM_COUNTER.WRITE_ENABLE = pcw.state;
    PROGRAM_COUNTER.OUTPUT_ENABLE = pco.state;

    MEMORY_ADDRESS_REGISTER.WRITE_ENABLE = marw.state;
    MEMORY_ADDRESS_REGISTER.OUTPUT_ENABLE = maro.state;

    MEMORY.WRITE_ENABLE = memw.state;
    MEMORY.OUTPUT_ENABLE = memo.state;

    A_REGISTER.WRITE_ENABLE = aregw.state;
    A_REGISTER.OUTPUT_ENABLE = arego.state;
}


function pulse(CLOCK: boolean) {
    // showData();
    setSignals();
    DATA_BUS.reset();
    ADDRESS_BUS.reset();
    PROGRAM_COUNTER.run(CLOCK);
    MEMORY_ADDRESS_REGISTER.run(CLOCK);
    ADDRESS_BUS.write(MEMORY_ADDRESS_REGISTER.read_user());
    MEMORY.run(CLOCK);
    A_REGISTER.run(CLOCK);
    // showData();
}



