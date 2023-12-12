import "./style.css"
import CPU from "./cpu"

const root : HTMLDivElement | null = document.querySelector("#root");

let cpu = new CPU();


enum OPCODES {
  NOP = 0x00,
  LDA_ABS = 0x01,
  STA_ABS = 0x02,
  JMP_ABS = 0x03,
  ADD_ABS = 0x04,
  MOVAB = 0x05,
  MOVBA = 0x06,
  ADDB = 0x07,
  JMP_C = 0x08,
  JMP_NC = 0x09,
  JMP_Z = 0x0a,
  JMP_NZ = 0x0b,
  SUB_M = 0x0c,
  SUB_B = 0x0d,
  HLT = 0xFe
}


cpu.memory.memory[0x0000] = OPCODES.LDA_ABS
cpu.memory.memory[0x0001] = 0x00
cpu.memory.memory[0x0002] = 0x50
cpu.memory.memory[0x0003] = OPCODES.MOVAB
cpu.memory.memory[0x0004] = OPCODES.LDA_ABS
cpu.memory.memory[0x0005] = 0x01
cpu.memory.memory[0x0006] = 0x50
cpu.memory.memory[0x0007] = OPCODES.ADDB
cpu.memory.memory[0x0008] = OPCODES.JMP_NC
cpu.memory.memory[0x0009] = 0x07
cpu.memory.memory[0x000a] = 0x00
cpu.memory.memory[0x000b] = OPCODES.SUB_B
cpu.memory.memory[0x000c] = OPCODES.JMP_NZ
cpu.memory.memory[0x000d] = 0x0b
cpu.memory.memory[0x000e] = 0x00
cpu.memory.memory[0x000f] = OPCODES.JMP_ABS
cpu.memory.memory[0x0010] = 0x07
cpu.memory.memory[0x0011] = 0x00
cpu.memory.memory[0x0012] = OPCODES.HLT


cpu.memory.memory[0x5000] = 0x01
cpu.memory.memory[0x5001] = 0x00


const A_DISPLAY_ELEMENT = document.createElement('div');
const B_DISPLAY_ELEMENT = document.createElement('div');
const IR_DISPLAY_ELEMENT = document.createElement('div');
const H_DISPLAY_ELEMENT = document.createElement('div');
const L_DISPLAY_ELEMENT = document.createElement('div');
const PC_DISPLAY_ELEMENT = document.createElement('div');
const DATA_BUS_DISPLAY_ELEMENT = document.createElement('div');
const ADDRESS_BUS_DISPLAY_ELEMENT = document.createElement('div');

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



const stepAuto = document.createElement('button');
const stepManualMicro = document.createElement('button');
const stepManualIns = document.createElement('button');
stepAuto.innerText = "Start Auto"
stepManualMicro.innerText = "Step Micro"
stepManualIns.innerText = "Step Ins"

stepAuto.addEventListener('click', () =>{
  setInterval(()=>{
    if(cpu.HALT_CPU) return
    cpu.PULSE();
    playAudio();
    displayElements();
  },100)  
})

stepManualMicro.addEventListener('click', () =>{
  if(cpu.HALT_CPU) return
  cpu.PULSE();
  playAudio();
  displayElements();
})
stepManualIns.addEventListener('click', () =>{
  // Fetch!
  while(cpu.ins_end){
    cpu.PULSE();
    playAudio();
    displayElements();
  }
  //Instruction!
  while(!cpu.ins_end){
    cpu.PULSE();
    playAudio();
    displayElements();
  }
})

displayElements()
root?.appendChild(stepAuto);
root?.appendChild(stepManualMicro);
root?.appendChild(stepManualIns);

function displayElements(){
  A_DISPLAY_ELEMENT.innerText = "A\n0x"+cpu.A.data.toString(16)+"\n"+cpu.A.data.toString(10);
  B_DISPLAY_ELEMENT.innerText = "B\n0x"+cpu.B.data.toString(16)+"\n"+cpu.B.data.toString(10);
  IR_DISPLAY_ELEMENT.innerText = "IR\n0x"+cpu.IR.data.toString(16)+"\n"+cpu.IR.data.toString(10);
  H_DISPLAY_ELEMENT.innerText = "H\n0x"+cpu.HL.H.data.toString(16)+"\n"+cpu.HL.H.data.toString(10);
  L_DISPLAY_ELEMENT.innerText = "L\n"+cpu.HL.L.data.toString(16)+"\n"+cpu.HL.L.data.toString(10);
  PC_DISPLAY_ELEMENT.innerText = "PC\n0x"+cpu.PC.data().toString(16)+"\n"+cpu.PC.data().toString(10);
  DATA_BUS_DISPLAY_ELEMENT.innerText = "DATABUS\n0x"+cpu.dataBus.data.toString(16)+"\n"+cpu.dataBus.data.toString(10);
  ADDRESS_BUS_DISPLAY_ELEMENT.innerText ="ADDRESSBUS\n0x"+ cpu.addressBus.data.toString(16)+"\n"+cpu.addressBus.data.toString(10);
  // console.log("Z - FLAG ", cpu.ALU.ZERO_FLAG);
  // console.log("C - FLAG ", cpu.ALU.CARRY_FLAG);
}

function playAudio(){
  const light_flick_sound = new Audio('./src/light-switch.mp3');
  light_flick_sound.play();
}
// Only works 1kHz or 1 instruction per ms.


