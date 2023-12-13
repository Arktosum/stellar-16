import "./style.css"
import CPU from "./cpu"
import Program from "./assembler"


const CPU_CLOCK_SPEED = 1

const root : HTMLDivElement | null = document.querySelector("#root");
class LEDDisplay{
  div : HTMLDivElement;
  bitDivs : HTMLDivElement[];
  parentDiv : HTMLDivElement;
  LEDOncolor : string;
  LEDOffColor : string;
  textDiv : HTMLDivElement
  constructor(parentDiv : HTMLDivElement,LEDOncolor:string='red',LEDOffColor:string='black'){
    this.parentDiv = parentDiv
    this.div = document.createElement("div");
    this.LEDOncolor = LEDOncolor
    this.LEDOffColor = LEDOffColor
    this.bitDivs = []
    for(let i = 0; i < 8 ; i++){
      let bitDiv = document.createElement("div");
      bitDiv.classList.add("byte-value");
      this.bitDivs.push(bitDiv);
    }
    for(let bitDiv of this.bitDivs){
      this.div.appendChild(bitDiv)
    }
    this.textDiv = document.createElement("div")
    this.div.appendChild(this.textDiv)
    // this.textDiv.innerHTML=`
    // <div style="color:${LEDOncolor}">0x00</div>
    // `
    this.div.className = 'byte-container'
    this.parentDiv.appendChild(this.div);
  }
  displayNumber(number: number){
    let binary_string = number.toString(2)
    let size = 8
    let diff = size - binary_string.length;
    let string = "";
    for(let i = 0 ; i < diff ; i++){
      string += "0"
    }
    string += binary_string;
    this.textDiv.innerHTML=`
      <div style="color:${this.LEDOncolor};font-size : bold">0x${number.toString(16)}</div>
      `
    for(let i = 0; i < size ; i++){
        let color = string[i] == "1"
        this.bitDivs[i].style.backgroundColor = color?this.LEDOncolor : this.LEDOffColor;
        this.bitDivs[i].style.boxShadow = `10px 10px 100px 10px ${color?this.LEDOncolor : this.LEDOffColor}`;
    }
  }
}

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
const PC_HIGH_DISPLAY_ELEMENT = document.createElement('div');
const PC_LOW_DISPLAY_ELEMENT = document.createElement('div');
const DATA_BUS_DISPLAY_ELEMENT = document.createElement('div');
const ADDRESS_BUS_DISPLAY_ELEMENT = document.createElement('div');
const STACK_POINTER_DISPLAY_ELEMENT = document.createElement('div');
const ALU_BUFFER_DISPLAY_ELEMENT = document.createElement('div');


const A_REGISTER_LED = new LEDDisplay(A_DISPLAY_ELEMENT)
const B_REGISTER_LED = new LEDDisplay(B_DISPLAY_ELEMENT)
const IR_REGISTER_LED = new LEDDisplay(IR_DISPLAY_ELEMENT)
const H_REGISTER_LED = new LEDDisplay(H_DISPLAY_ELEMENT)
const L_REGISTER_LED = new LEDDisplay(L_DISPLAY_ELEMENT)
const STACK_POINTER_LED = new LEDDisplay(STACK_POINTER_DISPLAY_ELEMENT,'violet')
const PC_HIGH_REGISTER_LED = new LEDDisplay(PC_HIGH_DISPLAY_ELEMENT,'orange')
const PC_LOW_REGISTER_LED = new LEDDisplay(PC_LOW_DISPLAY_ELEMENT,'orange')
const DATABUS_REGISTER_LED = new LEDDisplay(DATA_BUS_DISPLAY_ELEMENT,'lightblue')
const ADDRESSBUS_REGISTER_LED = new LEDDisplay(ADDRESS_BUS_DISPLAY_ELEMENT,'lightblue')
const ALU_REGISTER_LED = new LEDDisplay(ALU_BUFFER_DISPLAY_ELEMENT,'green')

