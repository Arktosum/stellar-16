import "./style.css"
import CPU from "./cpu"

const root : HTMLDivElement | null = document.querySelector("#root");

let cpu = new CPU();


enum OPCODES {
  NOP = 0x00,
  LDA_ABS = 0x01,
  STA_ABS = 0x02,
  JMP_ABS = 0x03,
  HLT = 0xFe
}

cpu.memory.memory[0x0000] = OPCODES.LDA_ABS
cpu.memory.memory[0x0001] = 0x80
cpu.memory.memory[0x0002] = 0x50
cpu.memory.memory[0x0003] = OPCODES.JMP_ABS
cpu.memory.memory[0x0004] = 0x50
cpu.memory.memory[0x0005] = 0x50
cpu.memory.memory[0x5050] = OPCODES.STA_ABS
cpu.memory.memory[0x5051] = 0x81
cpu.memory.memory[0x5052] = 0x50
cpu.memory.memory[0x5053] = OPCODES.JMP_ABS
cpu.memory.memory[0x5054] = 0x53
cpu.memory.memory[0x5055] = 0x50
cpu.memory.memory[0x5056] = OPCODES.HLT
cpu.memory.memory[0x5080] = 0x4a
cpu.memory.memory[0x5081] = 0x00


const A_DISPLAY_ELEMENT = document.createElement('div');
const B_DISPLAY_ELEMENT = document.createElement('div');
const IR_DISPLAY_ELEMENT = document.createElement('div');
const H_DISPLAY_ELEMENT = document.createElement('div');
const L_DISPLAY_ELEMENT = document.createElement('div');
const PC_DISPLAY_ELEMENT = document.createElement('div');
const DATA_BUS_DISPLAY_ELEMENT = document.createElement('div');
const ADDRESS_BUS_DISPLAY_ELEMENT = document.createElement('div');
const INTERACT_BUTTON = document.createElement('button');

A_DISPLAY_ELEMENT.id = 'a-register'
B_DISPLAY_ELEMENT.id = 'b-register'
IR_DISPLAY_ELEMENT.id = 'ir-register'
H_DISPLAY_ELEMENT.id = 'h-register'
L_DISPLAY_ELEMENT.id = 'l-register'
PC_DISPLAY_ELEMENT.id = 'pc-register'
DATA_BUS_DISPLAY_ELEMENT.id = 'data-bus'
ADDRESS_BUS_DISPLAY_ELEMENT.id = 'address-bus'

A_DISPLAY_ELEMENT.classList.add('flex')
B_DISPLAY_ELEMENT.classList.add('flex')
IR_DISPLAY_ELEMENT.classList.add('flex')
H_DISPLAY_ELEMENT.classList.add('flex')
L_DISPLAY_ELEMENT.classList.add('flex')
PC_DISPLAY_ELEMENT.classList.add('flex')
DATA_BUS_DISPLAY_ELEMENT.classList.add('flex')
ADDRESS_BUS_DISPLAY_ELEMENT.classList.add('flex')

root?.appendChild(A_DISPLAY_ELEMENT);
root?.appendChild(B_DISPLAY_ELEMENT);
root?.appendChild(IR_DISPLAY_ELEMENT);
root?.appendChild(H_DISPLAY_ELEMENT);
root?.appendChild(L_DISPLAY_ELEMENT);
root?.appendChild(PC_DISPLAY_ELEMENT);
root?.appendChild(DATA_BUS_DISPLAY_ELEMENT);
root?.appendChild(ADDRESS_BUS_DISPLAY_ELEMENT);
root?.appendChild(INTERACT_BUTTON);

// const stepClock = document.createElement('div');
// const stepInstruction = document.createElement('div');

function displayElements(){
  // display clock
  cpu.PULSE();
  if(cpu.HALT_CPU) return
  // console.clear();
  A_DISPLAY_ELEMENT.innerText = "A\n0x"+cpu.A.data.toString(16);
  B_DISPLAY_ELEMENT.innerText = "B\n0x"+cpu.B.data.toString(16);
  IR_DISPLAY_ELEMENT.innerText = "IR\n0x"+cpu.IR.data.toString(16);
  H_DISPLAY_ELEMENT.innerText = "H\n0x"+cpu.HL.H.data.toString(16);
  L_DISPLAY_ELEMENT.innerText = "L\n"+cpu.HL.L.data.toString(16);
  PC_DISPLAY_ELEMENT.innerText = "PC\n0x"+cpu.PC.data().toString(16);
  DATA_BUS_DISPLAY_ELEMENT.innerText = "DATABUS\n0x"+cpu.dataBus.data.toString(16);
  ADDRESS_BUS_DISPLAY_ELEMENT.innerText ="ADDRESSBUS\n0x"+ cpu.addressBus.data.toString(16);
}

function playAudio(){
  const light_flick_sound = new Audio('./src/light-switch.mp3');
  light_flick_sound.play();
}
// Only works 1kHz or 1 instruction per ms.
setInterval(()=>{
  playAudio()
  displayElements();
},1000)


