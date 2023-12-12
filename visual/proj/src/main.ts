import "./style.css"
import CPU from "./cpu"
import Program from "./assembler"


const root : HTMLDivElement | null = document.querySelector("#root");

let cpu = new CPU();


function loadProgram(){
  cpu.PC.setData(Program.startAddress);
  for(let [address,data,isOpcode] of Program.Bytes){
    cpu.memory.memory[address] = data
  }
  console.log("Loaded program!");
}
loadProgram();
const A_DISPLAY_ELEMENT = document.createElement('div');
const B_DISPLAY_ELEMENT = document.createElement('div');
const IR_DISPLAY_ELEMENT = document.createElement('div');
const H_DISPLAY_ELEMENT = document.createElement('div');
const L_DISPLAY_ELEMENT = document.createElement('div');
const PC_DISPLAY_ELEMENT = document.createElement('div');
const DATA_BUS_DISPLAY_ELEMENT = document.createElement('div');
const ADDRESS_BUS_DISPLAY_ELEMENT = document.createElement('div');
const ALU_BUFFER = document.createElement('div');

A_DISPLAY_ELEMENT.id = 'a-register'
B_DISPLAY_ELEMENT.id = 'b-register'
IR_DISPLAY_ELEMENT.id = 'ir-register'
H_DISPLAY_ELEMENT.id = 'h-register'
L_DISPLAY_ELEMENT.id = 'l-register'
PC_DISPLAY_ELEMENT.id = 'pc-register'
DATA_BUS_DISPLAY_ELEMENT.id = 'data-bus'
ADDRESS_BUS_DISPLAY_ELEMENT.id = 'address-bus'
ALU_BUFFER.id = 'alu'

A_DISPLAY_ELEMENT.classList.add('flex')
B_DISPLAY_ELEMENT.classList.add('flex')
IR_DISPLAY_ELEMENT.classList.add('flex')
H_DISPLAY_ELEMENT.classList.add('flex')
L_DISPLAY_ELEMENT.classList.add('flex')
PC_DISPLAY_ELEMENT.classList.add('flex')
DATA_BUS_DISPLAY_ELEMENT.classList.add('flex')
ADDRESS_BUS_DISPLAY_ELEMENT.classList.add('flex')
ALU_BUFFER.classList.add('flex')

root?.appendChild(A_DISPLAY_ELEMENT);
root?.appendChild(B_DISPLAY_ELEMENT);
root?.appendChild(IR_DISPLAY_ELEMENT);
root?.appendChild(H_DISPLAY_ELEMENT);
root?.appendChild(L_DISPLAY_ELEMENT);
root?.appendChild(PC_DISPLAY_ELEMENT);
root?.appendChild(DATA_BUS_DISPLAY_ELEMENT);
root?.appendChild(ADDRESS_BUS_DISPLAY_ELEMENT);
root?.appendChild(ALU_BUFFER);



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
  },10)  
})

stepManualMicro.addEventListener('click', () =>{
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
  ALU_BUFFER.innerText ="ALU\n0x"+ cpu.ALU.ALU_buffer.data.toString(16)+"\n"+cpu.ALU.ALU_buffer.data.toString(10);

  console.log(cpu.memory.memory[0x5000])
  console.log(cpu.memory.memory[0x5001])
  console.log(cpu.memory.memory[0x5002])
}

function playAudio(){
  const light_flick_sound = new Audio('./src/light-switch.mp3');
  light_flick_sound.play();
}
// Only works 1kHz or 1 instruction per ms.


