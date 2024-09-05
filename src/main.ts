import ALU from './digital-logic/alu';
import { Bus } from './digital-logic/bus';
import { Clock } from './digital-logic/clock';
import { DFFCounter, Register } from './digital-logic/flipflop';
import { NOT } from './digital-logic/gates';
import { HexDisplay } from './digital-logic/hexDisplay';
import { RAM } from './digital-logic/memory';
import Numeric from './digital-logic/number';
import { ROM } from './digital-logic/rom';
import { bitButton, bitDisplay } from './display';
import './style.css'
import { createElement } from './util';

const root = document.body;

// DIGITAL LOGIC UNITS
const clock = new Clock(1);

const program_counter = new DFFCounter(16, 'PC', true);
const cycle_counter = new DFFCounter(4, 'CYCLE COUNTER', true);
const address_bus = new Bus(16);
const ram = new RAM(16);
const rom = new ROM(16, 16);

const SIGNAL = {
  PC_ENABLE: 1 << 0,
  PC_MODE: 1 << 1,
  PC_OUT: 1 << 2,
  MAR_WRITE: 1 << 3,
  MEM_STORE: 1 << 4,
  MEM_MDOB_OUT: 1 << 5,
  MEM_MDIB_WRITE: 1 << 6,
  A_REG_OUT: 1 << 7,
  A_REG_WRITE: 1 << 8,
  ALU_A_REG_WRITE: 1 << 9,
  ALU_B_REG_WRITE: 1 << 10,
  ALU_OUTPUT_BUFFER_OUT: 1 << 11,
  ALU_SUBTRACT: 1 << 12,
  INS_REG_WRITE: 1 << 13,
}


const mar = ram.MEMORY_ADDRESS_REGISTER;
const mdob = ram.MEMORY_OUT_BUFFER;
const mdib = ram.MEMORY_DATA_BUFFER;


// Registers
const a_register = new Register(16, "A REG", true);
const ins_register = new Register(16, "INS REG", true);
const alu = new ALU();
const alu_a_register = alu.A_REGISTER;
const alu_b_register = alu.B_REGISTER;
const alu_output_buffer = alu.OUTPUT_BUFFER;

// HEX DISPLAYs
const program_counter_display = new HexDisplay(16, 'program_counter');
const cycle_counter_display = new HexDisplay(16, 'CYCLE COUNTER');
const address_bus_display = new HexDisplay(16, 'ADDRESS BUS');
const mar_display = new HexDisplay(16, 'MAR');
const mdob_display = new HexDisplay(16, 'MDOB');
const mdib_display = new HexDisplay(16, 'MDIB');
const a_register_display = new HexDisplay(16, 'A REGISTER');
const ins_register_display = new HexDisplay(16, 'INS REGISTER');

const alu_a_register_display = new HexDisplay(16, 'ALU A REGISTER');
const alu_b_register_display = new HexDisplay(16, 'ALU B REGISTER');
const alu_output_buffer_display = new HexDisplay(16, 'ALU OUTPUT BUFFER');

const HEX_DISPLAYS = [
  cycle_counter_display, ins_register_display, program_counter_display, 
  address_bus_display, mar_display, mdob_display, mdib_display, 
  a_register_display, alu_a_register_display, alu_b_register_display, alu_output_buffer_display
]
// Bit Buttons
const stepButton = bitButton('STEP', () => {
  clock.step(pulse, waveStart, waveEnd);
});

const manClock = bitButton('MCLOCK');

const manStepButton = bitButton('MSTEP', () => {
  clock.clock = manClock.state;
  waveStart();
  clock.man_pulse(pulse);
});

const PC_ENABLE = bitDisplay('PCE');
const PC_OUT = bitDisplay('PCO');
const PC_MODE = bitDisplay('PCM');
const MAR_WRITE = bitDisplay('MARW');
const MEM_STORE = bitDisplay('MST')
const MEM_MDOB_OUT = bitDisplay('MDOBO');
const MEM_MDIB_WRITE = bitDisplay('MDIBW');
const A_REG_OUT = bitDisplay('AOUT');
const A_REG_WRITE = bitDisplay('AREGW');
const ALU_A_REG_WRITE = bitDisplay('ALUAW');
const ALU_B_REG_WRITE = bitDisplay('ALUBW');
const ALU_OUTPUT_BUFFER_OUT = bitDisplay('ALUO');
const ALU_SUBTRACT = bitDisplay('ALUSUB');
const INS_REG_WRITE = bitDisplay('INSW');

root.appendChild(stepButton);
root.appendChild(manStepButton);
root.appendChild(manClock);