A_DISPLAY_ELEMENT.id = 'a-register'
B_DISPLAY_ELEMENT.id = 'b-register'
IR_DISPLAY_ELEMENT.id = 'ir-register'
H_DISPLAY_ELEMENT.id = 'h-register'
L_DISPLAY_ELEMENT.id = 'l-register'
PC_HIGH_DISPLAY_ELEMENT.id = 'pc-register-high'
PC_HIGH_DISPLAY_ELEMENT.id = 'pc-register-low'
DATA_BUS_DISPLAY_ELEMENT.id = 'data-bus'
ADDRESS_BUS_DISPLAY_ELEMENT.id = 'address-bus'
ALU_BUFFER_DISPLAY_ELEMENT.id = 'alu'
STACK_POINTER_DISPLAY_ELEMENT.id = 'stack-pointer'


A_DISPLAY_ELEMENT.classList.add('flex')
B_DISPLAY_ELEMENT.classList.add('flex')
IR_DISPLAY_ELEMENT.classList.add('flex')
H_DISPLAY_ELEMENT.classList.add('flex')
L_DISPLAY_ELEMENT.classList.add('flex')
PC_HIGH_DISPLAY_ELEMENT.classList.add('flex')
PC_LOW_DISPLAY_ELEMENT.classList.add('flex')
DATA_BUS_DISPLAY_ELEMENT.classList.add('flex')
ADDRESS_BUS_DISPLAY_ELEMENT.classList.add('flex')
ALU_BUFFER_DISPLAY_ELEMENT.classList.add('flex')
STACK_POINTER_DISPLAY_ELEMENT.classList.add('flex')

root?.appendChild(A_DISPLAY_ELEMENT);
root?.appendChild(B_DISPLAY_ELEMENT);
root?.appendChild(IR_DISPLAY_ELEMENT);
root?.appendChild(H_DISPLAY_ELEMENT);
root?.appendChild(L_DISPLAY_ELEMENT);
root?.appendChild(PC_HIGH_DISPLAY_ELEMENT);
root?.appendChild(PC_LOW_DISPLAY_ELEMENT);
root?.appendChild(DATA_BUS_DISPLAY_ELEMENT);
root?.appendChild(ADDRESS_BUS_DISPLAY_ELEMENT);
root?.appendChild(ALU_BUFFER_DISPLAY_ELEMENT);
root?.appendChild(STACK_POINTER_DISPLAY_ELEMENT);



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
  },CPU_CLOCK_SPEED)
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
  A_REGISTER_LED .displayNumber(cpu.A.data);
  B_REGISTER_LED .displayNumber(cpu.B.data);
  IR_REGISTER_LED.displayNumber(cpu.IR.data);
  H_REGISTER_LED .displayNumber(cpu.HL.H.data);
  L_REGISTER_LED.displayNumber(cpu.HL.L.data);
  PC_HIGH_REGISTER_LED.displayNumber(cpu.PC.PC_HIGH);
  PC_LOW_REGISTER_LED.displayNumber(cpu.PC.PC_LOW);
  DATABUS_REGISTER_LED.displayNumber(cpu.dataBus.data);
  ADDRESSBUS_REGISTER_LED.displayNumber(cpu.addressBus.data);
  ALU_REGISTER_LED .displayNumber(cpu.ALU.ALU_buffer.data);
  STACK_POINTER_LED.displayNumber(cpu.STACKP.L);

  for(let i = 0x2005; i >= 0x2000; i--){
    console.log(i.toString(16),cpu.memory.memory[i].toString(16))
  }
  console.log(cpu.memory.memory[0x5000].toString(16))
  console.log(cpu.memory.memory[0x5001].toString(16))
  console.log(cpu.memory.memory[0x5002].toString(16))
  console.log(cpu.memory.memory[0x5003].toString(16))
}

function playAudio(){
  const light_flick_sound = new Audio('./src/light-switch.mp3');
  // light_flick_sound.play();
}
// Only works 1kHz or 1 instruction per ms.