const pc_container = createElement('div', 'flex');
pc_container.appendChild(PC_ENABLE);
pc_container.appendChild(PC_OUT);
pc_container.appendChild(PC_MODE);
root.appendChild(pc_container);

const mar_container = createElement('div', 'flex');
mar_container.appendChild(MAR_WRITE);
root.appendChild(mar_container);

const mem_container = createElement('div', 'flex');
mem_container.appendChild(MEM_MDOB_OUT);
mem_container.appendChild(MEM_MDIB_WRITE);
mem_container.appendChild(MEM_STORE);
root.appendChild(mem_container);

const a_reg_container = createElement('div', 'flex');
a_reg_container.appendChild(A_REG_OUT);
a_reg_container.appendChild(A_REG_WRITE);
root.appendChild(a_reg_container);

const ins_reg_container = createElement('div', 'flex');
ins_reg_container.appendChild(INS_REG_WRITE);
root.appendChild(ins_reg_container);

const alu_container = createElement('div', 'flex');
alu_container.appendChild(ALU_A_REG_WRITE);
alu_container.appendChild(ALU_B_REG_WRITE);
alu_container.appendChild(ALU_OUTPUT_BUFFER_OUT);
alu_container.appendChild(ALU_SUBTRACT);
root.appendChild(alu_container);


const display_container = createElement('div', '')
HEX_DISPLAYS.forEach((display) => {
  display_container.appendChild(display.container);
})
root.appendChild(display_container);

function display() {
  program_counter_display.display(program_counter.read());
  address_bus_display.display(address_bus.read());
  mar_display.display(mar.read());
  mdib_display.display(mdib.read());
  mdob_display.display(mdob.read());
  a_register_display.display(a_register.read());
  alu_a_register_display.display(alu_a_register.read());
  alu_b_register_display.display(alu_b_register.read());
  alu_output_buffer_display.display(alu_output_buffer.read());
  cycle_counter_display.display(cycle_counter.read());
  ins_register_display.display(ins_register.read());

}

function SIGNAL_APPLIER(signal: number) {
  const SIGNAL = new Numeric(signal).toBinary(16);

  program_counter.ENABLE = SIGNAL[15];
  program_counter.MODE = SIGNAL[14];
  program_counter.OUTPUT_ENABLE = SIGNAL[13];

  mar.WRITE_ENABLE = SIGNAL[12];

  ram.MEM_STORE = SIGNAL[11];
  mdob.OUTPUT_ENABLE = SIGNAL[10];

  mdib.WRITE_ENABLE = SIGNAL[9];

  a_register.OUTPUT_ENABLE = SIGNAL[8];
  a_register.WRITE_ENABLE = SIGNAL[7];

  alu_a_register.WRITE_ENABLE = SIGNAL[6];
  alu_b_register.WRITE_ENABLE = SIGNAL[5];
  alu_output_buffer.OUTPUT_ENABLE = SIGNAL[4];
  alu.SUBTRACT_FLAG = SIGNAL[3];
  ins_register.WRITE_ENABLE = SIGNAL[2];
}

// 16  bits
//  INS |  DC  |  DC   | T_STATE
// 0000 | xxxx | xxxx | 0000


// LDA 5000 // 6 cc
// MOV a alu_a // 3 cc
// LDA 5001
// MOV a alu_b
// ADD a
// STA 5003

// 0x0 = NOP
// 0x1 = LDA

// Regardless of instruction , 00 and 01 time steps are always FETCH
for (let i = 0; i < 16; i++) {
  rom.writeLocation(i << 12 | 0x0000, SIGNAL.PC_OUT | SIGNAL.MAR_WRITE); // Fetch
  rom.writeLocation(i << 12 | 0x0001, SIGNAL.MEM_MDOB_OUT | SIGNAL.INS_REG_WRITE | SIGNAL.PC_ENABLE); // Fetch
}

// LDA
rom.writeLocation(0x1002, SIGNAL.PC_OUT | SIGNAL.MAR_WRITE);
rom.writeLocation(0x1003, SIGNAL.MEM_MDOB_OUT | SIGNAL.PC_ENABLE | SIGNAL.PC_MODE);
rom.writeLocation(0x1004, SIGNAL.PC_OUT | SIGNAL.MAR_WRITE);
rom.writeLocation(0x1005, SIGNAL.MEM_MDOB_OUT | SIGNAL.A_REG_WRITE | SIGNAL.PC_ENABLE);
rom.writeLocation(0x1006, SIGNAL.PC_OUT | SIGNAL.MAR_WRITE);
rom.writeLocation(0x1007, SIGNAL.MEM_MDOB_OUT | SIGNAL.PC_ENABLE | SIGNAL.PC_MODE);

// JMP
rom.writeLocation(0x2002, SIGNAL.PC_OUT | SIGNAL.MAR_WRITE);
rom.writeLocation(0x2003, SIGNAL.MEM_MDOB_OUT | SIGNAL.PC_WRITE);

// mov a alu_a
rom.writeLocation(0x3002, SIGNAL.A_REG_OUT | SIGNAL.ALU_A_REG_WRITE | SIGNAL.PC_ENABLE);
// mov a alu_b
rom.writeLocation(0x4002, SIGNAL.A_REG_OUT | SIGNAL.ALU_B_REG_WRITE | SIGNAL.PC_ENABLE);
// add a // a = alu_a + alu_b
rom.writeLocation(0x5002, SIGNAL.ALU_OUTPUT_BUFFER_OUT | SIGNAL.A_REG_WRITE | SIGNAL.PC_ENABLE);
// SUB B || a = alu_a - alu_b
rom.writeLocation(0x6002, SIGNAL.ALU_OUTPUT_BUFFER_OUT | SIGNAL.A_REG_WRITE | SIGNAL.ALU_SUBTRACT | SIGNAL.PC_ENABLE);



ram.writeLocation(0x0000, 0xFF01); // LDA
ram.writeLocation(0x0001, 0x5000); // 0x5000
ram.writeLocation(0x0002, 0xFF02); // MOVAA
ram.writeLocation(0x0003, 0xFF03); // LDA
ram.writeLocation(0x0004, 0x5002);
ram.writeLocation(0x0005, 0xFF04); // MOVAB
ram.writeLocation(0x0006, 0xFFFF);

ram.writeLocation(0x5000, 0x0202);
ram.writeLocation(0x5001, 0x0002);
ram.writeLocation(0x5002, 0x0101);
ram.writeLocation(0x5003, 0x0005);

display();

function pulse(clock: boolean, phase: string) {
  console.log(`--------- PULSE START - ${phase} ---------`)

  cycle_counter.ENABLE = true;
  cycle_counter.run(NOT(clock), new Numeric(0).toBinary(16));
  const instruction = ins_register.read();
  const rom_address = [
    ...instruction.slice(12, 16), 
    false, false, false,false, 
    false, false, false, false, 
    ...cycle_counter.read().slice(0, 4)
  ];
  console.log('applied rom-address', Numeric.fromBinary(rom_address).toHex(4));
  const new_signal = rom.run(rom_address);
  SIGNAL_APPLIER(Numeric.fromBinary(new_signal).decimal);
  address_bus.write(program_counter.OUTPUT_ENABLE, program_counter.read());
  address_bus.write(a_register.OUTPUT_ENABLE, a_register.read());
  address_bus.write(mdob.OUTPUT_ENABLE, mdob.read());
  address_bus.write(mdib.OUTPUT_ENABLE, mdib.read());
  address_bus.write(alu_output_buffer.OUTPUT_ENABLE, alu_output_buffer.read());

  program_counter.run(clock, address_bus.read());
  mar.write(clock, address_bus.read());
  ram.run(clock);
  mdib.write(address_bus.read());
  a_register.write(clock, address_bus.read());
  ins_register.write(clock, address_bus.read());
  alu_a_register.write(clock, address_bus.read());
  alu_b_register.write(clock, address_bus.read());
  alu.run();
  display();
  console.log(`--------- PULSE END -------------------`)
}

function waveStart() {
  console.log('--------- WAVE START ---------')
  // SIGNAL_APPLIER(0x0000); // RESET ALL SIGNALS
  // program_counter.ENABLE = PC_ENABLE.state
  // program_counter.MODE = PC_MODE.state
  // program_counter.OUTPUT_ENABLE = PC_OUT.state

  // mar.WRITE_ENABLE = MAR_WRITE.state

  // ram.MEM_STORE = MEM_STORE.state
  // mdob.OUTPUT_ENABLE = MEM_MDOB_OUT.state;

  // mdib.WRITE_ENABLE = MEM_MDIB_WRITE.state

  // a_register.OUTPUT_ENABLE = A_REG_OUT.state
  // a_register.WRITE_ENABLE = A_REG_WRITE.state

  // alu_a_register.WRITE_ENABLE = ALU_A_REG_WRITE.state;
  // alu_b_register.WRITE_ENABLE = ALU_B_REG_WRITE.state
  // alu_output_buffer.OUTPUT_ENABLE = ALU_OUTPUT_BUFFER_OUT.state;
  // alu.SUBTRACT_FLAG = ALU_SUBTRACT.state;
  // ins_register.WRITE_ENABLE = INS_REG_WRITE.state;
  // INSTRUCTIONS[instruction++]();
}

function waveEnd() {
  console.log('--------- WAVE END ---------')
}

